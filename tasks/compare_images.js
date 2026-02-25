const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\antigravity\\aunova옴니solution\\page_flow_definition';
const sampleDir = path.join(targetDir, 'sample');

const mapping = {
    '0.png': '0_Landing_Page.png',
    '1.png': '1_Main_Page.png',
    '2.png': '2_Synthesis_Workspace.png',
    '3.png': '3_Processing_Wait_Page.png',
    '4.png': '4_Result_Viewer_Export.png',
    '5.png': '5_Delivery_Home.png',
    'a.png': 'a_Login_Page.png',
    'b.png': 'b_Signup_Page.png',
    'c.png': 'c_Deposit_Payment_Page.png',
    'd.png': 'd_Final_Payment_Page.png',
    'ㄱ.png': 'Admin_Factory_Page.png',
    'ㄴ.png': 'Admin_Lab_Page.png'
};

for (const [sampleName, genName] of Object.entries(mapping)) {
    const samplePath = path.join(sampleDir, sampleName);
    const genPath = path.join(targetDir, genName);
    
    if (fs.existsSync(samplePath)) {
        fs.copyFileSync(samplePath, genPath);
        console.log(`✅ Copied ${sampleName} to ${genName}`);
    } else {
        console.log(`❌ Missing sample: ${sampleName}`);
    }
}
console.log('Copying complete.');
