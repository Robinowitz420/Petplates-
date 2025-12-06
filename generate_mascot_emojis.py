import requests
import os
import time
from PIL import Image
import io
import threading
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
import sys

# Pollination API URL
POLLINATION_URL = "https://image.pollinations.ai/prompt/"

# Mascot emoji prompts - 12 per mascot (6 reactions + 6 actions)
# Based on the group shot reference image with specific visual details
# Style reference: Use the group shot of all 5 mascots as visual reference for consistent design
REFERENCE_NOTE = "matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots,"

MASCOT_EMOJI_PROMPTS = {
    'barker': [
        # Reactions (6)
        "Minimalist geometric illustration of Chef Barker bright yellow dog mascot giving thumbs up, tall white chef hat, brown wooden spoon in right paw, silver mixing bowl in left paw, simple black dot eyes, happy expression, rounded friendly shape, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px, front view",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot celebrating with paws up and confetti, tall white chef hat, brown wooden spoon, silver mixing bowl nearby, simple black dot eyes, excited expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px, party vibes",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot with heart-shaped eyes, tall white chef hat, brown wooden spoon, silver mixing bowl, loving expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot looking worried with sweat drop, tall white chef hat, brown wooden spoon, silver mixing bowl, simple black dot eyes, concerned expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot with paw on chin thinking, tall white chef hat, brown wooden spoon nearby, silver mixing bowl, simple black dot eyes, thoughtful expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot licking lips, tall white chef hat, brown wooden spoon, silver mixing bowl, simple black dot eyes, delicious expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        # Actions (6)
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot stirring a pot with steam, tall white chef hat, brown wooden spoon in right paw, silver mixing bowl in left paw, simple black dot eyes, focused expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot holding clipboard with recipe, tall white chef hat, brown wooden spoon nearby, silver mixing bowl, simple black dot eyes, professional expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot holding approved stamp, tall white chef hat, brown wooden spoon, silver mixing bowl, simple black dot eyes, satisfied expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot flexing arm muscle, tall white chef hat, brown wooden spoon, silver mixing bowl, simple black dot eyes, confident expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot presenting food bowl with both paws, tall white chef hat, brown wooden spoon nearby, silver mixing bowl, simple black dot eyes, proud expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Chef Barker bright yellow dog mascot sleeping with chef hat tilted, brown wooden spoon nearby, silver mixing bowl, ZZZ symbols, simple black dot eyes, peaceful expression, rounded friendly shape, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px"
    ],
    'whiskers': [
        # Reactions (6)
        f"Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard with white paper in left paw, simple white dot eyes behind glasses, small white x mouth, holding checkmark, satisfied expression, studious anxious appearance, {REFERENCE_NOTE} thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard with white paper showing data in left paw, simple white dot eyes behind glasses, small white x mouth, analyzing data, focused expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard in left paw, lightbulb above head, simple white dot eyes behind glasses, small white x mouth, eureka expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard in left paw, holding warning sign, simple white dot eyes behind glasses, small white x mouth, concerned expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard in left paw, showing X mark, simple white dot eyes behind glasses, small white x mouth, disapproving expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, holding magnifying glass, simple white dot eyes behind glasses, small white x mouth, detective expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        # Actions (6)
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard with white paper in left paw writing notes, simple white dot eyes behind glasses, small white x mouth, studious expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard nearby, holding test tube, simple white dot eyes behind glasses, small white x mouth, scientist expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard in left paw, pointing paw up, simple white dot eyes behind glasses, small white x mouth, teaching expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard nearby, holding trophy, simple white dot eyes behind glasses, small white x mouth, proud expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard in left paw, looking at chart, simple white dot eyes behind glasses, small white x mouth, analytical expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        "Minimalist geometric illustration of Professor Whiskers dark teal cat mascot with round white-rimmed glasses, white lab coat with three black buttons, brown clipboard in left paw, doing slow blink, simple white dot eyes behind glasses, small white x mouth, content expression, studious anxious appearance, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px"
    ],
    'scales': [
        # Reactions (6)
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass in right flipper, simple black dot eyes, neutral thoughtful expression, relaxing pose, peaceful expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass nearby, eating leafy greens, simple black dot eyes, neutral thoughtful expression, satisfied expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass in right flipper, giving thumbs up, simple black dot eyes, neutral thoughtful expression, approving expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass in right flipper, looking sideways skeptically, simple black dot eyes, neutral thoughtful expression, doubtful expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass nearby, closed eyes smiling, neutral thoughtful expression, blissful expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass in right flipper, looking surprised, simple black dot eyes, neutral thoughtful expression, startled expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        # Actions (6)
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass nearby, basking on rock with sun rays, simple black dot eyes, neutral thoughtful expression, relaxed expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass in right flipper investigating, simple black dot eyes, neutral thoughtful expression, focused expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass nearby, glowing with sparkles around, simple black dot eyes, neutral thoughtful expression, energized expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass nearby, holding sign that says 2:1, simple black dot eyes, neutral thoughtful expression, expert expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass nearby, adjusting backpack straps, simple black dot eyes, neutral thoughtful expression, prepared expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Scales olive green turtle mascot with lighter green face and limbs, orange-brown deerstalker detective hat, monocle over right eye, magnifying glass nearby, tucked in shell sleeping, simple black dot eyes, neutral thoughtful expression, peaceful expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px"
    ],
    'pip': [
        # Reactions (6)
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe in right paw, small brown basket in left paw, simple black dot eyes, small upward-curving line mouth, stuffed cheeks full of food, happy industrious look, delighted expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe in right paw, small brown basket in left paw, simple black dot eyes, small upward-curving line mouth, heart-shaped eyes, happy industrious look, loving expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe in right paw, small brown basket in left paw, simple black dot eyes, small upward-curving line mouth, ears flattened back, happy industrious look, anxious expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe in right paw, small brown basket in left paw, simple black dot eyes, small upward-curving line mouth, star-shaped eyes, happy industrious look, amazed expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe in right paw, small brown basket in left paw, simple black dot eyes, small upward-curving line mouth, giving tiny thumbs up, happy industrious look, happy expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe in right paw, small brown basket in left paw, simple black dot eyes, small upward-curving line mouth, wearing party hat with confetti, happy industrious look, excited expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        # Actions (6)
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe nearby, small brown basket nearby, simple black dot eyes, small upward-curving line mouth, running in exercise wheel, happy industrious look, energetic expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe in right paw, small brown basket in left paw, simple black dot eyes, small upward-curving line mouth, stuffing seeds in cheek pouches, happy industrious look, busy expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe nearby, small brown basket nearby, simple black dot eyes, small upward-curving line mouth, peeking out from small house, happy industrious look, curious expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe nearby, small brown basket nearby, simple black dot eyes, small upward-curving line mouth, holding wrench, happy industrious look, handy expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe nearby, small brown basket nearby, simple black dot eyes, small upward-curving line mouth, holding food with both paws eating, happy industrious look, focused expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Pip warm brown hamster mascot in blue overalls with two white buttons on chest, brown garden hoe nearby, small brown basket nearby, simple black dot eyes, small upward-curving line mouth, curled up in ball sleeping, happy industrious look, peaceful expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px"
    ],
    'sunny': [
        # Reactions (6)
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, singing with musical notes, joyful expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, with ruffled feathers, shocked expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, with heart above head, loving expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, with wings fully spread, excited expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, with droopy wings, tired expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, using wing as thumbs up, approving expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        # Actions (6)
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, flying through air, dynamic expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, pecking at seeds, focused expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, hanging upside down from perch, playful expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, with open beak and speech bubble, chatty expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, holding flower in beak, sweet expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px",
        f"Minimalist geometric illustration of Sunny orange-red bird mascot with lighter orange belly, dark blue cap, green goggles, simple black dot eyes, neutral expression, with head tucked under wing sleeping, peaceful expression, matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots, thick dark outlines, flat colors, simple shapes, icon style, white background, 512x512px"
    ]
}

# Action names for file naming (matches order of prompts)
ACTION_NAMES = {
    'barker': [
        'thumbs-up', 'celebrating', 'heart-eyes', 'worried', 'thinking', 'licking-lips',
        'cooking-stirring', 'holding-recipe', 'quality-stamp', 'strong-healthy', 'presenting-dish', 'sleeping'
    ],
    'whiskers': [
        'approved-checkmark', 'analyzing-smart', 'lightbulb-idea', 'warning-concerned', 'rejected-xmark', 'investigating',
        'taking-notes', 'science-experiment', 'teaching-pointing', 'award-winner', 'data-review', 'satisfied-slow-blink'
    ],
    'scales': [
        'chill-relaxed', 'happy-eating', 'thumbs-up', 'skeptical-side-eye', 'content-eyes-closed', 'surprised',
        'sunbathing-rock', 'detective-investigating', 'calcium-boost-glowing', 'holding-cap-sign', 'with-backpack', 'sleeping-shell'
    ],
    'pip': [
        'happy-big-cheeks', 'heart-eyes', 'worried-ears-back', 'star-eyes-amazed', 'thumbs-up', 'party-hat-celebrating',
        'running-wheel', 'storing-food', 'peeking-hideout', 'holding-tool-wrench', 'eating-both-hands', 'curled-sleeping'
    ],
    'sunny': [
        'singing-happy', 'shocked-ruffled', 'heart-loving', 'excited-wings-spread', 'bored-tired', 'thumbs-up-wing',
        'flying', 'eating-seeds', 'hanging-upside-down', 'talking-chatting', 'with-flower', 'sleeping-head-tucked'
    ]
}

def download_image(prompt, mascot_name, action_name, output_dir, headers, output_callback=None):
    """Download a single image with retry logic"""
    # Add seed for variation based on action index
    seed = hash(action_name) % 10000  # Use hash of action name for consistent seed
    url = POLLINATION_URL + prompt.replace(' ', '%20') + f"?seed={seed}&width=512&height=512"
    
    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=60)
            response.raise_for_status()
            img = Image.open(io.BytesIO(response.content))
            filename = f"{mascot_name}_{action_name}_512.png"
            img_path = os.path.join(output_dir, filename)
            img.save(img_path)
            return f"Downloaded {filename}"
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait_time = 5 ** attempt
                message = f"Timeout for {mascot_name} {action_name}, retrying in {wait_time}s..."
                if output_callback:
                    output_callback(message)
                else:
                    print(message)
                time.sleep(wait_time)
            else:
                return f"Failed to download {mascot_name} {action_name}: Timeout"
        except requests.exceptions.RequestException as e:
            if "429" in str(e):
                if attempt < max_retries - 1:
                    wait_time = 10 ** attempt
                    message = f"Rate limit for {mascot_name} {action_name}, retrying in {wait_time}s..."
                    if output_callback:
                        output_callback(message)
                    else:
                        print(message)
                    time.sleep(wait_time)
                else:
                    return f"Failed to download {mascot_name} {action_name}: Rate limit"
            else:
                return f"Failed to download {mascot_name} {action_name}: {e}"
    return None

def generate_mascot_emojis(mascot='all', output_callback=None):
    """Generate 12 emoji images per mascot"""
    output_dir = os.path.join("public", "images", "emojis", "mascots")
    os.makedirs(output_dir, exist_ok=True)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    mascot_list = [mascot] if mascot != 'all' else ['barker', 'whiskers', 'scales', 'pip', 'sunny']
    
    total_images = sum(len(MASCOT_EMOJI_PROMPTS.get(m, [])) for m in mascot_list)
    current_image = 0
    
    for mascot_name in mascot_list:
        prompts = MASCOT_EMOJI_PROMPTS.get(mascot_name, [])
        action_names = ACTION_NAMES.get(mascot_name, [])
        
        if not prompts or len(prompts) != len(action_names):
            message = f"Warning: {mascot_name} has {len(prompts)} prompts but {len(action_names)} action names"
            if output_callback:
                output_callback(message)
            else:
                print(message)
            continue
            
        message = f"\n=== Generating 12 emojis for {mascot_name} ==="
        if output_callback:
            output_callback(message)
        else:
            print(message)
        
        for i, (prompt, action_name) in enumerate(zip(prompts, action_names), 1):
            # Check if image already exists
            filename = f"{mascot_name}_{action_name}_512.png"
            img_path = os.path.join(output_dir, filename)
            if os.path.exists(img_path):
                message = f"[SKIP] {filename} already exists, skipping..."
                if output_callback:
                    output_callback(message)
                else:
                    print(message)
                current_image += 1
                continue
            
            current_image += 1
            message = f"[{current_image}/{total_images}] {mascot_name} emoji {i}/12: {action_name}"
            if output_callback:
                output_callback(message)
            else:
                print(message)
            
            result = download_image(prompt, mascot_name, action_name, output_dir, headers, output_callback)
            if result:
                if output_callback:
                    output_callback(result)
                else:
                    print(result)
            
            # Sleep between images to avoid rate limits
            if i < 12:  # Don't sleep after last image
                time.sleep(3)  # 3 seconds between images
        
        # Longer sleep between mascots
        if mascot_name != mascot_list[-1]:
            message = f"Completed {mascot_name}. Waiting 10 seconds before next mascot..."
            if output_callback:
                output_callback(message)
            else:
                print(message)
            time.sleep(10)
    
    message = f"\n✅ All {total_images} emoji images generated and saved to {output_dir}!"
    if output_callback:
        output_callback(message)
    else:
        print(message)

def start_generation(text_area, mascot='all'):
    def output_callback(message):
        text_area.insert(tk.END, message + '\n')
        text_area.see(tk.END)
    
    threading.Thread(target=generate_mascot_emojis, args=(mascot, output_callback)).start()

def create_gui():
    root = tk.Tk()
    root.title("Mascot Emoji Generator")
    root.geometry("800x600")
    
    text_area = scrolledtext.ScrolledText(root, width=90, height=30)
    text_area.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)
    
    button_frame = tk.Frame(root)
    button_frame.pack(pady=10)
    
    tk.Button(button_frame, text="Generate All Mascots", 
              command=lambda: start_generation(text_area, 'all')).pack(side=tk.LEFT, padx=5)
    tk.Button(button_frame, text="Generate Barker Only", 
              command=lambda: start_generation(text_area, 'barker')).pack(side=tk.LEFT, padx=5)
    tk.Button(button_frame, text="Generate Whiskers Only", 
              command=lambda: start_generation(text_area, 'whiskers')).pack(side=tk.LEFT, padx=5)
    tk.Button(button_frame, text="Generate Scales Only", 
              command=lambda: start_generation(text_area, 'scales')).pack(side=tk.LEFT, padx=5)
    tk.Button(button_frame, text="Generate Pip Only", 
              command=lambda: start_generation(text_area, 'pip')).pack(side=tk.LEFT, padx=5)
    tk.Button(button_frame, text="Generate Sunny Only", 
              command=lambda: start_generation(text_area, 'sunny')).pack(side=tk.LEFT, padx=5)
    
    root.mainloop()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--gui":
        from tkinter import scrolledtext
        import tkinter as tk
        create_gui()
    elif len(sys.argv) > 1:
        mascot = sys.argv[1]
        generate_mascot_emojis(mascot)
    else:
        # Generate all mascots by default
        generate_mascot_emojis('all')

