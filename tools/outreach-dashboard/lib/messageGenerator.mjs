import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadTemplates, loadConfig } from './storage.mjs';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');

function getManualMessage(manualMessages, influencer, templateType) {
  const idKey = influencer?.id != null ? String(influencer.id) : '';
  const platform = String(influencer?.platform || '').toLowerCase().trim();
  const handle = String(influencer?.handle || '').toLowerCase().trim().replace(/^@/, '');
  const platformHandleKey = platform && handle ? `${platform}_${handle}` : '';

  const keysToTry = [platformHandleKey, idKey].filter(Boolean);
  console.log('DEBUG: Looking for manual message with keys:', {
    platformHandleKey,
    idKey,
    templateType,
    manualCount: Object.keys(manualMessages || {}).length,
  });
  for (const key of keysToTry) {
    const entry = manualMessages?.[key];
    if (!entry || typeof entry !== 'object') continue;
    const msg = entry?.[templateType];
    if (typeof msg === 'string' && msg.trim().length > 0) {
      console.log('DEBUG: Found manual message via key:', key);
      return { message: msg, key };
    }
  }

  return { message: null, key: platformHandleKey || idKey || '' };
}

/**
 * Generate a personalized message for an influencer
 * @param {Object} influencer - Influencer record
 * @param {Object} options - Generation options
 * @param {string} options.templateType - first_touch, follow_up, or affiliate_invite
 * @param {boolean} options.includePs - Whether to include PS about free Pro account
 * @param {boolean} options.forceNoEmojis - Force removal of emojis
 * @param {boolean} options.previewMode - Return what would be removed instead of final message
 * @returns {Object} { message, charCount, warnings: [] }
 */
export async function generateMessage(influencer, options = {}) {
  const {
    templateType = 'first_touch',
    includePs = false,
    forceNoEmojis = false,
    previewMode = false,
    source = 'hybrid' // 'manual', 'llm', or 'hybrid'
  } = options;

  const warnings = [];
  const templates = loadTemplates();
  const config = loadConfig();
  const manualMessages = loadManualMessages();

  const complexTemplates = templates?.templates && typeof templates.templates === 'object'
    ? templates.templates
    : templates;

  const fallbackTemplates = templates?.fallbackTemplates && typeof templates.fallbackTemplates === 'object'
    ? templates.fallbackTemplates
    : templates?.fallbackTemplates;

  console.log('DEBUG: Templates loaded keys:', Object.keys(templates));
  console.log('DEBUG: Complex template exists:', !!complexTemplates?.[templateType]);
  console.log('DEBUG: Fallback templates exist:', !!fallbackTemplates);

  // Get the appropriate template
  const platform = influencer.platform || 'other';
  console.log('DEBUG: Platform detected:', platform);
  console.log('DEBUG: Source mode:', source);

  // Check for manual messages first (if source allows)
  const manual = getManualMessage(manualMessages, influencer, templateType);
  if ((source === 'manual' || source === 'hybrid') && manual.message) {
    const manualMessage = manual.message;

    // Apply character limit and return
    const charLimit = config.charLimits?.[platform] || 450;
    const result = enforceCharLimit(manualMessage, charLimit, previewMode);
    if (result.warnings) {
      warnings.push(...result.warnings);
    }
    return {
      message: result.message,
      charCount: result.charCount || result.message.length,
      warnings,
      source: 'manual'
    };
  }

  if (source === 'manual') {
    // Manual-only mode but no manual message found
    warnings.push(`No manual message found for ${manual.key || influencer.id} with template ${templateType}`);
    return { message: '', charCount: 0, warnings, source: 'manual' };
  }

  let message;

  // Try AI generation first if available
  if (process.env.OPENAI_API_KEY && complexTemplates?.[templateType]) {
    console.log('DEBUG: Attempting AI generation for:', templateType, platform);
    console.log('DEBUG: OpenAI key exists:', !!process.env.OPENAI_API_KEY);
    console.log('DEBUG: Complex template exists:', !!complexTemplates?.[templateType]);
    try {
      message = await generateAIMessage(influencer, templateType, platform, complexTemplates, config, includePs);
      console.log('AI message generated successfully:', message.substring(0, 100) + '...');
      // AI generation succeeded, return the message directly
      const charLimit = config.charLimits?.[platform] || 450;
      const result = enforceCharLimit(message, charLimit, previewMode);
      if (result.warnings) {
        warnings.push(...result.warnings);
      }
      return {
        message: result.message,
        charCount: result.charCount || result.message.length,
        warnings
      };
    } catch (error) {
      console.warn('AI generation failed, falling back to template:', error.message);
      warnings.push(`AI generation failed: ${error.message}`);
    }
  }

  // Fall back to simple templates if AI failed or isn't available
  const template = fallbackTemplates?.[templateType]?.[platform] ||
                   fallbackTemplates?.[templateType]?.other;

  if (!template) {
    warnings.push(`No template found for ${templateType} on ${platform}`);
    return { message: '', charCount: 0, warnings };
  }

  message = template;

  // Prepare placeholder values
  const baseSiteUrl = config.siteUrl || 'https://example.com';

  // Apply UTM tracking if template is available
  let siteUrl = baseSiteUrl;
  if (config.utmTemplate) {
    siteUrl = config.utmTemplate
      .replace(/\{siteUrl\}/g, baseSiteUrl)
      .replace(/\{platform\}/g, platform)
      .replace(/\{handle\}/g, influencer.handle || '');
  }

  const placeholders = {
    name: influencer.displayName || influencer.handle || 'there',
    handle: influencer.handle || '',
    siteUrl: siteUrl,
    valueProp: config.valueProp || 'free personalized meal plans',
    brandName: config.brandName || 'Paws & Plates',
    hookLine: influencer.recentContentHook ? ` — loved your ${influencer.recentContentHook}` : '',
    psLine: includePs ? `\n\n${config.psOffer}` : ''
  };

  // Generate base message (use existing message variable)
  message = template;
  Object.entries(placeholders).forEach(([key, value]) => {
    message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });

  // Remove emojis if forced
  if (forceNoEmojis) {
    message = message.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '');
  }

  // Apply character limit
  const charLimit = config.charLimits?.[platform] || 450;
  const result = enforceCharLimit(message, charLimit, previewMode);

  if (result.warnings) {
    warnings.push(...result.warnings);
  }

  // Optional OpenAI enhancement
  if (process.env.OPENAI_API_KEY && !previewMode) {
    try {
      const enhanced = await enhanceWithOpenAI(result.message, {
        platform,
        templateType,
        charLimit,
        forceNoEmojis
      });
      if (enhanced) {
        // Verify the enhanced message still meets requirements
        const enhancedResult = enforceCharLimit(enhanced, charLimit, false);
        if (enhancedResult.message && enhancedResult.message.includes(config.siteUrl)) {
          result.message = enhancedResult.message;
          result.charCount = enhancedResult.charCount;
          if (enhancedResult.warnings) {
            warnings.push(...enhancedResult.warnings);
          }
        }
      }
    } catch (error) {
      warnings.push(`OpenAI enhancement failed: ${error.message}`);
    }
  }

  return {
    message: result.message,
    charCount: result.charCount || result.message.length,
    warnings
  };
}

/**
 * Enforce character limit by intelligently shortening content
 */
function enforceCharLimit(message, limit, previewMode = false) {
  if (message.length <= limit) {
    return { message, charCount: message.length, warnings: [] };
  }

  const warnings = [];
  let shortened = message;

  // Step 1: Remove hookLine (anything after " — loved your")
  const hookPattern = / — loved your.*$/m;
  if (hookPattern.test(shortened)) {
    shortened = shortened.replace(hookPattern, '');
    warnings.push('Removed hook line to fit character limit');
  }

  if (shortened.length <= limit) {
    return { message: shortened, charCount: shortened.length, warnings };
  }

  // Step 2: Shorten valueProp
  const valuePropPattern = /free personalized meal plans \+ shoppable ingredient lists for dogs, cats, birds, reptiles/;
  if (valuePropPattern.test(shortened)) {
    shortened = shortened.replace(valuePropPattern, 'free personalized meal plans + shoppable ingredient lists for dogs & cats + more');
    warnings.push('Shortened value proposition to fit character limit');
  }

  if (shortened.length <= limit) {
    return { message: shortened, charCount: shortened.length, warnings };
  }

  // Step 3: Remove extra fluff lines (look for patterns that can be condensed)
  // This is platform-specific logic - for now, just truncate safely

  // Step 4: Truncate safely (never cut the URL)
  const urlPattern = /https:\/\/[^\s]+/;
  const urlMatch = shortened.match(urlPattern);

  if (urlMatch) {
    const url = urlMatch[0];
    const urlIndex = shortened.indexOf(url);
    const availableSpace = limit - url.length - 3; // 3 for "..."

    if (availableSpace > 10) { // Only truncate if we have meaningful space
      const beforeUrl = shortened.substring(0, urlIndex);
      const truncated = beforeUrl.substring(0, availableSpace) + '...';
      shortened = truncated + url;
      warnings.push('Truncated message to fit character limit while preserving URL');
    } else {
      // If we can't fit meaningful content + URL, keep only URL
      shortened = url;
      warnings.push('Message truncated to URL only to fit character limit');
    }
  } else {
    // No URL found, just truncate
    shortened = shortened.substring(0, limit - 3) + '...';
    warnings.push('Truncated message to fit character limit');
  }

  if (previewMode) {
    // In preview mode, show what would be kept vs removed
    const originalLength = message.length;
    const newLength = shortened.length;
    const removed = originalLength - newLength;
    warnings.push(`Preview: Would reduce from ${originalLength} to ${newLength} characters (${removed} removed)`);
    return { message: shortened, charCount: newLength, warnings };
  }

  return { message: shortened, charCount: shortened.length, warnings };
}

/**
 * Enhance message with OpenAI while preserving requirements
 */
async function enhanceWithOpenAI(message, options) {
  const { platform, templateType, charLimit, forceNoEmojis } = options;

  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const model = process.env.OPENAI_ENHANCE_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: `Rewrite this outreach message in a casual, punchy voice with short lines and ellipses. Keep it under ${charLimit} characters. Preserve the URL and any PS section exactly. ${forceNoEmojis ? 'Remove all emojis.' : 'Use at most 1 emoji.'}

Original: ${message}`
        }],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content?.trim();

    if (!enhanced) {
      return null;
    }

    // Verify it still contains the URL
    const config = loadConfig();
    if (!enhanced.includes(config.siteUrl)) {
      throw new Error('Enhanced message missing required URL');
    }

    return enhanced;
  } catch (error) {
    console.error('OpenAI enhancement error:', error);
    return null;
  }
}

/**
 * Load manual messages from JSON file
 */
function loadManualMessages() {
  try {
    const manualMessagesFile = join(DATA_DIR, 'manualMessages.json');
    console.log('DEBUG: Loading manual messages from:', manualMessagesFile);
    if (!existsSync(manualMessagesFile)) {
      console.log('DEBUG: Manual messages file not found, will use templates');
      return {};
    }

    const manualMessagesText = readFileSync(manualMessagesFile, 'utf8');
    const manualMessages = JSON.parse(manualMessagesText);
    console.log('DEBUG: Loaded manual messages for', Object.keys(manualMessages).length, 'influencers');
    return manualMessages;
  } catch (error) {
    console.error('Error loading manual messages:', error);
    return {};
  }
}

/**
 * Generate a fully AI-powered message using complex templates
 */
async function generateAIMessage(influencer, templateType, platform, templates, config, includePs) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Get the complex template
  const complexTemplate = templates[templateType];
  if (!complexTemplate || !complexTemplate.variants || complexTemplate.variants.length === 0) {
    throw new Error('No complex template variants available');
  }

  // Use the first variant (could randomize later)
  const variant = complexTemplate.variants[0];

  // Build AI prompt from the template structure
  const prompt = `Write a personalized outreach message for a pet influencer.

INFLUENCER DETAILS:
- Name: ${influencer.displayName || 'Unknown'}
- Handle: ${influencer.handle || 'Unknown'}
- Platform: ${platform}
- Tags: ${influencer.tags || 'Not specified'}
- Personalization Notes: ${influencer.personalizationNotes || 'Not provided'}
- Recent Content: ${influencer.recentContentHook || 'Not provided'}

MESSAGE REQUIREMENTS:
- Template Type: ${templateType.replace('_', ' ')}
- Platform: ${platform}
- Style: Casual, direct, punchy, short lines, ellipses ok, max 1 emoji
- Include site URL: ${config.siteUrl}
${includePs ? `- Include PS: ${config.psOffer}` : '- No PS section'}
- Character limit: ${config.charLimits?.[platform] || 450}
- Must be personalized to this specific influencer

STRUCTURE TO FOLLOW:
${variant.llmInstruction ? variant.llmInstruction.join('\n') : 'Write a compelling, personalized outreach message'}

Generate the complete message now:`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing personalized outreach messages for pet influencers. Write in a casual, direct, punchy style with short lines and ellipses. No corporate speak, no hype. Make it personal and genuine.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.8,
    });

    const aiMessage = completion.choices[0]?.message?.content?.trim();
    if (!aiMessage) {
      throw new Error('No response from AI');
    }

    // Apply UTM tracking to URLs
    const baseSiteUrl = config.siteUrl || 'https://example.com';
    let siteUrl = baseSiteUrl;
    if (config.utmTemplate) {
      siteUrl = config.utmTemplate
        .replace(/\{siteUrl\}/g, baseSiteUrl)
        .replace(/\{platform\}/g, platform)
        .replace(/\{handle\}/g, influencer.handle || '');
    }

    // Replace any generic URLs with tracked ones
    const urlRegex = new RegExp(config.siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    return aiMessage.replace(urlRegex, siteUrl);

  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}
