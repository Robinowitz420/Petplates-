import os
import json
import time
import re
from datetime import datetime
from typing import List, Dict, Optional
import requests
from dataclasses import dataclass, asdict

"""
Multi-Platform Pet Help Monitor Bot
Monitors Reddit, Instagram, TikTok, Facebook, Pinterest for pet feeding help posts.
Runs 24/7 on Render, sends data to Firestore for dashboard.
"""

# Configuration
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID', '')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET', '')
REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT', 'PetHelpMonitor/2.0')

FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID', '')
FIREBASE_API_KEY = os.getenv('FIREBASE_API_KEY', '')

SITE_URL = 'https://paws-and-plates.vercel.app'

# Pet species by category
REPTILES = [
    'bearded dragon', 'beardie', 'leopard gecko', 'ball python', 'crested gecko',
    'corn snake', 'blue tongue skink', 'red eared slider', 'chameleon', 'uromastyx',
    'tegu', 'monitor lizard', 'boa constrictor', 'king snake', 'milk snake',
    'african fat tailed gecko', 'gargoyle gecko', 'russian tortoise', 'sulcata tortoise',
    'green iguana', 'anole', 'gecko', 'snake', 'lizard', 'turtle', 'tortoise', 'reptile'
]

BIRDS = [
    'budgie', 'parakeet', 'cockatiel', 'african grey', 'conure', 'macaw', 'cockatoo',
    'lovebird', 'canary', 'finch', 'quaker parrot', 'amazon parrot', 'eclectus',
    'caique', 'lorikeet', 'pigeon', 'dove', 'chicken', 'duck', 'quail', 'goose',
    'parrot', 'bird'
]

POCKET_PETS = [
    'rabbit', 'bunny', 'guinea pig', 'hamster', 'syrian hamster', 'dwarf hamster',
    'rat', 'mouse', 'gerbil', 'chinchilla', 'ferret', 'hedgehog', 'sugar glider',
    'degu', 'prairie dog', 'chipmunk', 'squirrel', 'roborovski', 'pocket pet'
]

DOGS_CATS = ['dog', 'cat', 'puppy', 'kitten']

# Feeding keywords
FEEDING_KEYWORDS = [
    'what should i feed', 'best diet for', 'feeding schedule', 'how much to feed',
    'portion sizes', 'meal plan', 'meal prep', 'what do you feed', 'feeding guide',
    'nutrition for', 'healthy diet', 'homemade food', 'fresh food', 'ingredients for',
    'shopping list', 'recipe for', 'meal ideas', 'what can', 'eat', 'safe foods',
    'toxic foods', 'feeding tips', 'diet help', 'confused about', 'diet',
    'struggling with', 'feeding', 'picky eater', "won't eat", 'feeding problems',
    'calcium', 'protein', 'vitamins', 'supplements', 'gut loading', 'dusting insects',
    'vegetable list', 'fruit list', 'staple foods', 'treats', 'variety diet',
    'balanced diet', 'nutritional requirements', 'feeding frequency', 'how often feed',
    'meal timing', 'feeding baby', 'feeding juvenile', 'feeding adult', 'feeding senior',
    'weight management', 'obesity', 'underweight', 'food aversion', 'food aggression',
    'raw diet', 'cooked diet', 'kibble vs fresh', 'homemade vs store bought',
    'transition diet', 'switching food', 'digestive issues', 'food allergies',
    'sensitive stomach', 'grain free', 'organic food', 'wild diet', 'natural diet',
    'species appropriate', 'carnivore diet', 'herbivore diet', 'omnivore diet',
    'meal prep tutorial', 'batch cooking', 'freezing meals', 'food storage',
    'meal rotation', 'variety feeding', 'seasonal diet'
]

# Reddit subreddits to monitor
SUBREDDITS = [
    # Reptiles
    'reptiles', 'BeardedDragons', 'leopardgeckos', 'snakes', 'ballpython',
    'cornsnakes', 'bluetongueskinks', 'turtle', 'tortoise', 'Chameleons',
    'CrestedGecko', 'geckos',
    # Birds
    'parrots', 'budgies', 'Conures', 'Cockatiels', 'AfricanGrey', 'Macaw',
    'cockatoo', 'parakeets', 'BackYardChickens', 'chickens',
    # Pocket Pets
    'Rabbits', 'guineapigs', 'hamsters', 'RATS', 'ferrets', 'Hedgehog',
    'chinchilla', 'sugargliders', 'gerbil',
    # Dogs & Cats
    'dogs', 'cats', 'puppy101', 'Dogtraining', 'CatAdvice', 'AskVet',
    # General
    'pets', 'PetAdvice', 'ExoticPets'
]

@dataclass
class Post:
    """Represents a help-seeking post"""
    id: str
    platform: str
    url: str
    title: str
    text: str
    author: str
    created_at: str
    matched_keywords: List[str]
    detected_species: List[str]
    category: str  # 'reptile', 'bird', 'pocket_pet', 'dog_cat'
    status: str = 'pending'  # 'pending', 'approved', 'posted', 'skipped'
    draft_response: str = ''
    edited_response: str = ''
    subreddit: Optional[str] = None

class ResponseGenerator:
    """Generates personalized responses based on post content"""
    
    @staticmethod
    def detect_species(text: str) -> tuple[List[str], str]:
        """Detect species mentioned and categorize"""
        text_lower = text.lower()
        detected = []
        category = 'general'
        
        # Check each category
        reptile_matches = [s for s in REPTILES if s in text_lower]
        bird_matches = [s for s in BIRDS if s in text_lower]
        pocket_matches = [s for s in POCKET_PETS if s in text_lower]
        dog_cat_matches = [s for s in DOGS_CATS if s in text_lower]
        
        # Prioritize by specificity
        if reptile_matches:
            detected.extend(reptile_matches)
            category = 'reptile'
        if bird_matches:
            detected.extend(bird_matches)
            category = 'bird'
        if pocket_matches:
            detected.extend(pocket_matches)
            category = 'pocket_pet'
        if dog_cat_matches:
            detected.extend(dog_cat_matches)
            category = 'dog_cat'
        
        # Remove duplicates, keep most specific
        detected = list(dict.fromkeys(detected))[:3]  # Max 3 species
        
        return detected, category
    
    @staticmethod
    def generate(post_title: str, post_text: str, detected_species: List[str], 
                 category: str) -> str:
        """Generate personalized response"""
        
        # Build species text
        if detected_species:
            if len(detected_species) == 1:
                species_text = detected_species[0] + 's'
            else:
                species_text = ', '.join(detected_species)
        else:
            # Default by category
            species_map = {
                'reptile': 'reptiles',
                'bird': 'birds',
                'pocket_pet': 'pocket pets',
                'dog_cat': 'dogs and cats',
                'general': 'dogs, cats, birds, reptiles'
            }
            species_text = species_map.get(category, 'all pets')
        
        # Template variations
        templates = [
            f"i built something for exactly this... free meal plans + shoppable ingredient lists for {species_text}. trying to make feeding less stressful.\n\n{SITE_URL}\n\nlmk if it helps",
            
            f"been working on this problem too... built a free meal planner with ingredient shopping lists for {species_text}. might save you some time.\n\n{SITE_URL}",
            
            f"this is what i made paws & plates for... free personalized meal plans for {species_text} with shoppable lists. no guesswork.\n\n{SITE_URL}\n\nworth checking out",
            
            f"your setup sounds like what we built for... paws & plates generates free meal plans + ingredient lists for {species_text}. makes the feeding side way easier.\n\n{SITE_URL}",
        ]
        
        # Pick template based on post content
        text_combined = f"{post_title} {post_text}".lower()
        
        if any(word in text_combined for word in ['help', 'confused', 'struggling', 'problem']):
            return templates[0]  # Empathetic
        elif any(word in text_combined for word in ['meal prep', 'batch', 'schedule']):
            return templates[1]  # Time-saving
        elif any(word in text_combined for word in ['what', 'how', 'question']):
            return templates[2]  # Direct answer
        else:
            return templates[3]  # General
    
class RedditMonitor:
    """Monitors Reddit for help posts"""
    
    def __init__(self):
        self.token = None
        self.seen_ids = set()
    
    def get_token(self) -> bool:
        """Get Reddit OAuth token"""
        if not REDDIT_CLIENT_ID or not REDDIT_CLIENT_SECRET:
            print("⚠️  Reddit credentials not set")
            return False
        
        auth = requests.auth.HTTPBasicAuth(REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET)
        data = {'grant_type': 'client_credentials'}
        headers = {'User-Agent': REDDIT_USER_AGENT}
        
        try:
            response = requests.post('https://www.reddit.com/api/v1/access_token',
                                   auth=auth, data=data, headers=headers)
            response.raise_for_status()
            self.token = response.json()['access_token']
            return True
        except Exception as e:
            print(f"❌ Reddit auth failed: {e}")
            return False
    
    def search(self) -> List[Post]:
        """Search Reddit for help posts"""
        if not self.token:
            if not self.get_token():
                return []
        
        headers = {
            'Authorization': f'bearer {self.token}',
            'User-Agent': REDDIT_USER_AGENT
        }
        
        found_posts = []
        
        for subreddit in SUBREDDITS:
            try:
                url = f'https://oauth.reddit.com/r/{subreddit}/new'
                params = {'limit': 25}
                
                response = requests.get(url, headers=headers, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                for post in data['data']['children']:
                    post_data = post['data']
                    post_id = post_data['id']
                    
                    if post_id in self.seen_ids:
                        continue
                    
                    title = post_data['title']
                    text = post_data.get('selftext', '')
                    combined = f"{title} {text}".lower()
                    
                    # Check for feeding keywords
                    matched = [kw for kw in FEEDING_KEYWORDS if kw in combined]
                    
                    if matched:
                        # Detect species
                        detected_species, category = ResponseGenerator.detect_species(combined)
                        
                        # Generate response
                        draft = ResponseGenerator.generate(title, text, detected_species, category)
                        
                        found_posts.append(Post(
                            id=post_id,
                            platform='reddit',
                            url=f"https://reddit.com{post_data['permalink']}",
                            title=title,
                            text=text[:500],
                            author=post_data['author'],
                            created_at=datetime.fromtimestamp(post_data['created_utc']).isoformat(),
                            matched_keywords=matched[:5],
                            detected_species=detected_species,
                            category=category,
                            draft_response=draft,
                            subreddit=subreddit
                        ))
                        
                        self.seen_ids.add(post_id)
                
                time.sleep(1)  # Rate limiting
                
            except Exception as e:
                print(f"⚠️  Error searching r/{subreddit}: {e}")
        
        return found_posts

class FirestoreClient:
    """Firestore client for saving posts"""
    
    def __init__(self):
        self.project_id = FIREBASE_PROJECT_ID
        self.api_key = FIREBASE_API_KEY
        self.base_url = f'https://firestore.googleapis.com/v1/projects/{self.project_id}/databases/(default)/documents'
    
    def save_post(self, post: Post) -> bool:
        """Save post to Firestore"""
        if not self.project_id or not self.api_key:
            print("⚠️  Firebase credentials not set")
            return False
        
        try:
            # Convert to Firestore document format
            doc = {
                'fields': {
                    'id': {'stringValue': post.id},
                    'platform': {'stringValue': post.platform},
                    'url': {'stringValue': post.url},
                    'title': {'stringValue': post.title},
                    'text': {'stringValue': post.text},
                    'author': {'stringValue': post.author},
                    'created_at': {'stringValue': post.created_at},
                    'matched_keywords': {'arrayValue': {'values': [{'stringValue': k} for k in post.matched_keywords]}},
                    'detected_species': {'arrayValue': {'values': [{'stringValue': s} for s in post.detected_species]}},
                    'category': {'stringValue': post.category},
                    'status': {'stringValue': post.status},
                    'draft_response': {'stringValue': post.draft_response},
                    'edited_response': {'stringValue': post.edited_response or ''},
                    'subreddit': {'stringValue': post.subreddit or ''},
                }
            }
            
            url = f'{self.base_url}/outreach_posts?documentId={post.id}&key={self.api_key}'
            response = requests.patch(url, json=doc, timeout=10)
            response.raise_for_status()
            return True
            
        except Exception as e:
            print(f"❌ Failed to save post {post.id}: {e}")
            return False

class MonitorBot:
    """Main monitoring bot"""
    
    def __init__(self):
        self.reddit = RedditMonitor()
        self.firestore = FirestoreClient()
        self.stats = {'total_found': 0, 'total_saved': 0}
    
    def run_once(self):
        """Run one monitoring cycle"""
        print(f"\n{'='*60}")
        print(f"🔄 Checking at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")
        
        # Search Reddit
        posts = self.reddit.search()
        
        if posts:
            print(f"✅ Found {len(posts)} new help-seeking posts!\n")
            
            for post in posts:
                print(f"📍 r/{post.subreddit}")
                print(f"📝 {post.title}")
                print(f"🔗 {post.url}")
                print(f"🎯 Species: {', '.join(post.detected_species) if post.detected_species else 'general'}")
                print(f"📂 Category: {post.category}")
                print(f"\n💬 Draft response:")
                print(f"{'-'*60}")
                print(post.draft_response)
                print(f"{'-'*60}\n")
                
                # Save to Firestore
                if self.firestore.save_post(post):
                    self.stats['total_saved'] += 1
                    print(f"💾 Saved to dashboard\n")
                
                self.stats['total_found'] += 1
        else:
            print("⏳ No new posts found this round")
        
        print(f"\n📊 Session stats: {self.stats['total_found']} found, {self.stats['total_saved']} saved")
    
    def run(self, check_interval: int = 300):
        """Run monitoring loop forever"""
        print(f"🚀 Pet Help Monitor Bot Started")
        print(f"📍 Monitoring {len(SUBREDDITS)} subreddits")
        print(f"⏱️  Check interval: {check_interval} seconds\n")
        
        while True:
            try:
                self.run_once()
                print(f"\n⏸️  Waiting {check_interval} seconds until next check...")
                time.sleep(check_interval)
            except KeyboardInterrupt:
                print(f"\n\n{'='*60}")
                print(f"✅ Bot stopped by user")
                print(f"📊 Final stats: {self.stats}")
                print(f"{'='*60}\n")
                break
            except Exception as e:
                print(f"❌ Error in monitoring loop: {e}")
                print(f"⏸️  Waiting 60 seconds before retry...")
                time.sleep(60)

def main():
    """Main entry point"""
    bot = MonitorBot()
    bot.run(check_interval=300)  # Check every 5 minutes

if __name__ == '__main__':
    main()