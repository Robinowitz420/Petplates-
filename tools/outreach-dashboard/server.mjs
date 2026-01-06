import { createServer } from 'http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { loadInfluencers, saveInfluencers, loadTemplates, saveTemplates, loadConfig, appendLog } from './lib/storage.mjs';
import { generateMessage } from './lib/messageGenerator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file if it exists
loadEnvFile();

// Configuration
const PORT = process.env.PORT || 4377;
const PUBLIC_DIR = join(__dirname, 'public');
const DATA_DIR = join(__dirname, 'data');
const LOGS_DIR = join(__dirname, 'logs');

// MIME types for static file serving
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Ensure required directories and files exist
ensureDataFiles();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Set CORS headers for API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // API routes
    if (pathname.startsWith('/api/')) {
      await handleApiRequest(req, res, pathname, url);
      return;
    }

    // Static file serving
    await handleStaticFile(req, res, pathname);

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

async function handleApiRequest(req, res, pathname, url) {
  const method = req.method;

  // GET /api/influencers
  if (pathname === '/api/influencers' && method === 'GET') {
    const influencers = loadInfluencers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(influencers));
    return;
  }

  // POST /api/influencers
  if (pathname === '/api/influencers' && method === 'POST') {
    const body = await getRequestBody(req);
    const influencers = Array.isArray(body) ? body : [];

    if (saveInfluencers(influencers)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to save influencers' }));
    }
    return;
  }

  // GET /api/templates
  if (pathname === '/api/templates' && method === 'GET') {
    const templates = loadTemplates();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(templates));
    return;
  }

  // POST /api/templates
  if (pathname === '/api/templates' && method === 'POST') {
    const body = await getRequestBody(req);
    if (saveTemplates(body)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to save templates' }));
    }
    return;
  }

  // GET /api/config
  if (pathname === '/api/config' && method === 'GET') {
    const config = loadConfig();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config));
    return;
  }

  // POST /api/generate
  if (pathname === '/api/generate' && method === 'POST') {
    const body = await getRequestBody(req);
    const { influencer, options = {} } = body;

    if (!influencer) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Influencer data required' }));
      return;
    }

    const result = await generateMessage(influencer, options);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 404 for unknown API routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
}

async function handleStaticFile(req, res, pathname) {
  // Default to index.html for root path
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = join(PUBLIC_DIR, filePath);

  // Security check - prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    if (existsSync(filePath)) {
      const ext = extname(filePath);
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('File not found');
    }
  } catch (error) {
    res.writeHead(500);
    res.end('Internal server error');
  }
}

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function loadEnvFile() {
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) {
    return;
  }

  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          process.env[key.trim()] = value;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load .env file:', error.message);
  }
}

function ensureDataFiles() {
  // Ensure directories exist
  [DATA_DIR, LOGS_DIR].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  // Ensure data files exist with defaults
  const defaultInfluencers = join(DATA_DIR, 'influencers.csv');
  if (!existsSync(defaultInfluencers)) {
    const csvContent = `id,displayName,platform,handle,profileUrl,email,tags,personalizationNotes,recentContentHook,status,lastContactedAt,notes\n1,Example Influencer,instagram,@example,https://instagram.com/example,,pet lover,,example content,not_contacted,,Example influencer for testing\n`;
    writeFileSync(defaultInfluencers, csvContent);
  }

  const defaultTemplates = join(DATA_DIR, 'templates.json');
  if (!existsSync(defaultTemplates)) {
    const templates = {
      "first_touch": {
        "instagram": "hey {name} — {valueProp} {hookLine}\n\ncheck it out: {siteUrl}{psLine}",
        "other": "hey {name} — {valueProp} {hookLine}\n\ncheck it out: {siteUrl}{psLine}"
      }
    };
    writeFileSync(defaultTemplates, JSON.stringify(templates, null, 2));
  }

  const defaultConfig = join(DATA_DIR, 'config.json');
  if (!existsSync(defaultConfig)) {
    const config = {
      "siteUrl": "https://example.com",
      "valueProp": "free personalized meal plans",
      "psOffer": "PS — free Pro account available",
      "charLimits": { "instagram": 450, "other": 450 }
    };
    writeFileSync(defaultConfig, JSON.stringify(config, null, 2));
  }

  appendLog('Server started - data files verified');
}

server.listen(PORT, () => {
  console.log(`🚀 Outreach Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`💾 Data stored in: ${DATA_DIR}`);
  console.log(`📝 Logs stored in: ${LOGS_DIR}`);
  if (process.env.OPENAI_API_KEY) {
    console.log(`🤖 OpenAI enhancement enabled`);
  } else {
    console.log(`📝 Using template-only mode (no OpenAI API key found)`);
  }
});
