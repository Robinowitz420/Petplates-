#!/usr/bin/env python3
"""
Test script for the multi-platform pet help monitor
"""

import sys
sys.path.append('.')

from pet_help_monitor_multi import MultiPlatformPetMonitor

def test_multi_platform():
    """Test the multi-platform functionality"""
    print("Testing Multi-Platform Pet Help Monitor")
    print("=" * 50)

    monitor = MultiPlatformPetMonitor()

    print("Testing Quora search...")
    try:
        quora_posts = monitor.search_quora()
        print(f"Found {len(quora_posts)} Quora questions")

        for post in quora_posts[:2]:  # Show first 2
            print(f"  • {post['title'][:60]}...")
            if post.get('matched_keywords'):
                print(f"    Keywords: {', '.join(post['matched_keywords'])}")
    except Exception as e:
        print(f"Quora test failed: {e}")

    print("\nTesting Stack Exchange...")
    try:
        se_posts = monitor.search_stack_exchange()
        print(f"Found {len(se_posts)} Stack Exchange questions")

        for post in se_posts[:2]:  # Show first 2
            print(f"  • {post['title'][:60]}...")
            if post.get('matched_keywords'):
                print(f"    Keywords: {', '.join(post['matched_keywords'])}")
    except Exception as e:
        print(f"Stack Exchange test failed: {e}")

    print("\nTesting keyword matching...")
    test_titles = [
        "How do I feed my diabetic dog?",
        "What should I feed my cat?",
        "Meal plan for bearded dragon",
        "Normal post about pets"
    ]

    for title in test_titles:
        matches = monitor.get_matched_keywords(title)
        status = "MATCH" if matches else "No match"
        print(f"  {status}: {title}")
        if matches:
            print(f"    Found: {', '.join(matches)}")

    print("\nTesting response generation...")
    test_post = {
        'title': 'How do I feed my bearded dragon?',
        'text': 'My beardie won\'t eat crickets anymore'
    }

    response = monitor.generate_response_template(test_post)
    print("Sample response:")
    print("-" * 40)
    print(response)
    print("-" * 40)

if __name__ == '__main__':
    test_multi_platform()
