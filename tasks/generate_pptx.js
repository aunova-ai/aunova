const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const baseDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition';
const mdFile = path.join(baseDir, 'page_flow_definition.md');

console.log("Reading Markdown definition for Premium Portrait PPTX...");
let mdContent = fs.readFileSync(mdFile, 'utf8');

function parseSections(md) {
    const sections = [];
    const parts = md.split(/^##\s+/m);
    for (let i = 1; i < parts.length; i++) {
        const lines = parts[i].split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n');
        
        const imgMatch = content.match(/!\[.*?\]\(\.\/(.*?)\)/);
        const pageNameMatch = content.match(/\*\*페이지명.*?\:\*\*(.*)/i);
        const roleMatch = content.match(/\*\*역할.*?\:\*\*([\s\S]*?)(?=\*\*|$)/i);
        const regionsMatch = content.match(/\*\*화면 영역.*?\:\*\*([\s\S]*?)$/i);
        
        const regionsRaw = regionsMatch ? regionsMatch[1].trim().replace(/\r/g, '') : '';
        const regionLines = regionsRaw.split('\n').filter(l => l.trim());

        const MAX_REGIONS_PER_SLIDE = 12;
        if (regionLines.length > MAX_REGIONS_PER_SLIDE) {
            for (let j = 0; j < regionLines.length; j += MAX_REGIONS_PER_SLIDE) {
                const chunk = regionLines.slice(j, j + MAX_REGIONS_PER_SLIDE)
                    .map(l => l.replace(/^[\s-]*\*/, '').trim())
                    .filter(l => l)
                    .join('\n');

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
                regions: regionLines.map(l => l.replace(/^[\s-]*\*/, '').trim()).filter(l => l).join('\n'),
                isContinued: false
            });
        }
    }
    return sections;
}

const sections = parseSections(mdContent);
const pptx = new PptxGenJS();

pptx.defineLayout({ name: 'A4_PORTRAIT', width: 8.27, height: 11.69 });
pptx.layout = 'A4_PORTRAIT';

// Process Sections
sections.forEach(s => {
    let slide = pptx.addSlide();
    slide.background = { color: 'F8F9FA' };

    // Header with Cyan Accent
    slide.addShape(pptx.ShapeType.rect, { x: 0.4, y: 0.3, w: 0.08, h: 0.35, fill: { color: '00F5FF' } });
    slide.addText(s.title, {
        x: 0.6, y: 0.3, w: 7, h: 0.4,
        fontSize: 22, bold: true, color: '000000', fontFace: 'Malgun Gothic'
    });
    
    // Page Name Tag
    slide.addText(s.pageName, {
        x: 0.6, y: 0.75, w: 2.5, h: 0.25,
        fontSize: 10, bold: true, color: 'FFFFFF', fill: { color: '000000' },
        align: 'center', valign: 'middle', shape: pptx.ShapeType.roundRect
    });

    // Left Col: Regions
    slide.addText("UI REGIONS", {
        x: 0.4, y: 1.2, w: 2.8, h: 0.3,
        fontSize: 10, bold: true, color: '666666', fontFace: 'Malgun Gothic'
    });
    
    slide.addText(s.regions, {
        x: 0.4, y: 1.5, w: 2.8, h: 9.5,
        fontSize: 10, color: '333333', fontFace: 'Malgun Gothic',
        valign: 'top', margin: 10, fill: { color: 'FFFFFF' },
        border: { pt: 1, color: 'EEEEEE' },
        shrinkText: true
    });

    if (!s.isContinued) {
        // Image - Fixed: Rectangle
        if (s.image) {
            const imgPath = path.join(baseDir, s.image);
            if (fs.existsSync(imgPath)) {
                slide.addImage({
                    path: imgPath,
                    x: 3.4, y: 1.5, w: 4.5, h: 3.0,
                    rounding: false // No oval cropping
                });
            }
        }

        // Role & Purpose with Cyan style
        const cleanRole = s.role.replace(/\*\*/g, '').replace(/^- /gm, '• ').trim();
        slide.addText("Role & Purpose", {
            x: 3.4, y: 4.7, w: 4.5, h: 0.3,
            fontSize: 12, bold: true, color: '007C85', fontFace: 'Malgun Gothic'
        });

        slide.addText(cleanRole, {
            x: 3.4, y: 5.0, w: 4.5, h: 6.0,
            fontSize: 10, color: '333333', fontFace: 'Malgun Gothic',
            valign: 'top', fill: { color: 'F1FCFE' }, margin: 10,
            border: { pt: 1, color: '00F5FF', type: 'solid' }
        });
    } else {
        slide.addText("(Visual content on previous page)", {
            x: 3.4, y: 1.5, w: 4.5, h: 9.5,
            fontSize: 12, italic: true, color: 'BBBBBB', align: 'center', valign: 'middle',
            border: { pt: 1, color: 'EEEEEE', type: 'dash' }
        });
    }
});

const pptxPath = path.join(baseDir, 'AUNOVA_Page_Flow_Definition.pptx');
pptx.writeFile({ fileName: pptxPath }).then(fileName => {
    console.log(`Premium Portrait PPTX generated successfully at: ${fileName}`);
});
