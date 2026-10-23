// Génère docs/comparatif-graphismes.html : ancien et nouveau dessin des objets, rendus avec le vrai code du jeu.
// Usage : node tools/make-comparatif.js <dossier-ancienne-version> [sortie.html]
//   <dossier-ancienne-version> contient icons.js et board.js de la version à comparer (ex. git show origin/main:js/icons.js).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const oldDir = process.argv[2];
const out = process.argv[3] || path.join(root, 'docs', 'comparatif-graphismes.html');
if (!oldDir) { console.error('Usage : node tools/make-comparatif.js <dossier-ancienne-version> [sortie.html]'); process.exit(1); }

function load(files) {
  const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
  files.forEach(function (f) {
    let src = fs.readFileSync(f, 'utf8');
    if (/board\.js$/.test(f)) src = src.replace('root.MurdokuBoard = {', 'root.MurdokuBoard = { surface: surface,');
    vm.runInContext(src, ctx, { filename: f });
  });
  return ctx;
}
const OLD = load([path.join(oldDir, 'icons.js'), path.join(oldDir, 'board.js')]);
const NEW = load([path.join(root, 'js', 'icons.js'), path.join(root, 'js', 'board.js')]);
const E = require(path.join(root, 'js', 'engine.js'));

// énigmes
const pctx = { window: {} }; vm.createContext(pctx);
fs.readdirSync(path.join(root, 'puzzles')).filter(f => f.endsWith('.js')).sort().forEach(f => vm.runInContext(fs.readFileSync(path.join(root, 'puzzles', f), 'utf8'), pctx));
const PUZ = {}; pctx.window.MURDOKU_PUZZLES.forEach(d => { PUZ[d.id] = d; });
const usage = {};
Object.keys(PUZ).forEach(function (id) {
  const ts = (fs.readFileSync(path.join(root, 'puzzles', id + '.js'), 'utf8').match(/t: '([a-z]+)/g) || []).map(x => x.slice(4));
  new Set(ts).forEach(function (t) { (usage[t] = usage[t] || []).push(PUZ[id].title); });
});

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const uniq = (svg, p) => svg.replace(/id="((?:fl|pat)-[^"]*)"/g, 'id="' + p + '$1"').replace(/url\(#((?:fl|pat)-[^)]*)\)/g, 'url(#' + p + '$1)');

// fonds réalistes par objet (là où l'objet est posé dans le jeu)
const BG = { tree: '#b9eda0', snowtree: '#eaf3fa', cactus: '#f8e6bd', shark: '#9fd3ef', lily: '#9fd3ef', shrub: '#b9eda0', flower: '#b9eda0', flowers: '#b9eda0', palm: '#7fb09a', crocodile: '#7fb09a', tee: '#9ccf7a', flag: '#9ccf7a', cart: '#9ccf7a', boulder: '#d8e6c0', oil: '#c9d2d6', lion: '#f3e3c0', penguin: '#dff0fb', bear: '#a98a6a', elephant: '#d8e6c0', house: '#b9eda0', car: '#aab6c0', bed: '#f3e3c0', door: '#e0ecf2', lily2: '#9fd3ef' };
const ORDER = ['chair', 'table', 'shelf', 'tv', 'plant', 'box', 'register', 'present', 'teddy', 'trash', 'door', 'bed', 'car', 'cart', 'statue', 'easel', 'framed', 'tree', 'snowtree', 'shrub', 'flower', 'flowers', 'bonsai', 'cactus', 'palm', 'lily', 'boulder', 'house', 'oil', 'tee', 'flag', 'shark', 'lion', 'penguin', 'bear', 'crocodile', 'elephant', 'animal'];
const NOTE = {
  chair: 'Fauteuil capitonné : dossier haut bombé avec bouton, accoudoirs, pieds en bois visibles sous l’assise.',
  table: 'Plateau plus petit, tranche visible, pieds longs et sombres. Les tables de plusieurs cases forment une seule dalle (voir « Tables et tapis »).',
  shelf: 'Livres de hauteurs et de couleurs variées, corniche plus marquée, socle.',
  tv: 'Écran large avec reflet, pied en col, voyant. La note de musique reste, c’est ce qui distingue la télé.',
  plant: 'Les feuilles sortent de la terre du pot et la lèvre du pot passe devant. Feuilles plus grandes, deux verts.',
  box: 'Une vraie caisse en bois : planches, croix de renfort, montants, clous, couvercle clair. Plus de carton plié ambigu.',
  register: 'Renommée « Tiroir-caisse » : la légende affichait « Caisse » pour deux objets différents. Afficheur vert, touches, tiroir.',
  present: 'Ruban en croix, nœud à deux boucles, couvercle plus large.',
  teddy: 'Oreilles à intérieur clair, museau, ventre, nœud papillon rouge.',
  trash: 'Couvercle avec poignée, nervures, reflet métallique.',
  door: 'Battant à panneaux, poignée dorée, cadre sombre. Reste un élément fin posé sur le bord de la case.',
  bed: 'Tête de lit en bois, oreiller, drap replié, couverture à rayures.',
  car: 'Vitres avec reflets, portières et poignées, feux avant et arrière, enjoliveurs.',
  cart: 'Toit, pare-brise, siège, sac de clubs, roues à moyeu.',
  statue: 'Buste sur piédestal à deux gradins, à la place d’une silhouette informe.',
  easel: 'Trois pieds en bois, planche porte-toile, toile peinte (paysage ; la toile « smiley » est conservée).',
  framed: 'Cadre doré à biseau, passe-partout, tableau (paysage ; la version colorée reste pour la case spéciale).',
  tree: 'Couronne en deux tons (ombre, lumière), masses de feuillage claires, tronc.',
  snowtree: 'Même silhouette que l’arbre, feuillage blanc bleuté, petites décorations.',
  shrub: 'Feuillage en masses avec lumière et nervures.',
  flower: 'Corolles à cinq pétales avec cœur jaune, feuilles vertes entre les fleurs.',
  flowers: 'Même traitement, fleurs rouges.',
  bonsai: 'Pot à pieds, tronc tordu, trois nuages de feuillage avec reflets.',
  cactus: 'Côtes verticales, épines, fleur rose au sommet.',
  palm: 'Tronc annelé, six palmes dentelées, noix de coco.',
  lily: 'Nervures et fleur de lotus rose sur la feuille.',
  boulder: 'Faces claire et sombre, fissures, touffe de mousse.',
  house: 'Toit en tuiles, cheminée, fenêtre à croisillons, porte avec poignée.',
  oil: 'Reflets irisés (turquoise, violet, bleu) sur la flaque.',
  tee: 'Balle de golf à alvéoles sur un tee en bois, herbe autour.',
  flag: 'Mât rayé, coupelle au pied du trou, fanion qui flotte.',
  shark: 'Nageoire plus grande avec reflet, écume et remous.',
  lion: 'Crinière à festons, museau clair, pattes avant, queue à houppe (au lieu d’un félin de profil peu lisible).',
  penguin: 'Ventre blanc, nageoires, bec et pieds orange, joues.',
  bear: 'Ours brun assis de face : oreilles, museau, ventre clair, coussinets. Différent de la peluche.',
  crocodile: 'Dos crénelé, gueule à dents, œil en relief, pattes courtes.',
  elephant: 'Grande oreille rose, trompe enroulée, défense, ongles.',
  animal: 'Empreinte de patte. Cet objet n’apparaît dans aucune énigme actuelle.'
};

function iconSvg(ctx, name, px, o) {
  const I = ctx.MurdokuIcons, big = I.BIG[name], long = I.LONG[name];
  const vb = big ? '0 0 200 200' : long ? '0 0 200 100' : '0 0 100 100';
  const w = big ? px : long ? px * 2 : px;
  let inner;
  try { inner = I.ICONS[name](Object.assign({ dir: name === 'door' ? 'l' : null }, o || {}), 200, 100); } catch (e) { inner = ''; }
  if (name === 'door') inner = '<g transform="translate(50,0)">' + inner + '</g>';
  return '<svg width="' + w + '" height="' + px + '" viewBox="' + vb + '" role="img" aria-label="' + name + '">' + inner + '</svg>';
}
function surfaceSvg(ctx, type, cells, color, floor) {
  const B = ctx.MurdokuBoard, s = 100;
  const rs = cells.map(c => c[0]), cs = cells.map(c => c[1]);
  const w = (Math.max(...cs) + 1) * s + 40, h = (Math.max(...rs) + 1) * s + 40;
  const grid = [];
  for (let r = 0; r <= Math.max(...rs) + 1; r++) grid.push('M0 ' + r * s + 'H' + w);
  for (let c = 0; c <= Math.max(...cs) + 1; c++) grid.push('M' + c * s + ' 0V' + h);
  const body = B.surface({ type: type, cells: cells, v: type === 'carpet' ? color : undefined }, s, { tableColor: color, uid: 'x' });
  return '<svg viewBox="-20 -20 ' + w + ' ' + h + '" width="' + Math.round(w * 0.9) + '" role="img" aria-label="' + type + '"><rect x="-20" y="-20" width="' + w + '" height="' + h + '" fill="' + floor + '"/><path d="' + grid.join('') + '" stroke="rgba(30,30,50,.2)" stroke-width="1.5" fill="none"/>' + body + '</svg>';
}
function boardSvg(ctx, id, prefix) {
  const def = PUZ[id], P = E.compile(def), B = ctx.MurdokuBoard;
  const svg = '<svg class="board" viewBox="-16 -16 1032 1032" role="img" aria-label="' + esc(def.title) + '">' + B.staticLayer(P) + '</svg>';
  return uniq(svg, prefix);
}

// ------- sections -------
const shapes = [
  ['1 case', [[0, 0]]], ['2 cases', [[0, 0], [0, 1]]], ['3 cases', [[0, 0], [0, 1], [0, 2]]], ['Vertical', [[0, 0], [1, 0], [2, 0]]], ['En L', [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]], ['2 × 2', [[0, 0], [0, 1], [1, 0], [1, 1]]]
];
function surfaceRows(type, color, floor) {
  return shapes.map(function (sh) {
    return '<div class="shape"><div class="pair"><figure><figcaption>Avant</figcaption>' + surfaceSvg(OLD, type, sh[1], color, floor) + '</figure><figure class="new"><figcaption>Après</figcaption>' + surfaceSvg(NEW, type, sh[1], color, floor) + '</figure></div><p class="cap">' + sh[0] + '</p></div>';
  }).join('');
}
const MISE = [['art-school', 'École d’art'], ['preppers', 'Survivalistes'], ['zoo', 'Zoo'], ['holiday-shopping', 'Shopping de Noël']];
let n = 0;
const miseHtml = MISE.map(function (m) {
  n++;
  return '<section class="situation"><h3>' + m[1] + '</h3><div class="pair big"><figure><figcaption>Avant</figcaption>' + boardSvg(OLD, m[0], 'o' + n + '-') + '</figure><figure class="new"><figcaption>Après</figcaption>' + boardSvg(NEW, m[0], 'n' + n + '-') + '</figure></div></section>';
}).join('');

const rows = ORDER.filter(t => NEW.MurdokuIcons.ICONS[t]).map(function (t) {
  const bg = BG[t] || '#efe4cf';
  const oldName = OLD.MurdokuIcons.NAMES[t], newName = NEW.MurdokuIcons.NAMES[t];
  const lg = NEW.MurdokuIcons.LONG[t] || NEW.MurdokuIcons.BIG[t];
  const big = lg ? 1.4 : 1;
  const u = (usage[t] || []).slice(0, 6).join(', ') || '—';
  return '<article class="asset" id="o-' + t + '"><header><h3>' + esc(newName) + (oldName !== newName ? ' <span class="ren">avant : ' + esc(oldName) + '</span>' : '') + '</h3><p class="use">' + esc(u) + '</p></header>' +
    '<div class="pair"><figure><figcaption>Avant</figcaption><div class="stage" style="background:' + bg + '">' + iconSvg(OLD, t, Math.round(104 / (lg ? 1.2 : 1)), t === 'easel' ? {} : {}) + '</div></figure>' +
    '<figure class="new"><figcaption>Après</figcaption><div class="stage" style="background:' + bg + '">' + iconSvg(NEW, t, Math.round(104 / (lg ? 1.2 : 1))) + '</div></figure></div>' +
    '<div class="small"><span>Tailles réelles</span><div class="chips"><div class="chip" style="background:' + bg + '">' + iconSvg(OLD, t, 24) + '<small>avant 24</small></div><div class="chip new" style="background:' + bg + '">' + iconSvg(NEW, t, 24) + '<small>après 24</small></div><div class="chip" style="background:' + bg + '">' + iconSvg(OLD, t, 40) + '<small>avant 40</small></div><div class="chip new" style="background:' + bg + '">' + iconSvg(NEW, t, 40) + '<small>après 40</small></div></div></div>' +
    '<p class="note">' + esc(NOTE[t] || '') + '</p></article>';
}).join('');

const html = `<title>Comparatif graphismes</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap">
<style>
/* Identité : planche de dessinateur, papier chaud et encre prune ; les objets gardent leurs vraies couleurs de jeu */
:root { --bg:#f6f1e8; --panel:#fffdf8; --fg:#2b2838; --muted:#6b6678; --line:#ddd3c2; --accent:#6a4a9a; --new:#2f8a55; --newbg:#e6f4ea; --warn:#b5651d; --font:'Montserrat',system-ui,-apple-system,'Segoe UI',sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#1d1b26; --panel:#272433; --fg:#f0ecf6; --muted:#a9a3b8; --line:#3d384c; --accent:#b79bf0; --new:#6fd09a; --newbg:#1f3a2e; --warn:#e8a25a; color-scheme:dark; } }
:root[data-theme="dark"] { --bg:#1d1b26; --panel:#272433; --fg:#f0ecf6; --muted:#a9a3b8; --line:#3d384c; --accent:#b79bf0; --new:#6fd09a; --newbg:#1f3a2e; --warn:#e8a25a; color-scheme:dark; }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--fg); font-family:var(--font); line-height:1.5; padding-left:max(16px, env(safe-area-inset-left,0px)); padding-right:max(16px, env(safe-area-inset-right,0px)); padding-block:24px 56px; }
main { max-width:1180px; margin:0 auto; display:flex; flex-direction:column; gap:36px; }
h1 { font-size:clamp(28px,5vw,44px); line-height:1.08; margin:0 0 8px; font-weight:800; letter-spacing:-.01em; text-wrap:balance; }
h2 { font-size:24px; margin:0 0 6px; font-weight:800; }
h3 { font-size:16px; margin:0; font-weight:800; }
p { margin:0; }
.lead { color:var(--muted); max-width:70ch; }
.rules { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:12px; margin-top:16px; }
.rules div { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:12px 14px; font-size:14px; }
.rules b { display:block; color:var(--accent); margin-bottom:2px; }
.pair { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
figure { margin:0; min-width:0; }
figcaption { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:4px; font-weight:600; }
.new figcaption { color:var(--new); }
.pair.big { gap:14px; } .pair.big svg.board { width:100%; height:auto; display:block; border-radius:10px; border:2px solid var(--line); }
.new svg.board { border-color:var(--new); }
.situation { display:flex; flex-direction:column; gap:8px; }
.shapes { display:grid; grid-template-columns:repeat(auto-fit,minmax(360px,1fr)); gap:14px; }
.shape { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:10px 12px; }
.shape svg { display:block; max-width:100%; height:auto; border-radius:6px; }
.cap { font-size:12px; color:var(--muted); margin-top:6px; }
.assets { display:grid; grid-template-columns:repeat(auto-fill,minmax(310px,1fr)); gap:14px; }
.asset { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:8px; min-width:0; }
.asset header { display:flex; flex-direction:column; gap:2px; }
.ren { font-weight:600; font-size:11px; color:var(--warn); margin-left:6px; }
.use { font-size:11px; color:var(--muted); }
.stage { border-radius:10px; border:1px solid rgba(0,0,0,.12); display:flex; align-items:center; justify-content:center; min-height:124px; padding:6px; overflow:hidden; }
.stage svg { max-width:100%; height:auto; }
.new .stage { border:2px solid var(--new); }
.small { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.small > span { font-size:11px; color:var(--muted); }
.chips { display:flex; gap:6px; flex-wrap:wrap; }
.chip { border-radius:8px; padding:4px 6px; display:flex; flex-direction:column; align-items:center; gap:2px; border:1px solid rgba(0,0,0,.12); }
.chip.new { border:2px solid var(--new); }
.chip small { font-size:9px; color:#2b2838; }
.note { font-size:13px; }
.decide { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:16px 18px; }
.decide ol { margin:8px 0 0; padding-left:20px; display:flex; flex-direction:column; gap:6px; font-size:14px; }
.tag { display:inline-block; font-size:11px; font-weight:800; background:var(--newbg); color:var(--new); border-radius:99px; padding:2px 8px; margin-right:6px; }
@media (max-width:640px) { .pair.big { grid-template-columns:1fr; } }
</style>
<main>
<header>
  <h1>Comparatif graphismes</h1>
  <p class="lead">Chaque objet du jeu, avant et après, dessiné avec le vrai code du jeu. Trois règles guident les nouveaux dessins : on reconnaît l’objet à 24 px de large (grille 16×16 sur téléphone), trois tons au maximum (base, lumière, ombre), et un détail qui porte l’identité de l’objet. Les détails fins n’apparaissent qu’à l’agrandissement.</p>
  <div class="rules">
    <div><b>À 24 px</b>La silhouette et la couleur suffisent à reconnaître l’objet, sans lire les détails.</div>
    <div><b>Une identité par objet</b>Tapis : broderie. Table : pieds visibles. Caisse : croix de planches. Plante : feuilles dans le pot.</div>
    <div><b>Mêmes contours</b>Trait sombre arrondi et ombre douce, comme les pions et les fiches.</div>
  </div>
</header>

<section class="decide" id="valider">
  <h2>À valider</h2>
  <p class="lead">Les points sur lesquels j’ai fait un choix qui peut ne pas être le tien.</p>
  <ol>
    <li><span class="tag">Nom</span>« Caisse » désignait deux objets (la caisse en bois et la caisse enregistreuse). La seconde devient « Tiroir-caisse ».</li>
    <li><span class="tag">Dessin</span>Chevalet et tableau montrent un petit paysage au lieu d’une toile blanche : plus reconnaissable. La toile « smiley » et le tableau coloré restent.</li>
    <li><span class="tag">Dessin</span>Statue : buste sur piédestal. Une statue en pied serait illisible à 24 px.</li>
    <li><span class="tag">Dessin</span>Animaux : lion et ours vus de face, assis ; crocodile et éléphant de profil.</li>
    <li><span class="tag">Sols</span>Le sol en bois a des lames alternées aux joints décalés, le sable des petites dunes. Les autres sols ne changent pas.</li>
    <li><span class="tag">Porte</span>Elle reste un élément fin sur le bord de la case ; seuls les panneaux et la poignée sont ajoutés.</li>
  </ol>
</section>

<section>
  <h2>Tables et tapis</h2>
  <p class="lead">Une pièce de plusieurs cases est une seule forme continue : aucune séparation entre les cases. Tables : plateau plus petit et pieds visibles. Tapis : liseré brodé tout autour (fil pointillé, double filet), médaillons au centre de chaque case, franges sur les petits côtés, pour ne jamais les confondre avec une table.</p>
  <h3 style="margin-top:14px">Tables</h3>
  <div class="shapes">${surfaceRows('table', '#9a8ab8', '#f3e3c0')}</div>
  <h3 style="margin-top:18px">Tapis</h3>
  <div class="shapes">${surfaceRows('carpet', '#f6c8de', '#f3e3c0')}</div>
</section>

<section>
  <h2>Mises en situation</h2>
  <p class="lead">Quatre plateaux complets, avant et après.</p>
  <div style="display:flex;flex-direction:column;gap:22px;margin-top:10px">${miseHtml}</div>
</section>

<section>
  <h2>Objets</h2>
  <p class="lead">Un objet par carte : agrandi sur son fond habituel, puis aux tailles réelles d’une case (24 px sur téléphone, 40 px sur tablette).</p>
  <div class="assets" style="margin-top:10px">${rows}</div>
</section>
</main>`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('écrit', out, (html.length / 1024).toFixed(0) + ' Ko');
