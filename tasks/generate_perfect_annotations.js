const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition';
const sampleDir = path.join(baseDir, 'smaple');
const outDir = path.join(baseDir, 'Annotated_Regions');

const pages = [
  { id: '0', file: '0_Landing_Page.png', mdIds: ['0 '], name: '0_Landing_Page' },
  { id: '1', file: '1_Main_Page.png', mdIds: ['1 '], name: '1_Main_Page' },
  { id: '1_1', file: '1_1_Main_Page.png', mdIds: ['1_1 '], name: '1_1_Main_Page' },
  { id: '1_2', file: '1_2_Main_Page.png', mdIds: ['1_2 '], name: '1_2_Main_Page' },
  { id: '1_3', file: '1_3_Main_Page.png', mdIds: ['1_3 '], name: '1_3_Main_Page' },
  { id: '2', file: '2_Synthesis_Workspace.png', mdIds: ['2 '], name: '2_Synthesis_Workspace' },
  { id: '3', file: '3_Processing_Wait_Page.png', mdIds: ['3 '], name: '3_Processing_Wait_Page' },
  { id: '4', file: '4_Result_Viewer_Export.png', mdIds: ['4 '], name: '4_Result_Viewer_Export' },
  { id: '5', file: '5_Delivery_Home.png', mdIds: ['5 '], name: '5_Delivery_Home' },
  { id: 'a', file: 'a_Login_Page.png', mdIds: ['a '], name: 'a_Login_Page' },
  { id: 'b', file: 'b_Signup_Page.png', mdIds: ['b '], name: 'b_Signup_Page' },
  { id: 'c', file: 'c_Deposit_Payment_Page.png', mdIds: ['c '], name: 'c_Deposit_Payment_Page' },
  { id: 'd', file: 'd_Final_Payment_Page.png', mdIds: ['d '], name: 'd_Final_Payment_Page' },
  { id: 'Admin_Factory', file: 'Admin_Factory_Page.png', mdIds: ['ㄱ'], name: 'Admin_Factory_Page' },
  { id: 'Admin_Lab', file: 'Admin_Lab_Page.png', mdIds: ['ㄴ'], name: 'Admin_Lab_Page' },
  { id: 'e', file: 'mypage_view.png', mdIds: ['e '], name: 'mypage_view' }
];

const colorTargets = {
  '빨간색': {r:255, g:0, b:0, hex:'#FF4444'},
  '파란색': {r:0, g:0, b:255, hex:'#4444FF'},
  '초록색': {r:0, g:255, b:0, hex:'#44FF44'},
  '녹색': {r:0, g:255, b:0, hex:'#44FF44'}, 
  '연두색': {r:127, g:255, b:0, hex:'#7FFF00'},
  '노란색': {r:255, g:255, b:0, hex:'#FFFF44'},
  '주황색': {r:255, g:165, b:0, hex:'#FFA500'},
  '보라색': {r:255, g:0, b:255, hex:'#FF00FF'},
  '하늘색': {r:0, g:255, b:255, hex:'#00FFFF'},
  '연보라색': {r:221, g:160, b:221, hex:'#dda0dd'},
  '살구색': {r:255, g:218, b:185, hex:'#ffdab9'},
  '남색': {r:51, g:51, b:255, hex:'#3333FF'},
  '회색': {r:170, g:170, b:170, hex:'#AAAAAA'},
  '흰색': {r:255, g:255, b:255, hex:'#FFFFFF'},
  '구리색': {r:204, g:136, b:68, hex:'#cc8844'},
  '안개색': {r:230, g:230, b:250, hex:'#e6e6fa'},
  '연노란색': {r:255, g:255, b:204, hex:'#ffffcc'},
  '자주색': {r:255, g:0, b:255, hex:'#FF00FF'},
  '분홍색': {r:255, g:192, b:203, hex:'#FFC0CB'}
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

const domBoxesPath = path.join(outDir, 'dom_precise_boxes.json');
const domBoxesData = fs.existsSync(domBoxesPath) ? JSON.parse(fs.readFileSync(domBoxesPath, 'utf8')) : {};

async function annotateImages() {
  const browser = await puppeteer.launch();
  const mdContent = fs.readFileSync(path.join(baseDir, 'page_flow_definition.md'), 'utf8');

  for (const pageInfo of pages) {
    const cleanImgPath = path.join(baseDir, pageInfo.file);
    const sampleImgPath = path.join(sampleDir, pageInfo.file);

    if (!fs.existsSync(cleanImgPath)) {
        console.log("No clean image for " + pageInfo.name + ", skipping.");
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
        if (isTargetHeader) { pageHeaderFound = true; inRegionSection = false; }
        else if (pageHeaderFound && line.startsWith('## ')) break;
        if (pageHeaderFound && line.includes('**화면 영역 (UI Regions):**')) { inRegionSection = true; continue; }
        if (pageHeaderFound && inRegionSection && line.trim().startsWith('- **[')) {
            regions.push(line.trim());
        }
    }

    if (regions.length === 0) continue;
    console.log(`Processing ${pageInfo.name} (${regions.length} regions)`);

    const page = await browser.newPage();
    const cleanBase64 = fs.readFileSync(cleanImgPath).toString('base64');
    const cleanSrc = "data:image/png;base64," + cleanBase64;
    
    let sampleSrc = "";
    if (fs.existsSync(sampleImgPath)) {
        sampleSrc = "data:image/png;base64," + fs.readFileSync(sampleImgPath).toString('base64');
    }

    const dims = await page.evaluate(async (src) => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve({ w: img.width, h: img.height });
        img.src = src;
      });
    }, cleanSrc);

    const padding = 40;
    const legendWidth = 550;
    await page.setViewport({ width: legendWidth + dims.w + (padding*2), height: Math.max(dims.h + (padding*2), 800) });

    const html = `
      <html>
        <body style="margin:0; padding:0; display:flex; background:#0A0A0B; font-family:sans-serif; color:white;">
          <div style="width:${legendWidth}px; padding:40px; border-right:2px solid #333; box-sizing:border-box; overflow-y:auto; height:100vh;">
            <div style="font-size:24px; font-weight:bold; color:#00F5FF; margin-bottom:20px; border-bottom:1px solid #00F5FF; padding-bottom:10px;">
              ${pageInfo.name.replace(/_/g, ' ')}
            </div>
            <div id="legend"></div>
          </div>
          <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:${padding}px;">
            <div id="container" style="position:relative; width:${dims.w}px; height:${dims.h}px;">
                <img id="clean-img" src="${cleanSrc}" style="width:100%; height:100%; border-radius:8px; box-shadow:0 0 20px black;" />
                ${sampleSrc ? `<img id="sample-img" src="${sampleSrc}" style="display:none;" />` : ''}
                <canvas id="c-clean" width="${dims.w}" height="${dims.h}" style="display:none;"></canvas>
                <canvas id="c-sample" width="${dims.w}" height="${dims.h}" style="display:none;"></canvas>
            </div>
          </div>
          <script>
            const regions = ${JSON.stringify(regions)};
            const colorTargets = ${JSON.stringify(colorTargets)};
            const domBoxes = ${JSON.stringify(domBoxesData['' + pageInfo.id] || {})};
            const getUxTerm = ${getUxTerm.toString()};
            const hasSample = ${!!sampleSrc};

            async function start() {
                const results = {};
                for(let k in colorTargets) results[k] = { x1:9999, y1:9999, x2:0, y2:0, found:false };

                if(hasSample) {
                    const cleanImg = document.getElementById('clean-img');
                    const sampleImg = document.getElementById('sample-img');
                    const c1 = document.getElementById('c-clean');
                    const c2 = document.getElementById('c-sample');
                    const ctx1 = c1.getContext('2d');
                    const ctx2 = c2.getContext('2d');
                    ctx1.drawImage(cleanImg, 0, 0);
                    ctx2.drawImage(sampleImg, 0, 0);
                    const d1 = ctx1.getImageData(0,0,c1.width, c1.height).data;
                    const d2 = ctx2.getImageData(0,0,c2.width, c2.height).data;

                    for(let i=0; i<d2.length; i+=4) {
                        const r2=d2[i], g2=d2[i+1], b2=d2[i+2];
                        const r1=d1[i], g1=d1[i+1], b1=d1[i+2];
                        const diff = Math.abs(r2-r1) + Math.abs(g2-g1) + Math.abs(b2-b1);
                        if(diff < 40) continue;

                        for(let name in colorTargets) {
                            const t = colorTargets[name];
                            const d = Math.sqrt((r2-t.r)**2 + (g2-t.g)**2 + (b2-t.b)**2);
                            if(d < 80) {
                                const pix = i/4;
                                const x = pix % c1.width;
                                const y = Math.floor(pix / c1.width);
                                results[name].x1 = Math.min(results[name].x1, x);
                                results[name].y1 = Math.min(results[name].y1, y);
                                results[name].x2 = Math.max(results[name].x2, x);
                                results[name].y2 = Math.max(results[name].y2, y);
                                results[name].found = true;
                            }
                        }
                    }
                }

                const legend = document.getElementById('legend');
                const container = document.getElementById('container');

                regions.forEach(line => {
                    let bestColor = null;
                    for(let name in colorTargets) if(line.includes(name)) bestColor = name;
                    const hex = bestColor ? colorTargets[bestColor].hex : '#FFF';
                    const text = line.replace(/\\*\\*/g, '').replace(/- \\[.*\\]/,'').trim();
                    const desc = line.split('[')[1].split(']')[0];
                    
                    const ux = getUxTerm(line);
                    legend.innerHTML += '<div style="background:rgba(255,255,255,0.05); border-left:4px solid '+hex+'; padding:10px; margin-bottom:15px; border-radius:4px;">' +
                        '<div style="color:'+hex+'; font-weight:bold; font-size:14px;">'+ux+'</div>' +
                        '<div style="font-size:13px; opacity:0.8; margin-top:4px;">'+text+'</div></div>';

                    // BOX LOGIC: prioritize Sample Match -> then DOM Match -> then Fallback
                    let box = null;
                    if(bestColor && results[bestColor].found) {
                        const r = results[bestColor];
                        box = { t: r.y1, l: r.x1, w: r.x2-r.x1, h: r.y2-r.y1 };
                    } else {
                        // Look in DOM Data
                        for(let key in domBoxes) {
                            if(line.includes(key)) {
                                const d = domBoxes[key];
                                box = { t: d.y, l: d.x, w: d.w, h: d.h };
                                break;
                            }
                        }
                    }

                    if(box) {
                        const div = document.createElement('div');
                        div.style = 'position:absolute; border:3px dashed '+hex+'; top:'+box.t+'px; left:'+box.l+'px; width:'+box.w+'px; height:'+box.h+'px; box-shadow:0 0 10px rgba(0,0,0,0.5); z-index:10; background:rgba(0,0,0,0.05); pointer-events:none;';
                        container.appendChild(div);
                    }
                });
            }
            window.onload = start;
          </script>
        </body>
      </html>
    `;

    const tmpPath = path.join(baseDir, 'temp.html');
    fs.writeFileSync(tmpPath, html);
    await page.goto('file:///' + tmpPath.replace(/\\\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(outDir, pageInfo.name + "_Annotated.png"), fullPage:true });
    await page.close();
  }
  await browser.close();
}

annotateImages().catch(console.error);
