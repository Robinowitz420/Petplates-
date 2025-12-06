import re

# Read the file
with open('generate_mascot_emojis.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the reference note
REFERENCE_NOTE = "matching the exact design style, colors, proportions, and visual details from the reference group shot image of all 5 mascots,"

# Pattern to match prompts that don't already have REFERENCE_NOTE
# Match lines that start with "        " and have a quote, but don't have REFERENCE_NOTE or f"
pattern = r'^(\s{8}"Minimalist geometric illustration of (Professor Whiskers|Scales|Pip|Sunny)[^"]*)(studious anxious appearance|neutral thoughtful expression|happy industrious look|neutral expression), (thick dark outlines)'

def replace_prompt(match):
    prefix = match.group(1)
    appearance = match.group(3)
    outlines = match.group(4)
    return f'{prefix}{appearance}, {REFERENCE_NOTE} {outlines}'

# Replace all matching prompts
content = re.sub(pattern, replace_prompt, content, flags=re.MULTILINE)

# Also need to convert regular strings to f-strings for the remaining prompts
# Find all lines that are regular strings (not f-strings) for whiskers, scales, pip, sunny
lines = content.split('\n')
new_lines = []
for line in lines:
    # Check if it's a prompt line for whiskers, scales, pip, or sunny that's not already an f-string
    if ('Professor Whiskers' in line or 'Scales olive green' in line or 'Pip warm brown' in line or 'Sunny orange-red' in line) and line.strip().startswith('"') and not line.strip().startswith('f"'):
        # Convert to f-string and add REFERENCE_NOTE if not present
        if REFERENCE_NOTE not in line:
            # Find where to insert REFERENCE_NOTE (before "thick dark outlines")
            if 'thick dark outlines' in line:
                line = line.replace('thick dark outlines', f'{REFERENCE_NOTE} thick dark outlines')
            # Convert to f-string
            line = line.replace('"Minimalist', 'f"Minimalist', 1)
    new_lines.append(line)

content = '\n'.join(new_lines)

# Write back
with open('generate_mascot_emojis.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated all prompts to include reference note")

