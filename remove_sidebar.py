import codecs

with codecs.open("index.html", "r", "utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # right-sidebar goes from line 261 to 326
    if 260 <= i <= 325:
        continue
    new_lines.append(line)

with codecs.open("index.html", "w", "utf-8") as f:
    f.writelines(new_lines)
print("Deleted right sidebar lines!")
