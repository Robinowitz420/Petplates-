import { loadTemplates, loadConfig } from './storage.mjs';

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
    previewMode = false
  } = options;

  const warnings = [];
  const templates = loadTemplates();
  const config = loadConfig();

  // Get the appropriate template
  const platform = influencer.platform || 'other';
  const template = templates[templateType]?.[platform] || templates[templateType]?.other;

  if (!template) {
    warnings.push(`No template found for ${templateType} on ${platform}`);
    return { message: '', charCount: 0, warnings };
  }

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

  // Generate base message
  let message = template;
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
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
