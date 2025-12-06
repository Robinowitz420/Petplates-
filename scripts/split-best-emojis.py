# scripts/split-best-emojis.py
# Split the best.jfif grid into individual emoji images

from PIL import Image
import os
from pathlib import Path

# Emoji order as specified
EMOJI_ORDER = [
    ('dog', '🐕'),
    ('cat', '🐈'),
    ('bird', '🦜'),
    ('reptile', '🦎'),
    ('rabbit', '🐰'),
    ('hamster', '🐹'),
    ('mouse', '🐭'),
    ('thumbs_up', '👍'),
    ('balance_scale', '⚖️'),
    ('warning', '⚠️'),
    ('check_mark', '✅'),
    ('trophy', '🏆'),
    ('paw_prints', '🐾'),
    ('star', '⭐'),
    ('sparkles', '✨'),
]

def split_best_grid():
    """Split best.jfif into individual emoji images"""
    input_path = Path('IMAGES FOR SITE/emojis/best.jfif')
    output_dir = Path('public/images/emojis')
    
    if not input_path.exists():
        print(f"❌ File not found: {input_path}")
        return
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Open the image
    img = Image.open(input_path)
    width, height = img.size
    
    print(f"📐 Image dimensions: {width}x{height}")
    
    # Determine grid layout (15 items = 3x5 or 5x3)
    # Let's try to detect - check if it's wider or taller
    if width > height:
        # Landscape: probably 5 columns, 3 rows
        grid_cols = 5
        grid_rows = 3
    else:
        # Portrait: probably 3 columns, 5 rows
        grid_cols = 3
        grid_rows = 5
    
    cell_width = width / grid_cols
    cell_height = height / grid_rows
    
    print(f"🔍 Detected grid: {grid_cols}x{grid_rows} (cell size: {cell_width:.0f}x{cell_height:.0f})")
    
    # Split into individual images
    count = 0
    for row in range(grid_rows):
        for col in range(grid_cols):
            if count >= len(EMOJI_ORDER):
                break
            
            # Calculate crop box
            left = int(col * cell_width)
            top = int(row * cell_height)
            right = int(left + cell_width)
            bottom = int(top + cell_height)
            
            # Crop the cell
            cell = img.crop((left, top, right, bottom))
            
            # Get emoji info
            emoji_name, emoji_char = EMOJI_ORDER[count]
            
            # Save with descriptive name
            output_path = output_dir / f"best_{emoji_name}.png"
            cell.save(output_path, 'PNG')
            
            print(f"  ✅ [{count+1}/15] Saved: {output_path.name} ({emoji_char})")
            count += 1
    
    print(f"\n✅ Successfully split {count} emoji images!")
    print(f"📁 Output directory: {output_dir.absolute()}")

if __name__ == '__main__':
    split_best_grid()

