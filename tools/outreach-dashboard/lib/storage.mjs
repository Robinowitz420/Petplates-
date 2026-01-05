import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseCSV, writeCSV } from './csv.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', 'data');
const LOGS_DIR = join(__dirname, '..', 'logs');
const INFLUENCERS_FILE = join(DATA_DIR, 'influencers.csv');

/**
 * Load influencers from CSV file
 */
export function loadInfluencers() {
  try {
    if (!existsSync(INFLUENCERS_FILE)) {
      console.warn('Influencers CSV file not found:', INFLUENCERS_FILE);
      return [];
    }

    const csvText = readFileSync(INFLUENCERS_FILE, 'utf8');
    const { headers, rows } = parseCSV(csvText);

    // Convert string IDs to numbers for easier handling
    return rows.map(row => ({
      ...row,
      id: parseInt(row.id, 10) || row.id
    }));
  } catch (error) {
    console.error('Error loading influencers:', error);
    return [];
  }
}

/**
 * Save influencers to CSV file
 */
export function saveInfluencers(influencers) {
  try {
    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    // Get headers from the first influencer or use default headers
    const headers = influencers.length > 0
      ? Object.keys(influencers[0])
      : ['id', 'displayName', 'platform', 'handle', 'profileUrl', 'email', 'tags', 'personalizationNotes', 'recentContentHook', 'status', 'lastContactedAt', 'notes'];

    // Ensure all influencers have all headers
    const normalizedInfluencers = influencers.map(influencer => {
      const normalized = {};
      headers.forEach(header => {
        normalized[header] = influencer[header] || '';
      });
      return normalized;
    });

    const csvText = writeCSV(headers, normalizedInfluencers);
    writeFileSync(INFLUENCERS_FILE, csvText, 'utf8');

    appendLog(`Saved ${influencers.length} influencers to CSV`);
    return true;
  } catch (error) {
    console.error('Error saving influencers:', error);
    appendLog(`ERROR: Failed to save influencers - ${error.message}`);
    return false;
  }
}

/**
 * Append a line to today's log file
 */
export function appendLog(line) {
  try {
    // Ensure logs directory exists
    if (!existsSync(LOGS_DIR)) {
      mkdirSync(LOGS_DIR, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const logFile = join(LOGS_DIR, `outreach-${today}.log`);

    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${line}\n`;

    writeFileSync(logFile, logLine, { flag: 'a', encoding: 'utf8' });
  } catch (error) {
    console.error('Error writing to log:', error);
  }
}

/**
 * Load templates from JSON file
 */
export function loadTemplates() {
  try {
    const templatesFile = join(DATA_DIR, 'templates.json');
    if (!existsSync(templatesFile)) {
      console.warn('Templates file not found:', templatesFile);
      return {};
    }

    const templatesText = readFileSync(templatesFile, 'utf8');
    return JSON.parse(templatesText);
  } catch (error) {
    console.error('Error loading templates:', error);
    return {};
  }
}

/**
 * Save templates to JSON file
 */
export function saveTemplates(templates) {
  try {
    const templatesFile = join(DATA_DIR, 'templates.json');
    writeFileSync(templatesFile, JSON.stringify(templates, null, 2), 'utf8');
    appendLog('Templates updated');
    return true;
  } catch (error) {
    console.error('Error saving templates:', error);
    return false;
  }
}

/**
 * Load config from JSON file
 */
export function loadConfig() {
  try {
    const configFile = join(DATA_DIR, 'config.json');
    if (!existsSync(configFile)) {
      console.warn('Config file not found:', configFile);
      return {};
    }

    const configText = readFileSync(configFile, 'utf8');
    return JSON.parse(configText);
  } catch (error) {
    console.error('Error loading config:', error);
    return {};
  }
}
