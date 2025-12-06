# scripts/analyze-emoji-images.py
# Analyze extracted emoji images to identify usable, unique ones

from PIL import Image
import os
from pathlib import Path
from collections import defaultdict
import hashlib

def get_image_hash(image_path):
    """Get a hash of the image content to detect duplicates"""
    try:
        img = Image.open(image_path)
        # Resize to small size for faster hashing
        img = img.resize((32, 32))
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        # Get pixel data hash
        pixel_data = img.tobytes()
        return hashlib.md5(pixel_data).hexdigest()
    except Exception as e:
        return None

def analyze_image(image_path):
    """Analyze a single image"""
    try:
        img = Image.open(image_path)
        width, height = img.size
        
        # Check if image is mostly empty/white
        if img.mode == 'RGB':
            pixels = list(img.getdata())
            # Count non-white pixels
            non_white = sum(1 for p in pixels if p != (255, 255, 255))
            total = len(pixels)
            content_ratio = non_white / total if total > 0 else 0
        else:
            content_ratio = 0.5  # Assume has content if not RGB
        
        return {
            'width': width,
            'height': height,
            'content_ratio': content_ratio,
            'has_content': content_ratio > 0.01,  # At least 1% non-white
            'size': os.path.getsize(image_path)
        }
    except Exception as e:
        return {'error': str(e)}

def main():
    emojis_dir = Path('public/images/emojis')
    
    if not emojis_dir.exists():
        print(f"❌ Directory not found: {emojis_dir}")
        return
    
    print("🔍 Analyzing emoji images...\n")
    
    # Group by source
    amojis = sorted(emojis_dir.glob('amojis_*.png'))
    copilot = sorted(emojis_dir.glob('copilot_emojis_*.png'))
    grid = sorted(emojis_dir.glob('emoji_grid_*.png'))
    
    print(f"📊 Found:")
    print(f"   amojis: {len(amojis)} images")
    print(f"   copilot: {len(copilot)} images")
    print(f"   grid: {len(grid)} images")
    print(f"   Total: {len(amojis) + len(copilot) + len(grid)} images\n")
    
    # Analyze all images
    all_images = list(amojis) + list(copilot) + list(grid)
    
    print("🔎 Checking for duplicates and usable content...\n")
    
    # Find duplicates by hash
    hash_map = defaultdict(list)
    usable_images = []
    duplicate_count = 0
    
    for img_path in all_images:
        img_hash = get_image_hash(img_path)
        if img_hash:
            hash_map[img_hash].append(img_path)
            if len(hash_map[img_hash]) == 1:
                # First occurrence, check if usable
                analysis = analyze_image(img_path)
                if analysis.get('has_content', False):
                    usable_images.append({
                        'path': img_path,
                        'hash': img_hash,
                        'source': img_path.stem.split('_')[0],
                        'number': int(img_path.stem.split('_')[-1]) if img_path.stem.split('_')[-1].isdigit() else 0,
                        'width': analysis.get('width', 0),
                        'height': analysis.get('height', 0),
                        'content_ratio': analysis.get('content_ratio', 0)
                    })
            else:
                duplicate_count += 1
    
    print(f"✅ Unique usable images: {len(usable_images)}")
    print(f"❌ Duplicates found: {duplicate_count}\n")
    
    # Group by source
    by_source = defaultdict(list)
    for img in usable_images:
        by_source[img['source']].append(img)
    
    print("📁 Usable images by source:")
    for source, images in sorted(by_source.items()):
        print(f"   {source}: {len(images)} unique images")
    
    # Identify best candidates for common emojis
    print("\n🎯 Best candidates for common pet emojis:")
    print("   (Based on image descriptions and position in grids)\n")
    
    # amojis.png grid (8x8) - based on earlier description:
    # Row 1: Yellow dog, teal cat, orange rabbit, rabbit+chick, green bird, turtle, owl, beaver
    candidates = {
        'dog': ['amojis_001', 'amojis_009', 'amojis_010'],  # Row 1, Row 2
        'cat': ['amojis_002', 'amojis_064'],  # Row 1, Row 8 (black cat)
        'rabbit': ['amojis_003', 'amojis_062'],  # Row 1, Row 8
        'bird': ['amojis_005', 'amojis_013', 'amojis_014', 'amojis_058'],  # Row 1, Row 3, Row 8
        'turtle': ['amojis_006', 'amojis_025', 'amojis_033'],  # Row 1, Row 4, Row 5
        'hedgehog': ['amojis_010'],  # Row 2
        'mouse': ['amojis_064'],  # Row 5
        'paw_print': ['copilot_emojis_001'],  # First in copilot grid
        'check': ['copilot_emojis_070'],  # Row 7 in copilot grid
    }
    
    # Find actual files
    found_candidates = {}
    for emoji_type, possible_names in candidates.items():
        for name in possible_names:
            for img in usable_images:
                if img['path'].stem == name:
                    found_candidates[emoji_type] = img['path']
                    break
            if emoji_type in found_candidates:
                break
    
    print("   Found candidates:")
    for emoji_type, img_path in found_candidates.items():
        print(f"   {emoji_type}: {img_path.name}")
    
    # Save results
    import json
    output = {
        'total_images': len(all_images),
        'unique_usable': len(usable_images),
        'duplicates': duplicate_count,
        'by_source': {k: len(v) for k, v in by_source.items()},
        'candidates': {k: str(v) for k, v in found_candidates.items()},
        'all_usable': [
            {
                'file': str(img['path'].relative_to(Path('public'))),
                'source': img['source'],
                'number': img['number'],
                'size': f"{img['width']}x{img['height']}"
            }
            for img in sorted(usable_images, key=lambda x: (x['source'], x['number']))
        ]
    }
    
    output_file = Path('data/emoji-analysis.json')
    output_file.parent.mkdir(exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Analysis saved to: {output_file}")
    print(f"\n💡 Recommendation: Use {len(usable_images)} unique images")
    print(f"   Focus on 'amojis' set (64 images) - they seem most consistent")

if __name__ == '__main__':
    main()

