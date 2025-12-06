"""
Script to find better emoji images from the segmented grids
and suggest improved mappings based on visual analysis
"""
from PIL import Image
import os
from pathlib import Path
import json

def analyze_emoji_image(image_path):
    """Analyze an emoji image to determine what it represents"""
    try:
        img = Image.open(image_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Get color distribution
        pixels = list(img.getdata())
        width, height = img.size
        
        # Calculate average colors
        avg_r = sum(p[0] for p in pixels) / len(pixels)
        avg_g = sum(p[1] for p in pixels) / len(pixels)
        avg_b = sum(p[2] for p in pixels) / len(pixels)
        
        # Check for specific patterns
        # Green = checkmark, yellow = star, red = X/warning, etc.
        is_green = avg_g > avg_r + 20 and avg_g > avg_b + 20
        is_yellow = avg_r > 200 and avg_g > 200 and avg_b < 150
        is_red = avg_r > avg_g + 30 and avg_r > avg_b + 30
        is_blue = avg_b > avg_r + 20 and avg_b > avg_g + 20
        is_white = avg_r > 240 and avg_g > 240 and avg_b > 240
        is_black = avg_r < 50 and avg_g < 50 and avg_b < 50
        
        # Check shape patterns (simple heuristics)
        # For checkmarks: look for diagonal patterns
        # For stars: look for pointy shapes
        # For thumbs: look for hand-like shapes
        
        return {
            'avg_r': avg_r,
            'avg_g': avg_g,
            'avg_b': avg_b,
            'is_green': is_green,
            'is_yellow': is_yellow,
            'is_red': is_red,
            'is_blue': is_blue,
            'is_white': is_white,
            'is_black': is_black,
            'brightness': (avg_r + avg_g + avg_b) / 3
        }
    except Exception as e:
        return {'error': str(e)}

def find_best_status_emojis():
    """Find the best images for status emojis"""
    emojis_dir = Path('public/images/emojis')
    
    if not emojis_dir.exists():
        print(f"❌ Emoji directory not found: {emojis_dir}")
        return {}
    
    # Analyze copilot emojis (they have symbols)
    copilot_files = sorted(emojis_dir.glob('copilot_emojis_*.png'))
    
    candidates = {
        'checkmark': [],  # Green checkmarks
        'star': [],       # Yellow stars
        'thumbs_up': [],  # Thumbs up
        'thumbs_down': [], # Thumbs down
        'balance': [],    # Scale/balance
        'warning': [],    # Warning signs
        'x': []           # X marks
    }
    
    print("🔍 Analyzing copilot emojis for status symbols...\n")
    
    for img_file in copilot_files:
        analysis = analyze_emoji_image(img_file)
        if 'error' in analysis:
            continue
        
        # Categorize based on color patterns
        if analysis['is_green'] and analysis['brightness'] > 100:
            candidates['checkmark'].append((img_file.name, analysis))
        elif analysis['is_yellow']:
            candidates['star'].append((img_file.name, analysis))
        elif analysis['is_red']:
            if 'warning' in img_file.name.lower() or analysis['brightness'] < 150:
                candidates['warning'].append((img_file.name, analysis))
            else:
                candidates['x'].append((img_file.name, analysis))
        elif analysis['is_blue']:
            candidates['balance'].append((img_file.name, analysis))
    
    # Sort candidates by relevance
    for key in candidates:
        candidates[key].sort(key=lambda x: x[1]['brightness'], reverse=True)
    
    return candidates

def main():
    print("🔍 Finding better emoji images...\n")
    
    candidates = find_best_status_emojis()
    
    suggestions = {}
    for emoji_type, candidate_list in candidates.items():
        if candidate_list:
            best = candidate_list[0]
            suggestions[emoji_type] = {
                'file': best[0],
                'path': f'/images/emojis/{best[0]}',
                'confidence': 'high' if len(candidate_list) > 0 else 'medium'
            }
            print(f"✅ {emoji_type}: {best[0]}")
        else:
            print(f"❌ {emoji_type}: No good candidates found")
    
    # Save suggestions
    output_path = Path('data/better-emoji-suggestions.json')
    output_path.parent.mkdir(exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(suggestions, f, indent=2)
    
    print(f"\n💾 Suggestions saved to: {output_path}")
    print("\n✅ Done! Check the suggestions file for improved emoji mappings.")

if __name__ == '__main__':
    main()

