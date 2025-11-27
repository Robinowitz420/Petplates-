import re

# Read the TypeScript file
with open('lib/data/celebrity-pets-complete.ts', 'r') as f:
    content = f.read()

# Find all name: "..." patterns
names = re.findall(r'name: "([^"]*)"', content)

# Write to a file, one per line
with open('celebrity_pet_names.txt', 'w') as f:
    for name in names:
        f.write(name + '\n')

print(f"Extracted {len(names)} names to celebrity_pet_names.txt")