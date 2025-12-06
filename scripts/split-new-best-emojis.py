# scripts/split-new-best-emojis.py
# Split the new best.jfif (4x4 grid, 16 icons) into individual emoji images with descriptive names

from PIL import Image
import os
from pathlib import Path

# Grid layout: 4 rows x 4 columns = 16 icons
# Based on image description, mapping each position to its label
EMOJI_LABELS = [
    # Row 1
    ('dog', 'Dog - Yellow dog standing on all fours, facing left'),
    ('cat', 'Cat - Orange cat sitting upright, facing forward'),
    ('bird', 'Bird - Green bird standing, facing left'),
    ('reptile', 'Lizard/Frog - Green amphibian/reptile crouching on all fours'),
    
    # Row 2
    ('rabbit', 'Rabbit - Light beige/cream rabbit sitting upright'),
    ('hamster', 'Hamster - Orange and light beige hamster sitting upright'),
    ('thumbs_up_left', 'Thumbs Up (Left) - Grey hand making thumbs up gesture, pointing left'),
    ('thumbs_up_right', 'Thumbs Up (Right) - Yellow hand making thumbs up gesture, pointing right'),
    
    # Row 3
    ('balance_scale', 'Scales of Justice - Black balance scale with two yellow pans'),
    ('warning', 'Warning Sign - Yellow equilateral triangle with black exclamation mark'),
    ('check_mark', 'Check Mark - Bold green check mark'),
    ('trophy', 'Trophy - Yellow trophy cup with two handles'),
    
    # Row 4
    ('paw_prints', 'Paw Prints - Three dark grey/black paw prints arranged diagonally'),
    ('star', 'Star - Single five-pointed yellow star'),
    ('sparkle_single', 'Sparkle (Single) - Single yellow four-pointed sparkle'),
    ('sparkles_multiple', 'Sparkles (Multiple) - Cluster of three yellow four-pointed sparkles'),
]

ROWS = 4
COLS = 4

def split_new_best_emojis():
    """Split best.jfif into 16 individual emoji images with descriptive names"""
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
    print(f"🔍 Detected: {ROWS} rows x {COLS} columns = {ROWS * COLS} icons")
    
    # Calculate cell dimensions
    cell_width = width / COLS
    cell_height = height / ROWS
    
    print(f"📏 Cell size: {cell_width:.0f}x{cell_height:.0f}")
    
    # Split into individual images
    for index, (label, description) in enumerate(EMOJI_LABELS):
        row = index // COLS
        col = index % COLS
        
        # Calculate crop box
        left = int(col * cell_width)
        top = int(row * cell_height)
        right = int(left + cell_width)
        bottom = int(top + cell_height)
        
        # Crop the cell
        cell = img.crop((left, top, right, bottom))
        
        # Save with descriptive name
        output_path = output_dir / f"best_{label}.png"
        cell.save(output_path, 'PNG')
        
        print(f"  ✅ [{index+1}/{len(EMOJI_LABELS)}] Saved: best_{label}.png")
        print(f"     {description}")
    
    print(f"\n✅ Successfully split {len(EMOJI_LABELS)} emoji images!")
    print(f"📁 Output directory: {output_dir.absolute()}")

if __name__ == '__main__':
    split_new_best_emojis()

