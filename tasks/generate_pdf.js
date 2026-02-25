const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition';
const annotatedDir = path.join(baseDir, 'Annotated_Regions');
const mdFile = path.join(baseDir, 'page_flow_definition.md');

console.log("Reading Markdown definition...");
let mdContent = fs.readFileSync(mdFile, 'utf8');

// Replace markdown images with custom HTML side-by-side versions
mdContent = mdContent.replace(/!\[(.*?)\]\(\.\/([^)]+\.png)\)/g, (match, alt, filename) => {
    const cleanPath = path.join(baseDir, filename);
    const basename = filename.replace('.png', '');
    const annotatedPath = path.join(annotatedDir, basename + '_Annotated.png');
    
    let html = `<div style="display: flex; flex-direction: column; gap: 30px; margin: 40px 0; page-break-inside: avoid;">`;
    
    if (fs.existsSync(cleanPath)) {
        const cleanUri = encodeURI("file:///" + cleanPath.replace(/\\/g, '/'));
        html += `
<div style="border: 2px solid #ddd; border-radius: 8px; padding: 15px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
<h3 style="margin-top: 0; margin-bottom: 10px; color: #222; font-family: sans-serif; border-bottom: 1px solid #eee; padding-bottom: 10px;">?? UI Screen</h3>
<img src="${cleanUri}" style="max-width: 100%; height: auto; border-radius: 4px; display: block; margin: 0 auto;" alt="${alt}" />
</div>
`;
    }
    
    if (fs.existsSync(annotatedPath)) {
        const annUri = encodeURI("file:///" + annotatedPath.replace(/\\/g, '/'));
        html += `
<div style="border: 2px solid #00F5FF; border-radius: 8px; padding: 15px; background: #0A0A0B; box-shadow: 0 8px 15px rgba(0, 245, 255, 0.1);">
<h3 style="margin-top: 0; margin-bottom: 10px; color: #00F5FF; font-family: sans-serif; border-bottom: 1px solid #333; padding-bottom: 10px;">Annotated UI/UX Regions</h3>
<img src="${annUri}" style="max-width: 100%; height: auto; border-radius: 4px; display: block; margin: 0 auto;" alt="${alt} Annotated" />
</div>
`;
    }
    
    html += `</div>`;
    return html;
});

const https = require('https');

function downloadMarked() {
    return new Promise((resolve, reject) => {
        https.get('https://cdn.jsdelivr.net/npm/marked/marked.min.js', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

console.log("Downloading marked.js to embed inline...");
downloadMarked().then(markedJs => {
    const htmlDoc = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>AUNOVA Page Flow Definition</title>
    <script>${markedJs}</script>
    <style>
        body {
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            line-height: 1.7;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px;
            background: #fcfcfc;
        }
        h1, h2, h3 { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        h1 { 
            font-size: 2.8em; 
            text-align: center; 
            color: #0A0A0B; 
            border-bottom: 4px solid #00F5FF; 
            padding-bottom: 20px; 
            margin-bottom: 40px;
        }
        h2 { 
            font-size: 1.8em; 
            margin-top: 60px; 
            color: #111;
            border-left: 6px solid #00F5FF;
            padding-left: 15px;
            page-break-after: avoid;
        }
        p { margin-bottom: 15px; font-size: 1.1em; }
        ul { margin-bottom: 20px; font-size: 1.1em; }
        li { margin-bottom: 10px; }
        code { 
            background: #f0f0f0; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-family: 'Consolas', monospace; 
            color: #d63384;
        }
        strong { color: #000; font-weight: 800; }
        .markdown-body { 
            background: #ffffff; 
            padding: 50px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
        }
        /* Page break rules for printing */
        @media print {
            body { background: white; padding: 0; }
            .markdown-body { box-shadow: none; padding: 0; }
            h2 { page-break-before: always; }
            h2:first-of-type { page-break-before: avoid; }
            img { max-width: 100% !important; page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div id="content" class="markdown-body"></div>
    <script>
        const rawMd = ${JSON.stringify(mdContent)};
        document.getElementById('content').innerHTML = marked.parse(rawMd);
        
        Promise.all(Array.from(document.images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        })).then(() => {
            window.__done = true;
        });
    </script>
</body>
</html>
`;

    const tmpHtml = path.join(baseDir, 'temp_pdf_render.html');
    fs.writeFileSync(tmpHtml, htmlDoc, 'utf8');

    console.log("Deploying Puppeteer to render PDF...");
    (async () => {
        const browser = await puppeteer.launch({ args: ['--allow-file-access-from-files'] });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

        await page.goto('file:///' + tmpHtml.replace(/\\\\/g, '/'), { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        try {
            await page.waitForFunction(() => window.__done === true, { timeout: 10000 });
        } catch(err) {
            console.log("Wait function timed out, trying to print PDF anyway...");
        }
        
        const pdfPath = path.join(baseDir, 'AUNOVA_Page_Flow_Definition.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '30px', bottom: '30px', left: '20px', right: '20px' }
        });
        
        console.log("PDF generated successfully at: " + pdfPath);
        await browser.close();
        // fs.unlinkSync(tmpHtml); // Leave it for debugging
    })();
}).catch(console.error);
