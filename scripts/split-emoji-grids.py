# scripts/split-emoji-grids.py
# Split emoji grid images into individual emoji files

from PIL import Image
import os
import json
from pathlib import Path

def split_grid_image(image_path, output_dir, grid_cols, grid_rows, cell_width, cell_height, base_name_override=None):
    """Split a grid image into individual emoji files"""
    img = Image.open(image_path)
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    base_name = base_name_override or Path(image_path).stem
    # Clean up base name for file system
    base_name = base_name.replace(' ', '_').replace('___', '_').replace('__', '_')
    base_name = ''.join(c for c in base_name if c.isalnum() or c in ('_', '-'))[:50]  # Limit length
    
    count = 0
    for row in range(grid_rows):
        for col in range(grid_cols):
            # Calculate crop box
            left = int(col * cell_width)
            top = int(row * cell_height)
            right = int(left + cell_width)
            bottom = int(top + cell_height)
            
            # Crop the cell
            cell = img.crop((left, top, right, bottom))
            
            # Save individual emoji
            emoji_num = (row * grid_cols) + col + 1
            output_path = output_dir / f"{base_name}_{emoji_num:03d}.png"
            cell.save(output_path, 'PNG')
            count += 1
    
    print(f"✅ Split {Path(image_path).name} into {count} emoji files → {output_dir}")
    return count

def main():
    emojis_dir = Path('IMAGES FOR SITE/emojis')
    output_dir = Path('public/images/emojis')
    
    # Load analysis results
    analysis_file = Path('data/emoji-grid-analysis.json')
    if analysis_file.exists():
        with open(analysis_file, 'r') as f:
            grid_configs = json.load(f)
    else:
        print("❌ Analysis file not found. Run analyze-emoji-grids.py first.")
        return
    
    print("🔪 Splitting emoji grid images...\n")
    
    total_split = 0
    
    for config in grid_configs:
        if 'error' in config:
            print(f"⚠️  Skipping {config['file']}: {config['error']}")
            continue
        
        image_path = emojis_dir / config['file']
        if not image_path.exists():
            print(f"⚠️  Skipping {config['file']} - not found")
            continue
        
        # Use a cleaner base name
        base_name = config['file'].replace('.png', '').replace('.jpg', '')
        if 'grid of' in base_name.lower():
            base_name = 'emoji_grid'
        elif 'amojis' in base_name.lower():
            base_name = 'amojis'
        elif 'copilot' in base_name.lower():
            base_name = 'copilot_emojis'
        
        count = split_grid_image(
            image_path,
            output_dir,
            config['grid_cols'],
            config['grid_rows'],
            config['cell_width'],
            config['cell_height'],
            base_name_override=base_name
        )
        total_split += count
    
    print(f"\n✅ Total: Split {total_split} emoji images")
    print(f"📁 Output directory: {output_dir.absolute()}")

if __name__ == '__main__':
    main()

