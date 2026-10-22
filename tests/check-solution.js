// Vérifie une solution connue contre les règles transcrites : node tests/check-solution.js id "Nom:r,c ..."
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const E = require('../js/engine.js');
const ctx = { window: {} }; vm.createContext(ctx);
const id = process.argv[2];
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'puzzles', id + '.js'), 'utf8'), ctx);
const def = ctx.window.MURDOKU_PUZZLES[0];
const P = E.compile(def);
const pos = new Array(P.people.length).fill(-1);
process.argv[3].trim().split(/\s+/).forEach(t => {
  const [name, rc] = t.split(':'); const [r, c] = rc.split(',').map(Number);
  pos[P.pid[name]] = r * P.N + c;
});
P.people.forEach((p, i) => {
  const k = pos[i];
  const st = E.clueStatus(P, pos, i);
  console.log((st ? '✓' : '✗'), p.name.padEnd(10), 'r' + Math.floor(k / P.N) + ' c' + (k % P.N), 'zone', P.area[k], P.blocked[k] ? 'BLOQUÉE' : '', [...P.objs[k]].join(','));
});
P.globals.forEach(g => console.log(E.evalRule(P, g.fn, pos, -1) ? '✓' : '✗', 'global:', g.text));
console.log('consistent:', E.consistent(P, pos), 'coupable:', P.people[E.culpritOf(P, pos)]?.name);
