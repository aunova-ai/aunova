const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition\\Annotated_Regions';
const htmlPath = 'https://aunova.ai';

const boxData = {};

function saveBoxes() {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'dom_precise_boxes.json'), JSON.stringify(boxData, null, 2));
    console.log("Saved precise boxes to dom_precise_boxes.json");
}

async function runExtractor() {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  await page.goto(htmlPath, { waitUntil: "networkidle0" });

  const forceVisibility = async () => {
    await page.evaluate(() => {
        const targets = ['#app-shell', '#page-admin-1', '#page-admin-2', '#mypage-modal', 'main'];
        targets.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.style.height = '100vh';
                el.style.minHeight = '100vh';
                el.style.display = 'block';
                el.style.opacity = '1';
                el.style.visibility = 'visible';
            }
        });
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
    });
  };

  await page.evaluate(() => {
    // Helper to find the best bounding box for a given descriptor
    window.getPreciseBox = function(descriptor) {
        const text = descriptor.trim();
        
        // Strategy 1: XPath text match (exact or partial)
        const xpath = `//*[not(self::script) and not(self::style) and (contains(text(), "${text}") or contains(@placeholder, "${text}") or contains(@value, "${text}"))]`;
        const iterator = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let nodes = [];
        let node = iterator.iterateNext();
        while (node) {
            const r = node.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && r.height < 800) nodes.push(node);
            node = iterator.iterateNext();
        }

        if (nodes.length > 0) {
            // Find the most relevant node (usually the smallest one that contains the text)
            let best = nodes[0];
            let minArea = Infinity;
            nodes.forEach(n => {
                const r = n.getBoundingClientRect();
                const area = r.width * r.height;
                if (area < minArea) { minArea = area; best = n; }
            });
            
            const r = best.getBoundingClientRect();
            // Go up to find a container if it's too small (like an icon)
            let container = best;
            if (r.width < 30 || r.height < 30) {
                container = best.parentElement || best;
            }
            const finalR = container.getBoundingClientRect();
            return { x: finalR.x - 5, y: finalR.y - 5, w: finalR.width + 10, h: finalR.height + 10 };
        }

        // Strategy 2: Common UI patterns based on keywords
        if (text.includes('입력') || text.includes('폼') || text.includes('사항')) {
            const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
            if (inputs.length > 0) {
               let minX=9999, minY=9999, maxX=0, maxY=0;
               inputs.forEach(i => {
                  const r = i.getBoundingClientRect();
                  if (r.width > 0 && r.height > 0 && r.y > 0) {
                      minX = Math.min(minX, r.x); minY = Math.min(minY, r.y);
                      maxX = Math.max(maxX, r.x+r.width); maxY = Math.max(maxY, r.y+r.height);
                  }
               });
               if (minX !== 9999) return { x: minX-10, y: minY-10, w: (maxX-minX)+20, h: (maxY-minY)+20 };
            }
        }

        return null;
    };

    window.getUniversals = function() {
        // Updated selectors for live site (aunova.ai)
        const logo = document.querySelector('nav img, .fixed.top-0.left-0 img') || document.evaluate('//*[contains(text(), "AUNOVA")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const gnb = document.querySelector('.fixed.right-10') || document.querySelector('.fixed.right-6') || document.querySelector('nav .flex.items-center.gap-x-4');
        const navigator = document.querySelector('.absolute.top-6.left-1\\/2') || document.querySelector('.fixed.top-6.left-1\\/2');
        
        const b = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.x - 5, y: r.y - 5, w: r.width + 10, h: r.height + 10 };
        };
        
        return {
            "로고": b(logo),
            "로그인 / 회원가입": b(document.querySelector('button[onclick*="auth-modal"], #btn-auth')),
            "네비게이션 메뉴": b(gnb),
            "상단 네비게이터": b(navigator),
            "모달": b(document.querySelector('.max-w-2xl, .bg-\\[\\#09090B\\], #auth-modal, #signup-modal')),
            "로그인/회원가입 진입": b(document.querySelector('button[onclick*="auth-modal"], #btn-auth'))
        };
    };
  });

  const extract = async (pageId, customKeys) => {
      const b = await page.evaluate((keys) => {
          const res = window.getUniversals();
          keys.forEach(k => {
              const val = window.getPreciseBox(k);
              if (val) res[k] = val;
          });
          return res;
      }, customKeys);
      boxData[pageId] = b;
      console.log(`Extracted precise for ${pageId}`);
  };

  // 0 Landing
  await extract("0", ["AUNOVA", "DIGITAL GENESIS", "로고 이미지", "설명"]);

  // Transitions
  await page.evaluate(() => { navigateTo('page-1'); window.scrollTo(0, 0); }); await forceVisibility(); await new Promise(r => setTimeout(r, 1000));
  await extract("1", ["NOVA-3D", "3D PRINTING", "START", "상세 설명", "GENESIS", "로고", "메인 카피라이트", "슬로건"]);

  await page.evaluate(() => { 
    const el = document.getElementById("page1-below");
    if (el) el.scrollIntoView();
    else window.scrollTo(0, 1100);
  }); await new Promise(r => setTimeout(r, 1000));
  await extract("1_1", ["기능 카드", "AI CORE", "QUANTUM", "LIVE", "GOODS", "솔루션"]);

  await page.evaluate(() => { window.scrollTo(0, 1800); }); await new Promise(r => setTimeout(r, 1000));
  await extract("1_2", ["COMMUNITY", "REVIEWS", "AUNOVA SOLUTION", "소개", "갤러리"]);

  await page.evaluate(() => { 
    const el = document.getElementById("company-footer");
    if (el) el.scrollIntoView();
    else window.scrollTo(0, 2700);
  }); await new Promise(r => setTimeout(r, 1000));
  await extract("1_3", ["VIDEO PLACEHOLDER", "SERVICE", "푸터", "하단", "회사 정보", "연락처"]);

  await page.evaluate(() => { navigateTo('page-2'); }); await forceVisibility(); await new Promise(r => setTimeout(r, 1000));
  await extract("2", ["Lv.1", "PROJECT TITLE", "Drag & Drop", "GENERATE", "뷰어", "결제 예상", "프롬프트", "#center-preview", "#center-display"]);

  await page.evaluate(() => { navigateTo('page-3'); }); await forceVisibility(); await new Promise(r => setTimeout(r, 1000));
  await extract("c", ["결제 예정 금액", "결제 진행", "돌아가기", "비용", "결제 확인"]);

  await page.evaluate(() => { startProcessing(); }); await forceVisibility(); await new Promise(r => setTimeout(r, 3500));
  await extract("3", ["탄생하고 있습니다", "NEXT", "상태 표시", "#center-preview"]);

  await page.evaluate(() => { navigateTo('page-5'); }); await forceVisibility(); await new Promise(r => setTimeout(r, 1000));
  await extract("4", ["STYLE SELECT", "COLOR PALETTE", "EXPORT", "Print 요청", "뷰어", "#center-preview"]);

  await page.evaluate(() => { confirmPrint(); }); await forceVisibility(); await new Promise(r => setTimeout(r, 3500));
  await extract("5", ["배송해 드리겠습니다", "HOME", "마무리 안내"]);

  // Modals
  await page.evaluate(() => { navigateTo('page-1'); openModal('auth-modal'); }); await forceVisibility(); await new Promise(r => setTimeout(r, 1000));
  await extract("a", ["Auth Component", "Connect with", "이동", "입력 폼", "SNS"]);

  await page.evaluate(() => { closeModal('auth-modal'); openModal('signup-modal'); }); await forceVisibility(); await new Promise(r => setTimeout(r, 1000));
  await extract("b", ["인적사항", "결제 수단", "[보기]", "체크박스"]);

  await page.evaluate(() => { closeModal('signup-modal'); setLoggedIn('USER'); openModal('mypage-modal'); }); await forceVisibility(); await new Promise(r => setTimeout(r, 1000));
  await extract("e", ["MY PAGE", "History", "Settings", "프로필", "구매 내역", "설정"]);

  // Admin
  await page.evaluate(() => { closeModal('mypage-modal'); navigateTo('page-admin-1'); }); await forceVisibility(); await new Promise(r => setTimeout(r, 1000));
  await extract("Admin_Factory", ["THE FACTORY", "Customer", "CINEMA VIEWER", "L-P Lab", "주문 리스트", "Cinema"]);

  await page.evaluate(() => { navigateTo('page-admin-2'); }); await forceVisibility(); await new Promise(r => setTimeout(r, 1000));
  await extract("Admin_Lab", ["THE LAB", "AI MODEL DECK", "TIME MACHINE", "MERGE MODELS", "가중치 슬라이더", "병합"]);

  saveBoxes();
  await browser.close();
}

runExtractor().catch(console.error);
