/* Murdoku — icônes SVG des objets de la scène de crime.
 * Chaque icône est dessinée dans un repère 100 × 100 (une case) et mise à l'échelle par le plateau.
 * Style : aplats de couleur, contour sombre arrondi, ombre portée douce.
 */
(function (root) {
  'use strict';

  const O = '#2b2838'; // contour
  const SH = 'rgba(30,25,45,.22)'; // ombre

  function shadow(cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + SH + '"/>';
  }
  function g(inner, sw) {
    return '<g stroke="' + O + '" stroke-width="' + (sw || 4) + '" stroke-linejoin="round" stroke-linecap="round">' + inner + '</g>';
  }

  // Palette par défaut des objets (surchargée par le thème)
  const C = {
    chair: '#e9e6f2', chairDark: '#c4bfd6', table: '#6e6a86', tableTop: '#857f9e', wood: '#b98a5a',
    shelf: '#7aa2b8', shelfDark: '#4d6f84', book1: '#9aa7e8', book2: '#e8e4f6', book3: '#5b6aa8',
    tv: '#5a5a72', screen: '#d8f1ff', plant: '#7fcf8f', plantDark: '#4f9e63', pot: '#8a6a8e',
    statue: '#5a6a96', easel: '#9a7650', canvas: '#ffffff', framed: '#6a5a4a', gift: '#4fae9a', ribbon: '#aee6f2'
  };

  const ICONS = {
    chair: function (o) {
      const c = o.v || C.chair;
      return shadow(50, 84, 30, 9) + g(
        '<path d="M24 46 Q24 18 50 16 Q76 18 76 46 Z" fill="' + c + '"/>' +
        '<rect x="18" y="44" width="64" height="32" rx="10" fill="' + c + '"/>' +
        '<rect x="30" y="50" width="40" height="18" rx="6" fill="' + C.chairDark + '" stroke-width="3"/>' +
        '<rect x="14" y="46" width="14" height="30" rx="7" fill="' + c + '"/>' +
        '<rect x="72" y="46" width="14" height="30" rx="7" fill="' + c + '"/>', 3.5);
    },
    armchair: function (o) {
      const c = o.v || '#f0d7a8';
      return shadow(50, 86, 34, 9) + g(
        '<path d="M22 50 Q20 16 50 14 Q80 16 78 50 Z" fill="' + c + '"/>' +
        '<path d="M28 24 L72 24 M26 34 L74 34" stroke="#d9b77c" stroke-width="2.5" fill="none"/>' +
        '<rect x="20" y="48" width="60" height="30" rx="8" fill="' + c + '"/>' +
        '<rect x="12" y="44" width="16" height="36" rx="8" fill="' + c + '"/>' +
        '<rect x="72" y="44" width="16" height="36" rx="8" fill="' + c + '"/>' +
        '<path d="M56 36 L74 30 L76 44 L60 48 Z" fill="#fbf4e6" stroke-width="2.5"/>', 3.5);
    },
    schoolchair: function (o) {
      return shadow(50, 86, 30, 7) + g(
        '<rect x="24" y="18" width="52" height="34" rx="6" fill="#a9877a"/>' +
        '<rect x="20" y="48" width="60" height="22" rx="5" fill="#8f6e62"/>' +
        '<path d="M26 70 L24 86 M74 70 L76 86" stroke-width="3.5"/>' +
        '<circle cx="24" cy="88" r="3.5" fill="#7fb7c9"/><circle cx="76" cy="88" r="3.5" fill="#7fb7c9"/>', 3.5);
    },
    table: function (o) { // utilisé seulement pour les tables d'une case (sinon pièce fusionnée)
      const c = o.v || C.table;
      return shadow(50, 84, 38, 8) + g(
        '<rect x="12" y="16" width="76" height="56" rx="5" fill="' + c + '"/>' +
        '<rect x="12" y="62" width="76" height="10" rx="3" fill="' + shade(c, -0.18) + '"/>' +
        '<path d="M20 72 L20 86 M80 72 L80 86" stroke-width="5"/>', 3.5);
    },
    roundtable: function () {
      return shadow(50, 86, 30, 7) + g(
        '<path d="M30 60 L26 86 M70 60 L74 86 M50 64 L50 88" stroke-width="5"/>' +
        '<ellipse cx="50" cy="44" rx="40" ry="30" fill="#5a4640"/>' +
        '<path d="M64 26 Q72 30 76 36" stroke="#8a7670" stroke-width="2.5" fill="none"/>', 3.5);
    },
    desk: function (o) {
      return shadow(50, 84, 36, 7) + g(
        '<rect x="14" y="16" width="72" height="54" rx="6" fill="#7a6660"/>' +
        '<path d="M22 30 L26 60 M40 26 L42 64 M64 28 L62 60" stroke="#9a8680" stroke-width="2" fill="none"/>' +
        '<path d="M20 70 L20 86 M80 70 L80 86" stroke="#6a7d86" stroke-width="5"/>', 3.5);
    },
    shelf: function (o) {
      const c = o.v || C.shelf;
      let books = '';
      const cols = [C.book1, C.book2, C.book3, C.book2, C.book1];
      [26, 46, 66].forEach(function (y, r) {
        for (let i = 0; i < 5; i++) {
          books += '<rect x="' + (19 + i * 12.5) + '" y="' + (y - 12) + '" width="10" height="13" fill="' + cols[(i + r) % 5] + '" stroke-width="1.8"/>';
        }
      });
      return shadow(50, 88, 36, 6) + g(
        '<rect x="12" y="8" width="76" height="80" rx="4" fill="' + c + '"/>' +
        '<rect x="16" y="12" width="68" height="72" rx="2" fill="' + C.shelfDark + '"/>' + books +
        '<path d="M16 28 L84 28 M16 48 L84 48 M16 68 L84 68" stroke-width="3"/>' +
        '<rect x="12" y="8" width="76" height="9" rx="3" fill="' + shade(c, 0.12) + '"/>', 3);
    },
    tv: function (o) {
      return shadow(50, 84, 34, 7) + g(
        '<rect x="18" y="60" width="64" height="18" rx="4" fill="#8a8aa6"/>' +
        '<rect x="14" y="14" width="72" height="54" rx="8" fill="' + C.tv + '"/>' +
        '<rect x="22" y="21" width="56" height="38" rx="5" fill="' + C.screen + '" stroke-width="3"/>' +
        '<path d="M46 50 L46 32 L58 29 L58 46" fill="none" stroke-width="3.5"/>' +
        '<circle cx="42" cy="50" r="4.5" fill="' + O + '"/><circle cx="54" cy="46" r="4.5" fill="' + O + '"/>', 3.5);
    },
    plant: function (o) {
      return shadow(50, 86, 26, 7) + g(
        '<path d="M50 56 C40 30 22 26 14 18 C30 22 44 30 50 50 C48 26 40 12 42 4 C50 16 56 30 52 52 C58 28 70 16 84 12 C74 24 62 36 54 56 Z" fill="' + C.plant + '"/>' +
        '<path d="M50 56 C34 40 18 44 10 40 C26 38 40 42 50 54 C62 40 78 38 90 40 C80 46 66 46 52 58 Z" fill="' + C.plantDark + '"/>' +
        '<path d="M30 56 L70 56 L64 86 L36 86 Z" fill="' + C.pot + '"/>' +
        '<ellipse cx="50" cy="57" rx="21" ry="5" fill="' + shade(C.pot, -0.25) + '" stroke-width="3"/>', 3.2);
    },
    flowerpot: function () {
      return shadow(50, 88, 28, 6) + g(
        '<ellipse cx="50" cy="80" rx="30" ry="9" fill="#f6eee6"/>' +
        '<path d="M26 54 L74 54 L68 80 L32 80 Z" fill="#f6f0ea"/><path d="M30 64 L70 64" stroke="#d84a4a" stroke-width="5"/>' +
        '<path d="M50 54 C30 50 16 40 20 30 C32 30 40 40 50 46 C50 30 44 18 52 12 C60 20 56 34 54 46 C62 36 72 28 82 32 C82 44 68 52 52 56 Z" fill="#5fae5f"/>' +
        flowerHead(36, 30, '#e84a4a') + flowerHead(60, 26, '#e84a4a') + flowerHead(48, 42, '#d83a3a') + flowerHead(70, 42, '#e84a4a') + flowerHead(26, 44, '#e05050'), 3);
    },
    present: function (o) {
      const c = o.v || C.gift;
      return shadow(50, 86, 34, 7) + g(
        '<rect x="16" y="38" width="68" height="46" rx="4" fill="' + c + '"/>' +
        '<rect x="12" y="30" width="76" height="16" rx="3" fill="' + shade(c, 0.1) + '"/>' +
        '<rect x="44" y="30" width="12" height="54" fill="' + C.ribbon + '" stroke-width="3"/>' +
        '<path d="M50 30 C36 12 22 18 30 28 C34 32 44 31 50 30 C56 31 66 32 70 28 C78 18 64 12 50 30 Z" fill="' + C.ribbon + '"/>', 3.2);
    },
    register: function () {
      return shadow(50, 86, 34, 7) + g(
        '<rect x="14" y="52" width="72" height="32" rx="5" fill="#5f5f6e"/>' +
        '<path d="M22 52 L28 22 L72 22 L78 52 Z" fill="#8a8a9a"/>' +
        '<rect x="30" y="8" width="40" height="16" rx="3" fill="#cfe6f0"/>' +
        '<g stroke-width="2"><rect x="34" y="28" width="9" height="7" fill="#fff"/><rect x="46" y="28" width="9" height="7" fill="#fff"/><rect x="58" y="28" width="9" height="7" fill="#fff"/>' +
        '<rect x="34" y="38" width="9" height="7" fill="#fff"/><rect x="46" y="38" width="9" height="7" fill="#fff"/><rect x="58" y="38" width="9" height="7" fill="#fff"/></g>' +
        '<rect x="22" y="62" width="56" height="8" rx="2" fill="#3f3f4c"/>', 3.2);
    },
    teddy: function () {
      return shadow(50, 88, 30, 7) + g(
        '<circle cx="30" cy="20" r="10" fill="#c99560"/><circle cx="66" cy="20" r="10" fill="#c99560"/>' +
        '<ellipse cx="50" cy="66" rx="24" ry="20" fill="#c99560"/>' +
        '<ellipse cx="28" cy="80" rx="12" ry="8" fill="#c99560"/><ellipse cx="72" cy="80" rx="12" ry="8" fill="#c99560"/>' +
        '<circle cx="48" cy="34" r="22" fill="#d6a46c"/>' +
        '<ellipse cx="56" cy="40" rx="10" ry="7" fill="#f2d2a8" stroke-width="2.5"/>' +
        '<circle cx="42" cy="30" r="2.6" fill="' + O + '"/><circle cx="56" cy="29" r="2.6" fill="' + O + '"/><circle cx="60" cy="38" r="3" fill="' + O + '"/>', 3.2);
    },
    tree: function (o) {
      const c = o.v || '#6fbf8f';
      return shadow(50, 88, 30, 8) + g(
        '<rect x="44" y="72" width="12" height="14" fill="#7a5a50"/>' +
        '<path d="M50 6 C38 10 30 22 34 30 C22 34 18 46 24 52 C14 58 14 72 30 76 L70 76 C86 72 86 58 76 52 C82 46 78 34 66 30 C70 22 62 10 50 6 Z" fill="' + c + '"/>' +
        '<path d="M34 30 C42 36 58 36 66 30 M24 52 C36 60 64 60 76 52" fill="none" stroke-width="3"/>', 3.2);
    },
    snowtree: function () {
      return ICONS.tree({ v: '#ffffff' });
    },
    xmastree: function () {
      return shadow(50, 90, 32, 6) + g(
        '<rect x="44" y="76" width="12" height="12" fill="#8a5a40"/>' +
        '<path d="M50 10 L22 50 L34 50 L14 78 L86 78 L66 50 L78 50 Z" fill="#4f9e63"/>' +
        '<path d="M44 12 L50 2 L56 12 L66 12 L58 18 L61 28 L50 22 L39 28 L42 18 L34 12 Z" fill="#f6d84a" stroke-width="2.5"/>', 3) +
        '<circle cx="40" cy="44" r="4" fill="#e84a4a"/><circle cx="60" cy="58" r="4" fill="#4a8ae8"/><circle cx="36" cy="66" r="4" fill="#f6d84a"/><circle cx="62" cy="38" r="3.5" fill="#f6d84a"/><circle cx="52" cy="70" r="4" fill="#e84a4a"/>';
    },
    trash: function () {
      return shadow(50, 88, 24, 6) + g(
        '<path d="M28 30 L72 30 L66 84 L34 84 Z" fill="#7fb7c9"/>' +
        '<path d="M40 38 L42 76 M50 38 L50 76 M60 38 L58 76" stroke-width="2.5"/>' +
        '<ellipse cx="50" cy="30" rx="24" ry="7" fill="#5f97a9"/>', 3.2);
    },
    door: function (o) {
      const d = o.dir || 'l';
      const st = ' fill="#8a87b8" stroke="' + O + '" stroke-width="3"';
      if (d === 't' || d === 'b') {
        return '<g transform="translate(0,' + (d === 'b' ? 100 : 0) + ')"><rect x="16" y="-7" width="68" height="14" rx="6"' + st + '/><rect x="24" y="-2.5" width="52" height="5" rx="2" fill="#ffffff"/></g>';
      }
      return '<g transform="translate(' + (d === 'r' ? 100 : 0) + ',0)"><rect x="-7" y="16" width="14" height="68" rx="6"' + st + '/><rect x="-2.5" y="24" width="5" height="52" rx="2" fill="#ffffff"/></g>';
    },
    window: function () {
      return '<g transform="translate(-4,0)">' + g('<rect x="0" y="10" width="16" height="80" rx="3" fill="#c9a0a0"/>' +
        '<rect x="4" y="16" width="10" height="68" fill="#f6eed0" stroke-width="2.5"/><path d="M4 50 L14 50" stroke-width="2.5"/>', 3) + '</g>';
    },
    box: function () {
      return shadow(50, 88, 36, 6) + g(
        '<rect x="14" y="16" width="72" height="70" rx="3" fill="#bfa070"/>' +
        '<rect x="14" y="16" width="72" height="16" rx="3" fill="#d8bc86"/>' +
        '<path d="M50 16 L50 86" stroke-width="3"/>', 3.2);
    },
    bonsai: function () {
      return shadow(50, 90, 28, 6) + g(
        '<path d="M28 70 L72 70 L66 88 L34 88 Z" fill="#a98cc6"/>' +
        '<path d="M50 70 C48 58 40 52 34 46 M50 70 C54 56 60 48 70 44" fill="none" stroke="#6a4a3a" stroke-width="6"/>' +
        '<ellipse cx="34" cy="38" rx="20" ry="12" fill="#7a9a5a"/><ellipse cx="66" cy="32" rx="22" ry="13" fill="#8aaa6a"/><ellipse cx="50" cy="18" rx="16" ry="10" fill="#7a9a5a"/>', 3);
    },
    cactus: function () {
      return shadow(50, 90, 26, 6) + g(
        '<path d="M42 90 L42 20 Q42 8 50 8 Q58 8 58 20 L58 90 Z" fill="#8cc06a"/>' +
        '<path d="M42 56 L30 56 Q22 56 22 46 L22 32 Q22 26 28 26 Q34 26 34 32 L34 46 L42 46" fill="#8cc06a"/>' +
        '<path d="M58 48 L70 48 Q78 48 78 38 L78 26 Q78 20 72 20 Q66 20 66 26 L66 38 L58 38" fill="#8cc06a"/>', 3.2);
    },
    shrub: function () {
      return shadow(50, 86, 34, 8) + g(
        '<path d="M50 80 C30 82 12 74 14 60 C6 52 14 38 26 40 C24 26 40 20 48 30 C54 18 72 22 72 36 C86 34 92 52 84 60 C88 74 70 82 50 80 Z" fill="#7fcf6a"/>' +
        '<path d="M30 60 L44 48 M50 66 L56 46 M68 60 L60 48 M38 72 L50 58" stroke-width="2.5" fill="none"/>', 3.2);
    },
    flower: function () {
      return shadow(50, 86, 34, 8) + g(
        '<path d="M50 82 C26 84 10 70 16 54 C10 38 30 24 42 30 C50 16 72 20 72 34 C88 34 92 54 82 64 C80 78 66 84 50 82 Z" fill="#4f9a6a"/>', 3) +
        flowerHead(32, 44, '#8a6ac0', '#c9b0f0') + flowerHead(54, 36, '#8a6ac0', '#c9b0f0') + flowerHead(70, 52, '#7a5ab0', '#c9b0f0') +
        flowerHead(44, 62, '#8a6ac0', '#c9b0f0') + flowerHead(62, 68, '#7a5ab0', '#c9b0f0') + flowerHead(26, 64, '#8a6ac0', '#c9b0f0');
    },
    flowers: function () {
      return shadow(50, 86, 34, 8) + g(
        '<path d="M50 84 C26 86 10 72 16 56 C10 40 30 26 42 32 C50 18 72 22 72 36 C88 36 92 56 82 66 C80 80 66 86 50 84 Z" fill="#5fae6a"/>', 3) +
        flowerHead(32, 44, '#d84a5a') + flowerHead(54, 36, '#e05a6a') + flowerHead(70, 52, '#d84a5a') +
        flowerHead(44, 62, '#e05a6a') + flowerHead(62, 68, '#d84a5a') + flowerHead(26, 64, '#e05a6a');
    },
    lily: function () {
      return g('<path d="M50 50 L86 40 A38 26 0 1 1 82 60 Z" fill="#4f9e5a"/>' +
        '<path d="M50 50 L22 42 M50 50 L28 66 M50 50 L60 74" stroke="#2f6e3a" stroke-width="2.5"/>', 3.5);
    },
    statue: function () {
      return shadow(50, 90, 30, 6) + g(
        '<rect x="22" y="72" width="56" height="16" rx="2" fill="#4a5680"/>' +
        '<path d="M42 14 Q50 4 58 14 Q60 22 54 26 Q66 34 62 52 Q66 62 60 72 L40 72 Q36 60 42 50 Q34 36 46 26 Q40 22 42 14 Z" fill="' + C.statue + '"/>' +
        '<path d="M46 34 Q54 40 52 50 M44 58 Q50 62 56 58" fill="none" stroke-width="2.5"/>', 3.2);
    },
    easel: function (o) {
      const art = o.v === 'smiley' ? '<circle cx="50" cy="34" r="10" fill="none" stroke="#a090d0" stroke-width="2.5"/><circle cx="46" cy="32" r="1.5" fill="#a090d0"/><circle cx="54" cy="32" r="1.5" fill="#a090d0"/><path d="M45 37 Q50 41 55 37" stroke="#a090d0" stroke-width="2" fill="none"/>' : '';
      return shadow(50, 90, 30, 6) + g(
        '<path d="M30 88 L42 20 M70 88 L58 20 M50 20 L50 84" stroke="' + C.easel + '" stroke-width="7"/>' +
        '<path d="M30 88 L42 20 M70 88 L58 20 M50 20 L50 84" fill="none" stroke-width="2"/>' +
        '<rect x="20" y="14" width="60" height="44" rx="2" fill="' + C.canvas + '"/>' + art +
        '<rect x="18" y="56" width="64" height="8" rx="2" fill="' + C.easel + '"/>' +
        '<rect x="44" y="6" width="12" height="10" rx="2" fill="' + C.easel + '"/>', 3);
    },
    framed: function (o) {
      const art = o.v === 'art' ? '<path d="M32 50 Q36 34 40 48 M48 52 Q54 32 58 50 M64 44 Q68 38 70 50" stroke-width="5" fill="none" stroke="#4a7ac0"/><path d="M48 52 Q54 32 58 50" stroke="#c84a4a" stroke-width="5" fill="none"/>' : '';
      return g('<rect x="14" y="22" width="72" height="54" rx="3" fill="' + C.framed + '"/>' +
        '<rect x="22" y="30" width="56" height="38" fill="#ffffff" stroke-width="3"/>', 3.5) + art;
    },
    oil: function () {
      return '<path d="M20 58 C10 44 26 34 36 38 C40 26 62 26 64 38 C78 32 90 46 80 56 C88 66 74 76 62 70 C56 82 34 80 32 70 C18 74 10 64 20 58 Z" fill="#3a3a40"/>' +
        '<circle cx="18" cy="30" r="4" fill="#3a3a40"/><circle cx="84" cy="30" r="5" fill="#3a3a40"/><ellipse cx="78" cy="82" rx="7" ry="3.5" fill="#3a3a40"/><ellipse cx="22" cy="84" rx="6" ry="3" fill="#3a3a40"/>' +
        '<ellipse cx="42" cy="48" rx="8" ry="3" fill="#5a5a62"/>';
    },
    crumbs: function () {
      const pts = [[24, 30, 7], [48, 22, 5], [70, 34, 8], [34, 52, 5], [60, 56, 7], [80, 62, 5], [28, 74, 6], [52, 78, 5], [74, 84, 4], [16, 50, 3], [44, 40, 3], [86, 44, 3]];
      return pts.map(function (p) {
        return '<path d="M' + (p[0] - p[2]) + ' ' + p[1] + ' q' + p[2] * 0.4 + ' -' + p[2] + ' ' + p[2] * 1.4 + ' -' + p[2] * 0.6 + ' q' + p[2] * 0.8 + ' ' + p[2] * 0.8 + ' -' + p[2] * 0.2 + ' ' + p[2] * 1.4 + ' q-' + p[2] * 1.2 + ' ' + p[2] * 0.2 + ' -' + p[2] * 1.2 + ' -' + p[2] * 0.8 + ' z" fill="#b88850" stroke="' + O + '" stroke-width="2.2"/>';
      }).join('');
    },
    tee: function () {
      return g('<ellipse cx="50" cy="62" rx="30" ry="18" fill="#6fcf6f"/>' +
        '<ellipse cx="50" cy="62" rx="18" ry="9" fill="#4faf5f" stroke-width="2"/>', 3) +
        g('<path d="M50 62 L50 46" stroke-width="3"/><circle cx="50" cy="40" r="8" fill="#ffffff"/>', 3);
    },
    flag: function (o) {
      const c = o.v || '#e05a6a';
      return shadow(46, 86, 12, 5) + g('<path d="M44 86 L44 18" stroke-width="5"/><path d="M44 86 L44 18" stroke="#ffffff" stroke-width="2"/>' +
        '<path d="M46 18 L80 22 L78 40 L46 38 Z" fill="' + c + '"/>' +
        '<ellipse cx="44" cy="86" rx="10" ry="4" fill="#7a5a50"/>', 3);
    },
    cart: function () {
      return shadow(50, 88, 38, 6) + g(
        '<rect x="12" y="10" width="62" height="14" rx="2" fill="#eef6f8"/>' +
        '<path d="M18 24 L18 56 M66 24 L66 50" stroke-width="3"/>' +
        '<path d="M10 74 L10 54 Q10 46 20 46 L56 46 Q64 46 70 54 L86 60 Q92 64 90 74 Z" fill="#eef6f8"/>' +
        '<path d="M24 48 L24 66 M32 48 L32 66" stroke-width="2.5"/>' +
        '<circle cx="26" cy="78" r="9" fill="#8ab8c0"/><circle cx="74" cy="78" r="9" fill="#8ab8c0"/>', 3);
    },
    car: function (o, w, h) { // pièce 200 × 100 (ou 100 × 200 si verticale)
      const c = o.v || '#aab8f5';
      return shadow(100, 86, 90, 10) + g(
        '<path d="M8 70 L8 50 Q8 40 22 38 L52 34 L76 12 Q82 8 92 8 L136 8 Q146 8 152 14 L172 34 Q192 36 194 50 L194 70 Z" fill="' + c + '"/>' +
        '<path d="M84 16 L94 16 L94 34 L66 34 Z M102 16 L134 16 Q140 16 144 20 L158 34 L102 34 Z" fill="#3a3a48" stroke-width="3"/>' +
        '<path d="M60 46 L150 46 M100 36 L100 66" stroke-width="2.5" fill="none"/>' +
        '<rect x="70" y="50" width="20" height="5" rx="2" fill="#3a3a48" stroke-width="2"/>' +
        '<circle cx="48" cy="72" r="14" fill="#4a4a58"/><circle cx="48" cy="72" r="6" fill="#9a9aa8" stroke-width="2"/>' +
        '<circle cx="156" cy="72" r="14" fill="#4a4a58"/><circle cx="156" cy="72" r="6" fill="#9a9aa8" stroke-width="2"/>' +
        '<rect x="186" y="50" width="8" height="8" fill="#fff" stroke-width="2"/>', 3.5);
    },
    bed: function (o) { // pièce 200 × 100 : oreiller à gauche
      const c = o.v || '#a8c98a';
      return shadow(100, 90, 92, 8) + g(
        '<rect x="6" y="8" width="188" height="80" rx="6" fill="#f2f2f6"/>' +
        '<rect x="14" y="16" width="44" height="64" rx="10" fill="#ffffff"/>' +
        '<path d="M22 22 L22 74" stroke="#d8d8e2" stroke-width="3"/>' +
        '<rect x="70" y="8" width="124" height="80" rx="6" fill="' + c + '"/>' +
        '<path d="M70 20 L194 20" stroke="' + shade(c, -0.15) + '" stroke-width="3"/>', 3.5);
    },
    house: function () {
      return shadow(50, 88, 34, 6) + g('<path d="M16 46 L50 16 L84 46 Z" fill="#a85a5a"/><rect x="22" y="44" width="56" height="40" fill="#e8c8a8"/><rect x="42" y="60" width="16" height="24" fill="#7a4a3a"/>', 3.2);
    },
    shark: function () {
      return g('<path d="M20 70 Q50 64 80 70" fill="none" stroke="#5a8ab0" stroke-width="3"/><path d="M34 68 Q48 30 66 20 Q60 44 66 68 Z" fill="#4a5a6a"/>', 3);
    },
    boulder: function () {
      return shadow(50, 84, 36, 7) + g('<path d="M16 76 C10 56 22 30 46 26 C70 22 90 44 86 70 C80 82 26 86 16 76 Z" fill="#a8a29a"/><path d="M40 40 Q50 36 58 44" fill="none" stroke-width="2.5"/>', 3.2);
    },
    rock: function () { return ICONS.boulder(); },
    animal: function (o) {
      return shadow(50, 84, 36, 7) + g('<ellipse cx="50" cy="56" rx="34" ry="22" fill="#9a9aa8"/><circle cx="24" cy="40" r="14" fill="#9a9aa8"/>', 3.2);
    },
    lion: function () {
      return shadow(50, 84, 38, 6) + g(
        '<path d="M30 52 Q30 40 46 40 L76 40 Q88 42 88 56 L88 78 M80 78 L80 62 M36 78 L36 62 M44 78 L44 62" fill="#f0d898" stroke-width="3"/>' +
        '<path d="M28 52 L88 52 L88 70 Q60 74 30 70 Z" fill="#f0d898"/>' +
        '<path d="M88 50 Q98 52 96 62" fill="none" stroke-width="3"/>' +
        '<circle cx="28" cy="40" r="20" fill="#e2b86a"/><circle cx="24" cy="42" r="12" fill="#f6dfa4"/>' +
        '<path d="M14 46 L20 46" stroke-width="2.5"/><circle cx="20" cy="38" r="2" fill="' + O + '"/>', 3);
    },
    penguin: function () {
      return shadow(50, 88, 22, 5) + g(
        '<path d="M50 8 Q66 10 66 34 Q72 60 64 86 L36 86 Q28 60 34 34 Q34 10 50 8 Z" fill="#2b2838"/>' +
        '<path d="M50 26 Q60 30 60 48 Q62 66 56 84 L44 84 Q40 64 42 46 Q42 30 50 26 Z" fill="#ffffff" stroke-width="2"/>' +
        '<path d="M60 18 L74 22 L60 26 Z" fill="#f2b84a" stroke-width="2"/>' +
        '<circle cx="54" cy="18" r="2.4" fill="#fff" stroke="none"/>', 3);
    },
    bear: function () {
      return shadow(50, 84, 38, 6) + g(
        '<path d="M16 60 Q14 34 40 32 L70 30 Q84 30 86 44 Q90 52 84 58 L84 80 L74 80 L72 66 L40 66 L38 80 L26 80 L24 66 Q16 66 16 60 Z" fill="#c9a07a"/>' +
        '<circle cx="80" cy="30" r="5" fill="#c9a07a"/><circle cx="84" cy="46" r="2.4" fill="' + O + '"/>' +
        '<ellipse cx="92" cy="52" rx="5" ry="4" fill="#2b2838"/>', 3);
    },
    crocodile: function () {
      return shadow(50, 74, 44, 5) + g(
        '<path d="M6 62 Q20 52 40 54 L62 50 Q74 44 96 46 Q98 50 90 54 L70 56 Q74 62 64 64 L40 66 L36 74 L30 66 Q16 68 6 62 Z" fill="#7acb6a"/>' +
        '<path d="M44 56 L48 52 M54 54 L58 50 M64 52 L68 48" stroke-width="2.5"/>' +
        '<circle cx="74" cy="48" r="2" fill="' + O + '"/>', 3);
    },
    elephant: function () { // pièce 200 × 200
      return shadow(100, 176, 86, 14) + g(
        '<path d="M40 90 Q40 46 96 44 Q140 42 150 74 L152 160 L134 160 L132 128 L72 130 L70 162 L50 162 L48 124 Q36 116 40 90 Z" fill="#c9dce4"/>' +
        '<path d="M128 56 Q176 50 178 96 Q180 120 168 150 Q164 168 176 172 Q160 176 158 158 Q156 132 150 120" fill="#c9dce4"/>' +
        '<path d="M120 60 Q100 86 116 112 Q140 120 148 92 Q150 66 128 56 Z" fill="#b4ccd8"/>' +
        '<path d="M150 112 Q166 118 172 108" fill="none" stroke="#ffffff" stroke-width="6"/>' +
        '<circle cx="156" cy="84" r="4" fill="' + O + '"/>' +
        '<path d="M40 92 Q28 100 30 118" fill="none" stroke-width="4"/>', 5);
    },
    palm: function () {
      return shadow(50, 88, 24, 6) + g(
        '<path d="M48 86 Q44 60 52 34" fill="none" stroke="#c9a070" stroke-width="10"/>' +
        '<path d="M48 86 Q44 60 52 34" fill="none" stroke-width="2.5"/>' +
        '<path d="M52 32 Q30 18 12 34 Q30 26 52 34 Q40 10 54 4 Q56 20 54 32 Q72 12 90 20 Q72 22 56 34 Q80 32 90 50 Q72 38 54 36 Q62 56 54 66 Q52 50 52 36 Q34 44 20 62 Q30 42 50 34 Z" fill="#6fc84a"/>', 2.5);
    }
  };

  function flowerHead(x, y, c, center) {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      s += '<circle cx="' + (x + Math.cos(a) * 5).toFixed(1) + '" cy="' + (y + Math.sin(a) * 5).toFixed(1) + '" r="4.6" fill="' + c + '" stroke="' + O + '" stroke-width="1.6"/>';
    }
    return s + '<circle cx="' + x + '" cy="' + y + '" r="2.6" fill="' + (center || '#f6e08a') + '"/>';
  }

  // Éclaircit (+) ou assombrit (-) une couleur hexadécimale
  function shade(hex, amt) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (x) { return x + x; }).join('');
    const n = parseInt(h, 16);
    let r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
    function f(v) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); }
    r = f(r); gg = f(gg); b = f(b);
    return '#' + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1);
  }

  // Types dessinés comme surfaces fusionnées (pièces multi-cases) plutôt qu'icônes
  const SURFACES = { table: true, desk: true, carpet: true, path: true, sand: true, water: true };
  // Types qui s'étirent sur 2 cases (icône 200 × 100)
  const LONG = { car: true, bed: true };
  // Types qui occupent un carré de 2 × 2 cases (icône 200 × 200)
  const BIG = { elephant: true };

  // Noms français des objets (légende, info-bulles)
  const NAMES = {
    chair: 'Chaise', armchair: 'Fauteuil', schoolchair: 'Chaise', table: 'Table', roundtable: 'Table', desk: 'Bureau',
    shelf: 'Étagère', tv: 'Télé', plant: 'Plante', flowerpot: 'Plante', present: 'Cadeau', register: 'Caisse',
    teddy: 'Peluche', tree: 'Arbre', snowtree: 'Arbre', xmastree: 'Sapin', trash: 'Corbeille', door: 'Porte',
    window: 'Fenêtre', box: 'Caisse', bonsai: 'Bonsaï', cactus: 'Cactus', shrub: 'Arbuste', flower: 'Fleurs',
    flowers: 'Fleurs', lily: 'Nénuphar', statue: 'Statue', easel: 'Chevalet', framed: 'Tableau encadré', oil: "Tache d'huile",
    crumbs: 'Miettes', tee: 'Départ', flag: 'Drapeau', cart: 'Voiturette', car: 'Voiture', bed: 'Lit', carpet: 'Tapis',
    path: 'Chemin', sand: 'Sable', water: 'Eau', house: 'Maison', shark: 'Requin', boulder: 'Rocher', rock: 'Rocher',
    lion: 'Lion', penguin: 'Manchot', bear: 'Ours', crocodile: 'Crocodile', elephant: 'Éléphant', palm: 'Palmier', animal: 'Animal'
  };

  root.MurdokuIcons = { ICONS: ICONS, SURFACES: SURFACES, LONG: LONG, BIG: BIG, NAMES: NAMES, shade: shade, OUTLINE: O, palette: C };
})(typeof window !== 'undefined' ? window : this);
