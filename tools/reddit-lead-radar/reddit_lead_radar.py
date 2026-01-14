#!/usr/bin/env python3
"""
Reddit Lead Radar for Paws & Plates
A sophisticated system for monitoring Reddit for pet feeding help opportunities.
"""

import os
import json
import sqlite3
import time
import hashlib
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import requests
import feedparser
from pathlib import Path
import base64

class RedditLeadRadar:
    def __init__(self, config_dir: str = "config"):
        self.config_dir = Path(config_dir)
        self.db_path = Path("leads.db")

        # Load configurations
        self.subreddits_config = self.load_config("subreddits.json")
        self.intent_phrases = self.load_config("intent_phrases.json")
        self.seed_questions = self.load_config("seed_questions.json")
        self.blacklist = self.load_config("blacklist.json")
        self.search_queries = self.load_config("search_queries.json")
        self.megathreads = self.load_config("megathreads.json")

        # Reddit API credentials
        self.reddit_client_id = os.getenv('REDDIT_CLIENT_ID')
        self.reddit_client_secret = os.getenv('REDDIT_CLIENT_SECRET')
        self.reddit_access_token = None
        self.token_expires_at = 0

        # Initialize database
        self.init_database()

        # Tracking
        self.processed_ids = set()
        self.load_processed_ids()

    def load_config(self, filename: str) -> Dict[str, Any]:
        """Load a configuration file"""
        # Use script directory as base
        script_dir = Path(__file__).parent
        config_path = script_dir / self.config_dir / filename
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Config file {filename} not found at {config_path}")
            return {}
        except json.JSONDecodeError as e:
            print(f"Error parsing {filename}: {e}")
            return {}

    def init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create posts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                subreddit TEXT NOT NULL,
                author TEXT,
                title TEXT NOT NULL,
                body TEXT,
                url TEXT,
                score INTEGER,
                num_comments INTEGER,
                created_utc REAL,
                processed_at REAL,
                intent_score REAL DEFAULT 0,
                semantic_score REAL DEFAULT 0,
                final_score REAL DEFAULT 0,
                is_emergency BOOLEAN DEFAULT 0,
                species TEXT,
                tags TEXT,
                draft_reply TEXT,
                entities TEXT,
                intent_matches TEXT
            )
        ''')

        # Create comments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                post_id TEXT,
                author TEXT,
                body TEXT,
                score INTEGER,
                created_utc REAL,
                processed_at REAL,
                intent_score REAL DEFAULT 0,
                semantic_score REAL DEFAULT 0,
                final_score REAL DEFAULT 0,
                is_emergency BOOLEAN DEFAULT 0,
                species TEXT,
                tags TEXT,
                entities TEXT,
                intent_matches TEXT,
                FOREIGN KEY (post_id) REFERENCES posts (id)
            )
        ''')

        # Create leads table for high-scoring opportunities
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                post_id TEXT,
                comment_id TEXT,
                subreddit TEXT,
                author TEXT,
                title TEXT,
                content TEXT,
                url TEXT,
                score REAL,
                species TEXT,
                intent_matches TEXT,
                semantic_matches TEXT,
                draft_reply TEXT,
                entities TEXT,
                created_at REAL,
                reviewed BOOLEAN DEFAULT 0,
                FOREIGN KEY (post_id) REFERENCES posts (id),
                FOREIGN KEY (comment_id) REFERENCES comments (id)
            )
        ''')

        conn.commit()
        conn.close()

    def load_processed_ids(self):
        """Load IDs of already processed posts/comments"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM posts")
        self.processed_ids.update([row[0] for row in cursor.fetchall()])

        cursor.execute("SELECT id FROM comments")
        self.processed_ids.update([row[0] for row in cursor.fetchall()])

        conn.close()

        print(f"Loaded {len(self.processed_ids)} processed post/comment IDs")

    def is_blacklisted(self, text: str, author: str = "") -> bool:
        """Check if content or author is blacklisted"""
        text_lower = text.lower()
        author_lower = (author or "").lower()

        # Check banned words
        for word in self.blacklist.get("banned_words", []):
            if word.lower() in text_lower:
                return True

        # Check banned substrings
        for substring in self.blacklist.get("banned_substrings", []):
            if substring.lower() in text_lower:
                return True

        # Check banned users
        for banned_user in self.blacklist.get("banned_users", []):
            if banned_user.lower() in author_lower:
                return True

        return False

    def is_emergency(self, text: str) -> bool:
        """Check if post indicates a medical emergency"""
        text_lower = text.lower()
        emergency_keywords = self.seed_questions.get("emergency_keywords", [])

        for keyword in emergency_keywords:
            if keyword.lower() in text_lower:
                return True

        return False

    def extract_species(self, text: str) -> Optional[str]:
        """Extract species from text"""
        text_lower = text.lower()

        species_map = {
            'reptiles': ['reptile', 'lizard', 'gecko', 'snake', 'dragon', 'beardie', 'turtle', 'tortoise'],
            'birds': ['bird', 'parrot', 'budgie', 'cockatiel', 'conure', 'chicken', 'duck', 'goose'],
            'pocket_pets': ['rabbit', 'bunny', 'guinea pig', 'hamster', 'rat', 'ferret', 'hedgehog', 'gerbil'],
            'dogs': ['dog', 'puppy', 'canine'],
            'cats': ['cat', 'kitten', 'feline']
        }

        for species, keywords in species_map.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return species

        return None

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract entities like age, weight, conditions from text"""
        text_lower = text.lower()
        entities = {
            'age': None,
            'weight': None,
            'weight_unit': None,
            'conditions': [],
            'allergies': [],
            'diet_type': None
        }

        # Extract age
        age_patterns = [
            r'(\d+)\s*(year|yr|month|mo|week|wk)s?\s*old',
            r'(\d+)\s*(year|yr|month|mo|week|wk)s?\s*old',
            r'age\s*(\d+)',
            r'(\d+)\s*years?\s*old',
            r'(\d+)\s*months?\s*old'
        ]

        for pattern in age_patterns:
            match = re.search(pattern, text_lower)
            if match:
                age_num = int(match.group(1))
                age_unit = match.group(2) if len(match.groups()) > 1 else 'year'
                entities['age'] = f"{age_num} {age_unit}{'s' if age_num != 1 else ''}"
                break

        # Extract weight
        weight_patterns = [
            r'(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds|kg|kgs|kilogram|kilograms|oz|ounces)',
            r'weigh(?:s|ing)?\s*(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds|kg|kgs|kilogram|kilograms|oz|ounces)',
            r'(\d+(?:\.\d+)?)\s*(lb|lbs|kg|kgs)'
        ]

        for pattern in weight_patterns:
            match = re.search(pattern, text_lower)
            if match:
                entities['weight'] = float(match.group(1))
                entities['weight_unit'] = match.group(2) if len(match.groups()) > 1 else match.group(2)
                break

        # Extract conditions/health issues
        health_keywords = [
            'diarrhea', 'constipation', 'vomiting', 'arthritis', 'joint pain',
            'skin issues', 'itching', 'allergies', 'ear infection', 'uti',
            'kidney disease', 'diabetes', 'thyroid', 'cancer', 'obesity',
            'underweight', 'picky eater', 'food refusal', 'weight loss', 'weight gain'
        ]

        for keyword in health_keywords:
            if keyword in text_lower:
                entities['conditions'].append(keyword)

        # Extract diet preferences
        diet_keywords = [
            'raw', 'kibble', 'wet food', 'dry food', 'homemade', 'cooked',
            'grain free', 'limited ingredient', 'prescription diet', 'hypoallergenic'
        ]

        for keyword in diet_keywords:
            if keyword in text_lower:
                entities['diet_type'] = keyword
                break

        return entities

    def calculate_intent_score(self, text: str) -> float:
        """Calculate intent score based on high-signal phrases with enhanced matching"""
        if not text:
            return 0.0

        text_lower = text.lower()
        intent_phrases = self.intent_phrases.get("high_signal_phrases", [])
        weights = self.intent_phrases.get("scoring_weights", {})

        max_score = 0.0
        matched_phrases = []

        for phrase in intent_phrases:
            phrase_lower = phrase.lower()

            # Exact match
            if phrase_lower in text_lower:
                if phrase_lower == text_lower.strip():
                    max_score = max(max_score, weights.get("exact_match", 1.0))
                else:
                    max_score = max(max_score, weights.get("partial_match", 0.7))
                matched_phrases.append(phrase)
                continue

            # Fuzzy partial matching - check for significant word overlap
            phrase_words = set(phrase_lower.split())
            text_words = set(text_lower.split())

            overlap = len(phrase_words.intersection(text_words))
            if overlap >= max(1, len(phrase_words) * 0.6):  # 60% word overlap
                max_score = max(max_score, weights.get("semantic_match", 0.5))
                matched_phrases.append(f"fuzzy: {phrase}")

        # Store for debugging
        self._last_intent_matches = matched_phrases

        return min(max_score, 1.0)

    def calculate_semantic_score(self, text: str, species: Optional[str] = None) -> float:
        """Calculate semantic similarity to seed questions"""
        if not text or not species:
            return 0.0

        # Simple TF-IDF style matching (could be upgraded to embeddings)
        text_words = set(text.lower().split())
        max_score = 0.0

        for seed_question in self.seed_questions.get(species, []):
            seed_words = set(seed_question.lower().split())
            intersection = text_words.intersection(seed_words)
            union = text_words.union(seed_words)

            if union:
                jaccard_similarity = len(intersection) / len(union)
                max_score = max(max_score, jaccard_similarity)

        return max_score

    def calculate_freshness_score(self, created_utc: float) -> float:
        """Calculate freshness score (newer posts score higher)"""
        now = time.time()
        hours_old = (now - created_utc) / 3600

        # Exponential decay: posts from last hour = 1.0, older decay
        if hours_old <= 1:
            return 1.0
        elif hours_old <= 24:
            return 0.8 ** (hours_old / 6)  # Decay every 6 hours
        else:
            return 0.1  # Very old posts get low freshness

    def calculate_final_score(self, intent_score: float, semantic_score: float,
                            freshness_score: float, subreddit_tags: List[str]) -> float:
        """Calculate final lead score"""
        config = self.seed_questions.get("scoring_config", {})

        # Apply weights
        intent_weight = config.get("intent_phrase_weight", 0.4)
        semantic_weight = config.get("semantic_similarity_weight", 0.4)
        freshness_weight = config.get("freshness_weight", 0.2)

        final_score = (
            intent_score * intent_weight +
            semantic_score * semantic_weight +
            freshness_score * freshness_weight
        )

        # Boost for link-allowed subreddits
        if "allowed_link" in subreddit_tags:
            final_score *= 1.2

        # Penalty for no-promo subreddits
        if "no_promo" in subreddit_tags:
            final_score *= 0.8

        return round(final_score, 3)

    def generate_draft_reply(self, post_data: Dict[str, Any], subreddit_tags: List[str]) -> str:
        """Generate a draft reply in Paws & Plates voice with appropriate style based on subreddit rules"""
        species = post_data.get('species', 'pet')
        title = post_data.get('title', '')
        content = post_data.get('body', '')

        # Determine engagement mode based on subreddit rules
        is_no_promo = "no_promo" in subreddit_tags

        if is_no_promo:
            # Pure help, no links - focus on educational value
            reply = f"I see you're looking for feeding help with your {species}. I've worked with many pet parents on similar nutrition questions. The key is understanding your pet's specific needs - age, size, activity level, and any health conditions all play a role in creating the right feeding plan."

            # Add species-specific context if available
            if species == 'dogs':
                reply += " For dogs, protein quality and digestibility are crucial, along with getting the right balance of nutrients for their life stage."
            elif species == 'cats':
                reply += " For cats, taurine and arachidonic acid are essential nutrients that must come from their diet."
            elif species in ['birds', 'reptiles', 'pocket_pets']:
                reply += f" For {species}, proper calcium-to-phosphorus ratios and species-appropriate nutrition are particularly important."

        else:
            # Link-allowed - provide help with soft product mention
            reply = f"I built something specifically for pet parents struggling with feeding questions like this. It's free meal plans + shoppable ingredient lists for dogs, cats, birds, reptiles, and pocket pets. https://paws-and-plates.vercel.app/ - lmk if it helps!"

        return reply

    def save_comment(self, comment_data: Dict[str, Any]):
        """Process and save a comment to database"""
        # Calculate scores
        intent_score = self.calculate_intent_score(comment_data.get('body', ''))
        semantic_score = self.calculate_semantic_score(f"{comment_data.get('body', '')}",
                                                      self.extract_species(comment_data.get('body', '')))
        freshness_score = self.calculate_freshness_score(comment_data['created_utc'])

        # Get subreddit config
        subreddit_config = next((s for s in self.subreddits_config.get("subreddits", [])
                               if s["name"] == comment_data['subreddit']), {})
        subreddit_tags = subreddit_config.get("tags", [])

        final_score = self.calculate_final_score(intent_score, semantic_score, freshness_score, subreddit_tags)

        # Check if it's a high-scoring lead
        min_threshold = self.seed_questions.get("scoring_config", {}).get("min_score_threshold", 0.6)
        is_lead = final_score >= min_threshold and not self.is_emergency(comment_data.get('body', ''))

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO comments
            (id, post_id, author, body, score, created_utc, processed_at,
             intent_score, semantic_score, final_score, is_emergency, species, tags, entities, intent_matches)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            comment_data['id'],
            comment_data['post_id'],
            comment_data.get('author'),
            comment_data.get('body'),
            comment_data.get('score'),
            comment_data['created_utc'],
            time.time(),
            intent_score,
            semantic_score,
            final_score,
            self.is_emergency(comment_data.get('body', '')),
            self.extract_species(comment_data.get('body', '')),
            json.dumps(subreddit_tags),
            json.dumps(self.extract_entities(comment_data.get('body', ''))),
            json.dumps(getattr(self, '_last_intent_matches', []))
        ))

        # Save to leads if high score
        if is_lead:
            cursor.execute('''
                INSERT OR REPLACE INTO leads
                (id, post_id, comment_id, subreddit, author, title, content, url, score, species,
                 intent_matches, semantic_matches, draft_reply, entities, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                f"lead_comment_{comment_data['id']}",
                comment_data['post_id'],
                comment_data['id'],
                comment_data['subreddit'],
                comment_data.get('author'),
                f"Comment about: {self.extract_species(comment_data.get('body', ''))} feeding",  # Generate descriptive title
                comment_data.get('body', ''),
                f"https://reddit.com/r/{comment_data['subreddit']}/comments/{comment_data['post_id']}/_/{comment_data['id']}",
                final_score,
                self.extract_species(comment_data.get('body', '')),
                json.dumps([]),  # Would store matched phrases
                json.dumps([]),  # Would store semantic matches
                self.generate_draft_reply(comment_data, subreddit_tags),
                json.dumps(self.extract_entities(comment_data.get('body', ''))),
                time.time()
            ))

        conn.commit()
        conn.close()

    def save_post(self, post_data: Dict[str, Any]):
        """Save post to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Calculate scores
        full_text = f"{post_data['title']} {post_data.get('body', '')}"
        species = self.extract_species(full_text)
        intent_score = self.calculate_intent_score(full_text)
        semantic_score = self.calculate_semantic_score(full_text, species)
        freshness_score = self.calculate_freshness_score(post_data['created_utc'])

        # Extract entities
        entities = self.extract_entities(full_text)

        # Get subreddit config
        subreddit_config = next((s for s in self.subreddits_config.get("subreddits", [])
                               if s["name"] == post_data['subreddit']), {})
        subreddit_tags = subreddit_config.get("tags", [])

        final_score = self.calculate_final_score(intent_score, semantic_score, freshness_score, subreddit_tags)

        # Check if it's a high-scoring lead
        min_threshold = self.seed_questions.get("scoring_config", {}).get("min_score_threshold", 0.6)
        is_lead = final_score >= min_threshold and not self.is_emergency(f"{post_data['title']} {post_data.get('body', '')}")

        cursor.execute('''
            INSERT OR REPLACE INTO posts
            (id, subreddit, author, title, body, url, score, num_comments, created_utc, processed_at,
             intent_score, semantic_score, final_score, is_emergency, species, tags, draft_reply, entities, intent_matches)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post_data['id'],
            post_data['subreddit'],
            post_data.get('author'),
            post_data['title'],
            post_data.get('body'),
            post_data.get('url'),
            post_data.get('score'),
            post_data.get('num_comments'),
            post_data['created_utc'],
            time.time(),
            intent_score,
            semantic_score,
            final_score,
            self.is_emergency(f"{post_data['title']} {post_data.get('body', '')}"),
            species,
            json.dumps(subreddit_tags),
            self.generate_draft_reply(post_data, subreddit_tags) if is_lead else None,
            json.dumps(entities),
            json.dumps(getattr(self, '_last_intent_matches', []))
        ))

        # Save to leads if high score
        if is_lead:
            cursor.execute('''
                INSERT OR REPLACE INTO leads
                (id, post_id, subreddit, author, title, content, url, score, species,
                 intent_matches, semantic_matches, draft_reply, entities, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                f"lead_{post_data['id']}",
                post_data['id'],
                post_data['subreddit'],
                post_data.get('author'),
                post_data['title'],
                post_data.get('body', ''),
                post_data.get('url'),
                final_score,
                species,
                json.dumps([]),  # Would store matched phrases
                json.dumps([]),  # Would store semantic matches
                self.generate_draft_reply(post_data, subreddit_tags),
                json.dumps(entities),
                time.time()
            ))

        conn.commit()
        conn.close()

    def fetch_reddit_rss(self, subreddit: str) -> List[Dict[str, Any]]:
        """Fetch posts from Reddit RSS feed"""
        url = f'https://www.reddit.com/r/{subreddit}/new/.rss'
        headers = {'User-Agent': 'RedditLeadRadar/1.0'}

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            feed = feedparser.parse(response.content)
            posts = []

            for entry in feed.entries:
                post_id = self.extract_post_id(entry)
                if not post_id or post_id in self.processed_ids:
                    continue

                # Skip blacklisted content
                title = entry.title if hasattr(entry, 'title') else ''
                author = getattr(entry, 'author', '')
                if self.is_blacklisted(f"{title} {getattr(entry, 'summary', '')}", author):
                    continue

                post_data = {
                    'id': post_id,
                    'subreddit': subreddit,
                    'author': author,
                    'title': title,
                    'body': getattr(entry, 'summary', ''),
                    'url': getattr(entry, 'link', ''),
                    'score': 0,  # RSS doesn't provide score
                    'num_comments': 0,  # RSS doesn't provide comment count
                    'created_utc': time.mktime(entry.published_parsed) if hasattr(entry, 'published_parsed') else time.time()
                }

                posts.append(post_data)
                self.processed_ids.add(post_id)

            return posts

        except Exception as e:
            print(f"Error fetching RSS for r/{subreddit}: {e}")
            return []

    def extract_post_id(self, entry) -> Optional[str]:
        """Extract post ID from RSS entry"""
        if hasattr(entry, 'link') and entry.link:
            parts = entry.link.split('/')
            if len(parts) > 6:
                return parts[6]

        if hasattr(entry, 'id'):
            return entry.id.split('/')[-1]

        return None

    def get_reddit_access_token(self) -> Optional[str]:
        """Get Reddit API access token"""
        if not self.reddit_client_id or not self.reddit_client_secret:
            print("Reddit API credentials not set. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables.")
            return None

        # Check if token is still valid (with 5 minute buffer)
        if self.reddit_access_token and time.time() < (self.token_expires_at - 300):
            return self.reddit_access_token

        try:
            # Reddit API authentication
            auth = requests.auth.HTTPBasicAuth(self.reddit_client_id, self.reddit_client_secret)
            data = {'grant_type': 'client_credentials'}
            headers = {'User-Agent': 'RedditLeadRadar/1.0'}

            response = requests.post('https://www.reddit.com/api/v1/access_token',
                                   auth=auth, data=data, headers=headers, timeout=10)
            response.raise_for_status()

            token_data = response.json()
            self.reddit_access_token = token_data['access_token']
            self.token_expires_at = time.time() + token_data['expires_in']

            return self.reddit_access_token

        except Exception as e:
            print(f"Failed to get Reddit access token: {e}")
            return None

    def fetch_reddit_comments(self, post_id: str, subreddit: str) -> List[Dict[str, Any]]:
        """Fetch top-level comments for a Reddit post"""
        access_token = self.get_reddit_access_token()
        if not access_token:
            # Fallback to RSS doesn't provide comments, so return empty
            return []

        headers = {
            'Authorization': f'bearer {access_token}',
            'User-Agent': 'RedditLeadRadar/1.0'
        }

        try:
            # Get post and comments
            url = f"https://oauth.reddit.com/r/{subreddit}/comments/{post_id}"
            params = {
                'limit': 50,  # Get up to 50 top-level comments
                'depth': 2,   # Include replies up to 2 levels deep
                'sort': 'new'
            }

            response = requests.get(url, headers=headers, params=params, timeout=15)
            response.raise_for_status()

            data = response.json()

            # Reddit API returns [post_data, comments_data]
            if len(data) < 2:
                return []

            comments_data = data[1]['data']['children']
            comments = []

            for comment_item in comments_data:
                if comment_item['kind'] != 't1':  # t1 = comment
                    continue

                comment_data = comment_item['data']

                # Skip deleted/removed comments
                if comment_data.get('body') in ['[deleted]', '[removed]']:
                    continue

                # Skip blacklisted content
                body = comment_data.get('body', '')
                author = comment_data.get('author', '')
                if self.is_blacklisted(f"{body}", author):
                    continue

                comment_info = {
                    'id': comment_data['id'],
                    'post_id': post_id,
                    'subreddit': subreddit,
                    'author': author,
                    'body': body,
                    'score': comment_data.get('score', 0),
                    'created_utc': comment_data.get('created_utc', time.time()),
                    'parent_id': comment_data.get('parent_id', '').split('_')[1] if comment_data.get('parent_id') else None,
                    'depth': comment_data.get('depth', 0)
                }

                comments.append(comment_info)

            return comments

        except Exception as e:
            print(f"Error fetching comments for post {post_id} in r/{subreddit}: {e}")
            return []

    def search_reddit_api(self, subreddit: str, months_back: int = 6) -> List[Dict[str, Any]]:
        """Search Reddit using API for posts from last N months"""
        access_token = self.get_reddit_access_token()
        if not access_token:
            print(f"Falling back to RSS for r/{subreddit}")
            return self.fetch_reddit_rss(subreddit)

        headers = {
            'Authorization': f'bearer {access_token}',
            'User-Agent': 'RedditLeadRadar/1.0'
        }

        # Calculate date range (6 months back)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months_back * 30)  # Approximate months to days
        start_epoch = int(start_date.timestamp())
        end_epoch = int(end_date.timestamp())

        # Search queries for pet feeding topics
        search_queries = [
            'feeding help',
            'feeding advice',
            'meal plan',
            'feeding schedule',
            'portion sizes',
            'diet help',
            'nutrition questions'
        ]

        all_posts = []

        for query in search_queries:
            try:
                # Reddit search API
                search_url = f'https://oauth.reddit.com/r/{subreddit}/search'
                params = {
                    'q': query,
                    'sort': 'new',
                    't': 'all',  # All time
                    'limit': 100,
                    'restrict_sr': 'true'  # Restrict to this subreddit
                }

                response = requests.get(search_url, headers=headers, params=params, timeout=15)
                response.raise_for_status()

                data = response.json()
                posts_data = data.get('data', {}).get('children', [])

                for post_item in posts_data:
                    post_data = post_item['data']
                    post_id = post_data['id']

                    # Skip if already processed or too old
                    created_utc = post_data.get('created_utc', 0)
                    if post_id in self.processed_ids or created_utc < start_epoch:
                        continue

                    # Skip blacklisted content
                    title = post_data.get('title', '')
                    author = post_data.get('author', '')
                    selftext = post_data.get('selftext', '')

                    if self.is_blacklisted(f"{title} {selftext}", author):
                        continue

                    # Extract post data
                    post_info = {
                        'id': post_id,
                        'subreddit': subreddit,
                        'author': author,
                        'title': title,
                        'body': selftext,
                        'url': f"https://reddit.com{post_data.get('permalink', '')}",
                        'score': post_data.get('score', 0),
                        'num_comments': post_data.get('num_comments', 0),
                        'created_utc': created_utc
                    }

                    all_posts.append(post_info)
                    self.processed_ids.add(post_id)

                # Rate limiting between queries
                time.sleep(1)

            except Exception as e:
                print(f"Reddit API search error for r/{subreddit} query '{query}': {e}")
                continue

        # Remove duplicates (same post might match multiple queries)
        unique_posts = []
        seen_ids = set()
        for post in all_posts:
            if post['id'] not in seen_ids:
                unique_posts.append(post)
                seen_ids.add(post['id'])

        return unique_posts

    def search_reddit_sitewide(self, query: str, max_results: int = 25) -> List[Dict[str, Any]]:
        """Search across all of Reddit for specific queries"""
        access_token = self.get_reddit_access_token()
        if not access_token:
            print(f"No Reddit API access for sitewide search: {query}")
            return []

        headers = {
            'Authorization': f'bearer {access_token}',
            'User-Agent': 'RedditLeadRadar/1.0'
        }

        try:
            # Reddit sitewide search
            search_url = "https://oauth.reddit.com/search"
            params = {
                'q': query,
                'sort': 'new',
                't': 'week',  # Last week for broader coverage
                'limit': max_results,
                'type': 'link'  # Only posts, not comments
            }

            response = requests.get(search_url, headers=headers, params=params, timeout=15)
            response.raise_for_status()

            data = response.json()
            posts_data = data.get('data', {}).get('children', [])

            posts = []
            for post_item in posts_data:
                post_data = post_item['data']
                post_id = post_data['id']

                # Skip if already processed
                if post_id in self.processed_ids:
                    continue

                # Skip blacklisted content
                title = post_data.get('title', '')
                author = post_data.get('author', '')
                selftext = post_data.get('selftext', '')

                if self.is_blacklisted(f"{title} {selftext}", author):
                    continue

                # Extract post data
                post_info = {
                    'id': post_id,
                    'subreddit': post_data.get('subreddit', ''),
                    'author': author,
                    'title': title,
                    'body': selftext,
                    'url': f"https://reddit.com{post_data.get('permalink', '')}",
                    'score': post_data.get('score', 0),
                    'num_comments': post_data.get('num_comments', 0),
                    'created_utc': post_data.get('created_utc', time.time()),
                    'search_query': query  # Track which query found this
                }

                posts.append(post_info)
                self.processed_ids.add(post_id)

            return posts

        except Exception as e:
            print(f"Reddit sitewide search error for '{query}': {e}")
            return []

    def monitor_megathreads(self) -> tuple[int, int]:
        """Monitor comments in known megathread posts"""
        total_comments = 0
        total_leads = 0

        megathreads = self.megathreads.get("megathreads", [])
        for megathread in megathreads:
            subreddit = megathread["subreddit"]
            post_id = megathread["post_id"]

            print(f"Monitoring megathread in r/{subreddit}: {post_id}")

            # Fetch recent comments from this megathread
            comments = self.fetch_reddit_comments(post_id, subreddit)

            for comment in comments:
                self.save_comment(comment)
                total_comments += 1

                # Check if comment became a lead
                if comment.get('final_score', 0) >= self.seed_questions.get("scoring_config", {}).get("min_score_threshold", 0.6):
                    total_leads += 1

            # Rate limiting between megathreads
            time.sleep(1)

        return total_comments, total_leads

    def run_ingestion_cycle(self):
        """Run one complete ingestion cycle with comprehensive metrics"""
        start_time = time.time()
        print(f"Starting ingestion cycle at {datetime.now().strftime('%H:%M:%S')}")

        # Metrics tracking
        metrics = {
            'subreddit_posts': 0,
            'subreddit_comments': 0,
            'sitewide_posts': 0,
            'megathread_comments': 0,
            'total_processed': 0,
            'leads_found': 0,
            'subreddit_breakdown': {},
            'start_time': start_time
        }

        # Process subreddit streams
        for subreddit_config in self.subreddits_config.get("subreddits", []):
            subreddit_name = subreddit_config["name"]
            subreddit_posts = 0
            subreddit_comments = 0
            subreddit_leads = 0

            # Skip read-only subreddits
            if "read_only" in subreddit_config.get("tags", []):
                continue

            print(f"Processing r/{subreddit_name}...")

            # Fetch posts (try API first, fallback to RSS)
            posts = self.search_reddit_api(subreddit_name, months_back=6)

            for post in posts:
                self.save_post(post)
                subreddit_posts += 1
                metrics['subreddit_posts'] += 1

                # Check if it became a lead
                if post.get('final_score', 0) >= self.seed_questions.get("scoring_config", {}).get("min_score_threshold", 0.6):
                    subreddit_leads += 1
                    metrics['leads_found'] += 1

                # Fetch and process comments for this post
                if self.subreddits_config.get("include_comments", True):
                    comments = self.fetch_reddit_comments(post['id'], subreddit_name)
                    for comment in comments:
                        self.save_comment(comment)
                        subreddit_comments += 1
                        metrics['subreddit_comments'] += 1

                        # Check if comment became a lead
                        if comment.get('final_score', 0) >= self.seed_questions.get("scoring_config", {}).get("min_score_threshold", 0.6):
                            subreddit_leads += 1
                            metrics['leads_found'] += 1

            metrics['total_processed'] += subreddit_posts + subreddit_comments
            metrics['subreddit_breakdown'][subreddit_name] = {
                'posts': subreddit_posts,
                'comments': subreddit_comments,
                'leads': subreddit_leads
            }

            # Rate limiting
            time.sleep(2)

        # Perform sitewide searches
        print("Performing sitewide searches...")
        search_queries = self.search_queries.get("queries", [])
        for query_config in search_queries:
            query = query_config["query"]
            max_results = self.search_queries.get("max_results_per_query", 25)

            print(f"Searching sitewide for: '{query}'")
            search_posts = self.search_reddit_sitewide(query, max_results)

            for post in search_posts:
                self.save_post(post)
                metrics['sitewide_posts'] += 1
                metrics['total_processed'] += 1

                # Check if it became a lead
                if post.get('final_score', 0) >= self.seed_questions.get("scoring_config", {}).get("min_score_threshold", 0.6):
                    metrics['leads_found'] += 1

                # Fetch comments for high-scoring posts from sitewide search
                if self.subreddits_config.get("include_comments", True) and post.get('final_score', 0) >= 0.3:
                    comments = self.fetch_reddit_comments(post['id'], post['subreddit'])
                    for comment in comments:
                        self.save_comment(comment)
                        metrics['total_processed'] += 1
                        if comment.get('final_score', 0) >= self.seed_questions.get("scoring_config", {}).get("min_score_threshold", 0.6):
                            metrics['leads_found'] += 1

            # Rate limiting between searches
            time.sleep(2)

        # Monitor megathreads
        print("Monitoring megathread comments...")
        megathread_comments, megathread_leads = self.monitor_megathreads()
        metrics['megathread_comments'] += megathread_comments
        metrics['total_processed'] += megathread_comments
        metrics['leads_found'] += megathread_leads

        # Calculate and display comprehensive metrics
        end_time = time.time()
        duration = end_time - start_time

        print(f"\n{'='*60}")
        print(f"INGESTION CYCLE COMPLETE - {datetime.now().strftime('%H:%M:%S')}")
        print(f"{'='*60}")
        print(f"Duration: {duration:.1f} seconds")
        print(f"Total items processed: {metrics['total_processed']}")
        print(f"Leads found: {metrics['leads_found']}")
        print(f"Success rate: {(metrics['leads_found']/metrics['total_processed']*100):.1f}%" if metrics['total_processed'] > 0 else "0%")
        print()

        # Breakdown by source
        print("BREAKDOWN BY SOURCE:")
        print(f"  Subreddit posts: {metrics['subreddit_posts']}")
        print(f"  Subreddit comments: {metrics['subreddit_comments']}")
        print(f"  Sitewide search posts: {metrics['sitewide_posts']}")
        print(f"  Megathread comments: {metrics['megathread_comments']}")
        print()

        # Top subreddits by leads
        if metrics['subreddit_breakdown']:
            print("TOP SUBREDDITS BY LEADS:")
            sorted_subs = sorted(metrics['subreddit_breakdown'].items(),
                               key=lambda x: x[1]['leads'], reverse=True)
            for subreddit, stats in sorted_subs[:5]:  # Top 5
                if stats['leads'] > 0:
                    print(f"  r/{subreddit}: {stats['leads']} leads ({stats['posts']} posts, {stats['comments']} comments)")
            print()

        # Performance metrics
        print("PERFORMANCE METRICS:")
        print(f"  Items/second: {metrics['total_processed']/duration:.1f}")
        print(f"  Leads/second: {metrics['leads_found']/duration:.2f}")
        print(f"{'='*60}")

        # Generate lead queue JSON
        self.generate_lead_queue(metrics)

    def generate_lead_queue(self, metrics=None):
        """Generate lead queue JSON file"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM leads
            WHERE reviewed = 0
            ORDER BY score DESC, created_at DESC
            LIMIT 50
        ''')

        leads = []
        for row in cursor.fetchall():
            # Determine engagement mode based on subreddit
            subreddit_config = next((s for s in self.subreddits_config.get("subreddits", [])
                                   if s["name"] == row[3]), {})
            engagement_mode = "no_promo" if "no_promo" in subreddit_config.get("tags", []) else "link_ok"

            lead = {
                'id': row[0],
                'post_id': row[1],
                'comment_id': row[2],  # New field for comments
                'subreddit': row[3],
                'author': row[4],
                'title': row[5],
                'content': row[6],
                'url': row[7],
                'score': row[8],
                'species': row[9],
                'intent_matches': json.loads(row[10] or '[]'),
                'semantic_matches': json.loads(row[11] or '[]'),
                'draft_reply': row[12],
                'entities': json.loads(row[14] or '{}'),  # Extracted age, weight, conditions
                'engagement_mode': engagement_mode,  # no_promo or link_ok
                'created_at': row[13]
            }
            leads.append(lead)

        with open('lead_queue.json', 'w') as f:
            json.dump({
                'leads': leads,
                'generated_at': time.time(),
                'stats': {
                    'total_scanned': metrics.get('total_processed', 0) if metrics else 0,
                    'leads_found': metrics.get('leads_found', 0) if metrics else 0,
                    'high_intent': len([l for l in leads if l.get('score', 0) > 0.8]),
                    'emergencies': 0  # Could be tracked separately if needed
                }
            }, f, indent=2)

        conn.close()

        if leads:
            print(f"Generated lead queue with {len(leads)} high-potential opportunities")
            # Could add notification here (email, Discord webhook, etc.)

    def run_continuous(self):
        """Run continuous monitoring"""
        polling_interval = self.subreddits_config.get("polling_interval_seconds", 600)

        print(f"Reddit Lead Radar starting continuous monitoring")
        print(f"Checking every {polling_interval} seconds")
        print(f"Press Ctrl+C to stop\n")

        while True:
            try:
                self.run_ingestion_cycle()
                time.sleep(polling_interval)
            except KeyboardInterrupt:
                print("\nStopping monitoring...")
                break
            except Exception as e:
                print(f"Error in monitoring cycle: {e}")
                time.sleep(60)  # Wait a minute before retrying

    def run_once(self):
        """Run a single ingestion cycle"""
        self.run_ingestion_cycle()

def main():
    """Main entry point"""
    import sys

    radar = RedditLeadRadar()

    if len(sys.argv) > 1 and sys.argv[1] == '--once':
        print("Running single ingestion cycle...")
        radar.run_once()
    else:
        radar.run_continuous()

if __name__ == '__main__':
    main()
