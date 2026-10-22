// Test de bout en bout (Playwright) : joue une énigme complète au doigt et vérifie l'écran de victoire.
// Usage : node tests/e2e.js [baseUrl]   (serveur statique requis, ex. python3 -m http.server 8765)
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), vm = require('vm');
const base = process.argv[2] || 'http://localhost:8765/';

function loadDef(id) {
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'puzzles', id + '.js'), 'utf8'), ctx);
  return ctx.window.MURDOKU_PUZZLES[0];
}

async function tapCell(page, N, r, c) {
  const box = await page.locator('svg.board').boundingBox();
  const s = 1000 / N;
  const x = box.x + (16 + (c + 0.5) * s) / 1032 * box.width;
  const y = box.y + (16 + (r + 0.5) * s) / 1032 * box.height;
  await page.mouse.click(x, y);
}

async function play(browser, ctxOpts, id, label) {
  const def = loadDef(id);
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(m.text()); });
  await page.goto(base + '#/p/' + id);
  await page.waitForSelector('svg.board');
  // pose des pions selon la solution
  const sol = def.solution.split(' ').map(t => { const [n, rc] = t.split(':'); const [r, c] = rc.split(',').map(Number); return { n, r, c }; });
  // une croix d'abord (appui long simulé par l'outil Croix), puis effacement
  await tapCell(page, def.size, sol[0].r, sol[0].c); // case vide occupable : une croix se pose
  const crosses = await page.evaluate(() => JSON.parse(localStorage.getItem('murdoku:v1:p:' + location.hash.split('/')[2])).crosses);
  if (!Object.keys(crosses).length) errors.push('croix non posée');
  await page.click('[data-act="undo"]');
  // brouillon : un même suspect posé sur deux cases, puis effacé par Annuler
  const p0 = sol[0], i0 = def.people.findIndex(q => q.name === p0.n);
  await page.click('[data-tool="draft"]');
  await page.click('.card[data-i="' + i0 + '"]');
  await tapCell(page, def.size, p0.r, p0.c);
  const alt = sol[1];
  await tapCell(page, def.size, alt.r, alt.c);
  const notes = await page.evaluate(() => JSON.parse(localStorage.getItem('murdoku:v1:p:' + location.hash.split('/')[2])).notes);
  const nb = Object.values(notes || {}).filter(l => l.includes(i0)).length;
  if (nb !== 2) errors.push('brouillon : ' + nb + ' vignette(s) au lieu de 2');
  // appui long sur la vignette de la bonne case : elle devient un vrai pion
  {
    const box = await page.locator('svg.board').boundingBox();
    const s = 1000 / def.size;
    const x = box.x + (16 + (p0.c + 0.5) * s) / 1032 * box.width, y = box.y + (16 + (p0.r + 0.5) * s) / 1032 * box.height;
    await page.mouse.move(x, y); await page.mouse.down(); await page.waitForTimeout(650); await page.mouse.up();
  }
  const placed = await page.evaluate(() => JSON.parse(localStorage.getItem('murdoku:v1:p:' + location.hash.split('/')[2])).pos);
  if (placed[i0] !== p0.r * def.size + p0.c) errors.push('appui long : la vignette n\u2019a pas été validée');
  const autoX = await page.locator('path.xauto').count();
  if (!autoX) errors.push('aucune croix automatique après placement');
  await page.click('[data-tool="draft"]');
  await page.click('[data-act="undo"]');
  await page.click('[data-act="undo"]');
  await page.click('[data-act="undo"]');
  // indice : doit sélectionner quelqu'un
  await page.keyboard.press('Escape');
  await page.click('[data-act="hint"]');
  const sel = await page.locator('.card.selected').count();
  if (sel !== 1) errors.push('indice : aucune fiche sélectionnée');
  await page.keyboard.press('Escape');
  for (const p of sol) {
    const i = def.people.findIndex(q => q.name === p.n);
    await page.click('.card[data-i="' + i + '"]');
    await tapCell(page, def.size, p.r, p.c);
  }
  await page.waitForSelector('.modal .win', { timeout: 5000 }).catch(() => errors.push('pas d’écran de victoire'));
  const winner = await page.locator('.modal .big').textContent().catch(() => '');
  const ok = winner === def.expected;
  if (!ok) errors.push('coupable affiché « ' + winner + ' », attendu « ' + def.expected + ' »');
  await page.screenshot({ path: path.join(process.env.SHOTS || '/tmp', 'e2e-' + id + '-' + label + '.png') });
  await ctx.close();
  console.log((errors.length ? '✗' : '✓'), id, label, errors.length ? errors.join(' | ') : 'coupable ' + winner);
  return errors.length === 0;
}

(async () => {
  const browser = await chromium.launch();
  const ipad = { viewport: { width: 1180, height: 820 }, hasTouch: false, deviceScaleFactor: 1 };
  const ipadPortrait = { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1 };
  const pc = { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 };
  const ids = (process.env.IDS || 'netflix-and-kill,car-repair,courtroom,golf-course,zoo').split(',');
  let ok = true;
  for (const id of ids) {
    ok = (await play(browser, ipad, id, 'ipad-paysage')) && ok;
  }
  ok = (await play(browser, ipadPortrait, 'holiday-shopping', 'ipad-portrait')) && ok;
  ok = (await play(browser, pc, 'mystery-islands', 'pc')) && ok;
  await browser.close();
  process.exit(ok ? 0 : 1);
})();
