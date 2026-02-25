const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition';
const sampleDir = path.join(baseDir, 'smaple');
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
  '빨간색': {hex:'#FF4444'},
  '파란색': {hex:'#4444FF'},
  '초록색': {hex:'#44FF44'},
  '녹색': {hex:'#44FF44'}, 
  '연두색': {hex:'#7FFF00'},
  '노란색': {hex:'#FFFF44'},
  '주황색': {hex:'#FFA500'},
  '보라색': {hex:'#FF00FF'},
  '하늘색': {hex:'#00FFFF'},
  '연보라색': {hex:'#dda0dd'},
  '살구색': {hex:'#ffdab9'},
  '남색': {hex:'#3333FF'},
  '회색': {hex:'#AAAAAA'},
  '흰색': {hex:'#FFFFFF'},
  '구리색': {hex:'#cc8844'},
  '안개색': {hex:'#e6e6fa'},
  '연노란색': {hex:'#ffffcc'},
  '자주색': {hex:'#FF00FF'},
  '분홍색': {hex:'#FFC0CB'},
  '검은색': {hex:'#AAAAAA'}
};

function getUxTerm(text) {
    if (text.includes('로고')) return "[Header Logo]";
    if (text.includes('메뉴') || text.includes('네비게이션') || text.includes('네비게이터')) return "[GNB / Navigation]";
    if (text.includes('로그인') || text.includes('회원가입') || text.includes('아이디') || text.includes('비밀번호')) return "[Auth Component]";
    if (text.includes('SNS') || text.includes('간편 로그인')) return "[OAuth Buttons]";
    if (text.includes('메인 카피') || text.includes('NOVA-3D:') || text.includes('타이틀')) return "[Hero Section]";
    if (text.includes('GENESIS') || text.includes('생성하기') || text.includes('NEXT') || text.includes('HOME') || text.includes('결제 확인') || text.includes('CONNECT')) return "[Primary CTA]";
    if (text.includes('뷰어') || text.includes('애니메이션') || text.includes('비디오') || text.includes('Cinema') || text.includes('렌더링 영역')) return "[Media Canvas]";
    if (text.includes('드롭존') || text.includes('업로드')) return "[File Dropzone]";
    if (text.includes('썸네일')) return "[Thumbnail Gallery]";
    if (text.includes('설정 탭') || (text.includes('스타일') && text.includes('선택')) || text.includes('난이도')) return "[Segmented Controls]";
    if (text.includes('입력창') || text.includes('프롬프트') || text.includes('입력 폼') || text.includes('입력 필드')) return "[Input Field]";
    if (text.includes('푸터') || text.includes('회사 정보')) return "[Footer]";
    if (text.includes('모달')) return "[Modal Box]";
    if (text.includes('리스트') || text.includes('테이블')) return "[Data List / Table]";
    if (text.includes('검색창') || text.includes('필터')) return "[Search & Filter]";
    if (text.includes('슬라이더')) return "[Range Slider]";
    if (text.includes('결제 금액') || text.includes('보증금') || text.includes('비용')) return "[Checkout Breakdown]";
    if (text.includes('약관') || text.includes('동의')) return "[Legal Agreement Checkboxes]";
    if (text.includes('취소') || text.includes('돌아가기') || text.includes('이전')) return "[Secondary Action / Dismiss]";
    return "[UI Element]";
}

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function annotateImages() {
  const browser = await puppeteer.launch();
  
  const mdContent = fs.readFileSync(path.join(baseDir, 'page_flow_definition.md'), 'utf8');

  for (const pageInfo of pages) {
    const sampleImgPath = path.join(sampleDir, pageInfo.file);

    if (!fs.existsSync(sampleImgPath)) {
        console.log("Skipping " + pageInfo.name + " due to missing smaple image. Reverting to base directory file if exists.");
    }
    
    // Fall back to clean image if NO sample image is provided
    let finalImgPath = sampleImgPath;
    if (!fs.existsSync(finalImgPath)) {
        finalImgPath = path.join(baseDir, pageInfo.file);
        if (!fs.existsSync(finalImgPath)) continue;
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
    console.log("Processing: " + pageInfo.name + " with " + regions.length + " regions via Smaple Original Presentation.");

    const page = await browser.newPage();
    
    const sampleImgData = fs.readFileSync(finalImgPath).toString('base64');
    const sampleSrc = "data:image/png;base64," + sampleImgData;

    const dimensions = await page.evaluate(async (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject('Image load failed');
        img.src = src;
      });
    }, sampleSrc);
    
    const padding = 40;
    const legendWidth = 550; 
    const viewWidth = legendWidth + dimensions.width + (padding * 2);
    const viewHeight = Math.max(dimensions.height + (padding * 2), 700);
    
    await page.setViewport({ width: viewWidth, height: viewHeight });

    const html = `
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <style>
            body { margin: 0; padding: 0; width: ${viewWidth}px; height: ${viewHeight}px; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; display: flex; background: #0A0A0B; color: #FFFFFF; }
            .legend-panel { width: ${legendWidth}px; height: 100%; background: #0f0f11; border-right: 2px solid #333; padding: 40px 30px; box-sizing: border-box; overflow-y: auto; }
            .legend-title { font-size: 26px; font-weight: bold; margin-bottom: 30px; border-bottom: 2px solid #00F5FF; padding-bottom: 15px; color: #00F5FF; }
            .legend-item { display: flex; align-items: center; margin-bottom: 25px; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
            .color-box { width: 28px; height: 28px; border-radius: 6px; margin-right: 20px; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.4); }
            .legend-text { font-size: 16px; line-height: 1.5; font-weight: 700; }
            .right-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: ${padding}px; background: #1a1a1c; }
            .image-container { position: relative; width: ${dimensions.width}px; height: ${dimensions.height}px; box-shadow: 0 0 30px rgba(0,0,0,0.8); border-radius: 8px; overflow: visible; }
            .bg-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; display: block; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="legend-panel">
            <div class="legend-title">${pageInfo.name.replace(/_/g, ' ')} UI Regions</div>
            <div id="legend-list"></div>
          </div>
          <div class="right-panel">
             <div class="image-container" id="image-container">
               <!-- PERFECT REPRESENTATION: We only show the original sample image with the user's hand-drawn boxes untouched -->
               <img class="bg-image" id="sample-img" src="${sampleSrc}" />
             </div>
          </div>
          
          <script>
            const regions = ${JSON.stringify(regions)};
            const colorTargets = ${JSON.stringify(colorTargets)};
            const getUxTerm = ${getUxTerm.toString()};
            
            function processImages() {
              const legendList = document.getElementById('legend-list');
              
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
                  
                  const uxPrefix = getUxTerm(rawText);
                  const richText = "<span style='color: #fff; font-size: 13px; opacity: 0.8; display: block; margin-bottom: 4px;'>" + rawText + "</span>" + uxPrefix;
                  
                  legendList.innerHTML += 
                      "<div class='legend-item' style='border-color: " + hex + "33;'>" +
                        "<div class='color-box' style='background-color: " + hex + "; box-shadow: 0 0 10px " + hex + "88;'></div>" +
                        "<div class='legend-text' style='color: " + hex + ";'>" + richText + "</div>" +
                      "</div>";
              });
            }

            const sImg = document.getElementById('sample-img');
            if (sImg.complete) processImages(); 
            else sImg.onload = processImages;
          </script>
        </body>
      </html>
    `;

    const tmpHtml = path.join(baseDir, 'temp_render_simple.html');
    fs.writeFileSync(tmpHtml, html, 'utf8');
    await page.goto('file:///' + tmpHtml.replace(/\\\\/g, '/'), { waitUntil: 'load' });
    
    const outputPath = path.join(outDir, pageInfo.name + "_Annotated.png");
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log("Saved legend annotated image to " + outputPath);
    await page.close();
  }

  await browser.close();
  const tmpCleanup = path.join(baseDir, 'temp_render_simple.html');
  if (fs.existsSync(tmpCleanup)) fs.unlinkSync(tmpCleanup);
}

annotateImages().catch(console.error);
