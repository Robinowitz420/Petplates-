#!/usr/bin/env python3
"""
Check the status of the Pet Help Monitor bot
"""

import os
import json
from datetime import datetime

def check_status():
    """Check bot status and show any found posts"""
    print("Pet Help Monitor RSS Bot Status")
    print("=" * 40)

    # Check seen posts
    if os.path.exists('seen_posts_rss.json'):
        with open('seen_posts_rss.json', 'r') as f:
            seen_posts = json.load(f)
        print(f"Posts seen so far: {len(seen_posts)}")
    else:
        print("No seen posts file found")

    # Check found posts
    if os.path.exists('found_posts_rss.json'):
        with open('found_posts_rss.json', 'r') as f:
            found_posts = json.load(f)
        if found_posts:
            print(f"✅ Found {len(found_posts)} matching posts!")
            print("\nRecent matches:")
            for i, post in enumerate(found_posts[-3:], 1):  # Show last 3
                print(f"{i}. r/{post['subreddit']}: {post['title'][:50]}...")
                if 'matched_keywords' in post:
                    print(f"   Keywords: {', '.join(post['matched_keywords'])}")
                print()
        else:
            print("No matching posts found yet")
    else:
        print("No found posts yet - bot is still searching")

    print("\nBot is monitoring these subreddits:")
    subreddits = [
        'reptiles', 'BeardedDragons', 'snakes', 'leopardgeckos', 'ballpython',
        'parrots', 'budgies', 'Conures', 'Cockatiels',
        'Rabbits', 'guineapigs', 'RATS', 'ferrets', 'Hedgehog',
        'hamsters', 'chinchilla'
    ]
    for subreddit in subreddits:
        print(f"  - r/{subreddit}")

    print(f"\nLast checked: {datetime.now().strftime('%H:%M:%S')}")
    print("Check back in a few minutes or run this script again!")

if __name__ == '__main__':
    check_status()
