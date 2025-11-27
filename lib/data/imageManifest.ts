// Image manifest for pet emoji groups and variants
export interface ImageGroup {
  masterIcon: string;
  masterHero: string;
  emojis: string[];
  variants: {
    icon_64: string;
    icon_128: string;
    thumb_150: string;
    thumb_300x200: string;
    recipe_600x384: string;
    recipe_300x192: string;
    banner_800x400: string;
    hero_1200x600: string;
    hero_800x400: string;
  };
}

export interface HealthConcernStyle {
  color: string;
  symbol: string;
  overlayType: 'icon' | 'frame' | 'badge';
}

export const imageManifest: Record<string, ImageGroup> = {
  "dog": {
    "masterIcon": "/assets/images/animals/dog/dog-core-icon-master.png",
    "masterHero": "/assets/images/animals/dog/dog-recipe-hero-master.png",
    "emojis": ["🐕", "🐶", "🐕‍🦺", "🦮", "🐩"],
    "variants": {
      "icon_64": "dog-icon-64.png",
      "icon_128": "dog-icon-128.png",
      "thumb_150": "dog-thumb-150.png",
      "thumb_300x200": "dog-thumb-300x200.png",
      "recipe_600x384": "dog-recipe-600x384.png",
      "recipe_300x192": "dog-recipe-300x192.png",
      "banner_800x400": "dog-banner-800x400.png",
      "hero_1200x600": "dog-hero-1200x600.png",
      "hero_800x400": "dog-hero-800x400.png"
    }
  },
  "cat": {
    "masterIcon": "/assets/images/animals/cat/cat-core-icon-master.png",
    "masterHero": "/assets/images/animals/cat/cat-recipe-hero-master.png",
    "emojis": ["🐈", "🐱", "🐈‍⬛"],
    "variants": {
      "icon_64": "cat-icon-64.png",
      "icon_128": "cat-icon-128.png",
      "thumb_150": "cat-thumb-150.png",
      "thumb_300x200": "cat-thumb-300x200.png",
      "recipe_600x384": "cat-recipe-600x384.png",
      "recipe_300x192": "cat-recipe-300x192.png",
      "banner_800x400": "cat-banner-800x400.png",
      "hero_1200x600": "cat-hero-1200x600.png",
      "hero_800x400": "cat-hero-800x400.png"
    }
  },
  "bird": {
    "masterIcon": "/assets/images/animals/bird/bird-core-icon-master.png",
    "masterHero": "/assets/images/animals/bird/bird-recipe-hero-master.png",
    "emojis": ["🦜", "🐦", "🪶", "🐓", "🐔", "🐣", "🐤", "🐥", "🐧", "🦆", "🦅", "🦉", "🦇"],
    "variants": {
      "icon_64": "bird-icon-64.png",
      "icon_128": "bird-icon-128.png",
      "thumb_150": "bird-thumb-150.png",
      "thumb_300x200": "bird-thumb-300x200.png",
      "recipe_600x384": "bird-recipe-600x384.png",
      "recipe_300x192": "bird-recipe-300x192.png",
      "banner_800x400": "bird-banner-800x400.png",
      "hero_1200x600": "bird-hero-1200x600.png",
      "hero_800x400": "bird-hero-800x400.png"
    }
  },
  "reptile": {
    "masterIcon": "/assets/images/animals/reptile/reptile-core-icon-master.png",
    "masterHero": "/assets/images/animals/reptile/reptile-recipe-hero-master.png",
    "emojis": ["🦎", "🐢", "🐍", "🐊", "🦖", "🦕"],
    "variants": {
      "icon_64": "reptile-icon-64.png",
      "icon_128": "reptile-icon-128.png",
      "thumb_150": "reptile-thumb-150.png",
      "thumb_300x200": "reptile-thumb-300x200.png",
      "recipe_600x384": "reptile-recipe-600x384.png",
      "recipe_300x192": "reptile-recipe-300x192.png",
      "banner_800x400": "reptile-banner-800x400.png",
      "hero_1200x600": "reptile-hero-1200x600.png",
      "hero_800x400": "reptile-hero-800x400.png"
    }
  },
  "pocket": {
    "masterIcon": "/assets/images/animals/pocket/pocket-core-icon-master.png",
    "masterHero": "/assets/images/animals/pocket/pocket-recipe-hero-master.png",
    "emojis": ["🐰", "🐹", "🐭", "🦔", "🐿️"],
    "variants": {
      "icon_64": "pocket-icon-64.png",
      "icon_128": "pocket-icon-128.png",
      "thumb_150": "pocket-thumb-150.png",
      "thumb_300x200": "pocket-thumb-300x200.png",
      "recipe_600x384": "pocket-recipe-600x384.png",
      "recipe_300x192": "pocket-recipe-300x192.png",
      "banner_800x400": "pocket-banner-800x400.png",
      "hero_1200x600": "pocket-hero-1200x600.png",
      "hero_800x400": "pocket-hero-800x400.png"
    }
  },
  "sea": {
    "masterIcon": "/assets/images/animals/sea/sea-core-icon-master.png",
    "masterHero": "/assets/images/animals/sea/sea-recipe-hero-master.png",
    "emojis": ["🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈"],
    "variants": {
      "icon_64": "sea-icon-64.png",
      "icon_128": "sea-icon-128.png",
      "thumb_150": "sea-thumb-150.png",
      "thumb_300x200": "sea-thumb-300x200.png",
      "recipe_600x384": "sea-recipe-600x384.png",
      "recipe_300x192": "sea-recipe-300x192.png",
      "banner_800x400": "sea-banner-800x400.png",
      "hero_1200x600": "sea-hero-1200x600.png",
      "hero_800x400": "sea-hero-800x400.png"
    }
  },
  "bug": {
    "masterIcon": "/assets/images/animals/bug/bug-core-icon-master.png",
    "masterHero": "/assets/images/animals/bug/bug-recipe-hero-master.png",
    "emojis": ["🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦗", "🕷️", "🦂"],
    "variants": {
      "icon_64": "bug-icon-64.png",
      "icon_128": "bug-icon-128.png",
      "thumb_150": "bug-thumb-150.png",
      "thumb_300x200": "bug-thumb-300x200.png",
      "recipe_600x384": "bug-recipe-600x384.png",
      "recipe_300x192": "bug-recipe-300x192.png",
      "banner_800x400": "bug-banner-800x400.png",
      "hero_1200x600": "bug-hero-1200x600.png",
      "hero_800x400": "bug-hero-800x400.png"
    }
  },
  "farm": {
    "masterIcon": "/assets/images/animals/farm/farm-core-icon-master.png",
    "masterHero": "/assets/images/animals/farm/farm-recipe-hero-master.png",
    "emojis": ["🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌"],
    "variants": {
      "icon_64": "farm-icon-64.png",
      "icon_128": "farm-icon-128.png",
      "thumb_150": "farm-thumb-150.png",
      "thumb_300x200": "farm-thumb-300x200.png",
      "recipe_600x384": "farm-recipe-600x384.png",
      "recipe_300x192": "farm-recipe-300x192.png",
      "banner_800x400": "farm-banner-800x400.png",
      "hero_1200x600": "farm-hero-1200x600.png",
      "hero_800x400": "farm-hero-800x400.png"
    }
  },
  "wild": {
    "masterIcon": "/assets/images/animals/wild/wild-core-icon-master.png",
    "masterHero": "/assets/images/animals/wild/wild-recipe-hero-master.png",
    "emojis": ["🐻", "🐨", "🐼", "🦊", "🐺", "🐗", "🐴", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘"],
    "variants": {
      "icon_64": "wild-icon-64.png",
      "icon_128": "wild-icon-128.png",
      "thumb_150": "wild-thumb-150.png",
      "thumb_300x200": "wild-thumb-300x200.png",
      "recipe_600x384": "wild-recipe-600x384.png",
      "recipe_300x192": "wild-recipe-300x192.png",
      "banner_800x400": "wild-banner-800x400.png",
      "hero_1200x600": "wild-hero-1200x600.png",
      "hero_800x400": "wild-hero-800x400.png"
    }
  },
  "fantasy": {
    "masterIcon": "/assets/images/animals/fantasy/fantasy-core-icon-master.png",
    "masterHero": "/assets/images/animals/fantasy/fantasy-recipe-hero-master.png",
    "emojis": ["🦄"],
    "variants": {
      "icon_64": "fantasy-icon-64.png",
      "icon_128": "fantasy-icon-128.png",
      "thumb_150": "fantasy-thumb-150.png",
      "thumb_300x200": "fantasy-thumb-300x200.png",
      "recipe_600x384": "fantasy-recipe-600x384.png",
      "recipe_300x192": "fantasy-recipe-300x192.png",
      "banner_800x400": "fantasy-banner-800x400.png",
      "hero_1200x600": "fantasy-hero-1200x600.png",
      "hero_800x400": "fantasy-hero-800x400.png"
    }
  }
};

export const healthConcernStyles: Record<string, HealthConcernStyle> = {
  "kidney-disease": { color: "#3B82F6", symbol: "🫘", overlayType: "icon" },
  "heart-disease": { color: "#EF4444", symbol: "❤️", overlayType: "icon" },
  "diabetes": { color: "#8B5CF6", symbol: "🍬", overlayType: "icon" },
  "allergies": { color: "#F59E0B", symbol: "⚠️", overlayType: "badge" },
  "obesity": { color: "#F97316", symbol: "⚖️", overlayType: "icon" },
  "pancreatitis": { color: "#92400E", symbol: "🍪", overlayType: "icon" },
  "digestive-issues": { color: "#10B981", symbol: "🍽️", overlayType: "icon" },
  "joint-health": { color: "#3B82F6", symbol: "🦴", overlayType: "icon" },
  "dental-issues": { color: "#FFFFFF", symbol: "🦷", overlayType: "icon" },
  "hip-dysplasia": { color: "#6B7280", symbol: "🦵", overlayType: "icon" },
  "skin-conditions": { color: "#EC4899", symbol: "🧴", overlayType: "icon" }
};

export const petCategoryStyles: Record<string, { color: string; symbol: string }> = {
  "dogs": { color: "#3B82F6", symbol: "🐕" },
  "cats": { color: "#F59E0B", symbol: "🐈" },
  "birds": { color: "#10B981", symbol: "🦜" },
  "reptiles": { color: "#8B5CF6", symbol: "🦎" },
  "pocket-pets": { color: "#EC4899", symbol: "🐰" }
};