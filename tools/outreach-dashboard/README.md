# Outreach Dashboard

A local-only web dashboard for managing influencer outreach campaigns. Generate personalized messages, track contact status, and maintain organized records - all without automating any messaging.

## What It Does

This tool provides a clean web interface to:
- **Import & Filter**: Load influencers from CSV and filter by status, platform, or search terms
- **Generate Messages**: Create personalized outreach messages using templates with optional AI enhancement
- **Track Progress**: Update contact status, add notes, and maintain history
- **Copy to Clipboard**: Copy generated messages with a satisfying beep sound
- **Open Profiles**: Quickly open influencer profile URLs in new tabs

**Important**: This tool is strictly local-only and does not automate any messaging, DMs, or emails. It only helps you generate and copy text, then opens profile URLs for you to manually send messages.

## Quick Start

1. **Edit your data**:
   ```bash
   # Edit the influencers CSV
   tools/outreach-dashboard/data/influencers.csv

   # Optionally edit templates and config
   tools/outreach-dashboard/data/templates.json
   tools/outreach-dashboard/data/config.json
   ```

2. **Optional: Enable AI enhancement**
   ```bash
   # Create .env file with your OpenAI API key
   cp tools/outreach-dashboard/.env.example tools/outreach-dashboard/.env
   # Edit .env and add: OPENAI_API_KEY=your_key_here
   ```

3. **Run the server**:
   ```bash
   cd tools/outreach-dashboard
   node server.mjs
   ```

4. **Open your browser**:
   ```
   http://localhost:4377
   ```

## Data Format

### Influencers CSV Structure

The `data/influencers.csv` file should have these columns:

```csv
id,displayName,platform,handle,profileUrl,email,tags,personalizationNotes,recentContentHook,status,lastContactedAt,notes
```

**Field Descriptions**:
- `id`: Unique identifier (number)
- `displayName`: Full name or display name
- `platform`: instagram|tiktok|youtube|x|threads|email|other
- `handle`: Username/handle (without @)
- `profileUrl`: Full URL to their profile
- `email`: Optional email address
- `tags`: Comma-separated tags (e.g., "dog lover,photographer")
- `personalizationNotes`: Bullet points about them (pipe-separated)
- `recentContentHook`: Recent content reference (MUST NOT be invented)
- `status`: not_contacted|contacted|replied|follow_up|not_interested|needs_manual_check
- `lastContactedAt`: ISO timestamp or blank
- `notes`: Free-form notes

### Example Rows

```csv
1,Sarah Johnson,instagram,@sarahsdoglife,https://instagram.com/sarahsdoglife,,dog lover,pet parent|professional photographer,,not_contacted,,New lead from dog community forum
2,Mike Chen,tiktok,@mikespets,,mike@example.com,pet blogger,cat owner|tech enthusiast,,contacted,2024-01-15T10:30:00Z,Initial contact made, waiting for response
```

## Features

### Filtering & Search
- Filter by contact status
- Filter by platform
- Search across names, handles, and tags
- Limit results (50, 100, 250, 1000)

### Message Generation
- **Templates**: First touch, follow-up, and affiliate invite templates
- **Placeholders**: {name}, {handle}, {siteUrl}, {valueProp}, {hookLine}, {psLine}
- **AI Enhancement**: Optional OpenAI integration for better messaging (if API key provided)
- **Character Limits**: Automatic enforcement by platform (Instagram: 450, X/Twitter: 280, etc.)
- **Smart Shortening**: Intelligently removes optional parts when over limit

### Tracking & Notes
- Status updates with timestamps
- Free-form notes
- Personalization notes
- Recent content hooks
- Email addresses
- Profile URLs

## Configuration

### Config File (`data/config.json`)

```json
{
  "siteUrl": "https://paws-and-plates.vercel.app/",
  "valueProp": "free personalized meal plans + shoppable ingredient lists for dogs, cats, birds, reptiles",
  "psOffer": "PS — if you're interested, I can give you a free Pro account to try. Just DM me.",
  "charLimits": {
    "instagram": 450,
    "tiktok": 450,
    "x": 280,
    "youtube": 650,
    "threads": 450,
    "email": 1000,
    "other": 450
  }
}
```

### Templates File (`data/templates.json`)

Templates use placeholders and support multiple platforms:

```json
{
  "first_touch": {
    "instagram": "hey {name} — {valueProp} {hookLine}\n\ncheck it out: {siteUrl}{psLine}",
    "tiktok": "hey {name}! loving your pet content! {valueProp} {hookLine}\n\n{handle} would love this: {siteUrl}{psLine}"
  }
}
```

## API Endpoints

The server provides these endpoints:

- `GET /api/influencers` - Get all influencers
- `POST /api/influencers` - Save all influencers (full replacement)
- `GET /api/templates` - Get message templates
- `POST /api/templates` - Save templates
- `GET /api/config` - Get configuration
- `POST /api/generate` - Generate message for influencer

## Usage Workflow

1. **Import your influencer list** into `data/influencers.csv`
2. **Filter** to find influencers you want to contact
3. **Click a row** to open the details panel
4. **Update status/notes** as needed
5. **Generate a message** using templates
6. **Copy to clipboard** (beep confirms)
7. **Open their profile** in a new tab
8. **Manually send** the message
9. **Mark as contacted** when done

## Troubleshooting

### Port Conflicts
If port 4377 is busy, create a `.env` file:
```
PORT=4378
```

### CSV Formatting Issues
- Always quote fields containing commas or newlines
- Escape quotes by doubling them: `"He said ""Hello"""` becomes `He said "Hello"`
- Ensure consistent column count across all rows

### Character Limit Enforcement
Messages are automatically shortened when over limits:
1. Removes hook line (recent content reference)
2. Shortens value prop ("dogs & cats + more")
3. Truncates safely while preserving the URL

### OpenAI Issues
- API key must be in `.env` file as `OPENAI_API_KEY=sk-...`
- Enhanced messages still respect character limits and preserve required elements
- Falls back to template-only mode if AI fails

### File Permissions
Ensure the user running the server can:
- Read/write CSV files in `data/`
- Create log files in `logs/`

## Security Notes

- **Local Only**: Server binds to localhost only
- **No Automation**: Never sends messages automatically
- **API Key Optional**: Works without OpenAI integration
- **Data Privacy**: All data stays on your local machine

## Development

To modify the tool:

- **Frontend**: Edit `public/index.html`, `public/app.js`, `public/styles.css`
- **Backend**: Edit `server.mjs` and files in `lib/`
- **Data**: Edit files in `data/`
- **Templates**: Customize `data/templates.json`

The server automatically reloads when you restart it. Frontend changes require a browser refresh.
