/* Render assets/og.png — the 1200x630 card that Slack, WhatsApp, X and
   Facebook show when a link to the site is pasted.

       node tools/og-image.mjs [path/to/fonts.css]

   Drawn through headless Chromium rather than an image library on purpose:
   the card is set in Anek Kannada, and Kannada needs real shaping — an image
   library that cannot form conjuncts would render ರಕ್ಷಣಾ as loose parts. This
   way it also inherits the site's own colours and type, so the card and the
   page it opens look like the same thing.

   Needs playwright and a Chromium. The output is committed, so this only has
   to run when the card itself changes. Set PLAYWRIGHT_ROOT if playwright is
   installed somewhere other than beside this repo — an ESM bare import
   resolves from the *script's* directory, not the working directory, so a
   plain `import` cannot find an install that lives elsewhere.
*/
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(
  process.env.PLAYWRIGHT_ROOT ? join(process.env.PLAYWRIGHT_ROOT, 'noop.js') : import.meta.url);
const { chromium } = require('playwright');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'og.png');

/* the woff2 faces base64'd into one stylesheet; without it the card falls back
   to a system font and the Kannada looks nothing like the site */
const fontsPath = process.argv[2];
if (!fontsPath || !existsSync(fontsPath)) {
  console.error('usage: node tools/og-image.mjs <fonts.css with @font-face data: URIs>');
  process.exit(1);
}
const fonts = readFileSync(fontsPath, 'utf8');

const crest = 'data:image/png;base64,' +
  readFileSync(join(ROOT, 'assets', 'logo.png')).toString('base64');

const html = `<!doctype html><html lang="kn"><head><meta charset="utf-8"><style>
${fonts}
* { margin: 0; box-sizing: border-box; }
body {
  width: 1200px; height: 630px; display: flex; overflow: hidden;
  font-family: 'Anek Latin', 'Anek Kannada', sans-serif;
  background: #1A0800;
}
.card {
  position: relative; flex: 1; display: flex; flex-direction: column;
  justify-content: center; gap: 26px; padding: 0 88px;
  background:
    radial-gradient(62% 70% at 88% 8%, rgba(212,42,40,.42) 0%, transparent 62%),
    radial-gradient(52% 58% at 6% 96%, rgba(255,204,0,.20) 0%, transparent 60%),
    #1A0800;
}
/* the same raking flag stripes the page heads carry */
.rake {
  position: absolute; inset: -30% -6% -30% auto; width: 46%;
  background: repeating-linear-gradient(114deg,
    rgba(212,42,40,.30) 0 18px, transparent 18px 38px,
    rgba(255,204,0,.34) 38px 56px, transparent 56px 80px);
  -webkit-mask-image: linear-gradient(to left, #000 6%, transparent 94%);
}
.top { position: relative; display: flex; align-items: center; gap: 22px; }
.top img { width: 96px; height: auto; }
.kicker {
  font-size: 21px; font-weight: 600; letter-spacing: .22em;
  text-transform: uppercase; color: #FFCC00;
}
h1 {
  position: relative; font-size: 82px; font-weight: 700; line-height: 1.22;
  color: #fff; letter-spacing: -.01em;
}
h1 em { font-style: normal; color: #FFCC00; }
p { position: relative; font-size: 30px; color: rgba(255,255,255,.74); max-width: 24ch; }
.rule { position: absolute; left: 0; right: 0; bottom: 0; height: 12px;
        background: linear-gradient(to right, #D42A28 50%, #FFCC00 50%); }
</style></head><body>
  <div class="card">
    <span class="rake"></span>
    <div class="top">
      <img src="${crest}" alt="" />
      <span class="kicker">Karnataka Rakshana Vedike</span>
    </div>
    <h1>ಕರ್ನಾಟಕದ ಗೌರವ,<br /><em>ಕನ್ನಡದ ಹೆಮ್ಮೆ</em></h1>
    <p>ನಾಡು · ನುಡಿ · ನೆಲ · ಸಂಸ್ಕೃತಿ</p>
    <span class="rule"></span>
  </div>
</body></html>`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: OUT });
await browser.close();
console.log('wrote assets/og.png 1200x630');
