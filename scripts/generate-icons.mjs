import { Browser } from 'file:///C:/Users/AUGUSTINE/.gemini/config/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { readFileSync, copyFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const srcIconPath = 'C:/Users/AUGUSTINE/.gemini/antigravity/brain/30467cde-257e-44b7-8b18-67b72357614f/habitops_icon_cyan_square_1793436969797.jpg';
const base64Data = readFileSync(srcIconPath).toString('base64');
const dataUri = `data:image/jpeg;base64,${base64Data}`;

const browser = await Browser.launch();

const sizes = [
  { name: 'icon-512.png', size: 512, targets: ['assets/icon-512.png', 'android-build/assets/www/assets/icon-512.png'] },
  { name: 'icon-192.png', size: 192, targets: ['assets/icon-192.png', 'android-build/assets/www/assets/icon-192.png', 'android-build/shell/ic_launcher.png'] },
  { name: 'apple-touch-icon.png', size: 180, targets: ['assets/apple-touch-icon.png'] },
  { name: 'favicon-32x32.png', size: 32, targets: ['assets/favicon-32x32.png', 'assets/favicon.png'] },
];

for (const item of sizes) {
  const page = await browser.newPage({ width: item.size, height: item.size, dsf: 1 });
  const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${item.size}px; height: ${item.size}px; overflow: hidden; background: #00e5ff; }
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    </style>
  </head>
  <body>
    <img src="${dataUri}" />
  </body>
</html>`;
  
  const tmpHtml = resolve(`temp_icon_${item.size}.html`);
  writeFileSync(tmpHtml, htmlContent);
  const fileUrl = pathToFileURL(tmpHtml).href;
  
  await page.goto(fileUrl, { settleMs: 300 });
  
  const tmpOut = resolve(`assets/${item.name}`);
  await page.screenshot({ path: tmpOut });
  rmSync(tmpHtml, { force: true });
  
  for (const t of item.targets) {
    const p = resolve(t);
    mkdirSync(resolve(p, '..'), { recursive: true });
    copyFileSync(tmpOut, p);
    console.log(`✓ Generated ${t} (${item.size}x${item.size})`);
  }
}

// Copy master original
copyFileSync(srcIconPath, resolve('assets/habitops-app-icon-master.jpg'));

await browser.close();
console.log('🎉 All mobile app icons generated successfully!');
