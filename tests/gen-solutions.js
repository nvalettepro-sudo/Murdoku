// Calcule (ou valide) la solution de chaque énigme et l'écrit dans le fichier (champ « solution »).
// Usage : node tests/gen-solutions.js [id] [--known "Nom:r,c ..."]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const E = require('../js/engine.js');
const dir = path.join(__dirname, '..', 'puzzles');
const args = process.argv.slice(2);
const only = args[0] && !args[0].startsWith('--') ? args[0] : null;
const ki = args.indexOf('--known');
const known = ki >= 0 ? args[ki + 1] : null;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
  const file = path.join(dir, f);
  const src = fs.readFileSync(file, 'utf8');
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(src, ctx);
  const def = ctx.window.MURDOKU_PUZZLES[0];
  if (only && def.id !== only) continue;
  const P = E.compile(def);
  let sol;
  if (known) {
    sol = new Array(P.people.length).fill(-1);
    known.trim().split(/\s+/).forEach(t => { const [n, rc] = t.split(':'); const [r, c] = rc.split(',').map(Number); sol[P.pid[n]] = r * P.N + c; });
    if (!E.consistent(P, sol) || sol.includes(-1)) { console.log('✗', def.id, 'solution fournie invalide'); continue; }
  } else {
    const res = E.solve(P, { limit: 1, pairs: P.N >= 12 });
    sol = res.solutions[0];
    if (!sol) { console.log('✗', def.id, 'pas de solution'); continue; }
  }
  const N = P.N;
  const txt = P.people.map((p, i) => `${p.name}:${Math.floor(sol[i] / N)},${sol[i] % N}`).join(' ');
  let out = src.replace(/\n  solution: '[^']*',?/, '');
  out = out.replace(/\n\}\);\s*$/, `,\n  solution: '${txt}'\n});\n`).replace(/,,/g, ',');
  fs.writeFileSync(file, out);
  console.log('✓', def.id, '→', txt);
}
