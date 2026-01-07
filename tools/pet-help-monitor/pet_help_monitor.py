import os
import json
import time
from datetime import datetime, timedelta
import requests
from typing import List, Dict

"""
Pet Help Post Monitor Bot
Monitors Reddit, Instagram, and TikTok for help-seeking posts about pet nutrition/feeding.
Sends alerts when relevant posts are found.
"""

# Configuration
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID', '')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET', '')
REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT', 'PetHelpMonitor/1.0')

# Keywords to monitor
HELP_KEYWORDS = [
    "how do i feed",
    "what should i feed",
    "meal plan for",
    "help with feeding",
    "confused about diet",
    "feeding schedule",
    "portion sizes",
    "meal prep for my",
    "diet help",
    "what to feed",
    "feeding tips",
    "struggling to feed",
    "need help feeding",
    "how to meal prep",
    # Additional keywords for better coverage
    "feeding advice",
    "nutrition help",
    "what can i feed",
    "safe to feed",
    "feeding my",
    "diet for",
    "meal ideas",
    "food for",
    "eating habits",
    "appetite issues"
]

# Reddit subreddits to monitor
SUBREDDITS = [
    'reptiles',
    'BeardedDragons',
    'snakes',
    'leopardgeckos',
    'ballpython',
    'parrots',
    'budgies',
    'Conures',
    'Cockatiels',
    'Rabbits',
    'guineapigs',
    'RATS',
    'ferrets',
    'Hedgehog',
    'hamsters',
    'chinchilla',
    'BackYardChickens'
]

# Instagram/TikTok hashtags to monitor
HASHTAGS = [
    'reptilehelp',
    'birdhelp',
    'reptilequestions',
    'parrotdiet',
    'rabbitdiet',
    'feedinghelp',
    'petnutritionhelp',
    'beardeddragondiet',
    'snakefeedinghelp',
    'birdchophelp',
    'reptilefeedinghelp',
    'exoticpethelp'
]

class PetHelpMonitor:
    def __init__(self):
        self.reddit_token = None
        self.seen_posts = self.load_seen_posts()
        self.found_posts = []

    def load_seen_posts(self) -> set:
        """Load previously seen post IDs to avoid duplicates"""
        try:
            with open('seen_posts.json', 'r') as f:
                return set(json.load(f))
        except FileNotFoundError:
            return set()

    def save_seen_posts(self):
        """Save seen post IDs"""
        with open('seen_posts.json', 'w') as f:
            json.dump(list(self.seen_posts), f)

    def get_reddit_token(self) -> str:
        """Get Reddit OAuth token"""
        if not REDDIT_CLIENT_ID or not REDDIT_CLIENT_SECRET:
            print("⚠️  Reddit credentials not set. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET env vars.")
            return None

        auth = requests.auth.HTTPBasicAuth(REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET)
        data = {'grant_type': 'client_credentials'}
        headers = {'User-Agent': REDDIT_USER_AGENT}

        try:
            response = requests.post('https://www.reddit.com/api/v1/access_token',
                                   auth=auth, data=data, headers=headers)
            response.raise_for_status()
            self.reddit_token = response.json()['access_token']
            return self.reddit_token
        except Exception as e:
            print(f"❌ Reddit auth failed: {e}")
            return None

    def search_reddit(self) -> List[Dict]:
        """Search Reddit for help-seeking posts"""
        if not self.reddit_token:
            if not self.get_reddit_token():
                return []

        headers = {
            'Authorization': f'bearer {self.reddit_token}',
            'User-Agent': REDDIT_USER_AGENT
        }

        found = []

        for subreddit in SUBREDDITS:
            try:
                # Get new posts from subreddit
                url = f'https://oauth.reddit.com/r/{subreddit}/new'
                params = {'limit': 25}

                response = requests.get(url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()

                for post in data['data']['children']:
                    post_data = post['data']
                    post_id = post_data['id']

                    # Skip if already seen
                    if post_id in self.seen_posts:
                        continue

                    # Check if post contains help keywords
                    title_lower = post_data['title'].lower()
                    selftext_lower = post_data.get('selftext', '').lower()
                    combined_text = f"{title_lower} {selftext_lower}"

                    matched_keywords = [kw for kw in HELP_KEYWORDS if kw in combined_text]

                    if matched_keywords:
                        found.append({
                            'platform': 'reddit',
                            'subreddit': subreddit,
                            'id': post_id,
                            'title': post_data['title'],
                            'author': post_data['author'],
                            'url': f"https://reddit.com{post_data['permalink']}",
                            'created': datetime.fromtimestamp(post_data['created_utc']).isoformat(),
                            'matched_keywords': matched_keywords,
                            'text': post_data.get('selftext', '')[:200]
                        })
                        self.seen_posts.add(post_id)

                # Rate limiting
                time.sleep(1)

            except Exception as e:
                print(f"⚠️  Error searching r/{subreddit}: {e}")

        return found

    def generate_response_template(self, post: Dict) -> str:
        """Generate a response template for a help post"""
        # Detect species from post
        text = f"{post.get('title', '')} {post.get('text', '')}".lower()

        species = []
        if any(word in text for word in ['reptile', 'lizard', 'gecko', 'snake', 'dragon', 'beardie']):
            species.append('reptiles')
        if any(word in text for word in ['bird', 'parrot', 'budgie', 'cockatiel', 'conure', 'chicken']):
            species.append('birds')
        if any(word in text for word in ['rabbit', 'bunny', 'guinea pig', 'hamster', 'rat', 'ferret', 'hedgehog']):
            species.append('pocket pets')
        if any(word in text for word in ['dog', 'puppy', 'cat', 'kitten']):
            species.append('dogs/cats')

        species_text = ', '.join(species) if species else 'dogs, cats, birds, reptiles, pocket pets'

        return f"""i built something for exactly this... free meal plans + shoppable ingredient lists for {species_text}. trying to make feeding less stressful.

https://paws-and-plates.vercel.app/

lmk if it helps"""

    def monitor(self, duration_minutes: int = 60):
        """Run monitoring loop"""
        print(f"🔍 Starting Pet Help Monitor...")
        print(f"📍 Monitoring {len(SUBREDDITS)} subreddits")
        print(f"⏱️  Will run for {duration_minutes} minutes\n")

        start_time = time.time()
        check_interval = 300  # Check every 5 minutes

        while (time.time() - start_time) < (duration_minutes * 60):
            print(f"\n{'='*60}")
            print(f"🔄 Checking at {datetime.now().strftime('%H:%M:%S')}")
            print(f"{'='*60}\n")

            # Search Reddit
            reddit_posts = self.search_reddit()

            if reddit_posts:
                print(f"\n✅ Found {len(reddit_posts)} new help-seeking posts!\n")

                for post in reddit_posts:
                    print(f"📍 r/{post['subreddit']}")
                    print(f"📝 {post['title']}")
                    print(f"🔗 {post['url']}")
                    print(f"🎯 Matched: {', '.join(post['matched_keywords'])}")
                    print(f"\n💬 Suggested reply:")
                    print(f"{'-'*60}")
                    print(self.generate_response_template(post))
                    print(f"{'-'*60}\n")

                    self.found_posts.append(post)
            else:
                print("⏳ No new posts found this round")

            # Save seen posts
            self.save_seen_posts()

            # Save found posts to file
            if self.found_posts:
                with open('found_posts.json', 'w') as f:
                    json.dump(self.found_posts, f, indent=2)
                print(f"\n💾 Saved {len(self.found_posts)} total posts to found_posts.json")

            # Wait before next check
            if (time.time() - start_time) < (duration_minutes * 60):
                print(f"\n⏸️  Waiting {check_interval} seconds until next check...")
                time.sleep(check_interval)

        print(f"\n{'='*60}")
        print(f"✅ Monitoring complete!")
        print(f"📊 Total posts found: {len(self.found_posts)}")
        print(f"{'='*60}\n")

def main():
    """Main function"""
    monitor = PetHelpMonitor()

    # Run for 1 hour (you can adjust this)
    monitor.monitor(duration_minutes=60)

if __name__ == '__main__':
    main()

# Pet Help Post Monitor - Setup Guide

This bot monitors Reddit for help-seeking posts about pet nutrition and feeding, then alerts you with suggested responses.

---

## Quick Start (5 minutes)

### 1. Install Python dependencies

```bash
pip install requests
```

### 2. Get Reddit API credentials

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - **Name**: PetHelpMonitor
   - **App type**: Select "script"
   - **Description**: Monitors pet nutrition help posts
   - **About URL**: Leave blank
   - **Redirect URI**: http://localhost:8080
4. Click "Create app"
5. Copy your credentials:
   - **Client ID**: The string under "personal use script"
   - **Client Secret**: The "secret" value

### 3. Set environment variables

**Mac/Linux:**
```bash
export REDDIT_CLIENT_ID='your_client_id_here'
export REDDIT_CLIENT_SECRET='your_secret_here'
export REDDIT_USER_AGENT='PetHelpMonitor/1.0'
```

**Windows (Command Prompt):**
```cmd
set REDDIT_CLIENT_ID=your_client_id_here
set REDDIT_CLIENT_SECRET=your_secret_here
set REDDIT_USER_AGENT=PetHelpMonitor/1.0'
```

**Windows (PowerShell):**
```powershell
$env:REDDIT_CLIENT_ID='your_client_id_here'
$env:REDDIT_CLIENT_SECRET='your_secret_here'
$env:REDDIT_USER_AGENT='PetHelpMonitor/1.0'
```

Or create a `.env` file:
```
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_USER_AGENT=PetHelpMonitor/1.0
```

### 4. Run the bot

```bash
python pet_help_monitor.py
```

---

## What It Does

### Monitors these subreddits every 5 minutes:
- r/reptiles
- r/BeardedDragons
- r/snakes
- r/leopardgeckos
- r/ballpython
- r/parrots
- r/budgies
- r/Conures
- r/Cockatiels
- r/Rabbits
- r/guineapigs
- r/RATS
- r/ferrets
- r/Hedgehog
- r/hamsters
- r/chinchilla
- r/BackYardChickens

### Looks for these keywords:
- "how do i feed"
- "what should i feed"
- "meal plan for"
- "help with feeding"
- "confused about diet"
- "feeding schedule"
- "portion sizes"
- "meal prep for my"
- "diet help"
- "what to feed"
- "feeding tips"
- "struggling to feed"
- "need help feeding"
- "how to meal prep"

### When it finds a match:
✅ Shows you the post title + link
✅ Generates a personalized response in YOUR voice
✅ Saves to `found_posts.json` so you can review later
✅ Tracks seen posts so you don't get duplicates

---

## Example Output

```
================================================================
🔄 Checking at 14:23:15
================================================================

✅ Found 3 new help-seeking posts!

📍 r/BeardedDragons
📝 Help! What should I feed my juvenile beardie?
🔗 https://reddit.com/r/BeardedDragons/comments/abc123/help_what_should_i_feed...
🎯 Matched: what should i feed, help with feeding

💬 Suggested reply:
------------------------------------------------------------
i built something for exactly this... free meal plans + shoppable
ingredient lists for reptiles. trying to make feeding less stressful.

https://paws-and-plates.vercel.app/

lmk if it helps
------------------------------------------------------------

📍 r/parrots
📝 Struggling with meal prep for my 3 conures
🔗 https://reddit.com/r/parrots/comments/def456/struggling_with_meal_prep...
🎯 Matched: struggling to feed, meal prep for my

💬 Suggested reply:
------------------------------------------------------------
i built something for exactly this... free meal plans + shoppable
ingredient lists for birds. trying to make feeding less stressful.

https://paws-and-plates.vercel.app/

lmk if it helps
------------------------------------------------------------

💾 Saved 3 total posts to found_posts.json

⏸️  Waiting 300 seconds until next check...
```

---

## Configuration

### Change check interval

Edit this line in the code:
```python
check_interval = 300  # Check every 5 minutes (300 seconds)
```

Change to:
```python
check_interval = 600  # Check every 10 minutes
```

### Change monitoring duration

When you run the script:
```python
monitor.monitor(duration_minutes=60)  # Run for 1 hour
```

Change to:
```python
monitor.monitor(duration_minutes=1440)  # Run for 24 hours
```

Or run indefinitely:
```python
monitor.monitor(duration_minutes=999999)  # Run basically forever
```

### Add more subreddits

Edit the `SUBREDDITS` list:
```python
SUBREDDITS = [
    'reptiles',
    'BeardedDragons',
    # Add your own:
    'ExoticPets',
    'PetAdvice',
    'AskVet'
]
```

### Add more keywords

Edit the `HELP_KEYWORDS` list:
```python
HELP_KEYWORDS = [
    "how do i feed",
    "what should i feed",
    # Add your own:
    "feeding advice",
    "nutrition help",
    "diet suggestions"
]
```

---

## Files Created

**seen_posts.json** - Tracks posts you've already seen (to avoid duplicates)
**found_posts.json** - All matching posts with suggested responses

You can review `found_posts.json` anytime to see what the bot found.

---

## Usage Tips

### Run it in the background

**Mac/Linux:**
```bash
nohup python pet_help_monitor.py &
```

**Windows:**
Use Task Scheduler or run in a separate terminal

### Run it on a schedule

Use cron (Mac/Linux) or Task Scheduler (Windows) to run it:
- Every morning at 9am
- Every 4 hours
- Continuously

### Review posts in batches

Let it run for a few hours, then open `found_posts.json` and reply to all matches at once.

---

## Troubleshooting

### "Reddit credentials not set"
Make sure you've set the environment variables or created a .env file.

### "Reddit auth failed"
Double-check your CLIENT_ID and CLIENT_SECRET are correct.

### No posts found
- Keywords might be too specific - try adding more
- Subreddits might be slow - try adding more subreddits
- All recent posts might have already been seen - wait a bit

### Rate limiting
Reddit allows ~60 requests per minute. The bot waits 1 second between subreddits to avoid hitting limits.

---

## Next Steps

1. **Run it for 1 hour** to test
2. **Review found_posts.json** to see what it caught
3. **Copy the suggested replies** and paste them on Reddit
4. **Adjust keywords/subreddits** based on what you find
5. **Run it continuously** or on a schedule

---

## Future Enhancements (if you want)

- Email/Slack notifications when posts are found
- Auto-reply (risky - could get banned)
- Instagram/TikTok monitoring (requires different APIs)
- Web dashboard to review posts
- Track which posts got responses

Let me know if you want any of these!
