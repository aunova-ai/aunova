const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition';
const sampleDir = path.join(baseDir, 'smaple'); // User's new directory name
const outDir = path.join(baseDir, 'Annotated_Regions');

const pages = [
  { id: '0', file: '0_Landing_Page.png', mdIds: ['0 '], name: '0_Landing_Page' },
  { id: '1_1', file: '1_1_Main_Page.png', mdIds: ['1_1 '], name: '1_1_Main_Page' },
  { id: '1_2', file: '1_2_Main_Page.png', mdIds: ['1_2 '], name: '1_2_Main_Page' },
  { id: '1', file: '1_Main_Page.png', mdIds: ['1_Main_Page', ' 1 '], name: '1_Main_Page' },
  { id: '2', file: '2_Synthesis_Workspace.png', mdIds: ['2 '], name: '2_Synthesis_Workspace' },
  { id: '3', file: '3_Processing_Wait_Page.png', mdIds: ['3 '], name: '3_Processing_Wait_Page' },
  { id: '4', file: '4_Result_Viewer_Export.png', mdIds: ['4 '], name: '4_Result_Viewer_Export' },
  { id: '5', file: '5_Delivery_Home.png', mdIds: ['5 '], name: '5_Delivery_Home' },
  { id: 'a', file: 'a_Login_Page.png', mdIds: ['a '], name: 'a_Login_Page' },
  { id: 'b', file: 'b_Signup_Page.png', mdIds: ['b '], name: 'b_Signup_Page' },
  { id: 'c', file: 'c_Deposit_Payment_Page.png', mdIds: ['c '], name: 'c_Deposit_Payment_Page' },
  { id: 'd', file: 'd_Final_Payment_Page.png', mdIds: ['d '], name: 'd_Final_Payment_Page' },
  { id: 'Admin_Factory', file: 'Admin_Factory_Page.png', mdIds: ['ㄱ'], name: 'Admin_Factory_Page' },
  { id: 'Admin_Lab', file: 'Admin_Lab_Page.png', mdIds: ['ㄴ'], name: 'Admin_Lab_Page' }
];

const colorTargets = {
  '빨간색': {r:255, g:0, b:0, hex:'#FF4444'},
  '파란색': {r:0, g:0, b:255, hex:'#4444FF'},
  '초록색': {r:0, g:255, b:0, hex:'#44FF44'},
  '녹색': {r:0, g:128, b:0, hex:'#44FF44'}, 
  '연두색': {r:127, g:255, b:0, hex:'#7FFF00'},
  '노란색': {r:255, g:255, b:0, hex:'#FFFF44'},
  '주황색': {r:255, g:165, b:0, hex:'#FFA500'},
  '보라색': {r:128, g:0, b:128, hex:'#FF00FF'},
  '하늘색': {r:0, g:255, b:255, hex:'#00FFFF'},
  '연보라색': {r:221, g:160, b:221, hex:'#dda0dd'},
  '살구색': {r:255, g:218, b:185, hex:'#ffdab9'},
  '남색': {r:0, g:0, b:128, hex:'#3333FF'},
  '회색': {r:128, g:128, b:128, hex:'#AAAAAA'},
  '흰색': {r:255, g:255, b:255, hex:'#FFFFFF'},
  '구리색': {r:184, g:115, b:51, hex:'#cc8844'},
  '안개색': {r:230, g:230, b:250, hex:'#e6e6fa'},
  '연노란색': {r:250, g:250, b:210, hex:'#ffffcc'},
  '자주색': {r:128, g:0, b:128, hex:'#FF00FF'},
  '분홍색': {r:255, g:192, b:203, hex:'#FFC0CB'}
};

function getExplicitBounds(pageId, desc) {
    let t = 10, l = 10, w = 20, h = 10;
    
    // Universals
    if (desc.includes('로고 (') || desc.includes('로고 위치')) { t=3; l=2; w=12; h=7; }
    if (desc.includes('로그인 / 회원가입') || desc.includes('로그인/회원가입 진입')) { t=3; l=85; w=13; h=6; }
    if (desc.includes('네비게이션 메뉴') || desc.includes('Gallery, Reviews')) { t=12; l=85; w=13; h=25; }
    if (desc.includes('네비게이터') && desc.includes('상단')) { t=3; l=35; w=30; h=6; }
    if (desc.includes('모달') || desc.includes('전체 모달')) { t=20; l=35; w=30; h=60; }

    if (pageId === '0') {
        if (desc.includes('로고 이미지')) { t=35; l=40; w=20; h=15; }
        if (desc.includes('설명')) { t=55; l=30; w=40; h=15; }
    }
    else if (pageId === '1_1') {
        t=10; l=10; w=80; h=80;
    }
    else if (pageId === '1_2') {
        t=5; l=5; w=90; h=90;
    }
    else if (pageId === '1') {
        if (desc.includes('NOVA-3D')) { t=30; l=5; w=35; h=10; }
        if (desc.includes('3D PRINTING')) { t=42; l=5; w=45; h=15; }
        if (desc.includes('상세 설명')) { t=60; l=5; w=35; h=15; }
        if (desc.includes('GENESIS')) { t=80; l=5; w=15; h=8; }
    }
    else if (pageId === '2') {
        if (desc.includes('난이도')) { t=12; l=2; w=25; h=6; }
        if (desc.includes('프로젝트명')) { t=20; l=2; w=25; h=8; }
        if (desc.includes('프롬프트')) { t=30; l=2; w=25; h=40; }
        if (desc.includes('드롭존')) { t=72; l=2; w=12; h=20; }
        if (desc.includes('썸네일')) { t=72; l=15; w=12; h=20; }
        if (desc.includes('GENERATE')) { t=95; l=2; w=25; h=6; }
        if (desc.includes('뷰어') || desc.includes('애니메이션')) { t=25; l=35; w=40; h=50; }
        if (desc.includes('결제 예상')) { t=80; l=84; w=14; h=15; }
    }
    else if (pageId === '3') {
        if (desc.includes('뷰어')) { t=25; l=35; w=40; h=50; }
        if (desc.includes('상태 표시')) { t=80; l=35; w=30; h=6; }
        if (desc.includes('NEXT')) { t=88; l=45; w=10; h=6; }
    }
    else if (pageId === '4') {
        if (desc.includes('스타일 선택')) { t=15; l=2; w=6; h=60; }
        if (desc.includes('컬러 팔레트')) { t=80; l=2; w=20; h=15; }
        if (desc.includes('뷰어')) { t=25; l=20; w=60; h=65; }
        if (desc.includes('추출 메뉴') || desc.includes('EXPORT')) { t=15; l=85; w=13; h=25; }
        if (desc.includes('Print 요청')) { t=80; l=85; w=13; h=15; }
    }
    else if (pageId === '5') {
        if (desc.includes('애니메이션')) { t=25; l=35; w=40; h=50; }
        if (desc.includes('마무리 안내')) { t=80; l=30; w=40; h=6; }
        if (desc.includes('HOME')) { t=88; l=45; w=10; h=6; }
    }
    else if (pageId === 'a' || pageId === 'b') {
        if (desc.includes('모달') || desc.includes('안내 영역')) { t=28; l=38; w=24; h=10; }
        if (desc.includes('입력 폼')) { t=40; l=38; w=24; h=15; }
        if (desc.includes('SNS') || desc.includes('옵션')) { t=58; l=38; w=24; h=10; }
        if (desc.includes('CONNECT')) { t=72; l=38; w=24; h=6; }
        if (desc.includes('텍스트 이동')) { t=80; l=38; w=24; h=4; }
    }
    else if (pageId === 'c' || pageId === 'd') {
        if (desc.includes('비용')) { t=35; l=38; w=24; h=15; }
        if (desc.includes('결제 확인')) { t=55; l=38; w=24; h=6; }
        if (desc.includes('취소')) { t=65; l=38; w=24; h=4; }
    }
    else if (pageId === 'Admin_Factory') {
        if (desc.includes('어드민 메뉴') || desc.includes('메뉴 탭')) { t=5; l=5; w=90; h=5; }
        if (desc.includes('리스트 테이블')) { t=20; l=5; w=90; h=30; }
        if (desc.includes('검색창') || desc.includes('필터')) { t=12; l=5; w=30; h=6; }
        if (desc.includes('Cinema')) { t=55; l=5; w=60; h=40; }
        if (desc.includes('요약 정보')) { t=55; l=68; w=28; h=25; }
        if (desc.includes('실행 버튼들')) { t=82; l=68; w=28; h=15; }
    }
    else if (pageId === 'Admin_Lab') {
        if (desc.includes('AI 모델 파라미터')) { t=15; l=5; w=28; h=70; }
        if (desc.includes('가중치 슬라이더')) { t=15; l=35; w=30; h=15; }
        if (desc.includes('병합(Merge)')) { t=35; l=35; w=30; h=10; }
        if (desc.includes('설정 확인 텍스트')) { t=50; l=35; w=30; h=35; }
        if (desc.includes('테스트 렌더링')) { t=15; l=68; w=28; h=70; }
    }

    return { t: t+'%', l: l+'%', w: w+'%', h: h+'%' };
}

function getUxTerm(text) {
    if (text.includes('로고')) return "[Header Logo] ";
    if (text.includes('메뉴') || text.includes('네비게이션') || text.includes('네비게이터')) return "[GNB / Navigation] ";
    if (text.includes('로그인') || text.includes('회원가입')) return "[Auth Actions] ";
    if (text.includes('메인 카피') || text.includes('NOVA-3D:') || text.includes('타이틀')) return "[Hero Section] ";
    if (text.includes('GENESIS') || text.includes('생성하기') || text.includes('NEXT') || text.includes('HOME')) return "[Primary CTA] ";
    if (text.includes('뷰어') || text.includes('애니메이션') || text.includes('비디오') || text.includes('Cinema')) return "[Media Canvas] ";
    if (text.includes('드롭존') || text.includes('업로드')) return "[File Dropzone] ";
    if (text.includes('썸네일')) return "[Thumbnail Gallery] ";
    if (text.includes('설정 탭') || (text.includes('스타일') && text.includes('선택'))) return "[Segmented Controls] ";
    if (text.includes('입력창') || text.includes('프롬프트')) return "[Text Input Field] ";
    if (text.includes('푸터') || text.includes('회사 정보')) return "[Footer] ";
    if (text.includes('모달')) return "[Modal Box] ";
    if (text.includes('리스트') || text.includes('테이블')) return "[Data Grid / List] ";
    if (text.includes('검색창') || text.includes('필터')) return "[Search & Filter] ";
    if (text.includes('슬라이더')) return "[Range Slider] ";
    if (text.includes('결제') || text.includes('비용')) return "[Checkout UI] ";
    return "[UI Component] ";
}

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function annotateImages() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const mdContent = fs.readFileSync(path.join(baseDir, 'page_flow_definition.md'), 'utf8');

  for (const pageInfo of pages) {
    const cleanImgPath = path.join(baseDir, pageInfo.file);
    const sampleImgPath = path.join(sampleDir, pageInfo.file);

    if (!fs.existsSync(cleanImgPath)) {
        console.log("Skipping " + pageInfo.name + " due to missing clean image.");
        continue;
    }
    
    const mdLines = mdContent.split('\n');
    let inRegionSection = false;
    let regions = [];
    
    let pageHeaderFound = false;
    for (let i = 0; i < mdLines.length; i++) {
        const line = mdLines[i];
        
        let isTargetHeader = false;
        for (const mdId of pageInfo.mdIds) {
            if (line.trim().startsWith('## ' + mdId) || line.trim().startsWith('## ' + mdId.trim() + ' ')) {
                isTargetHeader = true; break;
            }
        }
        
        if (isTargetHeader) {
            pageHeaderFound = true;
            inRegionSection = false;
        } else if (pageHeaderFound && line.startsWith('## ')) {
            break;
        }
        
        if (pageHeaderFound && line.includes('**화면 영역 (UI Regions):**')) {
            inRegionSection = true;
            continue;
        }
        
        if (pageHeaderFound && inRegionSection) {
            if (line.trim().startsWith('- **[')) {
                regions.push(line.trim());
            }
        }
    }

    if (regions.length === 0) continue;
    console.log("Processing: " + pageInfo.name + " with " + regions.length + " regions.");

    const cleanImgData = fs.readFileSync(cleanImgPath).toString('base64');
    const cleanImgSrc = "data:image/png;base64," + cleanImgData;
    
    let sampleImgSrc = "";
    if (fs.existsSync(sampleImgPath)) {
        const sampleImgData = fs.readFileSync(sampleImgPath).toString('base64');
        sampleImgSrc = "data:image/png;base64," + sampleImgData;
    }

    const dimensions = await page.evaluate(async (src) => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = src;
      });
    }, cleanImgSrc);
    
    const padding = 40;
    const legendWidth = 550; // Increased to fit UI term + Original text
    const viewWidth = legendWidth + dimensions.width + (padding * 2);
    const viewHeight = Math.max(dimensions.height + (padding * 2), 700);
    
    await page.setViewport({ width: viewWidth, height: viewHeight });

    const html = `
      <html>
        <head>
          <style>
            body { 
              margin: 0; padding: 0; width: \${viewWidth}px; height: \${viewHeight}px; 
              font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; 
              display: flex; background: #0A0A0B; color: #FFFFFF;
            }
            .legend-panel {
              width: \${legendWidth}px;
              height: 100%;
              background: #0f0f11;
              border-right: 2px solid #333;
              padding: 40px 30px;
              box-sizing: border-box;
              overflow-y: auto;
            }
            .legend-title {
              font-size: 26px;
              font-weight: bold;
              margin-bottom: 30px;
              border-bottom: 2px solid #00F5FF;
              padding-bottom: 15px;
              color: #00F5FF;
            }
            .legend-item {
              display: flex;
              align-items: center;
              margin-bottom: 25px;
              background: rgba(255,255,255,0.03);
              padding: 15px;
              border-radius: 8px;
              border: 1px solid rgba(255,255,255,0.05);
            }
            .color-box {
              width: 28px;
              height: 28px;
              border-radius: 6px;
              margin-right: 20px;
              flex-shrink: 0;
              border: 2px solid rgba(255,255,255,0.8);
            }
            .legend-text {
              font-size: 16px;
              line-height: 1.5;
              font-weight: 700;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            }
            .right-panel {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: \${padding}px;
              background: #1a1a1c;
            }
            .image-container {
              position: relative;
              width: \${dimensions.width}px;
              height: \${dimensions.height}px;
              box-shadow: 0 0 30px rgba(0,0,0,0.8);
              border-radius: 8px;
              overflow: visible;
            }
            .bg-image {
              position: absolute;
              top: 0; left: 0;
              width: 100%; height: 100%;
              object-fit: contain;
              display: block;
              border-radius: 8px;
            }
            .region-box {
               position: absolute;
               border: 4px dashed;
               border-radius: 8px;
               pointer-events: none;
               box-shadow: 0 0 15px rgba(0,0,0,0.8), inset 0 0 10px rgba(0,0,0,0.6);
               z-index: 10;
            }
            canvas { display: none; }
          </style>
        </head>
        <body>
          <div class="legend-panel">
            <div class="legend-title">\${pageInfo.name.replace(/_/g, ' ')} UI Regions</div>
            <div id="legend-list"></div>
          </div>
          <div class="right-panel">
             <div class="image-container" id="image-container">
               <img class="bg-image" id="clean-img" src="${cleanImgSrc}" />
               ${sampleImgSrc ? `<img id="sample-img" src="${sampleImgSrc}" style="display:none;" />` : ''}
               <canvas id="canvas-clean" width="${dimensions.width}" height="${dimensions.height}"></canvas>
               <canvas id="canvas-sample" width="\${dimensions.width}" height="\${dimensions.height}"></canvas>
             </div>
          </div>
          
          <script>
            const regions = \${JSON.stringify(regions)};
            const colorTargets = \${JSON.stringify(colorTargets)};
            const hasSample = \${sampleImgSrc !== ""};
            
            function processImages() {
              const getUxTerm = ${getUxTerm.toString()};
              const getExplicitBounds = ${getExplicitBounds.toString()};
              const bounds = {};
              for (const key in colorTargets) {
                  bounds[key] = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, count: 0 };
              }

              if (hasSample) {
                  const cleanImg = document.getElementById('clean-img');
                  const sampleImg = document.getElementById('sample-img');
                  
                  const cClean = document.getElementById('canvas-clean');
                  const ctxClean = cClean.getContext('2d');
                  ctxClean.drawImage(cleanImg, 0, 0, cClean.width, cClean.height);
                  const cleanData = ctxClean.getImageData(0, 0, cClean.width, cClean.height).data;

                  const cSample = document.getElementById('canvas-sample');
                  const ctxSample = cSample.getContext('2d');
                  ctxSample.drawImage(sampleImg, 0, 0, cSample.width, cSample.height);
                  const sampleData = ctxSample.getImageData(0, 0, cSample.width, cSample.height).data;

                  for (let i = 0; i < sampleData.length; i += 4) {
                     const sr = sampleData[i], sg = sampleData[i+1], sb = sampleData[i+2], sa = sampleData[i+3];
                     const cr = cleanData[i], cg = cleanData[i+1], cb = cleanData[i+2];
                     
                     if (sa === 0) continue;

                     // PIXEL DIFFERENCE CV (Ignores matching backgrounds!)
                     const diff = Math.abs(sr - cr) + Math.abs(sg - cg) + Math.abs(sb - cb);
                     if (diff < 30) continue; // If pixels are same, it wasn't a drawn marker!

                     let bestDist = 120;
                     let bestColor = null;

                     for (const key in colorTargets) {
                        const target = colorTargets[key];
                        const dist = Math.sqrt(Math.pow(sr - target.r, 2) + Math.pow(sg - target.g, 2) + Math.pow(sb - target.b, 2));
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestColor = key;
                        }
                     }

                     if (bestColor && bestDist < 100) { 
                         const idx = i / 4;
                         const x = idx % cSample.width;
                         const y = Math.floor(idx / cSample.width);
                         
                         bounds[bestColor].minX = Math.min(bounds[bestColor].minX, x);
                         bounds[bestColor].minY = Math.min(bounds[bestColor].minY, y);
                         bounds[bestColor].maxX = Math.max(bounds[bestColor].maxX, x);
                         bounds[bestColor].maxY = Math.max(bounds[bestColor].maxY, y);
                         bounds[bestColor].count++;
                     }
                  }
              }

              const legendList = document.getElementById('legend-list');
              const imageContainer = document.getElementById('image-container');
              
              regions.forEach((r, idx) => {
                  let matchedColorKey = null;

                  for (const key in colorTargets) {
                      if (r.indexOf(key) !== -1) {
                          matchedColorKey = key;
                          break;
                      }
                  }

                  const rawText = r.replace('- **[', '[').replace(/\\*\\*/g, '');
                  const hex = matchedColorKey ? colorTargets[matchedColorKey].hex : '#FFFFFF';
                  
                  // ENHANCE TEXT WITH UX TERMINOLOGY
                  const uxPrefix = getUxTerm(rawText);
                  const richText = "<span style='color: #fff; font-size: 13px; opacity: 0.8; display: block; margin-bottom: 4px;'>" + rawText + "</span>" + uxPrefix;
                  
                  // TEXT IS NOW COLORED THE SAME AS THE BOX
                  legendList.innerHTML += 
                      "<div class='legend-item'>" +
                        "<div class='color-box' style='background-color: " + hex + "; box-shadow: 0 0 15px " + hex + ";'></div>" +
                        "<div class='legend-text' style='color: " + hex + ";'>" + richText + "</div>" +
                      "</div>";
                  
                  // Explicit hardcoded bounds as fallback
                  let loc = getExplicitBounds('${pageInfo.id}', rawText);
                  let styleStr = 'top: ' + loc.t + '; left: ' + loc.l + '; width: ' + loc.w + '; height: ' + loc.h + '; border-color: ' + hex + '; background-color: ' + hex + '15;';

                  if (matchedColorKey && bounds[matchedColorKey].count > 10) {
                      const box = bounds[matchedColorKey];
                      const w = Math.max(20, box.maxX - box.minX);
                      const h = Math.max(20, box.maxY - box.minY);
                      
                      // Filter out massive false positive boxes
                      if (w < imageContainer.clientWidth * 0.95 && h < imageContainer.clientHeight * 0.95) {
                          // USE PRECISE COMPUTER VISION BOUNDS!
                          styleStr = 'top: ' + box.minY + 'px; left: ' + box.minX + 'px; width: ' + w + 'px; height: ' + h + 'px; border-color: ' + hex + '; background-color: ' + hex + '15;';
                      }
                  }

                  imageContainer.innerHTML += 
                      "<div class='region-box' style='" + styleStr + "'></div>";
              });

              window.__done = true;
            }

            if (hasSample) {
               const sImg = document.getElementById('sample-img');
               if (sImg.complete) {
                   processImages();
               } else {
                   sImg.onload = processImages;
               }
            } else {
               processImages();
            }
          </script>
        </body>
      </html>
    `;

    await page.setContent(html);
    await page.waitForFunction('window.__done === true', { timeout: 30000 });

    const outputPath = path.join(outDir, pageInfo.name + "_Annotated.png");
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log("Saved annotated image to " + outputPath);
  }

  await browser.close();
}

annotateImages().catch(console.error);
