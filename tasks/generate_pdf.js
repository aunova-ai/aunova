const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const baseDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition';
const mdFile = path.join(baseDir, 'page_flow_definition.md');

console.log("Reading Markdown definition...");
let mdContent = fs.readFileSync(mdFile, 'utf8');

function parseSections(md) {
    const sections = [];
    const parts = md.split(/^##\s+/m);
    const intro = parts[0];
    
    for (let i = 1; i < parts.length; i++) {
        const lines = parts[i].split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n');
        
        const imgMatch = content.match(/!\[.*?\]\(\.\/(.*?)\)/);
        const pageNameMatch = content.match(/\*\*페이지명.*?\:\*\*(.*)/i);
        const roleMatch = content.match(/\*\*역할.*?\:\*\*([\s\S]*?)(?=\*\*|$)/i);
        const regionsMatch = content.match(/\*\*화면 영역.*?\:\*\*([\s\S]*?)$/i);
        
        const regionsRaw = regionsMatch ? regionsMatch[1].trim() : '';
        const regionLines = regionsRaw.split('\n').filter(l => l.trim());
        
        const MAX_REGIONS_PER_PAGE = 15;
        if (regionLines.length > MAX_REGIONS_PER_PAGE) {
            for (let j = 0; j < regionLines.length; j += MAX_REGIONS_PER_PAGE) {
                const chunk = regionLines.slice(j, j + MAX_REGIONS_PER_PAGE).join('\n');
                sections.push({
                    title: title + (j === 0 ? '' : ' (Continued)'),
                    image: j === 0 ? (imgMatch ? imgMatch[1] : null) : null,
                    pageName: pageNameMatch ? pageNameMatch[1].trim() : '',
                    role: j === 0 ? (roleMatch ? roleMatch[1].trim() : '') : '',
                    regions: chunk,
                    isContinued: j > 0
                });
            }
        } else {
            sections.push({
                title: title,
                image: imgMatch ? imgMatch[1] : null,
                pageName: pageNameMatch ? pageNameMatch[1].trim() : '',
                role: roleMatch ? roleMatch[1].trim() : '',
                regions: regionsRaw,
                isContinued: false
            });
        }
    }
    return { intro, sections };
}

const parsed = parseSections(mdContent);

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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
        
        body {
            font-family: 'Inter', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        
        h1 { 
            font-size: 2.2em; 
            text-align: center; 
            color: #000; 
            font-weight: 800;
            border-bottom: 4px solid #00F5FF; 
            padding-bottom: 15px; 
            margin-bottom: 40px;
            letter-spacing: -1px;
        }

        .section {
            background: #fff;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            page-break-after: always;
            border: 1px solid #eee;
            min-height: 900px;
            display: flex;
            flex-direction: column;
        }

        .section:last-child { page-break-after: auto; }

        h2 { 
            font-size: 1.6em; 
            margin-top: 0; 
            margin-bottom: 15px;
            color: #000;
            font-weight: 800;
            display: flex;
            align-items: center;
        }
        
        h2::before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 24px;
            background: #00F5FF;
            margin-right: 12px;
            border-radius: 3px;
        }

        .page-name-tag {
            display: inline-block;
            background: #000;
            color: #fff;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 0.8em;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .main-layout {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 25px;
            flex-grow: 1;
        }

        .legend-column {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #efefef;
        }

        .legend-column h3 {
            margin-top: 0;
            font-size: 0.9em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
        }

        .image-column {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .image-container img {
            width: 100%;
            height: auto;
            border-radius: 4px; /* Fixed: Rectangle with slight round */
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #eee;
        }

        .description-box {
            background: #f1fcfe;
            padding: 20px;
            border-radius: 12px;
            border-left: 5px solid #00F5FF;
        }

        .description-box h3 {
            margin-top: 0;
            font-size: 1.1em;
            color: #007c85;
            margin-bottom: 8px;
        }

        .role-text {
            font-size: 0.95em;
            color: #333;
        }

        li, p { word-break: keep-all; }

        @media print {
            body { background: white; padding: 0; }
            .section { box-shadow: none; border: 1px solid #ddd; margin: 0; width: 100%; height: 100%; }
        }
    </style>
</head>
<body>
    <div id="intro"></div>
    <div id="sections-container"></div>

    <script>
        const data = ${JSON.stringify(parsed)};
        const container = document.getElementById('sections-container');
        document.getElementById('intro').innerHTML = marked.parse(data.intro || '');

        data.sections.forEach(s => {
            const secDiv = document.createElement('div');
            secDiv.className = 'section';
            
            const imgPath = s.image ? encodeURI("file:///" + "${baseDir.replace(/\\/g, '/')}/" + s.image) : '';
            
            let rightContent = '';
            if (!s.isContinued) {
                rightContent = \`
                    <div class="image-container">
                        <img src="\${imgPath}" alt="\${s.title}" />
                    </div>
                    <div class="description-box">
                        <h3>Role & Purpose</h3>
                        <div class="role-text">\${marked.parse(s.role)}</div>
                    </div>
                \`;
            } else {
                rightContent = \`
                    <div style="background: #fdfdfd; border: 1px dashed #ccc; flex-grow: 1; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #999;">
                        (Content continued from previous page)
                    </div>
                \`;
            }

            secDiv.innerHTML = \`
                <h2>\${s.title}</h2>
                <div class="page-name-tag">\${s.pageName}</div>
                
                <div class="main-layout">
                    <div class="legend-column">
                        <h3>UI REGIONS</h3>
                        <div class="region-list">\${marked.parse(s.regions)}</div>
                    </div>
                    <div class="image-column">
                        \${rightContent}
                    </div>
                </div>
            \`;
            container.appendChild(secDiv);
        });

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
        const browser = await puppeteer.launch({ 
            args: ['--allow-file-access-from-files'],
            headless: "new"
        });
        const page = await browser.newPage();
        
        await page.goto('file:///' + tmpHtml.replace(/\\\\/g, '/'), { waitUntil: 'networkidle2', timeout: 60000 });
        
        try {
            await page.waitForFunction(() => window.__done === true, { timeout: 20000 });
        } catch(err) {
            console.log("Wait function timed out, trying to print PDF anyway...");
        }
        
        const pdfPath = path.join(baseDir, 'AUNOVA_Page_Flow_Definition.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            landscape: false,
            printBackground: true,
            margin: { top: '15mm', bottom: '15mm', left: '10mm', right: '10mm' }
        });
        
        console.log("PDF generated successfully at: " + pdfPath);
        await browser.close();
    })();
}).catch(console.error);
