import json
import os
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Tuple

import requests

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except Exception:
    firebase_admin = None
    credentials = None
    firestore = None


SUBREDDITS = [
    # Reptiles
    "reptiles",
    "BeardedDragons",
    "leopardgeckos",
    "snakes",
    "ballpython",
    "cornsnakes",
    "bluetongueskinks",
    "turtle",
    "tortoise",
    "Chameleons",
    "CrestedGecko",
    "geckos",
    # Birds
    "parrots",
    "budgies",
    "Conures",
    "Cockatiels",
    "AfricanGrey",
    "Macaw",
    "cockatoo",
    "parakeets",
    "BackYardChickens",
    "chickens",
    # Pocket Pets
    "Rabbits",
    "guineapigs",
    "hamsters",
    "RATS",
    "ferrets",
    "Hedgehog",
    "chinchilla",
    "sugargliders",
    "gerbil",
    # Dogs/Cats
    "dogs",
    "cats",
    "puppy101",
    "Dogtraining",
    "CatAdvice",
    "AskVet",
    # General
    "pets",
    "PetAdvice",
    "ExoticPets",
]

CATEGORY_BY_SUBREDDIT = {
    # Reptiles
    "reptiles": "reptile",
    "beardeddragons": "reptile",
    "leopardgeckos": "reptile",
    "snakes": "reptile",
    "ballpython": "reptile",
    "cornsnakes": "reptile",
    "bluetongueskinks": "reptile",
    "turtle": "reptile",
    "tortoise": "reptile",
    "chameleons": "reptile",
    "crestedgecko": "reptile",
    "geckos": "reptile",
    # Birds
    "parrots": "bird",
    "budgies": "bird",
    "conures": "bird",
    "cockatiels": "bird",
    "africangrey": "bird",
    "macaw": "bird",
    "cockatoo": "bird",
    "parakeets": "bird",
    "backyardchickens": "bird",
    "chickens": "bird",
    # Pocket pets
    "rabbits": "pocket_pet",
    "guineapigs": "pocket_pet",
    "hamsters": "pocket_pet",
    "rats": "pocket_pet",
    "ferrets": "pocket_pet",
    "hedgehog": "pocket_pet",
    "chinchilla": "pocket_pet",
    "sugargliders": "pocket_pet",
    "gerbil": "pocket_pet",
    # Dog/Cat
    "dogs": "dog_cat",
    "cats": "dog_cat",
    "puppy101": "dog_cat",
    "dogtraining": "dog_cat",
    "catadvice": "dog_cat",
    "askvet": "dog_cat",
    # General
    "pets": "dog_cat",
    "petadvice": "dog_cat",
    "exoticpets": "pocket_pet",
}


def reddit_public_new_posts(subreddit: str, limit: int = 25) -> List[dict]:
    user_agent = os.environ.get("REDDIT_USER_AGENT", "PetHelpMonitor/2.0")
    headers = {"User-Agent": user_agent}

    url = f"https://www.reddit.com/r/{subreddit}/new.json"
    params = {"limit": str(limit)}

    resp = requests.get(url, headers=headers, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    children = data.get("data", {}).get("children", [])
    return [c.get("data", {}) for c in children if isinstance(c, dict)]

# Heuristic keyword list (can be expanded anytime)
FEEDING_KEYWORDS = [
    "what should i feed",
    "what do i feed",
    "best diet",
    "feeding schedule",
    "how much to feed",
    "portion",
    "meal plan",
    "meal prep",
    "feeding guide",
    "nutrition",
    "healthy diet",
    "homemade",
    "fresh food",
    "ingredients",
    "shopping list",
    "recipe",
    "meal ideas",
    "what can eat",
    "safe foods",
    "toxic foods",
    "feeding tips",
    "diet help",
    "confused",
    "struggling",
    "picky eater",
    "won't eat",
    "calcium",
    "protein",
    "vitamins",
    "supplements",
]

SPECIES_TERMS = {
    "reptile": [
        "bearded dragon",
        "leopard gecko",
        "ball python",
        "crested gecko",
        "corn snake",
        "blue tongue skink",
        "red-eared slider",
        "chameleon",
        "uromastyx",
        "tegu",
        "monitor lizard",
        "boa constrictor",
        "king snake",
        "milk snake",
        "african fat-tailed gecko",
        "gargoyle gecko",
        "russian tortoise",
        "sulcata tortoise",
        "green iguana",
        "anole",
    ],
    "bird": [
        "budgie",
        "parakeet",
        "cockatiel",
        "african grey",
        "conure",
        "macaw",
        "cockatoo",
        "lovebird",
        "canary",
        "finch",
        "quaker",
        "amazon parrot",
        "eclectus",
        "caique",
        "lorikeet",
        "pigeon",
        "dove",
        "chicken",
        "duck",
        "quail",
        "goose",
    ],
    "pocket_pet": [
        "rabbit",
        "bunny",
        "guinea pig",
        "hamster",
        "syrian hamster",
        "dwarf hamster",
        "roborovski",
        "rat",
        "mouse",
        "gerbil",
        "chinchilla",
        "ferret",
        "hedgehog",
        "sugar glider",
        "degu",
        "prairie dog",
        "chipmunk",
        "squirrel",
    ],
    "dog_cat": ["dog", "puppy", "cat", "kitten"],
}

RESPONSE_TEMPLATES = {
    "empathetic": "i built something for exactly this... free meal plans + shoppable ingredient lists for {species}. trying to make feeding less stressful.\n\nhttps://paws-and-plates.vercel.app\n\nlmk if it helps",
    "time_saving": "if meal prep / schedules are the hard part, i built a free tool that makes meal plans + a shoppable ingredient list for {species}.\n\nhttps://paws-and-plates.vercel.app\n\nhope it saves you time",
    "direct": "quick idea: i made a free meal planner + shoppable ingredient list for {species}. might help answer the "
    "what/how much" stuff without guesswork.\n\nhttps://paws-and-plates.vercel.app\n\nlmk if you want me to sanity check what you're feeding",
    "general": "i made a free meal plan + ingredient list tool for {species} (helps with portions + safe foods).\n\nhttps://paws-and-plates.vercel.app\n\nhope it helps",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def match_keywords(title: str, body: str) -> List[str]:
    hay = normalize(f"{title}\n{body}")
    matched = [kw for kw in FEEDING_KEYWORDS if kw in hay]
    return matched


def detect_species(title: str, body: str) -> Tuple[List[str], Optional[str]]:
    hay = normalize(f"{title}\n{body}")
    detected: List[str] = []
    category_counts: Dict[str, int] = {"reptile": 0, "bird": 0, "pocket_pet": 0, "dog_cat": 0}

    for category, terms in SPECIES_TERMS.items():
        for term in terms:
            if term in hay:
                detected.append(term)
                category_counts[category] += 1

    # choose best category by count, else None
    best_category = None
    best_count = 0
    for cat, count in category_counts.items():
        if count > best_count:
            best_count = count
            best_category = cat

    if best_count == 0:
        best_category = None

    # de-dupe species list (keep order)
    seen: Set[str] = set()
    deduped = []
    for s in detected:
        if s not in seen:
            seen.add(s)
            deduped.append(s)

    return deduped, best_category


def choose_response_template(title: str, body: str) -> str:
    hay = normalize(f"{title}\n{body}")
    if any(w in hay for w in ["help", "confused", "struggling", "stressed", "overwhelmed"]):
        return "empathetic"
    if any(w in hay for w in ["meal prep", "batch", "schedule", "routine"]):
        return "time_saving"
    if any(w in hay for w in ["what should", "what do i", "how much", "how often", "portion"]):
        return "direct"
    return "general"


def reddit_get_token() -> str:
    client_id = os.environ["REDDIT_CLIENT_ID"]
    client_secret = os.environ["REDDIT_CLIENT_SECRET"]
    user_agent = os.environ.get("REDDIT_USER_AGENT", "PetHelpMonitor/2.0")

    auth = requests.auth.HTTPBasicAuth(client_id, client_secret)
    data = {"grant_type": "client_credentials"}
    headers = {"User-Agent": user_agent}

    resp = requests.post("https://www.reddit.com/api/v1/access_token", auth=auth, data=data, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()["access_token"]


def reddit_search_new_posts(token: str, subreddit: str, limit: int = 25) -> List[dict]:
    user_agent = os.environ.get("REDDIT_USER_AGENT", "PetHelpMonitor/2.0")
    headers = {"Authorization": f"bearer {token}", "User-Agent": user_agent}

    url = f"https://oauth.reddit.com/r/{subreddit}/new"
    params = {"limit": str(limit)}

    resp = requests.get(url, headers=headers, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    children = data.get("data", {}).get("children", [])
    return [c.get("data", {}) for c in children if isinstance(c, dict)]


def load_seen_ids(path: str) -> Set[str]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            raw = json.load(f)
            if isinstance(raw, list):
                return set(str(x) for x in raw)
    except Exception:
        pass
    return set()


def save_seen_ids(path: str, ids: Set[str]) -> None:
    tmp = sorted(list(ids))[-5000:]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(tmp, f)


def init_firestore():
    if firebase_admin is None:
        raise RuntimeError("firebase-admin is not installed. Check requirements.txt")

    if firebase_admin._apps:
        return firestore.client()

    sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if not sa_json:
        raise RuntimeError(
            "Missing FIREBASE_SERVICE_ACCOUNT_JSON. "
            "For the bot, Firestore writes require a service account key JSON."
        )

    cred = credentials.Certificate(json.loads(sa_json))
    firebase_admin.initialize_app(cred)
    return firestore.client()


def firestore_upsert_outreach_post(db, doc: dict) -> None:
    post_id = doc["id"]
    ref = db.collection("outreach_posts").document(post_id)
    existing = ref.get()
    if existing.exists:
        return
    ref.set(doc)


def build_document(post: dict, subreddit: str) -> Optional[dict]:
    post_id = str(post.get("id") or "").strip()
    if not post_id:
        return None

    title = post.get("title") or ""
    body = post.get("selftext") or ""
    author = post.get("author") or ""
    created_utc = post.get("created_utc")

    matched = match_keywords(title, body)
    if not matched:
        return None

    detected_species, detected_category = detect_species(title, body)

    # fallback category from subreddit if no strong species match
    if not detected_category:
        detected_category = CATEGORY_BY_SUBREDDIT.get(subreddit.lower(), "dog_cat")

    template_key = choose_response_template(title, body)
    species_phrase = (
        detected_species[0]
        if detected_species
        else {
            "reptile": "reptiles",
            "bird": "birds",
            "pocket_pet": "small pets",
            "dog_cat": "dogs/cats",
        }.get(detected_category, "pets")
    )
    draft = RESPONSE_TEMPLATES[template_key].format(species=species_phrase)

    permalink = post.get("permalink")
    url = f"https://www.reddit.com{permalink}" if permalink else ""

    created_at = now_iso()
    if isinstance(created_utc, (int, float)):
        created_at = datetime.fromtimestamp(created_utc, tz=timezone.utc).isoformat()

    return {
        "id": post_id,
        "platform": "reddit",
        "url": url,
        "title": title,
        "text": body,
        "author": author,
        "subreddit": subreddit,
        "created_at": created_at,
        "matched_keywords": matched,
        "detected_species": detected_species,
        "category": detected_category,
        "status": "pending",
        "draft_response": draft,
        "edited_response": "",
    }


def main() -> None:
    interval_seconds = int(os.environ.get("POLL_INTERVAL_SECONDS", "300"))
    seen_path = os.environ.get("SEEN_POSTS_PATH", "seen_posts.json")

    auth_mode = (os.environ.get("REDDIT_AUTH_MODE") or "oauth").strip().lower()
    if auth_mode not in {"oauth", "public"}:
        raise RuntimeError("REDDIT_AUTH_MODE must be 'oauth' or 'public'")

    db = init_firestore()
    seen = load_seen_ids(seen_path)

    while True:
        try:
            token = reddit_get_token() if auth_mode == "oauth" else ""
            new_seen = set(seen)

            for sub in SUBREDDITS:
                posts = (
                    reddit_search_new_posts(token, sub, limit=25)
                    if auth_mode == "oauth"
                    else reddit_public_new_posts(sub, limit=25)
                )

                for post in posts:
                    post_id = str(post.get("id") or "")
                    if not post_id or post_id in new_seen:
                        continue

                    doc = build_document(post, sub)
                    new_seen.add(post_id)

                    if doc:
                        firestore_upsert_outreach_post(db, doc)

                    # keep a small delay to reduce rate limiting / blocks
                    time.sleep(0.15)

                # respect ~1 request/sec to Reddit regardless of mode
                time.sleep(1.0)

            seen = new_seen
            save_seen_ids(seen_path, seen)

        except Exception as e:
            print(f"[{now_iso()}] error: {e}")

        time.sleep(interval_seconds)


if __name__ == "__main__":
    main()
