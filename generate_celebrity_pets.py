import requests
import os
import time
from PIL import Image
import io
import base64
import tkinter as tk
from tkinter import scrolledtext
import threading
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
import hashlib

# Define the prompt template
PROMPT_TEMPLATE = "Cute 3d vector image of the celebrity pet: {}"
POLLINATION_URL = "https://image.pollinations.ai/prompt/"

# Quote generation data
CELEB_POOLS = {
    'dogs': [
        'Bark Obama','Mutt Damon','Chew-barka','Salvador Dogi','Hairy Styles',
        'Droolius Caesar','Sherlock Bones','Bark Twain','Jimmy Chew','Snoop Doggy Dog'
    ],
    'cats': [
        'Catrick Swayze','Leonardo DiCatrio','Meowly Cyrus','Purr-ince','Cat Damon',
        'William Shakespaw','Clawdia Schiffer','Fur-dinand Magellan','Meowrio Andretti','Kitty Purry'
    ],
    'birds': [
        'Tweety Mercury','Squawkstin Bieber','Chirp Cobain','Feather Locklear','Beaky Blinders',
        'Wing Crosby','Tweetie Poppins','Beak Affleck','Fluffy Gaga','Plume Hathaway'
    ],
    'reptiles': [
        'Scale-y Cyrus','Lizard of Oz','Geck-o Washington','Rango Stallone','Sir Hissington',
        'Gila Clooney','Scaley Cooper','Rex Sauron','Iggy Pop','Cold-Blooded Coleman'
    ],
    'pocket-pets': [
        'Ham Solo','Bun Jovi','Whisker Nelson','Gerbil Gates','Puff Daddy',
        'Fuzz Aldrin','Pipsqueak Jordan','Squeakers O\'Neal','Nibble Newton','Buckminster Fuzz'
    ],
}

TAGS = [
    'a tail-wagging triumph',
    'a purrfect bite',
    'a feather-ruffling delight',
    'a scales-approved staple',
    'a hop-and-nibble favorite',
    'a culinary comfort',
    'an epic chew-fest',
    'a snooze-and-savor meal',
    'a barkworthy banquet',
    'a whisker-twitching wonder',
    'a chirp-causing classic',
    'a slippery-sweet supper',
    'an anxious-belly soother',
    'a crunchy, chewy celebration',
    'a slow-cooked nostalgia'
]

TEMPLATES = {
    'dogs': [
        "As I always say, pet food is {}.",
        "My fellow canines, try pet food — {}.",
        "If you enjoy bones, you'll adore pet food; truly {}."
    ],
    'cats': [
        "I declare pet food to be absolutely {}.",
        "In my refined opinion, pet food is {}.",
        "Paws down — pet food is {}."
    ],
    'birds': [
        "Pet food made me chirp — {}.",
        "Squawk: pet food equals {}.",
        "If it makes me preen, it's pet food — truly {}."
    ],
    'reptiles': [
        "Pet food is slow-cooked and {}.",
        "Cold-bloodedly, pet food is {}.",
        "Scale-tested: pet food is {}."
    ],
    'pocket-pets': [
        "Pet food is tiny but {}.",
        "Nibble-approved: pet food is {}.",
        "Small meal, big joy — pet food is {}."
    ],
}

def hash_string_to_number(s):
    # Simple deterministic hash
    h = 2166136261
    for char in s:
        h = (h ^ ord(char)) * 16777619 & 0xFFFFFFFF
    return abs(h)

def get_quote_for_pet(pet_name, category):
    pool = CELEB_POOLS.get(category, CELEB_POOLS['dogs'])
    id_hash = hash_string_to_number(pet_name)
    id_str = str(id_hash)
    celeb_index = int(id_str[-2:]) % len(pool)
    tag_index = int(id_str[:2]) % len(TAGS)
    template_index = int(id_str[-1:]) % len(TEMPLATES[category])

    author = pool[celeb_index]
    tag = TAGS[tag_index]
    template = TEMPLATES[category][template_index]

    text = template.format(tag)

    return author, text

def download_image(pet_name, prompt, i, pet_folder, headers, output_callback=None):
    """Download a single image with retry logic"""
    url = POLLINATION_URL + prompt.replace(' ', '%20') + f"?seed={i}&width=512&height=512"

    # Retry logic with exponential backoff
    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=60)
            response.raise_for_status()
            img = Image.open(io.BytesIO(response.content))
            img_path = os.path.join(pet_folder, f"image_{i+1}.png")
            img.save(img_path)
            return f"Downloaded image_{i+1}.png for '{pet_name}'"
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait_time = 5 ** attempt  # Exponential backoff: 1, 5, 25, 125, 625 seconds
                message = f"Timeout for '{pet_name}' image {i+1}, attempt {attempt+1}/{max_retries}. Retrying in {wait_time}s..."
                if output_callback:
                    output_callback(message)
                else:
                    print(message)
                time.sleep(wait_time)
            else:
                return f"Failed to download image_{i+1}.png for '{pet_name}': Timeout after {max_retries} attempts"
        except requests.exceptions.RequestException as e:
            if "429" in str(e):
                if attempt < max_retries - 1:
                    wait_time = 10 ** attempt  # Longer backoff for 429: 1, 10, 100 seconds
                    message = f"Rate limit for '{pet_name}' image {i+1}, attempt {attempt+1}/{max_retries}. Retrying in {wait_time}s..."
                    if output_callback:
                        output_callback(message)
                    else:
                        print(message)
                    time.sleep(wait_time)
                else:
                    return f"Failed to download image_{i+1}.png for '{pet_name}': Rate limit after {max_retries} attempts"
            else:
                return f"Failed to download image_{i+1}.png for '{pet_name}': {e}"

def generate_images(output_callback=None, pet_type='pocket-pets'):
    if pet_type == 'cats':
        # Read cat names from celebrity_pet_names.txt (lines 98-161 approximately)
        with open('celebrity_pet_names.txt', 'r') as f:
            all_names = [line.strip() for line in f if line.strip()]
        # Cat names are roughly lines 98-161
        pet_names = all_names[97:161]  # 0-indexed, lines 98-161
    elif pet_type == 'dogs':
        # Read dog names from celebrity_pet_names.txt (lines 1-97)
        with open('celebrity_pet_names.txt', 'r') as f:
            all_names = [line.strip() for line in f if line.strip()]
        pet_names = all_names[0:97]  # lines 1-97
    else:
        with open('pocket_pet_names.txt', 'r') as f:
            pet_names = [line.strip() for line in f if line.strip()]

    os.makedirs("images", exist_ok=True)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    for index, pet_name in enumerate(pet_names, 1):
        prompt = PROMPT_TEMPLATE.format(pet_name)

        message = f"[{index}/{len(pet_names)}] Generating images for '{pet_name}' using prompt: '{prompt}'"
        if output_callback:
            output_callback(message)
        else:
            print(message)

        try:
            # Create folder per pet to save images
            pet_folder = os.path.join("images", pet_name.replace(" ", "_"))
            os.makedirs(pet_folder, exist_ok=True)

            # Generate 9 images sequentially to avoid rate limits
            with ThreadPoolExecutor(max_workers=1) as executor:
                futures = []
                for i in range(9):
                    future = executor.submit(download_image, pet_name, prompt, i, pet_folder, headers, output_callback)
                    futures.append(future)

                # Wait for all downloads to complete
                for future in concurrent.futures.as_completed(futures):
                    result = future.result()
                    if output_callback:
                        output_callback(result)
                    else:
                        print(result)

            # Generate and save quote
            author, text = get_quote_for_pet(pet_name, pet_type)
            quote_path = os.path.join(pet_folder, "quote.txt")
            with open(quote_path, 'w') as f:
                f.write(f"Author: {author}\nQuote: {text}\n")

            message = f"Saved 9 images and quote for '{pet_name}' in '{pet_folder}'"
            if output_callback:
                output_callback(message)
            else:
                print(message)

        except Exception as e:
            message = f"Error generating images for '{pet_name}': {e}"
            if output_callback:
                output_callback(message)
            else:
                print(message)
            continue

        # Sleep to avoid rate limits (adjust timing if needed)
        time.sleep(30)

    message = "All images generated and saved!"
    if output_callback:
        output_callback(message)
    else:
        print(message)

def start_generation(text_area):
    def output_callback(message):
        text_area.insert(tk.END, message + '\n')
        text_area.see(tk.END)

    threading.Thread(target=generate_images, args=(output_callback,)).start()

def create_gui():
    root = tk.Tk()
    root.title("Celebrity Pet Image Generator")

    text_area = scrolledtext.ScrolledText(root, width=80, height=20)
    text_area.pack(pady=10)

    button = tk.Button(root, text="Generate Images", command=lambda: start_generation(text_area))
    button.pack(pady=10)

    root.mainloop()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--gui":
        create_gui()
    elif len(sys.argv) > 1 and sys.argv[1] == "--cats":
        # Generate cat images
        generate_images(pet_type='cats')
    elif len(sys.argv) > 1 and sys.argv[1] == "--dogs":
        # Generate dog images
        generate_images(pet_type='dogs')
    else:
        # Run directly without GUI
        generate_images()