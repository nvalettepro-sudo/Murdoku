// Vérifie que js/version.js est cohérent et que le cache hors ligne (sw.js) porte le même numéro.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/version.js'), 'utf8'), ctx);
const V = ctx.window.MURDOKU_VERSION;
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const errs = [];
if (!/^\d+\.\d+(\.\d+)?$/.test(V.VERSION)) errs.push('VERSION invalide : ' + V.VERSION);
if (!/^\d{4}-\d{2}-\d{2}$/.test(V.DATE)) errs.push('DATE invalide : ' + V.DATE);
if (!V.HISTORY.length || V.HISTORY[0].v !== V.VERSION || V.HISTORY[0].d !== V.DATE) errs.push('HISTORY[0] doit correspondre à VERSION et DATE');
if (!sw.includes("'murdoku-" + V.VERSION + "'")) errs.push('sw.js : CACHE doit valoir murdoku-' + V.VERSION);
if (!sw.includes('./js/version.js')) errs.push('sw.js : js/version.js absent du cache');
if (errs.length) { console.log('✗ ' + errs.join('\n✗ ')); process.exit(1); }
console.log('✓ version ' + V.VERSION + ' du ' + V.DATE + ' (cache hors ligne cohérent)');
