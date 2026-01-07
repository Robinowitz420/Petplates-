import os
import json
import time
from datetime import datetime
import requests
import feedparser
from typing import List, Dict

"""
Pet Help Post Monitor Bot - RSS Version
Monitors Reddit RSS feeds for help-seeking posts about pet nutrition/feeding.
No API credentials required!
"""

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
    "feeding advice",
    "nutrition help",
    "what can i feed",
    "safe to feed",
    "feeding my",
    "diet for",
    "meal ideas",
    "food for"
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
    'chinchilla'
]

class PetHelpMonitorRSS:
    def __init__(self):
        self.seen_posts = self.load_seen_posts()
        self.found_posts = []
        self.user_agent = 'PetHelpMonitor-RSS/1.0'

    def load_seen_posts(self) -> set:
        """Load previously seen post IDs to avoid duplicates"""
        try:
            with open('seen_posts_rss.json', 'r') as f:
                return set(json.load(f))
        except FileNotFoundError:
            return set()

    def save_seen_posts(self):
        """Save seen post IDs"""
        with open('seen_posts_rss.json', 'w') as f:
            json.dump(list(self.seen_posts), f)

    def parse_rss_feed(self, subreddit: str) -> List[Dict]:
        """Parse RSS feed for a subreddit"""
        url = f'https://www.reddit.com/r/{subreddit}/new/.rss'

        headers = {
            'User-Agent': self.user_agent,
            'Accept': 'application/rss+xml, application/xml'
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            # Parse RSS feed
            feed = feedparser.parse(response.content)

            posts = []
            for entry in feed.entries:
                # Extract post ID from various possible sources
                post_id = None

                # Try to get ID from link
                if hasattr(entry, 'link') and entry.link:
                    # Reddit links usually end with post ID
                    link_parts = entry.link.split('/')
                    if len(link_parts) > 6:
                        post_id = link_parts[6]  # Usually the post ID

                # Try to get ID from id field
                if not post_id and hasattr(entry, 'id'):
                    post_id = entry.id.split('/')[-1] if '/' in entry.id else entry.id

                # Skip if no ID or already seen
                if not post_id or post_id in self.seen_posts:
                    continue

                title = entry.title if hasattr(entry, 'title') else ''
                link = entry.link if hasattr(entry, 'link') else ''

                posts.append({
                    'id': post_id,
                    'title': title,
                    'link': link,
                    'subreddit': subreddit
                })

            return posts

        except Exception as e:
            print(f"Error fetching RSS for r/{subreddit}: {e}")
            return []

    def search_rss_feeds(self) -> List[Dict]:
        """Search RSS feeds for help-seeking posts"""
        found = []

        for subreddit in SUBREDDITS:
            try:
                posts = self.parse_rss_feed(subreddit)

                for post in posts:
                    title_lower = post['title'].lower()

                    # Check if post contains help keywords
                    matched_keywords = [kw for kw in HELP_KEYWORDS if kw in title_lower]

                    if matched_keywords:
                        post_data = {
                            'platform': 'reddit',
                            'subreddit': subreddit,
                            'id': post['id'],
                            'title': post['title'],
                            'url': post['link'],
                            'created': datetime.now().isoformat(),
                            'matched_keywords': matched_keywords,
                            'text': ''  # RSS doesn't provide full text
                        }

                        found.append(post_data)
                        self.seen_posts.add(post['id'])

                # Rate limiting - be respectful
                time.sleep(2)

            except Exception as e:
                print(f"Error processing r/{subreddit}: {e}")

        return found

    def generate_response_template(self, post: Dict) -> str:
        """Generate a response template for a help post"""
        # Detect species from post title
        text = post.get('title', '').lower()

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
        print(f"Starting Pet Help Monitor (Multi-Platform Version)")
        print(f"Monitoring {len(SUBREDDITS)} subreddits via RSS feeds")
        print(f"Will run for {duration_minutes} minutes\n")

        start_time = time.time()
        check_interval = 600  # Check every 10 minutes (RSS feeds update less frequently)

        while (time.time() - start_time) < (duration_minutes * 60):
            print(f"\n{'='*60}")
            print(f"Checking RSS feeds at {datetime.now().strftime('%H:%M:%S')}")
            print(f"{'='*60}\n")

            # Search RSS feeds
            reddit_posts = self.search_rss_feeds()

            if reddit_posts:
                print(f"\nFound {len(reddit_posts)} new help-seeking posts!\n")

                for post in reddit_posts:
                    print(f"r/{post['subreddit']}")
                    print(f"Title: {post['title']}")
                    print(f"URL: {post['url']}")
                    print(f"Matched keywords: {', '.join(post['matched_keywords'])}")
                    print(f"\nSuggested reply:")
                    print(f"{'-'*60}")
                    print(self.generate_response_template(post))
                    print(f"{'-'*60}\n")

                    self.found_posts.append(post)
            else:
                print("No new posts found this round")

            # Save seen posts
            self.save_seen_posts()

            # Save found posts to file
            if self.found_posts:
                with open('found_posts_rss.json', 'w') as f:
                    json.dump(self.found_posts, f, indent=2)
                print(f"\nSaved {len(self.found_posts)} total posts to found_posts_rss.json")

            # Wait before next check
            if (time.time() - start_time) < (duration_minutes * 60):
                print(f"\nWaiting {check_interval} seconds until next check...")
                time.sleep(check_interval)

        print(f"\n{'='*60}")
        print(f"Monitoring complete!")
        print(f"Total posts found: {len(self.found_posts)}")
        print(f"{'='*60}\n")

def main():
    """Main function"""
    monitor = PetHelpMonitorRSS()

    # Check command line args for quick test
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--quick':
        print("Running quick test (1 minute)...")
        monitor.monitor(duration_minutes=1)
    else:
        # Run for 1 hour (you can adjust this)
        monitor.monitor(duration_minutes=60)

if __name__ == '__main__':
    main()
