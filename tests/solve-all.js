// Vérifie que chaque énigme a une solution unique et affiche le coupable.
// Usage : node tests/solve-all.js [id] [--verbose]
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const E = require('../js/engine.js');

function loadPuzzles() {
  const dir = path.join(__dirname, '..', 'puzzles');
  const ctx = { window: {} };
  vm.createContext(ctx);
  fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
  });
  return ctx.window.MURDOKU_PUZZLES || [];
}

function show(P, sol) {
  const N = P.N;
  const lines = [];
  for (let r = 0; r < N; r++) {
    let s = '';
    for (let c = 0; c < N; c++) {
      const k = r * N + c;
      const i = sol.indexOf(k);
      s += i >= 0 ? P.people[i].name[0] : (P.blocked[k] ? '#' : '.');
      s += ' ';
    }
    lines.push('  ' + s + '  ' + P.def.grid[r]);
  }
  return lines.join('\n');
}

const args = process.argv.slice(2);
const only = args.find(a => !a.startsWith('--'));
const verbose = args.includes('--verbose');
// --quick : les grandes grilles (16×16) ne sont pas résolues entièrement ; on vérifie seulement
// que la solution enregistrée respecte tous les indices et désigne le bon coupable.
const quick = args.includes('--quick');
let failed = 0;
for (const def of loadPuzzles()) {
  if (only && def.id !== only) continue;
  const t0 = Date.now();
  let P;
  try { P = E.compile(def); } catch (e) { console.log('✗', def.id, e.message); failed++; continue; }
  if (quick && P.N >= 16 && def.solution) {
    const sol = new Array(P.people.length).fill(-1);
    def.solution.split(' ').forEach(t => { const [n, rc] = t.split(':'); const [r, c] = rc.split(',').map(Number); sol[P.pid[n]] = r * P.N + c; });
    const ok = E.consistent(P, sol) && !sol.includes(-1);
    const ci = E.culpritOf(P, sol);
    const good = ok && (!def.expected || P.people[ci].name === def.expected);
    if (!good) failed++;
    console.log(`${good ? '✓' : '✗'} ${def.id} : solution enregistrée ${ok ? 'valide' : 'INVALIDE'} — coupable ${ci >= 0 ? P.people[ci].name : '?'} (vérification rapide)`);
    continue;
  }
  const res = E.solve(P, { limit: 2, pairs: P.N >= 12 });
  const ms = Date.now() - t0;
  const n = res.solutions.length;
  const status = n === 1 ? '✓' : '✗';
  if (n !== 1) failed++;
  let culprit = '-';
  if (n >= 1) {
    const ci = E.culpritOf(P, res.solutions[0]);
    culprit = ci >= 0 ? P.people[ci].name : '?';
  }
  const expected = def.expected;
  let expOk = '';
  if (expected && n >= 1) {
    const ok = culprit === expected;
    if (!ok) failed++;
    expOk = ok ? ' (attendu ✓)' : ' (attendu ' + expected + ' ✗)';
  }
  console.log(`${status} ${def.id} : ${n === 0 ? 'aucune solution' : n === 1 ? 'solution unique' : 'plusieurs solutions'} — coupable ${culprit}${expOk} — ${res.nodes} nœuds, ${ms} ms${res.exhausted ? ' (limite atteinte)' : ''}`);
  if (verbose || n !== 1) res.solutions.forEach((s, j) => console.log(' solution ' + (j + 1) + ':\n' + show(P, s)));
  if (n === 0 && verbose) {
    const d = E.staticDomains(P);
    P.people.forEach((p, i) => console.log('   ', p.name, d[i].length, 'cases'));
  }
}
process.exit(failed ? 1 : 0);
