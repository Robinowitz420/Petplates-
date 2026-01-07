# Pet Help Post Monitor

A Python bot that monitors multiple platforms (Reddit, Stack Exchange) for help-seeking posts about pet nutrition and feeding, then alerts you with suggested responses.

## Features

- 🔍 **Multi-Platform Monitoring**: Reddit RSS + Stack Exchange API
- 📊 **17+ Reddit subreddits** + Stack Exchange pet site
- 🎯 **Intelligent keyword matching** for nutrition/diet questions
- 💬 **Personalized response templates** for each species
- 📝 **Tracks seen posts** to avoid duplicates across platforms
- 💾 **Centralized JSON storage** for batch review
- 🕐 **Configurable check intervals** and monitoring duration

## Quick Setup

### Option 1: Full API Version (Recommended)

#### 1. Install Dependencies
```bash
pip install requests
```

#### 2. Get Reddit API Credentials

**⚠️ Reddit API Access Restricted**: Reddit now requires approval for new API applications. You may need to:**

1. **Wait for Approval**: Apply at https://www.reddit.com/prefs/apps and wait for Reddit's review
2. **Use Existing App**: If you have other Reddit apps, you can reuse credentials
3. **Use RSS Alternative**: See Option 2 below

For the full API setup:
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

#### 3. Set Environment Variables

**Windows (Command Prompt):**
```cmd
set REDDIT_CLIENT_ID=your_client_id_here
set REDDIT_CLIENT_SECRET=your_secret_here
set REDDIT_USER_AGENT=PetHelpMonitor/1.0
```

**Windows (PowerShell):**
```powershell
$env:REDDIT_CLIENT_ID='your_client_id_here'
$env:REDDIT_CLIENT_SECRET='your_secret_here'
$env:REDDIT_USER_AGENT='PetHelpMonitor/1.0'
```

**Mac/Linux:**
```bash
export REDDIT_CLIENT_ID='your_client_id_here'
export REDDIT_CLIENT_SECRET='your_secret_here'
export REDDIT_USER_AGENT='PetHelpMonitor/1.0'
```

Or create a `.env` file:
```
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_USER_AGENT=PetHelpMonitor/1.0
```

#### 4. Run the Bot
```bash
python pet_help_monitor.py
```

### Option 2: RSS Feed Version (No API Required) 🚀 RECOMMENDED

If Reddit API access is blocked, use the RSS version - it's simpler and works immediately:

#### Install RSS Dependencies
```bash
pip install requests feedparser
```

#### Run the RSS Version
```bash
python pet_help_monitor_rss.py
```

**Advantages:**
- ✅ **No API credentials needed** - works immediately
- ✅ **Uses Reddit's public RSS feeds** - no approval required
- ✅ **Automatic duplicate prevention** - tracks seen posts
- ✅ **Same intelligent matching** - finds help posts with keywords
- ✅ **Same response generation** - personalized replies for each species
- ⚠️ **Titles only** - can't read full post content (but titles often contain the question)

**What it finds:** Same keywords, same subreddits, same response templates - just using RSS instead of API.

## What It Monitors

### Subreddits (17 total)
- r/reptiles, r/BeardedDragons, r/snakes, r/leopardgeckos, r/ballpython
- r/parrots, r/budgies, r/Conures, r/Cockatiels
- r/Rabbits, r/guineapigs, r/RATS, r/ferrets, r/Hedgehog
- r/hamsters, r/chinchilla, r/BackYardChickens

### Keywords (14 total)
- "how do i feed", "what should i feed", "meal plan for"
- "help with feeding", "confused about diet", "feeding schedule"
- "portion sizes", "meal prep for my", "diet help"
- "what to feed", "feeding tips", "struggling to feed"
- "need help feeding", "how to meal prep"

## Example Output

```
================================================================
🔄 Checking at 14:23:15
================================================================

✅ Found 3 new help-seeking posts!

📍 r/BeardedDragons
📝 Help! What should I feed my juvenile beardie?
🔗 https://reddit.com/r/BeardedDragons/comments/abc123/...
🎯 Matched: what should i feed, help with feeding

💬 Suggested reply:
------------------------------------------------------------
i built something for exactly this... free meal plans + shoppable
ingredient lists for reptiles. trying to make feeding less stressful.

https://paws-and-plates.vercel.app/

lmk if it helps
------------------------------------------------------------

💾 Saved 3 total posts to found_posts.json
```

## Configuration

### Change Check Interval
```python
check_interval = 300  # Check every 5 minutes
```

### Change Monitoring Duration
```python
monitor.monitor(duration_minutes=60)  # Run for 1 hour
monitor.monitor(duration_minutes=1440)  # Run for 24 hours
```

### Add More Subreddits
```python
SUBREDDITS = [
    'reptiles',
    'BeardedDragons',
    # Add your own:
    'ExoticPets',
    'PetAdvice'
]
```

### Add More Keywords
```python
HELP_KEYWORDS = [
    "how do i feed",
    # Add your own:
    "feeding advice",
    "nutrition help"
]
```

## Files Created

- `seen_posts.json` - Tracks posts you've already seen
- `found_posts.json` - All matching posts with suggested responses

## Usage Tips

### Run in Background (Mac/Linux)
```bash
nohup python pet_help_monitor.py &
```

### Run in Background (Windows)
Use Task Scheduler or run in a separate terminal window.

### Batch Review
Let it run for hours, then review `found_posts.json` and reply to matches in batches.

## Troubleshooting

### "Reddit credentials not set"
Make sure you've set the environment variables or created a `.env` file.

### "Reddit auth failed"
Double-check your CLIENT_ID and CLIENT_SECRET are correct.

### No posts found
- Keywords might be too specific - try adding more
- Subreddits might be slow - try adding more subreddits
- All recent posts might have already been seen - wait a bit

## Important Notes

- **Rate Limiting**: Reddit allows ~60 requests per minute. The bot waits 1 second between subreddits.
- **No Automation**: This bot only finds and suggests responses - you manually reply on Reddit.
- **Ethical Use**: Use responsibly and follow Reddit's rules.

## Future Enhancements

- Email/Slack notifications when posts are found
- Instagram/TikTok monitoring
- Web dashboard to review posts
- Auto-tracking of response success
