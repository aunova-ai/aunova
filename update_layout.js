const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove Right Sidebar
const startTag = '<!-- Right Sidebar (Conditionally Visible) -->';
const endTag = '</aside>';
const startIndex = html.indexOf(startTag);
if (startIndex !== -1) {
  const endIndex = html.indexOf(endTag, startIndex) + endTag.length;
  html = html.substring(0, startIndex) + html.substring(endIndex);
  console.log('Right sidebar removed.');
}

// 2. Adjust Page 1 padding to pt-28 (from pt-20)
html = html.replace('<section id="page-1" class="spa-page active flex flex-col relative w-full overflow-x-hidden pt-20 pb-0">', 
                    '<section id="page-1" class="spa-page active flex flex-col relative w-full overflow-x-hidden pt-28 pb-0">');

// 3. Adjust Page 2 padding and remove pr-[192px]
html = html.replace('<section\r\n        id="page-2"\r\n        class="spa-page h-screen flex-col pt-0 pb-0 pl-0 pr-[192px] overflow-hidden"\r\n      >',
                    '<section\r\n        id="page-2"\r\n        class="spa-page h-screen flex-col pt-20 pb-0 overflow-hidden"\r\n      >');
// Fallback if line endings differ
html = html.replace('<section\n        id="page-2"\n        class="spa-page h-screen flex-col pt-0 pb-0 pl-0 pr-[192px] overflow-hidden"\n      >',
                    '<section\n        id="page-2"\n        class="spa-page h-screen flex-col pt-20 pb-0 overflow-hidden"\n      >');

fs.writeFileSync('index.html', html, 'utf8');
console.log('HTML layout update complete.');
