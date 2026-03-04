const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const htmlPath = 'C:\\antigravity\\aunova옴니solution\\index.html';

async function testExtraction() {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath}`, { waitUntil: "networkidle0" });

  await page.evaluate(() => {
    window.getBox = function(text, selector) {
        if (selector) {
            const el = document.querySelector(selector);
            if (el) return el.getBoundingClientRect();
        }
        if (text) {
            // Find text exact or includes
            const el = document.evaluate(`//*[text()[contains(., '${text}')]]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (el) return el.getBoundingClientRect();
        }
        return null;
    }
  });

  // Test 1_Main_Page texts ("NOVA-3D", "3D PRINTING", "GENESIS")
  const boxes = await page.evaluate(() => {
      return {
          nova: window.getBox('NOVA-3D'),
          printing: window.getBox('3D PRINTING'),
          genesis: window.getBox('GENESIS'),
          logo: window.getBox(null, 'img[alt="AUNOVA"]'),
      }
  });
  console.log(boxes);
  await browser.close();
}

testExtraction();
