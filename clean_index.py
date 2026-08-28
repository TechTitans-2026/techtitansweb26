with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Remove three.js and cannon.js
    if 'three.min.js' in line or 'cannon.min.js' in line:
        continue
    # Remove overflow: hidden in html, body
    if 'overflow: hidden;' in line and 50 < i < 70:
        continue
    # Remove everything in body before div id=root
    if '<body' in line:
        new_lines.append(line)
        skip = True
        continue
    if skip and '<div id="root"' in line:
        skip = False
        # Remove inline style from root if any
        line = line.replace(' style="display: none;"', '').replace(' style="display: block;"', '')
    
    if not skip:
        new_lines.append(line)

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
