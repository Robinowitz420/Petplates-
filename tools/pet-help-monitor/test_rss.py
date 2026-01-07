#!/usr/bin/env python3
"""
Quick test script for the RSS version
"""

import sys
import os
sys.path.append('.')

from pet_help_monitor_rss import PetHelpMonitorRSS

def test_rss():
    """Test the RSS functionality"""
    print("Testing Pet Help Monitor RSS Version")
    print("=" * 50)

    monitor = PetHelpMonitorRSS()

    # Test just one subreddit to avoid rate limits
    test_subreddit = 'reptiles'

    print(f"Testing RSS feed for r/{test_subreddit}...")

    try:
        posts = monitor.parse_rss_feed(test_subreddit)

        if posts:
            print(f"Found {len(posts)} recent posts in r/{test_subreddit}")
            print("\nSample posts:")
            for i, post in enumerate(posts[:3]):  # Show first 3
                print(f"  {i+1}. {post['title'][:60]}...")
        else:
            print("No posts found or RSS feed unavailable")
    except Exception as e:
        print(f"Error: {e}")

    print("\nTesting keyword matching...")

    # Test keyword matching with sample titles
    sample_titles = [
        "Help! What should I feed my bearded dragon?",
        "How do I feed my ball python?",
        "Meal plan for my leopard gecko",
        "Just bought a parrot, what to feed?",
        "Normal post about reptile care"
    ]

    keywords = [
        "how do i feed", "what should i feed", "meal plan for",
        "help with feeding", "feeding advice"
    ]

    for title in sample_titles:
        title_lower = title.lower()
        matches = [kw for kw in keywords if kw in title_lower]
        status = "MATCH" if matches else "No match"
        print(f"  {status}: {title}")
        if matches:
            print(f"    Keywords: {', '.join(matches)}")

if __name__ == '__main__':
    test_rss()
