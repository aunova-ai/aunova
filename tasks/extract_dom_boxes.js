const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition\\Annotated_Regions';
const htmlPath = 'C:\\antigravity\\aunova옴니solution\\index.html';

const boxData = {};

function saveBoxes() {
    fs.writeFileSync(path.join(targetDir, 'dom_boxes.json'), JSON.stringify(boxData, null, 2));
    console.log("Saved DOM boxes to dom_boxes.json");
}

async function runExtractor() {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath}`, { waitUntil: "networkidle0" });

  await page.evaluate(() => {
    window.getBox = function(selector, multi=false) {
        if(multi) {
            let els = [];
            if (selector.startsWith('text=')) {
                const text = selector.substring(5);
                const xpath = `//*[contains(text(), '${text}')]`;
                const iterator = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                let node = iterator.iterateNext();
                while (node) { els.push(node); node = iterator.iterateNext(); }
            } else {
                els = Array.from(document.querySelectorAll(selector));
            }
            if(els.length === 0) return null;
            // merge all bounds
            let minX=9999, minY=9999, maxX=0, maxY=0;
            els.forEach(e => {
                const r = e.getBoundingClientRect();
                if(r.width === 0 || r.height === 0 || r.height > 800) return; // ignore hidden or too big
                minX = Math.min(minX, r.x); minY = Math.min(minY, r.y);
                maxX = Math.max(maxX, r.x+r.width); maxY = Math.max(maxY, r.y+r.height);
            });
            if(minX === 9999) return null;
            return {x: minX-10, y: minY-10, w: (maxX-minX)+20, h: (maxY-minY)+20};
        }
        
        // Custom text selector XPATH
        if (selector.startsWith('text=')) {
           const text = selector.substring(5);
           const el = document.evaluate(`//*[contains(text(), '${text}')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
           if (!el) return null;
           const r = el.getBoundingClientRect();
           return {x: r.x-10, y: r.y-10, w: r.width+20, h: r.height+20};
        }

        const el = document.querySelector(selector);
        if(!el) return null;
        const r = el.getBoundingClientRect();
        return {x: r.x-10, y: r.y-10, w: r.width+20, h: r.height+20};
    };

    window.getUniversals = function() {
        return {
            "로고 이미지": window.getBox('.fixed.top-6.left-10'),
            "로그인 / 회원가입": window.getBox('button.border-white\\/20, button#btn-mypage', true),
            "네비게이션 메뉴": window.getBox('.fixed.right-10, .fixed.right-6'),
            "상단 네비게이터": window.getBox('.absolute.top-6.left-1\\/2'),
            "모달": window.getBox('.max-w-2xl, .bg-\\[\\#0A0B10\\]\\/95', true),
            "전체 모달": window.getBox('.max-w-2xl, .bg-\\[\\#0A0B10\\]\\/95', true),
            "안내 영역": window.getBox('.max-w-2xl', true),
            "없음": window.getBox('.max-w-2xl', true),
            "전체상": window.getBox('.max-w-2xl', true)
        };
    };
  });

  const waitDelay = 1000;
  const extract = async (pageId, customSelectors) => {
      const b = await page.evaluate((cs) => {
          const res = window.getUniversals();
          for(const [key, sel] of Object.entries(cs)) {
              const box = window.getBox(sel.s, sel.m);
              if(box) res[key] = box;
          }
          return res;
      }, customSelectors);
      boxData[pageId] = b;
      console.log(`Extracted ${pageId}`);
  };

  // 0 Landing Page
  await extract("0", {
      "로고 이미지": {s: "text=AUNOVA", m: false},
      "설명": {s: "text=DIGITAL GENESIS", m: false}
  });

  // Intro skip
  await page.evaluate(() => {
    const p0 = document.getElementById("page-0");
    if (p0) p0.style.display = "none";
    const shell = document.getElementById("app-shell");
    if (shell) shell.style.opacity = "1";
    navigateTo("page-1");
  });
  await new Promise(r => setTimeout(r, waitDelay));

  // 1 Main Page
  await extract("1", {
      "NOVA-3D": {s: "text=NOVA-3D", m: false},
      "3D PRINTING": {s: "text=AI 기반 3D 합성 기술로", m: false},
      "상세 설명": {s: "text=세상에 없던 당신만의 3D 세상", m: false},
      "GENESIS": {s: "text=START", m: false}
  });

  // 1_1 Main Page
  await page.evaluate(() => document.getElementById("page1-below").scrollIntoView({ behavior: "instant" }));
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("1_1", {
      "기능 카드": {s: "div.grid.grid-cols-1.md\\:grid-cols-3", m: false},
      "상세 설명": {s: "div.grid.grid-cols-1.md\\:grid-cols-3 p", m: true}
  });

  // 1_2 Main Page
  await page.evaluate(() => document.getElementById("company-footer").scrollIntoView({ behavior: "instant" }));
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("1_2", {
      "커뮤니티": {s: "text=COMMUNITY", m: false},
      "리뷰": {s: "div.col-span-12.mt-24", m: false},
      "비디오": {s: "text=VIDEO PLACEHOLDER", m: false},
      "푸터": {s: "text=SERVICE", m: false},
      "하단": {s: "#company-footer", m: false}
  });

  // 2 Synthesis
  await page.evaluate(() => { window.scrollTo(0, 0); navigateTo("page-2"); });
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("2", {
      "난이도": {s: "text=Lv.1", m: false},
      "프로젝트명": {s: "text=PROJECT TITLE", m: false},
      "프롬프트": {s: "textarea", m: false},
      "드롭존": {s: "text=Drag & Drop", m: false},
      "썸네일": {s: "text=SAMPLE OUTPUT", m: false},
      "GENERATE": {s: "button#btn-generate", m: false},
      "뷰어": {s: "#scene-container canvas, #video-placeholder", m: true},
      "애니메이션": {s: "#scene-container canvas, #video-placeholder", m: true},
      "결제 예상": {s: "text=TOTAL ESTIMATE", m: false}
  });

  // c Deposit
  await page.evaluate(() => navigateTo("page-3"));
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("c", {
      "비용": {s: "text=결제 예정 금액", m: false},
      "결제 확인": {s: "text=결제 진행", m: false},
      "취소": {s: "text=돌아가기", m: false}
  });

  // 3 Wait
  await page.evaluate(() => { document.getElementById("synth-title").value = "Testing"; startProcessing(); });
  await new Promise(r => setTimeout(r, 4000));
  await extract("3", {
      "상태 표시": {s: "text=탄생하고 있습니다", m: false},
      "NEXT": {s: "button#btn-next", m: false}
  });

  // 4 Result
  await page.evaluate(() => navigateTo("page-5"));
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("4", {
      "스타일 선택": {s: "text=STYLE SELECT", m: false},
      "컬러 팔레트": {s: "text=COLOR PALETTE", m: false},
      "뷰어": {s: "#result-container canvas", m: false},
      "추출 메뉴": {s: "text=EXPORT", m: false},
      "EXPORT": {s: "text=EXPORT", m: false},
      "Print 요청": {s: "button#btn-print", m: false}
  });

  // 5 Delivery
  await page.evaluate(() => { confirmPrint(); });
  await new Promise(r => setTimeout(r, 4000));
  await extract("5", {
      "마무리 안내": {s: "text=배송해 드리겠습니다", m: false},
      "HOME": {s: "button#btn-home", m: false}
  });

  // Modals (a, b, d, e)
  await page.evaluate(() => { navigateTo("page-1"); window.scrollTo(0,0); openModal('auth-modal'); });
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("a", {
      "입력 폼": {s: "input[type='email'], input[type='password']", m: true},
      "SNS": {s: "button.bg-white\\/5", m: true},
      "CONNECT": {s: "button.bg-nova-cyan", m: true},
      "이동": {s: "text=AUNOVA 회원가입", m: false}
  });
  await page.evaluate(() => closeModal('auth-modal'));

  await page.evaluate(() => openModal('signup-modal'));
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("b", {
      "인적사항": {s: "input[type='text'], input[type='email'], input[type='password'], input[type='tel']", m: true},
      "결제 수단": {s: "select", m: false},
      "체크박스": {s: "input[type='checkbox']", m: true},
      "보기": {s: "text=[보기]", m: true}
  });
  await page.evaluate(() => closeModal('signup-modal'));

  await page.evaluate(() => { navigateTo("page-5"); openModal("print-modal"); });
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("d", {
      "결제 금액": {s: "text=총 잔금 결제", m: false},
      "최종 잔액": {s: "text=총 잔금 결제", m: false},
      "승인": {s: "button.bg-nova-cyan", m: true},
      "결제 확인": {s: "button.bg-nova-cyan", m: true},
      "취소": {s: "text=취소", m: false}
  });
  await page.evaluate(() => closeModal("print-modal"));

  await page.evaluate(() => { navigateTo("page-1"); setLoggedIn("USER"); openModal("mypage-modal"); });
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("e", {
      "프로필": {s: "text=MY PAGE", m: false},
      "구매 내역": {s: "div.max-h-\\[400px\\]", m: false},
      "설정": {s: "button.bg-nova-cyan", m: false},
      "알림": {s: "text=MY PAGE", m: false}
  });
  await page.evaluate(() => closeModal("mypage-modal"));

  // Admins
  await page.evaluate(() => navigateTo("page-admin-1"));
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("Admin_Factory", {
      "메인 타이틀": {s: "text=THE FACTORY", m: false},
      "L-P Lab": {s: "text=L-P Lab", m: false},
      "인쇄(프린트)": {s: "text=인쇄", m: false},
      "주문 리스트": {s: "text=Customer", m: false}, // approximate list area
      "주문 번호": {s: "text=No.", m: false},
      "고객명": {s: "text=Customer", m: false},
      "작품 제목": {s: "text=Title", m: false},
      "선택된 난이도": {s: "text=Lv", m: false},
      "작업 상태": {s: "text=Status", m: false},
      "결제 금액": {s: "text=Price", m: false},
      "CINEMA VIEWER": {s: "text=CINEMA VIEWER", m: false},
      "메인 3D 모델": {s: "#scene-container canvas, #video-placeholder", m: true},
      "제어/관련 옵션": {s: "text=Rotation", m: true}
  });

  await page.evaluate(() => navigateTo("page-admin-2"));
  await new Promise(r => setTimeout(r, waitDelay));
  await extract("Admin_Lab", {
      "메인 타이틀": {s: "text=THE LAB", m: false},
      "P Factory": {s: "text=P Factory", m: false},
      "AI MODEL DECK": {s: "text=AI MODEL DECK", m: false},
      "TIME MACHINE": {s: "text=TIME MACHINE", m: false},
      "Version Slider": {s: "input[type='range']", m: true},
      "텍스트 뷰": {s: "text=Version Configuration", m: false},
      "Merge": {s: "text=MERGE MODELS", m: false}
  });

  saveBoxes();
  await browser.close();
}
runExtractor().catch(console.error);
