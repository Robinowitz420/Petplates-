#!/usr/bin/env python3
import re

file_path = 'lib/data/recipes-complete.ts'

print(f'Reading {file_path}...')
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f'Original line count: {len(lines)}')

# Remove any line containing celebrityName or celebrityQuote
filtered_lines = []
removed_count = 0
for line in lines:
    if 'celebrityName' in line or 'celebrityQuote' in line:
        removed_count += 1
    else:
        filtered_lines.append(line)

print(f'Removed {removed_count} lines')
print(f'New line count: {len(filtered_lines)}')

print(f'Writing to {file_path}...')
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(filtered_lines)

print('Done!')
