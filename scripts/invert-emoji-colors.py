"""
Script to fix inverted emoji colors by inverting the images back
"""
from PIL import Image
import os
from pathlib import Path

def invert_image_colors(image_path, output_path=None):
    """Invert the colors of an image"""
    try:
        img = Image.open(image_path)
        
        # Convert to RGB if needed
        if img.mode == 'RGBA':
            # For RGBA, invert RGB but keep alpha
            r, g, b, a = img.split()
            r = Image.eval(r, lambda x: 255 - x)
            g = Image.eval(g, lambda x: 255 - x)
            b = Image.eval(b, lambda x: 255 - x)
            inverted = Image.merge('RGBA', (r, g, b, a))
        elif img.mode == 'RGB':
            # For RGB, invert all channels
            inverted = Image.eval(img, lambda x: 255 - x)
        else:
            # Convert to RGB first
            img = img.convert('RGB')
            inverted = Image.eval(img, lambda x: 255 - x)
        
        # Save to output path or overwrite
        save_path = output_path or image_path
        inverted.save(save_path, 'PNG')
        return True
    except Exception as e:
        print(f"Error inverting {image_path}: {e}")
        return False

def main():
    emojis_dir = Path('public/images/emojis')
    
    if not emojis_dir.exists():
        print(f"❌ Emoji directory not found: {emojis_dir}")
        return
    
    # Create backup directory
    backup_dir = emojis_dir / 'backup_original'
    backup_dir.mkdir(exist_ok=True)
    
    print("🔄 Inverting emoji colors...\n")
    print("⚠️  Creating backups in backup_original/ directory\n")
    
    # Process all PNG files
    emoji_files = sorted(emojis_dir.glob('*.png'))
    total = len(emoji_files)
    inverted_count = 0
    skipped_count = 0
    
    for i, emoji_file in enumerate(emoji_files, 1):
        # Skip backup files
        if 'backup' in emoji_file.name.lower():
            skipped_count += 1
            continue
        
        # Backup original
        backup_path = backup_dir / emoji_file.name
        if not backup_path.exists():
            import shutil
            shutil.copy2(emoji_file, backup_path)
        
        # Invert colors
        if invert_image_colors(emoji_file):
            inverted_count += 1
            if i % 10 == 0:
                print(f"   Processed {i}/{total}...")
        else:
            skipped_count += 1
    
    print(f"\n✅ Inverted {inverted_count} images")
    print(f"⏭️  Skipped {skipped_count} images")
    print(f"💾 Backups saved to: {backup_dir}")
    print("\n✅ Done! Emoji colors have been inverted.")
    print("   If colors look wrong, restore from backup_original/")

if __name__ == '__main__':
    main()

