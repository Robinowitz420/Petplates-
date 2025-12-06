"""
Script to analyze emoji images and identify which ones have correct colors
and which ones are inverted. Also identifies the best images for each emoji type.
"""
from PIL import Image
import os
from pathlib import Path
import json

def analyze_image_colors(image_path):
    """Analyze if an image has inverted colors (check if it's mostly dark/light)"""
    try:
        img = Image.open(image_path)
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Get average brightness
        pixels = list(img.getdata())
        avg_brightness = sum(sum(p) for p in pixels) / (len(pixels) * 3)
        
        # Check if image is mostly transparent/white (might be inverted)
        # Normal emojis should have some color, not be pure white/black
        has_color = False
        color_variance = 0
        
        if len(pixels) > 0:
            # Check color variance
            r_values = [p[0] for p in pixels]
            g_values = [p[1] for p in pixels]
            b_values = [p[2] for p in pixels]
            
            if r_values and g_values and b_values:
                r_var = max(r_values) - min(r_values)
                g_var = max(g_values) - min(g_values)
                b_var = max(b_values) - min(b_values)
                color_variance = (r_var + g_var + b_var) / 3
                has_color = color_variance > 20  # Threshold for having actual color
        
        return {
            'avg_brightness': avg_brightness,
            'has_color': has_color,
            'color_variance': color_variance,
            'likely_inverted': avg_brightness > 200 and color_variance < 30,  # Very bright with low variance = likely inverted
            'likely_good': has_color and 50 < avg_brightness < 200  # Good color range
        }
    except Exception as e:
        return {
            'error': str(e),
            'likely_inverted': False,
            'likely_good': False
        }

def find_best_emoji_candidates():
    """Find the best emoji images from all available grids"""
    emojis_dir = Path('public/images/emojis')
    
    if not emojis_dir.exists():
        print(f"❌ Emoji directory not found: {emojis_dir}")
        return {}
    
    # Analyze all images
    all_images = {}
    
    for image_file in sorted(emojis_dir.glob('*.png')):
        analysis = analyze_image_colors(image_file)
        all_images[image_file.name] = {
            'path': str(image_file.relative_to('public')),
            **analysis
        }
    
    # Categorize by quality
    good_images = {k: v for k, v in all_images.items() if v.get('likely_good', False)}
    inverted_images = {k: v for k, v in all_images.items() if v.get('likely_inverted', False)}
    other_images = {k: v for k, v in all_images.items() if k not in good_images and k not in inverted_images}
    
    return {
        'good': good_images,
        'inverted': inverted_images,
        'other': other_images,
        'all': all_images
    }

def suggest_emoji_mappings():
    """Suggest better emoji mappings based on image analysis"""
    analysis = find_best_emoji_candidates()
    
    # Common emoji types we need
    emoji_needs = {
        'dog': ['🐕', '🐶'],
        'cat': ['🐈', '🐱'],
        'bird': ['🦜', '🐦'],
        'turtle': ['🦎', '🐢'],
        'rabbit': ['🐰', '🐇'],
        'hamster': ['🐹'],
        'mouse': ['🐭'],
        'hedgehog': ['🦔'],
        'paw': ['🐾'],
        'checkmark': ['✅'],
        'thumbs_up': ['👍'],
        'thumbs_down': ['👎'],
        'balance': ['⚖️'],
        'star': ['⭐'],
        'sparkle': ['✨']
    }
    
    # Find best candidates from good images
    suggestions = {}
    
    for emoji_type, emojis in emoji_needs.items():
        # Look for images that might match
        candidates = []
        for img_name, img_data in analysis['good'].items():
            # Simple heuristic: check filename patterns
            if emoji_type in img_name.lower() or any(e in img_name for e in emojis):
                candidates.append((img_name, img_data))
        
        if candidates:
            # Sort by quality (color variance, brightness)
            candidates.sort(key=lambda x: (
                -x[1].get('color_variance', 0),
                abs(x[1].get('avg_brightness', 128) - 128)  # Prefer mid-range brightness
            ))
            suggestions[emoji_type] = {
                'emojis': emojis,
                'best_candidate': candidates[0][0],
                'path': candidates[0][1]['path'],
                'all_candidates': [c[0] for c in candidates[:3]]
            }
    
    return suggestions

def main():
    print("🔍 Analyzing emoji images for color issues...\n")
    
    analysis = find_best_emoji_candidates()
    
    print(f"✅ Found {len(analysis['good'])} good quality images")
    print(f"⚠️  Found {len(analysis['inverted'])} potentially inverted images")
    print(f"❓ Found {len(analysis['other'])} other images\n")
    
    if analysis['inverted']:
        print("⚠️  Potentially inverted images (very bright, low color variance):")
        for img_name in list(analysis['inverted'].keys())[:10]:
            print(f"   - {img_name}")
        if len(analysis['inverted']) > 10:
            print(f"   ... and {len(analysis['inverted']) - 10} more")
        print()
    
    # Generate suggestions
    suggestions = suggest_emoji_mappings()
    
    print("💡 Suggested emoji mappings (best quality images):")
    for emoji_type, suggestion in suggestions.items():
        print(f"   {emoji_type}: {suggestion['best_candidate']} ({suggestion['path']})")
    
    # Save analysis to file
    output = {
        'analysis': analysis,
        'suggestions': suggestions,
        'summary': {
            'total_images': len(analysis['all']),
            'good_images': len(analysis['good']),
            'inverted_images': len(analysis['inverted']),
            'other_images': len(analysis['other'])
        }
    }
    
    output_path = Path('data/emoji-color-analysis.json')
    output_path.parent.mkdir(exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n💾 Analysis saved to: {output_path}")
    print("\n✅ Done! Check the analysis file for detailed results.")

if __name__ == '__main__':
    main()

