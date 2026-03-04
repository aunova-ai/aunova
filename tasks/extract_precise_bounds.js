const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const targetDir = "C:\\antigravity\\aunova옴니solution\\page_flow_definition\\Annotated_Regions";
const htmlPath = "https://aunova.ai";

const boxData = {};

function saveBoxes() {
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(
    path.join(targetDir, "dom_precise_boxes.json"),
    JSON.stringify(boxData, null, 2)
  );
  console.log("Saved precise boxes to dom_precise_boxes.json");
}

async function runExtractor() {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1440, height: 900 },
    headless: true
  });
  const page = await browser.newPage();
  
  // Inject helper once to window
  const injectHelpers = async () => {
    await page.evaluate(() => {
      window.findByText = (t) => {
        const all = document.querySelectorAll("button, div, span, a, input, textarea, h1, h2, h3, h4, h5, h6, label, p, li, b, strong");
        let best = null;
        let minArea = Infinity;
        for (const el of all) {
          const c = (el.innerText || el.textContent || "").toLowerCase();
          const v = (el.value || "").toLowerCase();
          const p = (el.placeholder || "").toLowerCase();
          const target = t.toLowerCase();
          if (c.includes(target) || v.includes(target) || p.includes(target)) {
            const r = el.getBoundingClientRect();
            if (r.width > 3 && r.height > 3 && r.width < 1440 && r.height < 900) {
              const area = r.width * r.height;
              if (area < minArea) { minArea = area; best = el; }
            }
          }
        }
        return best;
      };

      window.getPreciseBox = (descriptor) => {
        const text = descriptor.trim();
        if (!text) return null;
        let node = window.findByText(text);
        if (!node) {
          if (text.includes("로고")) node = document.querySelector('nav img, .fixed.top-0.left-0 img') || window.findByText('AUNOVA');
          if (text.includes("입력") || text.includes("폼") || text.includes("프롬프트") || text.includes("타이틀")) node = document.querySelector('input, textarea, select, h1, h2');
          if (text.includes("버튼") || text.includes("START") || text.includes("GENERATE") || text.includes("CONFIRM") || text.includes("커넥트")) node = document.querySelector('button, button.bg-primary');
          if (text.includes("뷰어") || text.includes("캔버스") || text.includes("포트폴리오")) node = document.querySelector('#center-preview, #center-display, canvas, video');
          if (text.includes("푸터") || text.includes("회사 정보") || text.includes("하단")) node = document.querySelector('footer, #company-footer');
        }
        if (node) {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
        return null;
      };

      window.getUniversals = () => {
        const b = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        };
        return {
          "로고": b('nav img') || b('.fixed.top-0.left-0 img'),
          "로그인 / 회원가입": b('button[onclick*="auth-modal"]') || b('#btn-auth'),
          "네비게이션 메뉴": b('nav .flex.items-center.gap-x-4') || b('.fixed.right-10'),
          "상단 네비게이터": b('.absolute.top-6.left-1\\/2') || b('.fixed.top-6.left-1\\/2'),
          "모달": b('#auth-modal') || b('#signup-modal') || b('#mypage-modal') || b('.max-w-2xl'),
          "로그인/회원가입 진입": b('button[onclick*="auth-modal"]') || b('#btn-auth')
        };
      };
      
      // Safety for SPA functions
      if (typeof navigateTo === 'undefined') window.navigateTo = (id) => { const el = document.getElementById(id); if(el) el.classList.remove('hidden'); };
      if (typeof openModal === 'undefined') window.openModal = (id) => { const el = document.getElementById(id); if(el) el.classList.add('active'); };
      if (typeof closeModal === 'undefined') window.closeModal = (id) => { const el = document.getElementById(id); if(el) el.classList.remove('active'); };
      if (typeof setLoggedIn === 'undefined') window.setLoggedIn = () => {};
      if (typeof startProcessing === 'undefined') window.startProcessing = () => {};
      if (typeof confirmPrint === 'undefined') window.confirmPrint = () => {};
    });
  };

  const extract = async (pageId, customKeys) => {
    const b = await page.evaluate((keys) => {
      const res = window.getUniversals();
      keys.forEach((k) => {
        const val = window.getPreciseBox(k);
        if (val) res[k] = val;
      });
      return res;
    }, customKeys);
    boxData[pageId] = b;
    console.log(`Extracted precise for ${pageId}`);
  };

  await page.goto(htmlPath, { waitUntil: "networkidle0" });
  await injectHelpers();

  // 0 Landing
  await extract("0", ["로고", "설명", "로그인", "AUNOVA", "DIGITAL GENESIS"]);

  // Transitions
  await page.evaluate(() => { window.navigateTo('page-1'); window.scrollTo(0, 0); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("1", ["로고", "메인 카피라이트", "슬로건", "START", "NOVA-3D", "상세 설명"]);

  await page.evaluate(() => { window.scrollTo(0, 1100); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("1_1", ["기능 카드", "상세 설명", "AI CORE", "QUANTUM", "LIVE", "GOODS"]);

  await page.evaluate(() => { window.scrollTo(0, 1800); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("1_2", ["리뷰", "소개", "COMMUNITY", "REVIEWS", "AUNOVA SOLUTION"]);

  await page.evaluate(() => { window.scrollTo(0, 2700); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("1_3", ["비디오 플레이어", "회사 정보", "서비스 바로가기", "연락처", "푸터"]);

  await page.evaluate(() => { window.navigateTo('page-2'); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("2", ["Lv.1", "프로젝트명", "요청 사항", "레퍼런스 이미지", "샘플 아웃풋", "생성하기", "진행률 네비게이터"]);

  await page.evaluate(() => { window.navigateTo('page-3'); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("c", ["경고", "결제 예정 금액", "결제 진행", "돌아가기", "결제 확인"]);

  await page.evaluate(() => { window.startProcessing(); });
  await new Promise(r => setTimeout(r, 2000));
  await extract("3", ["로고", "애니메이션", "상태 표시", "NEXT"]);

  await page.evaluate(() => { window.navigateTo('page-5'); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("4", ["로고", "STYLE SELECT", "COLOR PALETTE", "EXPORT", "Print 요청"]);

  // Modals
  await page.evaluate(() => { window.navigateTo('page-1'); window.openModal('auth-modal'); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("a", ["로그인 창", "입력 폼", "SNS", "CONNECT", "회원가입"]);

  await page.evaluate(() => { window.closeModal('auth-modal'); window.openModal('signup-modal'); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("b", ["회원가입 모달", "인적사항", "비밀번호 조건", "결제 수단", "약관 동의"]);

  await page.evaluate(() => { window.closeModal('signup-modal'); window.setLoggedIn('USER'); window.openModal('mypage-modal'); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("e", ["MY PAGE", "작업 항목", "상태 배지", "새로고침"]);

  // Admin
  await page.evaluate(() => { window.closeModal('mypage-modal'); window.navigateTo('page-admin-1'); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("Admin_Factory", ["THE FACTORY", "L-P Lab", "인쇄", "주문 리스트", "Customer", "Title"]);

  await page.evaluate(() => { window.navigateTo('page-admin-2'); });
  await new Promise(r => setTimeout(r, 1000));
  await extract("Admin_Lab", ["THE LAB", "AI MODEL DECK", "TIME MACHINE", "Merge"]);

  saveBoxes();
  await browser.close();
}

runExtractor().catch(console.error);
