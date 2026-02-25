const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const targetDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition';
const assetDir = path.join(targetDir, 'asset');

// Ensure directories exist
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true });

const htmlPath = 'C:/antigravity/aunova옴니solution/index.html';

// Assets to download
const assets = [
    { url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80', file: 'asset_space_bg.jpg' },
    { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', file: 'asset_video_placeholder.jpg' },
    { url: 'https://assets.mixkit.co/sfx/preview/mixkit-cinematic-impact-boom-726.mp3', file: 'sfx_boom.mp3' },
    { url: 'https://assets.mixkit.co/sfx/preview/mixkit-deep-space-hum-2169.mp3', file: 'sfx_ambient.mp3' }
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close(resolve);
            });
        }).on('error', function(err) {
            fs.unlinkSync(dest);
            reject(err);
        });
    });
}

(async () => {
    console.log('Downloading assets...');
    for (let t of assets) {
        await download(t.url, path.join(assetDir, t.file)).catch(console.error);
    }
    console.log('Assets downloaded.');

    console.log('Launching browser...');
    const browser = await puppeteer.launch({ defaultViewport: { width: 1440, height: 900 } });
    const page = await browser.newPage();
    
    // Read html content and load it directly or via file protocol
    await page.goto(`file:///${htmlPath}`, { waitUntil: 'networkidle0' });
    
    // Inject a quick helper to ensure smooth transitions
    await page.evaluate(() => {
        // Disable transitions to speed up capturing
        const style = document.createElement('style');
        style.textContent = '* { transition-duration: 0ms !important; animation-duration: 0ms !important; }';
        document.head.appendChild(style);
        
        // Hide cursors that might blink
        const cursor = document.getElementById('cursor');
        if(cursor) cursor.style.display = 'none';
        const cursorAura = document.getElementById('cursor-aura');
        if(cursorAura) cursorAura.style.display = 'none';
    });

    const waitDelay = 300;
    const capture = async (name) => {
        const p = path.join(targetDir, name);
        await page.screenshot({ path: p });
        console.log(`Captured ${name}`);
    };

    // 0 Landing Page
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('0_Landing_Page.png');

    // Dismiss Intro Overlay
    await page.evaluate(() => {
        const p0 = document.getElementById('page-0');
        if (p0) p0.style.display = 'none';
        const shell = document.getElementById('app-shell');
        if (shell) shell.style.opacity = '1';
    });

    // 1 Main Page (Top)
    await page.evaluate(() => navigateTo('page-1'));
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('1_Main_Page.png');

    // 1_1 Main Page (Motion Synthesis - Below the fold)
    await page.evaluate(() => {
        document.getElementById('page1-below').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('1_1_Main_Page.png');

    // 1_2 Main Page (Footer)
    await page.evaluate(() => {
        document.getElementById('company-footer').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('1_2_Main_Page.png');

    // Reset scroll and navigate to page 2
    await page.evaluate(() => window.scrollTo(0, 0));

    // 2 Synthesis Workspace
    await page.evaluate(() => navigateTo('page-2'));
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('2_Synthesis_Workspace.png');

    // c Deposit Payment (page-3 in HTML)
    await page.evaluate(() => navigateTo('page-3'));
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('c_Deposit_Payment_Page.png');

    // 3 Processing Wait Page (page-4 in HTML)
    await page.evaluate(() => {
        document.getElementById("synth-title").value = "우르킬 열쇠의 고리";
        startProcessing();
    });
    await new Promise(r => setTimeout(r, 4000)); // Wait for 3.5s animation to finish
    await capture('3_Processing_Wait_Page.png');

    // 4 Result Viewer Export (page-5 in HTML)
    await page.evaluate(() => navigateTo('page-5'));
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('4_Result_Viewer_Export.png');

    // 5 Delivery Home (page-6 in HTML)
    await page.evaluate(() => {
        document.getElementById("synth-title").value = "우르킬 열쇠의 고리";
        confirmPrint();
    });
    await new Promise(r => setTimeout(r, 4000)); // Wait for 3.5s animation to finish
    await capture('5_Delivery_Home.png');

    // a Login Page
    await page.evaluate(() => { navigateTo('page-1'); window.scrollTo(0,0); });
    await new Promise(r => setTimeout(r, waitDelay));
    await page.evaluate(() => openModal('auth-modal'));
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('a_Login_Page.png');
    await page.evaluate(() => closeModal('auth-modal'));

    // b Signup Page
    await page.evaluate(() => openModal('signup-modal'));
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('b_Signup_Page.png');
    await page.evaluate(() => closeModal('signup-modal'));

    // d Final Payment Page
    // Make sure we are on page-5 or something that makes sense for final payment
    await page.evaluate(() => navigateTo('page-5'));
    await new Promise(r => setTimeout(r, waitDelay));
    await page.evaluate(() => openModal('print-modal'));
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('d_Final_Payment_Page.png');
    await page.evaluate(() => closeModal('print-modal'));

    // Admin Factory Page
    await page.evaluate(() => navigateTo('page-admin-1'));
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('Admin_Factory_Page.png');

    // Admin Lab Page
    await page.evaluate(() => navigateTo('page-admin-2'));
    await new Promise(r => setTimeout(r, waitDelay));
    await capture('Admin_Lab_Page.png');

    await browser.close();
    console.log('All captures done.');
})();
