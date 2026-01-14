# Outreach Monitor Bot (Reddit)

Polls a set of subreddits for pet feeding/nutrition questions and writes reviewable drafts to Firestore (`outreach_posts`).

## Environment

- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_USER_AGENT` (optional, default `PetHelpMonitor/2.0`)

Reddit auth mode:
- `REDDIT_AUTH_MODE` (optional): `oauth` (default) or `public`
  - `oauth` uses official OAuth tokens and requires `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET`
  - `public` reads `https://www.reddit.com/r/<sub>/new.json` and does not require OAuth credentials (useful if OAuth is blocked or you are waiting on access)

Firestore (recommended):
- `FIREBASE_SERVICE_ACCOUNT_JSON` = the full JSON of a Firebase service account key

Optional (only used for reference / dashboard parity):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`

## Run locally

```bash
pip install -r requirements.txt
python bot.py
```

## Deploy to Render

Use the included `render.yaml` and set env vars in the Render dashboard.
