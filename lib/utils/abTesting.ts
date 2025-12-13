// A/B Testing Utilities for Button Copy Optimization
// Tracks which button text drives more affiliate clicks

export type ButtonVariant = 'shop-now' | 'buy-amazon' | 'get-ingredients';

export interface ButtonCopyVariant {
  id: ButtonVariant;
  text: string;
  icon?: string;
}

export const BUTTON_VARIANTS: ButtonCopyVariant[] = [
  { id: 'shop-now', text: 'Buy', icon: '🛒' },
  { id: 'buy-amazon', text: 'Buy', icon: '📦' },
  { id: 'get-ingredients', text: 'Buy', icon: '✨' }
];

export const BUY_ALL_VARIANTS: ButtonCopyVariant[] = [
  { id: 'shop-now', text: 'Buy All', icon: '🛒' },
  { id: 'buy-amazon', text: 'Buy All', icon: '📦' },
  { id: 'get-ingredients', text: 'Buy All', icon: '✨' }
];

// Assign user to a variant (sticky - stays same across session)
export function getAssignedVariant(): ButtonVariant {
  if (typeof window === 'undefined') return 'shop-now';
  
  // Check if user already has assigned variant
  const stored = localStorage.getItem('ab_button_variant');
  if (stored && ['shop-now', 'buy-amazon', 'get-ingredients'].includes(stored)) {
    return stored as ButtonVariant;
  }
  
  // Randomly assign new user to a variant (33/33/33 split)
  const variants: ButtonVariant[] = ['shop-now', 'buy-amazon', 'get-ingredients'];
  const random = Math.floor(Math.random() * 3);
  const assigned = variants[random];
  
  localStorage.setItem('ab_button_variant', assigned);
  return assigned;
}

// Get button text for assigned variant
export function getButtonCopy(isBuyAll: boolean = false): ButtonCopyVariant {
  const variant = getAssignedVariant();
  const variants = isBuyAll ? BUY_ALL_VARIANTS : BUTTON_VARIANTS;
  return variants.find(v => v.id === variant) || variants[0];
}

// Track button click (for conversion analysis)
export function trackButtonClick(
  variant: ButtonVariant,
  context: 'individual' | 'buy-all' | 'preview',
  ingredientName?: string
) {
  if (typeof window === 'undefined') return;
  
  const clicks = JSON.parse(localStorage.getItem('ab_button_clicks') || '[]');
  
  clicks.push({
    variant,
    context,
    ingredientName,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 1000 clicks
  if (clicks.length > 1000) {
    clicks.splice(0, clicks.length - 1000);
  }
  
  localStorage.setItem('ab_button_clicks', JSON.stringify(clicks));
}

// Get conversion stats for analysis
export function getConversionStats() {
  if (typeof window === 'undefined') return null;
  
  const clicks = JSON.parse(localStorage.getItem('ab_button_clicks') || '[]');
  
  const stats: Record<ButtonVariant, { total: number; byContext: Record<string, number> }> = {
    'shop-now': { total: 0, byContext: {} },
    'buy-amazon': { total: 0, byContext: {} },
    'get-ingredients': { total: 0, byContext: {} }
  };
  
  clicks.forEach((click: any) => {
    const variant = click.variant as ButtonVariant;
    if (stats[variant]) {
      stats[variant].total++;
      stats[variant].byContext[click.context] = (stats[variant].byContext[click.context] || 0) + 1;
    }
  });
  
  return stats;
}

// Console command to see results
export function logABTestResults() {
  const stats = getConversionStats();
  if (!stats) {
    console.log('No A/B test data available');
    return;
  }
  
  console.log('🧪 A/B Test Results - Button Copy Optimization\n');
  console.log('═══════════════════════════════════════════\n');
  
  Object.entries(stats).forEach(([variant, data]) => {
    console.log(`${variant.toUpperCase()}:`);
    console.log(`  Total clicks: ${data.total}`);
    console.log(`  By context:`, data.byContext);
    console.log('');
  });
  
  // Calculate winner
  const sorted = Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
  const winner = sorted[0];
  
  console.log(`🏆 WINNER: "${winner[0]}" with ${winner[1].total} clicks`);
  console.log('\nTo reset test: localStorage.removeItem("ab_button_clicks")');
  console.log('To change your variant: localStorage.removeItem("ab_button_variant")');
}

// Make available globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).logABTestResults = logABTestResults;
  (window as any).getConversionStats = getConversionStats;
}

