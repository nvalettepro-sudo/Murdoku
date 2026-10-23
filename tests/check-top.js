// Contrôle de la partie haute de l'écran de jeu (légende, bulles de règles, en-tête) sur toutes les énigmes
// et plusieurs tailles d'écran : aucun texte ne doit sortir de sa bulle, aucune zone ne doit en chevaucher une autre.
// Usage : node tests/check-top.js [baseUrl]   (serveur statique requis, Playwright requis)
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const base = process.argv[2] || 'http://localhost:8765/';
const ids = fs.readdirSync(path.join(__dirname, '..', 'puzzles')).filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, ''));
const vps = (process.env.VPS || '1500x1000,1194x834,1280x690,1024x768,820x1180,393x852').split(',').map(x => x.split('x').map(Number));

function inspect() {
  const out = [];
  const textOut = (el, label, skip) => {
    const R = el.getBoundingClientRect(), rg = document.createRange();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue;
      if (skip && n.parentElement.closest(skip)) continue;
      rg.selectNodeContents(n);
      for (const q of rg.getClientRects()) {
        if (q.width < 1) continue;
        if (q.right > R.right + 1 || q.left < R.left - 1 || q.bottom > R.bottom + 1 || q.top < R.top - 1) { out.push(label + ' : « ' + n.textContent.trim().slice(0, 24) + ' » sort de sa bulle'); return; }
      }
    }
  };
  document.querySelectorAll('.legend .lg').forEach(e => textOut(e, 'légende'));
  document.querySelectorAll('.legend .lg .it').forEach(e => {
    const R = e.closest('.lg').getBoundingClientRect(), q = e.getBoundingClientRect();
    if (q.bottom > R.bottom + 1 || q.top < R.top - 1 || q.right > R.right + 1 || q.left < R.left - 1) out.push('légende : un objet sort de sa bulle');
  });
  document.querySelectorAll('.bubble').forEach(e => textOut(e, 'bulle de règle', '.num'));
  const br = document.querySelector('.brand');
  if (br) textOut(br, 'en-tête', '.logo');
  const parts = [...document.querySelectorAll('.brand,.topbtns,.legend,.rules3')].map(e => [e.className, e.getBoundingClientRect()]);
  for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
    const a = parts[i][1], c = parts[j][1];
    if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) out.push(parts[i][0] + ' chevauche ' + parts[j][0]);
  }
  const bd = document.querySelector('.boardbox').getBoundingClientRect();
  parts.forEach(p => { const q = p[1]; if (q.bottom > bd.top + 1 && q.left < bd.right && q.right > bd.left && q.top < bd.top) out.push(p[0] + ' chevauche le plateau'); });
  return out;
}

(async () => {
  const browser = await chromium.launch(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {});
  let bad = 0;
  for (const [w, h] of vps) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    for (const id of ids) {
      await page.goto(base + '#/p/' + id);
      await page.reload();
      await page.waitForSelector('svg.board');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      const r = await page.evaluate(inspect);
      if (r.length) { bad += r.length; console.log('✗', w + '×' + h, id, '|', [...new Set(r)].join(' ; ')); }
    }
    await page.close();
  }
  await browser.close();
  console.log(bad ? '✗ ' + bad + ' problème(s) dans la partie haute' : '✓ partie haute propre : ' + ids.length + ' énigmes × ' + vps.length + ' tailles d\'écran');
  process.exit(bad ? 1 : 0);
})();
