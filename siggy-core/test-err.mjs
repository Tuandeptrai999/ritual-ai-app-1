import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        page.on('console', msg => {
            if (msg.type() === 'error') console.error('PAGE ERROR LOG:', msg.text());
            else console.log('PAGE LOG:', msg.text());
        });
        page.on('pageerror', err => {
            console.error('PAGE UNCAUGHT ERROR:', err.message);
        });
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
        console.log('Finished loading HTML');
        await browser.close();
    } catch (e) {
        console.error('SCRIPT ERR:', e);
        process.exit(1);
    }
})();
