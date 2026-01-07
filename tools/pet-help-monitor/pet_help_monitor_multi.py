#!/usr/bin/env python3
"""
Pet Help Post Monitor - Multi-Platform Version
Monitors Reddit, Quora, Stack Exchange, and more for pet feeding help posts
"""

import os
import json
import time
import requests
import feedparser
from datetime import datetime
from typing import List, Dict, Any

# Keywords to monitor
HELP_KEYWORDS = [
    "how do i feed", "what should i feed", "meal plan for",
    "help with feeding", "confused about diet", "feeding schedule",
    "portion sizes", "meal prep for my", "diet help", "what to feed",
    "feeding tips", "struggling to feed", "need help feeding", "how to meal prep",
    "feeding advice", "nutrition help", "what can i feed", "safe to feed",
    "feeding my", "diet for", "meal ideas", "food for"
]

class MultiPlatformPetMonitor:
    def __init__(self):
        self.seen_posts = self.load_seen_posts()
        self.found_posts = []
        self.user_agent = 'PetHelpMonitor-Multi/1.0'

    def load_seen_posts(self) -> Dict[str, set]:
        """Load previously seen post IDs by platform"""
        try:
            with open('seen_posts_multi.json', 'r') as f:
                data = json.load(f)
                return {platform: set(posts) for platform, posts in data.items()}
        except FileNotFoundError:
            return {}

    def save_seen_posts(self):
        """Save seen post IDs"""
        data = {platform: list(posts) for platform, posts in self.seen_posts.items()}
        with open('seen_posts_multi.json', 'w') as f:
            json.dump(data, f, indent=2)

    # REDDIT MONITORING
    def search_reddit_rss(self) -> List[Dict]:
        """Search Reddit RSS feeds"""
        subreddits = [
            'reptiles', 'BeardedDragons', 'snakes', 'leopardgeckos', 'ballpython',
            'parrots', 'budgies', 'Conures', 'Cockatiels',
            'Rabbits', 'guineapigs', 'RATS', 'ferrets', 'Hedgehog',
            'hamsters', 'chinchilla', 'BackYardChickens'
        ]

        found = []
        for subreddit in subreddits:
            try:
                url = f'https://www.reddit.com/r/{subreddit}/new/.rss'
                headers = {'User-Agent': self.user_agent}
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()

                feed = feedparser.parse(response.content)
                for entry in feed.entries:
                    post_id = self.extract_reddit_post_id(entry)
                    if not post_id or post_id in self.seen_posts.get('reddit', set()):
                        continue

                    title = entry.title if hasattr(entry, 'title') else ''
                    if self.matches_keywords(title):
                        found.append({
                            'platform': 'reddit',
                            'subreddit': subreddit,
                            'id': post_id,
                            'title': title,
                            'url': entry.link if hasattr(entry, 'link') else '',
                            'created': datetime.now().isoformat(),
                            'matched_keywords': self.get_matched_keywords(title),
                            'text': ''
                        })
                        self.seen_posts.setdefault('reddit', set()).add(post_id)

                time.sleep(2)  # Rate limiting

            except Exception as e:
                print(f"Reddit RSS error for r/{subreddit}: {e}")

        return found

    def extract_reddit_post_id(self, entry) -> str:
        """Extract post ID from Reddit RSS entry"""
        if hasattr(entry, 'link') and entry.link:
            parts = entry.link.split('/')
            if len(parts) > 6:
                return parts[6]  # Post ID
        if hasattr(entry, 'id'):
            return entry.id.split('/')[-1]
        return ''

    # QUORA MONITORING
    def search_quora(self) -> List[Dict]:
        """Search Quora for pet feeding questions"""
        found = []

        # Quora search queries for pet feeding
        search_queries = [
            "pet feeding help",
            "dog feeding schedule",
            "cat feeding advice",
            "pet nutrition questions",
            "reptile feeding",
            "bird feeding",
            "rabbit feeding",
            "hamster feeding"
        ]

        for query in search_queries:
            try:
                # Quora search URL
                url = "https://www.quora.com/search"
                params = {
                    'q': query,
                    'time': 'week',  # Last week
                    'sort': 'recent',
                    'type': 'question'
                }

                headers = {
                    'User-Agent': self.user_agent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }

                response = requests.get(url, params=params, headers=headers, timeout=15)
                response.raise_for_status()

                # Parse the HTML response to extract questions
                # This is simplified - in production you'd want more robust parsing
                content = response.text

                # Extract question data from HTML (simplified approach)
                questions = self.parse_quora_html(content, query)

                for question in questions:
                    question_id = question['id']
                    if question_id in self.seen_posts.get('quora', set()):
                        continue

                    title = question['title']
                    if self.matches_keywords(title):
                        found.append({
                            'platform': 'quora',
                            'id': question_id,
                            'title': title,
                            'url': question['url'],
                            'created': question.get('created', datetime.now().isoformat()),
                            'matched_keywords': self.get_matched_keywords(title),
                            'text': question.get('excerpt', '')
                        })
                        self.seen_posts.setdefault('quora', set()).add(question_id)

                time.sleep(3)  # Rate limiting

            except Exception as e:
                print(f"Quora search error for '{query}': {e}")

        return found

    def parse_quora_html(self, html: str, query: str) -> List[Dict]:
        """Parse Quora HTML to extract questions (simplified)"""
        questions = []

        # This is a very basic HTML parser - in production, use BeautifulSoup
        # For now, we'll return mock data to demonstrate the concept

        # Mock questions based on common Quora pet feeding questions
        mock_questions = [
            {
                'id': f'quora_{query.replace(" ", "_")}_1',
                'title': f'How do I transition my dog from kibble to raw feeding?',
                'url': f'https://www.quora.com/How-do-I-transition-my-dog-from-kibble-to-raw-feeding',
                'excerpt': 'My 5-year-old Labrador has been on kibble his whole life. I want to switch to raw feeding but don\'t know how to do it safely.',
                'created': datetime.now().isoformat()
            },
            {
                'id': f'quora_{query.replace(" ", "_")}_2',
                'title': f'What should I feed my constipated cat?',
                'url': f'https://www.quora.com/What-should-I-feed-my-constipated-cat',
                'excerpt': 'My cat hasn\'t pooped in 3 days and seems uncomfortable. What foods can help with constipation?',
                'created': datetime.now().isoformat()
            },
            {
                'id': f'quora_{query.replace(" ", "_")}_3',
                'title': f'Feeding schedule for a 3-month-old puppy?',
                'url': f'https://www.quora.com/Feeding-schedule-for-a-3-month-old-puppy',
                'excerpt': 'I just got a 3-month-old puppy. How many times a day should I feed him and what portions?',
                'created': datetime.now().isoformat()
            }
        ]

        # Only return questions that match our keywords
        for q in mock_questions:
            if self.matches_keywords(q['title']):
                questions.append(q)

        return questions

    # STACK EXCHANGE MONITORING
    def search_stack_exchange(self) -> List[Dict]:
        """Search Stack Exchange pet sites"""
        sites = ['pets']
        found = []

        for site in sites:
            try:
                # Stack Exchange API (has generous rate limits)
                url = f'https://api.stackexchange.com/2.3/questions'
                params = {
                    'site': site,
                    'tagged': 'feeding,diet,nutrition',
                    'sort': 'creation',
                    'order': 'desc',
                    'pagesize': 50,
                    'key': os.getenv('STACK_EXCHANGE_KEY', '')  # Optional API key
                }

                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()

                for question in data.get('items', []):
                    question_id = str(question['question_id'])
                    if question_id in self.seen_posts.get('stackexchange', set()):
                        continue

                    title = question.get('title', '')
                    if self.matches_keywords(title):
                        found.append({
                            'platform': 'stackexchange',
                            'site': site,
                            'id': question_id,
                            'title': title,
                            'url': question.get('link', ''),
                            'created': datetime.fromtimestamp(question.get('creation_date', 0)).isoformat(),
                            'matched_keywords': self.get_matched_keywords(title),
                            'text': question.get('body', '')[:200]
                        })
                        self.seen_posts.setdefault('stackexchange', set()).add(question_id)

                time.sleep(1)  # Rate limiting

            except Exception as e:
                print(f"Stack Exchange error for {site}: {e}")

        return found

    # UTILITY METHODS
    def matches_keywords(self, text: str) -> bool:
        """Check if text contains any help keywords"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in HELP_KEYWORDS)

    def get_matched_keywords(self, text: str) -> List[str]:
        """Get list of matched keywords"""
        text_lower = text.lower()
        return [kw for kw in HELP_KEYWORDS if kw in text_lower]

    def generate_response_template(self, post: Dict) -> str:
        """Generate a response template for a help post"""
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
        print(f"Starting Pet Help Monitor (Multi-Platform Version)")
        print(f"Monitoring: Reddit RSS, Stack Exchange API")
        print(f"Will run for {duration_minutes} minutes\n")

        start_time = time.time()
        check_interval = 600  # Check every 10 minutes

        while (time.time() - start_time) < (duration_minutes * 60):
            print(f"\n{'='*60}")
            print(f"Checking platforms at {datetime.now().strftime('%H:%M:%S')}")
            print(f"{'='*60}\n")

            # Search all platforms
            all_posts = []
            all_posts.extend(self.search_reddit_rss())
            all_posts.extend(self.search_stack_exchange())
            # Quora blocked automated access - removed for now

            if all_posts:
                print(f"Found {len(all_posts)} new help-seeking posts!\n")

                for post in all_posts:
                    print(f"Platform: {post['platform']}")
                    if 'subreddit' in post:
                        print(f"  r/{post['subreddit']}")
                    elif 'site' in post:
                        print(f"  {post['site']}.stackexchange.com")
                    print(f"  Title: {post['title']}")
                    print(f"  URL: {post['url']}")
                    print(f"  Matched keywords: {', '.join(post['matched_keywords'])}")
                    print(f"\n  Suggested reply:")
                    print(f"{'-'*60}")
                    print(self.generate_response_template(post))
                    print(f"{'-'*60}\n")

                    self.found_posts.append(post)
            else:
                print("No new posts found this round")

            # Save data
            self.save_seen_posts()
            if self.found_posts:
                with open('found_posts_multi.json', 'w') as f:
                    json.dump(self.found_posts, f, indent=2)
                print(f"\n💾 Saved {len(self.found_posts)} total posts to found_posts_multi.json")

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
    monitor = MultiPlatformPetMonitor()

    # Check command line args
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--quick':
        print("Running quick test (1 minute)...")
        monitor.monitor(duration_minutes=1)
    else:
        monitor.monitor(duration_minutes=60)

if __name__ == '__main__':
    main()
