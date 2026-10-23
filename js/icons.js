/* Murdoku — icônes SVG des objets de la scène de crime.
 * Chaque icône est dessinée dans un repère 100 × 100 (une case) et mise à l'échelle par le plateau.
 * Style : aplats de couleur en trois tons (base, lumière, ombre), contour sombre arrondi, ombre portée douce.
 * Règle de lisibilité : un objet doit rester reconnaissable à 24 px de large ; les détails fins ne servent
 * qu'à l'agrandissement et ne portent jamais l'identité de l'objet.
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
  // trait de lumière (sans contour)
  function hl(d, w, op) {
    return '<path d="' + d + '" fill="none" stroke="#ffffff" stroke-opacity="' + (op || 0.55) + '" stroke-width="' + (w || 3) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  // trait fin sans contour sombre (détail)
  function ln(d, col, w) {
    return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  // Palette par défaut des objets (surchargée par le thème)
  const C = {
    chair: '#e9e6f2', chairDark: '#c4bfd6', table: '#6e6a86', tableTop: '#857f9e', wood: '#b98a5a',
    shelf: '#7aa2b8', shelfDark: '#4d6f84', book1: '#9aa7e8', book2: '#e8e4f6', book3: '#5b6aa8',
    tv: '#5a5a72', screen: '#d8f1ff', plant: '#7fcf8f', plantDark: '#4f9e63', pot: '#8a6a8e',
    statue: '#5a6a96', easel: '#9a7650', canvas: '#ffffff', framed: '#6a5a4a', gift: '#4fae9a', ribbon: '#aee6f2'
  };

  // Éventail de feuilles autour d'un point (x, y) : [angle, longueur, largeur]
  function leaves(x, y, list, fill, rib) {
    return list.map(function (l) {
      const a = l[0], L = l[1], w = l[2];
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')">' +
        '<path d="M0 0 C' + (-w) + ' ' + (-L * 0.3) + ' ' + (-w * 0.7) + ' ' + (-L * 0.85) + ' 0 ' + (-L) + ' C' + (w * 0.7) + ' ' + (-L * 0.85) + ' ' + w + ' ' + (-L * 0.3) + ' 0 0 Z" fill="' + (l[3] || fill) + '"/>' +
        '<path d="M0 -3 L0 ' + (-L * 0.82) + '" stroke="' + rib + '" stroke-width="2" fill="none"/></g>';
    }).join('');
  }

  const ICONS = {
    // Fauteuil vu de face : dossier haut capitonné, assise, accoudoirs, pieds en bois
    chair: function (o) {
      const c = o.v || C.chair, d = shade(c, -0.14), l = shade(c, 0.35);
      return shadow(50, 87, 34, 7) + g(
        '<rect x="20" y="76" width="9" height="12" rx="3" fill="#8a6a50"/><rect x="71" y="76" width="9" height="12" rx="3" fill="#8a6a50"/>' +
        '<path d="M25 54 V30 Q25 9 50 9 Q75 9 75 30 V54 Z" fill="' + c + '"/>' +
        '<path d="M33 50 V31 Q33 18 50 18 Q67 18 67 31 V50 Z" fill="' + l + '" stroke-width="2.4"/>' +
        '<rect x="19" y="50" width="62" height="28" rx="10" fill="' + c + '"/>' +
        '<rect x="27" y="54" width="46" height="15" rx="6" fill="' + d + '" stroke-width="2.4"/>' +
        '<rect x="9" y="40" width="17" height="40" rx="8.5" fill="' + c + '"/><rect x="74" y="40" width="17" height="40" rx="8.5" fill="' + c + '"/>', 3.4) +
        ln('M50 24 V44', d, 2) + '<circle cx="50" cy="24" r="2.4" fill="' + d + '"/><circle cx="50" cy="44" r="2.4" fill="' + d + '"/>' +
        hl('M13 48 V62', 2.4, 0.7) + hl('M78 48 V62', 2.4, 0.7);
    },
    // Table d'une case (légende) : plateau mince, tranche, quatre pieds bien visibles — voir surface() pour les tables fusionnées
    table: function (o) {
      const c = o.v || C.table;
      return shadow(50, 90, 36, 6) + g(
        '<rect x="20" y="62" width="8" height="26" rx="2" fill="' + shade(c, -0.45) + '"/><rect x="72" y="62" width="8" height="26" rx="2" fill="' + shade(c, -0.45) + '"/>' +
        '<rect x="12" y="32" width="76" height="40" rx="5" fill="' + shade(c, -0.28) + '"/>' +
        '<rect x="12" y="22" width="76" height="40" rx="5" fill="' + c + '"/>', 3.4) +
        hl('M20 30 H80', 2.6, 0.45);
    },
    shelf: function (o) {
      if (o.style === 'wood') return woodShelf();
      const c = o.v || C.shelf;
      const cols = [C.book1, '#e8c46a', C.book3, C.book2, '#c46a8a', '#6fb59a'];
      let books = '';
      [27, 47, 67].forEach(function (y, r) {
        let x = 19;
        for (let i = 0; i < 6; i++) {
          const w = 8 + ((i * 3 + r) % 3) * 2, h = 12 + ((i + r * 2) % 3) * 2;
          books += '<rect x="' + x + '" y="' + (y - h + 2) + '" width="' + w + '" height="' + h + '" fill="' + cols[(i + r * 2) % 6] + '" stroke-width="1.8"/>';
          x += w + 1.2;
          if (x > 78) break;
        }
      });
      return shadow(50, 91, 38, 6) + g(
        '<rect x="12" y="8" width="76" height="82" rx="4" fill="' + c + '"/>' +
        '<rect x="17" y="14" width="66" height="72" rx="2" fill="' + C.shelfDark + '"/>' + books +
        '<path d="M17 31 H83 M17 51 H83 M17 71 H83" stroke-width="3.4"/>' +
        '<rect x="10" y="6" width="80" height="10" rx="3" fill="' + shade(c, 0.18) + '"/>', 3) +
        hl('M16 11 H70', 2.2, 0.6);
    },
    tv: function (o) {
      return shadow(50, 90, 34, 6) + g(
        '<path d="M42 70 H58 L62 84 H38 Z" fill="#8a8aa6"/><rect x="30" y="82" width="40" height="7" rx="3" fill="#6c6c88"/>' +
        '<rect x="12" y="12" width="76" height="60" rx="8" fill="' + C.tv + '"/>' +
        '<rect x="19" y="19" width="62" height="45" rx="5" fill="' + C.screen + '" stroke-width="2.6"/>', 3.4) +
        '<path d="M23 23 H48 L30 60 H23 Z" fill="#ffffff" opacity=".4"/>' +
        g('<path d="M47 49 V31 L61 27 V45" fill="none" stroke-width="3.4"/><ellipse cx="43" cy="49" rx="5" ry="4" fill="' + O + '"/><ellipse cx="57" cy="45" rx="5" ry="4" fill="' + O + '"/>', 3) +
        '<circle cx="78" cy="68" r="2" fill="#7ee08a"/>';
    },
    // Plante verte : les feuilles sortent bien de la terre du pot, la lèvre avant du pot passe devant
    plant: function () {
      return shadow(50, 91, 28, 5) + g(
        '<path d="M31 64 L69 64 L63 91 L37 91 Z" fill="' + C.pot + '"/>' +
        '<ellipse cx="50" cy="64" rx="19" ry="5" fill="#5a4636" stroke-width="3"/>', 3.2) +
        g(leaves(50, 62, [[-70, 38, 10, C.plantDark], [70, 38, 10, C.plantDark], [-42, 52, 12], [42, 52, 12], [-14, 58, 11, C.plantDark], [14, 58, 11, C.plantDark], [0, 60, 12]], C.plant, C.plantDark), 2.6) +
        g('<rect x="28" y="59" width="44" height="10" rx="4.5" fill="' + shade(C.pot, 0.22) + '"/>', 3.2) +
        hl('M36 74 L39 87', 2.6, 0.45);
    },
    present: function (o) {
      const c = o.v || C.gift, r = C.ribbon;
      return shadow(50, 89, 35, 6) + g(
        '<rect x="16" y="42" width="68" height="46" rx="4" fill="' + c + '"/>' +
        '<rect x="11" y="32" width="78" height="16" rx="3" fill="' + shade(c, 0.12) + '"/>' +
        '<rect x="43" y="32" width="14" height="56" fill="' + r + '" stroke-width="3"/>' +
        '<path d="M50 32 C34 8 14 18 28 30 C36 34 44 33 50 32 Z" fill="' + r + '"/>' +
        '<path d="M50 32 C66 8 86 18 72 30 C64 34 56 33 50 32 Z" fill="' + r + '"/>' +
        '<circle cx="50" cy="31" r="5" fill="' + shade(r, -0.12) + '"/>', 3.2) +
        hl('M20 50 V80', 2.4, 0.4);
    },
    // Tiroir-caisse : afficheur, touches, tiroir à monnaie
    register: function () {
      return shadow(50, 90, 36, 6) + g(
        '<rect x="14" y="62" width="72" height="26" rx="5" fill="#5f5f6e"/>' +
        '<rect x="22" y="70" width="56" height="12" rx="3" fill="#3f3f4c" stroke-width="2.6"/>' +
        '<path d="M16 62 L24 34 H76 L84 62 Z" fill="#9a9aae"/>' +
        '<rect x="28" y="6" width="44" height="20" rx="4" fill="#4a4a5c"/>' +
        '<rect x="32" y="10" width="36" height="12" rx="2" fill="#bdeedc" stroke-width="2.2"/>' +
        '<path d="M44 26 H56 L58 34 H42 Z" fill="#7c7c90" stroke-width="2.4"/>', 3.2) +
        '<g stroke="' + O + '" stroke-width="1.8">' +
        [0, 1, 2].map(function (i) { return [0, 1].map(function (j) { return '<rect x="' + (32 + i * 13) + '" y="' + (38 + j * 10) + '" width="10" height="7" rx="1.5" fill="' + (i === 2 && j === 1 ? '#f2b84a' : '#ffffff') + '"/>'; }).join(''); }).join('') + '</g>' +
        '<rect x="45" y="75" width="10" height="3" rx="1.5" fill="#bfbfd0"/>' +
        ln('M38 15 H46 M50 15 H62', '#3a8a70', 2.4);
    },
    teddy: function () {
      return shadow(50, 90, 30, 6) + g(
        '<circle cx="28" cy="22" r="11" fill="#b9814f"/><circle cx="68" cy="22" r="11" fill="#b9814f"/>' +
        '<ellipse cx="50" cy="68" rx="24" ry="21" fill="#c99560"/>' +
        '<ellipse cx="26" cy="64" rx="8" ry="13" transform="rotate(20 26 64)" fill="#c99560"/><ellipse cx="74" cy="64" rx="8" ry="13" transform="rotate(-20 74 64)" fill="#c99560"/>' +
        '<ellipse cx="34" cy="86" rx="13" ry="7.5" fill="#c99560"/><ellipse cx="66" cy="86" rx="13" ry="7.5" fill="#c99560"/>' +
        '<ellipse cx="50" cy="72" rx="13" ry="12" fill="#f0cf9e" stroke-width="2.4"/>' +
        '<circle cx="48" cy="36" r="23" fill="#d6a46c"/>' +
        '<circle cx="28" cy="22" r="5" fill="#f0cf9e" stroke-width="2"/><circle cx="68" cy="22" r="5" fill="#f0cf9e" stroke-width="2"/>' +
        '<ellipse cx="48" cy="45" rx="11" ry="8" fill="#f2d2a8" stroke-width="2.4"/>' +
        '<circle cx="39" cy="32" r="2.8" fill="' + O + '"/><circle cx="57" cy="32" r="2.8" fill="' + O + '"/><ellipse cx="48" cy="42" rx="4" ry="3" fill="' + O + '"/>' +
        '<path d="M48 45 V48 M43 49 Q48 53 53 49" fill="none" stroke-width="2"/>', 3.2) +
        g('<path d="M36 58 L48 62 L36 68 Z M60 58 L48 62 L60 68 Z" fill="#d84a5a"/><circle cx="48" cy="62" r="3.6" fill="#b83a4a"/>', 2.6);
    },
    // Arbre : couronne en nuages, tronc avec ombre, quelques masses de feuillage plus claires
    tree: function (o) {
      const c = o.v || '#6fbf8f', hi = shade(c, 0.3), lo = shade(c, -0.2);
      const crown = 'M50 6 C38 10 30 22 34 30 C22 34 18 46 24 52 C14 58 14 72 30 76 L70 76 C86 72 86 58 76 52 C82 46 78 34 66 30 C70 22 62 10 50 6 Z';
      return '<g transform="translate(50 50) scale(1.12) translate(-50 -52)">' + shadow(50, 89, 30, 7) + g(
        '<path d="M44 66 L44 86 Q50 89 56 86 L56 66 Z" fill="#7a5a50"/>' +
        '<path d="' + crown + '" fill="' + lo + '"/>', 3.2) +
        '<path d="M50 9 C40 13 34 22 37 29 C27 34 24 44 28 50 C20 56 20 68 31 71 C40 72 64 72 70 70 C80 68 82 58 72 51 C78 45 74 35 63 30 C66 22 60 12 50 9 Z" fill="' + c + '"/>' +
        '<path d="M40 24 C46 16 56 16 60 24 C54 22 46 22 40 24 Z M31 46 C34 40 42 38 46 42 C40 42 35 44 31 46 Z M52 46 C58 40 66 40 70 46 C64 44 58 44 52 46 Z M34 62 C40 58 50 58 56 62 C48 63 40 63 34 62 Z" fill="' + hi + '"/>' +
        g('<path d="M34 30 C42 36 58 36 66 30 M24 52 C36 60 64 60 76 52" fill="none" stroke-width="2.6"/>', 3) +
        '</g>';
    },
    // Arbre enneigé : même silhouette, feuillage blanc bleuté, neige sur les branches
    snowtree: function () {
      return '<g transform="translate(50 50) scale(1.12) translate(-50 -52)">' + shadow(50, 89, 30, 7) + g(
        '<path d="M44 62 L44 86 Q50 89 56 86 L56 62 Z" fill="#7a5a50"/>' +
        '<path d="M50 6 C38 10 30 22 34 30 C22 34 18 46 24 52 C14 58 14 72 30 76 L70 76 C86 72 86 58 76 52 C82 46 78 34 66 30 C70 22 62 10 50 6 Z" fill="#b9d3e6"/>', 3.2) +
        '<path d="M50 9 C40 13 34 22 37 29 C27 34 24 44 28 50 C20 56 20 68 31 71 C40 72 64 72 70 70 C80 68 82 58 72 51 C78 45 74 35 63 30 C66 22 60 12 50 9 Z" fill="#ffffff"/>' +
        '<path d="M38 24 C44 17 56 17 62 24 C54 21 46 21 38 24 Z" fill="#dff0fb"/>' +
        g('<path d="M34 30 C42 36 58 36 66 30 M24 52 C36 60 64 60 76 52" fill="none" stroke-width="2.6"/>', 3) +
        '<circle cx="36" cy="56" r="2.4" fill="#7fc87f"/><circle cx="64" cy="42" r="2.4" fill="#d84a5a"/><circle cx="46" cy="38" r="2.4" fill="#7fc87f"/></g>';
    },
    // Corbeille : bac métallique à nervures, couvercle avec poignée
    trash: function () {
      return shadow(50, 90, 26, 5) + g(
        '<path d="M28 34 L72 34 L66 88 L34 88 Z" fill="#7fb7c9"/>' +
        '<path d="M40 42 L42 80 M50 42 V80 M60 42 L58 80" stroke-width="2.6"/>' +
        '<rect x="24" y="24" width="52" height="12" rx="4" fill="#5f97a9"/>' +
        '<path d="M42 24 Q50 12 58 24" fill="none" stroke-width="4"/>', 3.2) +
        hl('M32 40 L36 80', 2.4, 0.5);
    },
    // Porte posée sur le bord de la case (dir : l, r, t, b) : cadre, battant à panneaux, poignée
    door: function (o) {
      const d = o.dir || 'l';
      const leaf = '<rect x="-9" y="14" width="18" height="72" rx="5" fill="#7a5f8a"/>' +
        '<rect x="-5" y="19" width="10" height="62" rx="3" fill="#b08fc4" stroke-width="2"/>' +
        '<rect x="-3" y="24" width="6" height="22" rx="1.5" fill="#9a78b0" stroke-width="1.4"/><rect x="-3" y="52" width="6" height="24" rx="1.5" fill="#9a78b0" stroke-width="1.4"/>' +
        '<circle cx="2.2" cy="50" r="2.6" fill="#f2c24a" stroke-width="1.6"/>';
      const body = g(leaf, 3);
      if (d === 't' || d === 'b') return '<g transform="translate(100,' + (d === 'b' ? 100 : 0) + ') rotate(90)">' + body + '</g>';
      return '<g transform="translate(' + (d === 'r' ? 100 : 0) + ',0)">' + body + '</g>';
    },
    // Caisse en bois : planches, renforts, couvercle clair
    box: function () {
      return shadow(50, 90, 38, 6) + g(
        '<rect x="12" y="32" width="76" height="56" rx="3" fill="#b98a58"/>' +
        '<path d="M12 12 L88 12 L88 32 L12 32 Z" fill="#d9b680"/>' +
        '<path d="M12 50 H88 M12 69 H88" stroke-width="2.4"/>' +
        '<path d="M12 32 L88 88 M88 32 L12 88" stroke="#8a6238" stroke-width="5"/>' +
        '<path d="M12 32 L88 88 M88 32 L12 88" stroke-width="1.6"/>' +
        '<rect x="12" y="32" width="9" height="56" fill="#8a6238" stroke-width="2.4"/><rect x="79" y="32" width="9" height="56" fill="#8a6238" stroke-width="2.4"/>', 3.2) +
        ln('M30 22 H70', '#b58f56', 2) + '<g fill="#6a4a2a"><circle cx="16.5" cy="40" r="1.8"/><circle cx="16.5" cy="80" r="1.8"/><circle cx="83.5" cy="40" r="1.8"/><circle cx="83.5" cy="80" r="1.8"/></g>';
    },
    // Bonsaï : pot bas à pieds, tronc tourmenté, trois nuages de feuillage
    bonsai: function () {
      return shadow(50, 92, 30, 5) + g(
        '<path d="M26 72 L74 72 L69 88 L31 88 Z" fill="#a98cc6"/>' +
        '<rect x="22" y="66" width="56" height="9" rx="3" fill="#c3a8de"/>' +
        '<rect x="31" y="87" width="8" height="5" fill="#7a5aa0"/><rect x="61" y="87" width="8" height="5" fill="#7a5aa0"/>' +
        '<path d="M50 68 C46 56 38 54 32 46 M50 66 C56 54 62 50 70 44 M49 60 C50 50 50 44 52 34" fill="none" stroke="#6a4a3a" stroke-width="7"/>' +
        '<ellipse cx="32" cy="38" rx="19" ry="11" fill="#6f9a52"/><ellipse cx="68" cy="34" rx="21" ry="12" fill="#7fae5f"/><ellipse cx="50" cy="20" rx="17" ry="10" fill="#6f9a52"/>', 3) +
        '<ellipse cx="29" cy="34" rx="9" ry="3.6" fill="#a8d484"/><ellipse cx="66" cy="30" rx="10" ry="3.6" fill="#b8e090"/><ellipse cx="48" cy="16" rx="8" ry="3" fill="#a8d484"/>' +
        ln('M30 78 H70', '#8a6cae', 2);
    },
    cactus: function () {
      return shadow(50, 91, 26, 5) + g(
        '<path d="M41 90 V20 Q41 8 50 8 Q59 8 59 20 V90 Z" fill="#7fbf5a"/>' +
        '<path d="M41 58 H32 Q22 58 22 48 V34 Q22 27 28 27 Q34 27 34 34 V46 H41" fill="#7fbf5a"/>' +
        '<path d="M59 50 H68 Q78 50 78 40 V28 Q78 21 72 21 Q66 21 66 28 V40 H59" fill="#7fbf5a"/>', 3.2) +
        ln('M50 12 V88 M45.5 18 V88 M54.5 18 V88', '#4f8a3a', 1.8) +
        '<g stroke="#f6f0d0" stroke-width="1.8" stroke-linecap="round">' +
        '<path d="M44 30 l-3 -2 M56 40 l3 -2 M44 52 l-3 -2 M56 64 l3 -2 M44 74 l-3 -2 M25 36 l-3 -2 M75 32 l3 -2"/></g>' +
        '<circle cx="50" cy="8" r="4.6" fill="#f06a9a" stroke="' + O + '" stroke-width="2"/>';
    },
    shrub: function () {
      return shadow(50, 88, 36, 7) + g(
        '<path d="M50 82 C30 84 12 76 14 62 C6 54 14 40 26 42 C24 28 40 22 48 32 C54 20 72 24 72 38 C86 36 92 54 84 62 C88 76 70 84 50 82 Z" fill="#6fb85a"/>', 3.2) +
        '<path d="M24 56 C28 46 38 44 44 50 C38 50 30 52 24 56 Z M52 40 C58 32 68 34 70 42 C64 40 58 40 52 40 Z M40 70 C48 62 60 62 66 70 C58 70 48 70 40 70 Z" fill="#9adf7a"/>' +
        ln('M30 66 L42 56 M50 72 L56 54 M70 66 L62 56 M24 48 L30 52', '#3f8a3f', 2.4) +
        g('<path d="M26 42 L22 36 M72 38 L78 34 M48 32 L50 24" fill="none" stroke-width="2.6"/>', 3);
    },
    // Massifs de fleurs : feuillage, tiges, corolles à cinq pétales
    flower: function () {
      return shadow(50, 88, 36, 7) + g(
        '<path d="M50 84 C26 86 10 72 16 56 C10 40 30 26 42 32 C50 18 72 22 72 36 C88 36 92 56 82 66 C80 80 66 86 50 84 Z" fill="#4f9a6a"/>', 3) +
        '<path d="M22 60 C30 52 40 54 44 62 C36 62 28 62 22 60 Z M58 70 C66 62 78 64 80 70 C72 72 64 72 58 70 Z" fill="#7acb8a"/>' +
        flowerHead(32, 44, '#8a6ac0', '#f6e08a') + flowerHead(54, 38, '#a08ad0', '#f6e08a') + flowerHead(70, 52, '#8a6ac0', '#f6e08a') +
        flowerHead(44, 62, '#a08ad0', '#f6e08a') + flowerHead(62, 68, '#8a6ac0', '#f6e08a') + flowerHead(26, 64, '#a08ad0', '#f6e08a');
    },
    flowers: function () {
      return shadow(50, 88, 36, 7) + g(
        '<path d="M50 84 C26 86 10 72 16 56 C10 40 30 26 42 32 C50 18 72 22 72 36 C88 36 92 56 82 66 C80 80 66 86 50 84 Z" fill="#5fae6a"/>', 3) +
        '<path d="M22 60 C30 52 40 54 44 62 C36 62 28 62 22 60 Z M58 70 C66 62 78 64 80 70 C72 72 64 72 58 70 Z" fill="#8ad88a"/>' +
        flowerHead(32, 44, '#e0485a', '#f6e08a') + flowerHead(54, 38, '#f06a7a', '#f6e08a') + flowerHead(70, 52, '#e0485a', '#f6e08a') +
        flowerHead(44, 62, '#f06a7a', '#f6e08a') + flowerHead(62, 68, '#e0485a', '#f6e08a') + flowerHead(26, 64, '#f06a7a', '#f6e08a');
    },
    // Nénuphar : feuille ronde échancrée, nervures, fleur rose
    lily: function () {
      return g('<path d="M50 52 L77.2 39.3 A30 30 0 1 0 77.2 64.7 Z" fill="#4f9e5a"/>', 3.2) +
        ln('M50 52 L28 40 M50 52 L26 62 M50 52 L40 80 M50 52 L52 24 M50 52 L72 76', '#2f6e3a', 2) +
        '<ellipse cx="34" cy="38" rx="7" ry="3" fill="#ffffff" opacity=".4"/>' +
        g('<path d="M58 50 C54 40 56 34 62 30 C64 38 68 42 68 50 Z" fill="#ffd0e0"/><path d="M58 50 C48 46 46 38 50 34 C56 38 60 42 60 50 Z" fill="#ffe4ee"/><path d="M68 50 C76 46 80 40 78 34 C72 36 68 42 66 50 Z" fill="#ffe4ee"/><circle cx="62" cy="48" r="4" fill="#f6d04a"/>', 2.2);
    },
    // Statue : buste de marbre sombre sur piédestal à gradins
    statue: function () {
      const s = C.statue, l = shade(s, 0.28), d = shade(s, -0.22);
      return shadow(50, 92, 30, 5) + g(
        '<rect x="22" y="80" width="56" height="11" rx="2" fill="' + d + '"/>' +
        '<rect x="28" y="70" width="44" height="12" rx="2" fill="' + s + '"/>' +
        '<path d="M36 70 Q34 52 50 48 Q66 52 64 70 Z" fill="' + s + '"/>' +
        '<path d="M44 48 V40 H56 V48 Q50 52 44 48 Z" fill="' + l + '"/>' +
        '<ellipse cx="50" cy="28" rx="13" ry="16" fill="' + l + '"/>' +
        '<path d="M37 26 Q36 10 50 10 Q64 10 63 26 Q58 16 50 17 Q42 16 37 26 Z" fill="' + s + '"/>' +
        '<path d="M44 52 Q50 58 56 52" fill="none" stroke-width="2.4"/>', 3.2) +
        ln('M46 28 H46.1 M54 28 H54.1 M47 35 Q50 37 53 35', O, 2.6) +
        hl('M32 74 H66', 2.4, 0.3);
    },
    // Chevalet en A : trois pieds, planche porte-toile, toile sur pince (v: smiley = toile peinte)
    easel: function (o) {
      const art = o.v === 'smiley' ? '<circle cx="50" cy="34" r="11" fill="#fff6c0" stroke="#a090d0" stroke-width="2.6"/><circle cx="46" cy="31" r="1.8" fill="#a090d0"/><circle cx="54" cy="31" r="1.8" fill="#a090d0"/><path d="M44 38 Q50 44 56 38" stroke="#a090d0" stroke-width="2.4" fill="none"/>' :
        '<path d="M24 50 L36 38 L46 46 L58 32 L76 50 Z" fill="#c9e8d2" stroke="none"/><circle cx="66" cy="26" r="5" fill="#f6dc8a" stroke="none"/>';
      return shadow(50, 91, 32, 5) + g(
        '<path d="M30 90 L40 24 M70 90 L60 24 M50 24 V86" stroke="' + shade(C.easel, -0.3) + '" stroke-width="9"/>' +
        '<path d="M30 90 L40 24 M70 90 L60 24 M50 24 V86" stroke="' + C.easel + '" stroke-width="5"/>' +
        '<rect x="20" y="12" width="60" height="46" rx="2" fill="' + C.canvas + '"/>', 3) +
        '<g>' + art + '</g>' +
        g('<rect x="17" y="56" width="66" height="8" rx="2" fill="' + C.easel + '"/><rect x="43" y="6" width="14" height="9" rx="2" fill="' + C.easel + '"/>', 3) +
        hl('M24 16 H60', 2, 0.7);
    },
    // Tableau encadré : cadre doré à biseau, passe-partout, toile (v: art = tableau coloré)
    framed: function (o) {
      const art = o.v === 'art' ? '<path d="M30 60 Q38 38 46 58 M48 62 Q56 34 62 60 M62 56 Q68 44 72 58" stroke-width="6" fill="none" stroke="#4a7ac0" stroke-linecap="round"/><path d="M48 62 Q56 34 62 60" stroke="#c84a4a" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="68" cy="36" r="5" fill="#f2c24a"/>' : '<path d="M28 58 L42 44 L52 52 L62 40 L72 58 Z" fill="#dbe9f2" stroke="none"/><circle cx="66" cy="38" r="4" fill="#f6dc8a" stroke="none"/>';
      return g('<rect x="12" y="20" width="76" height="58" rx="3" fill="#a07a52"/>' +
        '<rect x="18" y="26" width="64" height="46" rx="1.5" fill="#f2e2b8" stroke-width="2.4"/>' +
        '<rect x="24" y="32" width="52" height="34" fill="#ffffff" stroke-width="3"/>', 3.4) + art +
        hl('M16 24 H60', 2.2, 0.55) + '<path d="M44 20 L50 12 L56 20" fill="none" stroke="' + O + '" stroke-width="2" stroke-linecap="round"/>';
    },
    // Tache d'huile : flaque sombre, reflets irisés
    oil: function () {
      return '<path d="M20 58 C10 44 26 34 36 38 C40 26 62 26 64 38 C78 32 90 46 80 56 C88 66 74 76 62 70 C56 82 34 80 32 70 C18 74 10 64 20 58 Z" fill="#33333a"/>' +
        '<circle cx="18" cy="30" r="4" fill="#33333a"/><circle cx="84" cy="30" r="5" fill="#33333a"/><ellipse cx="78" cy="82" rx="7" ry="3.5" fill="#33333a"/><ellipse cx="22" cy="84" rx="6" ry="3" fill="#33333a"/>' +
        '<ellipse cx="42" cy="48" rx="9" ry="3.2" fill="#6a6a76"/>' +
        ln('M34 60 Q46 66 58 58', '#6fd0c0', 2.4) + ln('M44 64 Q58 70 68 60', '#c07ae0', 2.2) + ln('M52 40 Q62 38 68 46', '#7aa8f0', 2.2);
    },
    // Départ de golf : tertre d'herbe, tee en bois, balle à alvéoles
    tee: function () {
      return g('<ellipse cx="50" cy="68" rx="32" ry="17" fill="#6fcf6f"/><ellipse cx="50" cy="66" rx="20" ry="9" fill="#4faf5f" stroke-width="2"/>', 3) +
        ln('M24 66 l-2 -6 M30 72 l-3 -6 M74 70 l3 -6 M70 76 l2 -6', '#3f8a4f', 2.2) +
        g('<path d="M45 64 L55 64 L52 44 L48 44 Z" fill="#e7a24a" stroke-width="2.4"/><circle cx="50" cy="34" r="12" fill="#ffffff"/>', 3) +
        '<g fill="#c9d4e0"><circle cx="45" cy="31" r="1.8"/><circle cx="52" cy="29" r="1.8"/><circle cx="55" cy="35" r="1.8"/><circle cx="47" cy="38" r="1.8"/></g>';
    },
    // Drapeau de trou : coupelle, mât rayé, fanion ondulant
    flag: function (o) {
      const c = o.v || '#e05a6a';
      return shadow(46, 88, 14, 5) + g(
        '<ellipse cx="44" cy="87" rx="12" ry="4.6" fill="#2b2838"/>' +
        '<path d="M44 86 V16" stroke-width="6"/>', 3) +
        '<path d="M44 86 V16" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>' +
        g('<path d="M46 16 C58 10 66 22 82 16 L78 32 C66 38 58 26 46 34 Z" fill="' + c + '"/>', 3) +
        ln('M50 22 C60 20 68 28 78 24', 'rgba(255,255,255,.55)', 2.4) +
        '<ellipse cx="44" cy="86" rx="9" ry="3" fill="none" stroke="#7a7a8a" stroke-width="1.6"/>';
    },
    // Voiturette de golf : toit, siège, volant, sac de clubs, roues à moyeu
    cart: function () {
      return shadow(50, 91, 40, 5) + g(
        '<rect x="10" y="8" width="66" height="13" rx="3" fill="#eef6f8"/>' +
        '<path d="M16 21 V50 M70 21 V48" stroke-width="3.2"/>' +
        '<path d="M8 76 V56 Q8 46 20 46 H54 Q64 46 70 54 L88 60 Q94 64 92 76 Z" fill="#eef6f8"/>' +
        '<path d="M22 30 H46 V46 H22 Z" fill="#cfe2ea" stroke-width="2.4"/>' +
        '<path d="M56 34 L66 30" stroke-width="3.2"/>' +
        '<path d="M70 54 V40 H78 V54" fill="#6a7a8a" stroke-width="2.4"/>' +
        '<circle cx="24" cy="78" r="10" fill="#4a4a58"/><circle cx="76" cy="78" r="10" fill="#4a4a58"/>', 3) +
        '<circle cx="24" cy="78" r="4.4" fill="#cfd8de" stroke="' + O + '" stroke-width="1.8"/><circle cx="76" cy="78" r="4.4" fill="#cfd8de" stroke="' + O + '" stroke-width="1.8"/>' +
        ln('M28 52 H66', '#9ab8c4', 2) + ln('M74 40 V32 M78 40 L82 32', '#8a6238', 2.4) +
        hl('M12 14 H60', 2.2, 0.8);
    },
    // Voiture (pièce 200 × 100) : carrosserie, vitres, poignées, feux, roues à enjoliveur
    car: function (o) {
      const c = o.v || '#aab8f5', d = shade(c, -0.2), l = shade(c, 0.3);
      return shadow(100, 88, 92, 8) + g(
        '<path d="M6 72 V52 Q6 42 20 40 L52 36 L74 14 Q80 10 90 10 H138 Q148 10 154 16 L174 36 Q194 38 196 52 V72 Z" fill="' + c + '"/>' +
        '<path d="M82 18 H94 V36 H66 Z M102 18 H134 Q140 18 144 22 L158 36 H102 Z" fill="#3a4a5e" stroke-width="3"/>' +
        '<path d="M70 32 L84 20 M104 20 V34" stroke="#cfe8f6" stroke-width="2.4" fill="none"/>' +
        '<path d="M98 36 V70 M60 48 H104" stroke-width="2.6" fill="none"/>' +
        '<rect x="68" y="50" width="20" height="5" rx="2.5" fill="' + d + '" stroke-width="2.2"/><rect x="108" y="50" width="20" height="5" rx="2.5" fill="' + d + '" stroke-width="2.2"/>' +
        '<rect x="6" y="62" width="190" height="10" fill="' + d + '" stroke-width="2.6"/>' +
        '<circle cx="48" cy="74" r="16" fill="#4a4a58"/><circle cx="156" cy="74" r="16" fill="#4a4a58"/>', 3.4) +
        '<circle cx="48" cy="74" r="7.6" fill="#d8d8e4" stroke="' + O + '" stroke-width="2"/><circle cx="156" cy="74" r="7.6" fill="#d8d8e4" stroke="' + O + '" stroke-width="2"/>' +
        '<circle cx="48" cy="74" r="2.4" fill="#7a7a8a"/><circle cx="156" cy="74" r="2.4" fill="#7a7a8a"/>' +
        '<rect x="186" y="46" width="10" height="9" rx="2" fill="#fff6c0" stroke="' + O + '" stroke-width="2"/><rect x="6" y="46" width="8" height="9" rx="2" fill="#e04a4a" stroke="' + O + '" stroke-width="2"/>' +
        hl('M24 44 L50 41', 2.6, 0.7) + '<path d="M120 14 H136" stroke="' + l + '" stroke-width="0"/>';
    },
    // Lit (pièce 200 × 100, tête à gauche) : tête de lit, oreiller, drap replié, couverture à rayures
    bed: function (o) {
      const c = o.v || '#a8c98a', d = shade(c, -0.18);
      return shadow(100, 92, 94, 7) + g(
        '<rect x="4" y="6" width="192" height="84" rx="7" fill="#8a6a50"/>' +
        '<rect x="12" y="10" width="182" height="76" rx="6" fill="#f2f2f6"/>' +
        '<rect x="18" y="16" width="46" height="64" rx="12" fill="#ffffff"/>' +
        '<rect x="64" y="10" width="130" height="76" rx="6" fill="' + c + '"/>' +
        '<rect x="64" y="10" width="14" height="76" fill="#ffffff" stroke-width="2.6"/>', 3.4) +
        ln('M26 26 V70 M32 22 V74', '#d8d8e2', 2.4) +
        ln('M90 10 V86 M120 10 V86 M150 10 V86 M178 10 V86', d, 2.6) +
        '<path d="M14 90 V96 M186 90 V96" stroke="' + O + '" stroke-width="5" stroke-linecap="round"/>' +
        hl('M70 18 H160', 2.4, 0.5);
    },
    // Maison : toit de tuiles, cheminée, fenêtre à croisillons, porte
    house: function () {
      return shadow(50, 90, 36, 5) + g(
        '<rect x="66" y="14" width="10" height="22" fill="#9a5a4a"/>' +
        '<rect x="20" y="46" width="60" height="42" fill="#ecd3b0"/>' +
        '<path d="M12 50 L50 14 L88 50 Z" fill="#b85a5a"/>' +
        '<rect x="44" y="62" width="16" height="26" rx="2" fill="#7a4a3a"/>' +
        '<rect x="26" y="56" width="14" height="14" fill="#cfe8f6" stroke-width="2.4"/>', 3.2) +
        ln('M33 56 V70 M26 63 H40', O, 1.6) + ln('M22 44 L50 18 L78 44', '#d98080', 2) + '<circle cx="56" cy="76" r="1.8" fill="#f2c24a"/>';
    },
    // Aileron de requin : nageoire, remous et écume
    shark: function () {
      return '<ellipse cx="50" cy="74" rx="30" ry="6" fill="#ffffff" opacity=".35"/>' +
        ln('M14 74 Q50 66 86 74', '#ffffff', 3) + ln('M24 80 Q50 74 76 80', '#ffffff', 2.4) +
        g('<path d="M30 74 Q44 30 70 14 Q60 44 68 74 Z" fill="#56677a"/>', 3) +
        '<path d="M38 70 Q48 40 62 26 Q56 46 58 70 Z" fill="#7d93a8"/>' + hl('M40 64 Q48 42 60 28', 2.2, 0.45);
    },
    // Rocher : facettes claire et sombre, fissure, touffe de mousse
    boulder: function () {
      return shadow(50, 86, 38, 6) + g(
        '<path d="M14 78 C8 56 20 30 46 24 C72 20 92 44 88 70 C82 84 24 88 14 78 Z" fill="#a8a29a"/>', 3.2) +
        '<path d="M46 24 C72 20 92 44 88 70 C84 62 76 46 60 36 Z" fill="#8a847c"/>' +
        '<path d="M22 56 C26 42 36 32 48 28 C40 38 32 48 28 62 Z" fill="#cbc6be"/>' +
        ln('M44 44 L52 54 L48 66 M62 52 L70 60', '#6a645c', 2.2) +
        '<path d="M30 34 C34 28 42 26 46 30 C42 34 36 36 30 34 Z" fill="#8fc46a"/>';
    },
    rock: function () { return ICONS.boulder(); },
    animal: function () {
      return shadow(50, 86, 30, 6) + g('<ellipse cx="50" cy="64" rx="18" ry="15" fill="#9a9aa8"/><ellipse cx="28" cy="40" rx="8" ry="10" fill="#9a9aa8"/><ellipse cx="44" cy="30" rx="8" ry="10" fill="#9a9aa8"/><ellipse cx="60" cy="30" rx="8" ry="10" fill="#9a9aa8"/><ellipse cx="74" cy="40" rx="8" ry="10" fill="#9a9aa8"/>', 3.2);
    },
    // Lion : crinière à festons, museau clair, pattes avant, queue à houppe
    lion: function () {
      const m = [];
      for (let i = 0; i < 12; i++) {
        const a0 = (i - 0.5) * Math.PI / 6, a1 = (i + 0.5) * Math.PI / 6, am = i * Math.PI / 6;
        const p = function (a, r) { return (50 + Math.cos(a) * r).toFixed(1) + ' ' + (38 + Math.sin(a) * r).toFixed(1); };
        m.push((i === 0 ? 'M' + p(a0, 26) : '') + ' Q' + p(am, 38) + ' ' + p(a1, 26));
      }
      return shadow(50, 90, 32, 5) + g(
        '<path d="M80 80 Q94 78 92 62" fill="none" stroke-width="5"/>' +
        '<path d="M28 90 Q24 62 50 58 Q76 62 72 90 Z" fill="#e8c07a"/>' +
        '<ellipse cx="38" cy="88" rx="9" ry="5" fill="#f0cf94"/><ellipse cx="62" cy="88" rx="9" ry="5" fill="#f0cf94"/>' +
        '<path d="' + m.join('') + ' Z" fill="#c9782e"/>', 3) +
        '<circle cx="92" cy="60" r="5" fill="#8a4a1e" stroke="' + O + '" stroke-width="2.4"/>' +
        g('<circle cx="35" cy="22" r="6" fill="#e8c07a"/><circle cx="65" cy="22" r="6" fill="#e8c07a"/>' +
          '<ellipse cx="50" cy="40" rx="18" ry="19" fill="#f0cf94"/>' +
          '<ellipse cx="50" cy="50" rx="10" ry="7.5" fill="#fbe6bd" stroke-width="2.2"/>', 3) +
        '<path d="M45 44 H55 L50 50 Z" fill="' + O + '"/>' +
        ln('M50 50 V54 M44 56 Q50 59 56 56', O, 2) +
        '<circle cx="43" cy="36" r="2.6" fill="' + O + '"/><circle cx="57" cy="36" r="2.6" fill="' + O + '"/>' +
        ln('M36 56 V64 M42 56 V64', '#c99a54', 2) + ln('M58 56 V64 M64 56 V64', '#c99a54', 2);
    },
    penguin: function () {
      return shadow(50, 91, 24, 4) + g(
        '<ellipse cx="38" cy="90" rx="9" ry="4" fill="#f2a63a"/><ellipse cx="62" cy="90" rx="9" ry="4" fill="#f2a63a"/>' +
        '<path d="M50 8 C68 8 74 32 72 54 C70 76 64 88 50 88 C36 88 30 76 28 54 C26 32 32 8 50 8 Z" fill="#2b3550"/>' +
        '<path d="M50 30 C62 30 64 50 62 64 C60 80 56 86 50 86 C44 86 40 80 38 64 C36 50 38 30 50 30 Z" fill="#ffffff"/>' +
        '<path d="M28 42 C14 54 18 72 26 76 C32 66 34 54 34 46 Z" fill="#2b3550"/>' +
        '<path d="M72 42 C86 54 82 72 74 76 C68 66 66 54 66 46 Z" fill="#2b3550"/>', 3) +
        g('<path d="M43 28 H57 L50 38 Z" fill="#f2a63a"/>', 2.4) +
        '<circle cx="42" cy="22" r="4.2" fill="#ffffff" stroke="' + O + '" stroke-width="2"/><circle cx="58" cy="22" r="4.2" fill="#ffffff" stroke="' + O + '" stroke-width="2"/>' +
        '<circle cx="43" cy="22.6" r="1.8" fill="' + O + '"/><circle cx="57" cy="22.6" r="1.8" fill="' + O + '"/>' +
        '<ellipse cx="38" cy="30" rx="3.4" ry="2" fill="#f2a0a0" opacity=".7"/><ellipse cx="62" cy="30" rx="3.4" ry="2" fill="#f2a0a0" opacity=".7"/>';
    },
    // Ours brun assis de face : oreilles à intérieur clair, museau, ventre, pattes à coussinets
    bear: function () {
      const b = '#a5724a', l = '#d9b48a';
      return shadow(50, 91, 34, 5) + g(
        '<ellipse cx="50" cy="68" rx="28" ry="24" fill="' + b + '"/>' +
        '<ellipse cx="50" cy="72" rx="15" ry="15" fill="' + l + '" stroke-width="2.4"/>' +
        '<ellipse cx="26" cy="68" rx="9" ry="15" transform="rotate(14 26 68)" fill="' + b + '"/><ellipse cx="74" cy="68" rx="9" ry="15" transform="rotate(-14 74 68)" fill="' + b + '"/>' +
        '<ellipse cx="34" cy="88" rx="13" ry="7" fill="' + b + '"/><ellipse cx="66" cy="88" rx="13" ry="7" fill="' + b + '"/>' +
        '<circle cx="33" cy="16" r="9" fill="' + b + '"/><circle cx="67" cy="16" r="9" fill="' + b + '"/>' +
        '<circle cx="50" cy="34" r="22" fill="' + b + '"/>', 3.2) +
        '<circle cx="33" cy="16" r="4" fill="' + l + '"/><circle cx="67" cy="16" r="4" fill="' + l + '"/>' +
        g('<ellipse cx="50" cy="43" rx="12" ry="9" fill="' + l + '"/>', 2.6) +
        '<ellipse cx="50" cy="39" rx="5" ry="3.6" fill="' + O + '"/>' + ln('M50 42 V47 M44 48 Q50 52 56 48', O, 2) +
        '<circle cx="40" cy="30" r="2.8" fill="' + O + '"/><circle cx="60" cy="30" r="2.8" fill="' + O + '"/>' +
        '<ellipse cx="34" cy="88" rx="5" ry="2.6" fill="#7a4a2a" opacity=".6"/><ellipse cx="66" cy="88" rx="5" ry="2.6" fill="#7a4a2a" opacity=".6"/>';
    },
    // Crocodile de profil : dos crénelé, gueule à dents, œil en relief, pattes courtes
    crocodile: function () {
      return shadow(50, 80, 46, 4) + g(
        '<path d="M30 68 L27 78 H36 L40 70 Z M62 66 L60 76 H69 L72 68 Z" fill="#5fa84a"/>' +
        '<path d="M2 66 Q16 58 32 56 L56 52 Q68 46 84 48 L96 50 Q99 54 94 57 L76 59 Q72 68 60 68 L38 70 Q18 76 2 66 Z" fill="#6fb85a"/>' +
        '<path d="M10 62 Q30 60 56 58 Q74 56 94 55 L94 57 L76 59 Q72 68 60 68 L38 70 Q18 74 8 66 Z" fill="#cfe89a" stroke="none"/>' +
        '<path d="M14 60 l3 -6 l4 5 M26 57 l3 -7 l4 6 M40 54 l3 -7 l4 6 M54 51 l3 -6 l4 5" fill="#4f9a3a" stroke-width="2.4"/>' +
        '<circle cx="78" cy="46" r="5" fill="#8fd070"/>', 3) +
        '<circle cx="78.5" cy="46" r="2.2" fill="#f2d04a" stroke="' + O + '" stroke-width="1.4"/><ellipse cx="78.5" cy="46" rx="0.8" ry="2" fill="' + O + '"/>' +
        '<path d="M78 58 l2.4 4 l2.4 -4 l2.4 4 l2.4 -4 l2.4 4 l2.4 -4" fill="#ffffff" stroke="' + O + '" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<circle cx="95" cy="50" r="1.2" fill="' + O + '"/>';
    },
    // Éléphant (pièce 200 × 200) de profil : grande oreille, trompe enroulée, défense, ongles
    elephant: function () {
      const b = '#b4c6d2', d = '#98adbb', l = '#d4e2ea';
      return shadow(100, 180, 88, 12) + g(
        '<path d="M36 124 C26 76 64 46 104 48 C150 50 168 78 164 110 L162 158 L140 158 L138 132 L84 134 L82 160 L56 160 L54 134 C44 134 38 130 36 124 Z" fill="' + b + '"/>' +
        '<path d="M148 96 C176 96 194 110 192 140 C191 158 178 166 168 162 C160 158 164 150 172 150 C178 148 178 140 176 132 C172 118 160 116 148 120 Z" fill="' + b + '"/>' +
        '<path d="M140 150 H162 M56 152 H82" stroke-width="2.4" fill="none"/>' +
        '<path d="M36 100 Q22 108 24 132" fill="none" stroke-width="5"/>' +
        '<ellipse cx="108" cy="90" rx="30" ry="40" fill="' + d + '"/>' +
        '<ellipse cx="110" cy="92" rx="19" ry="28" fill="#e8b8c0" stroke-width="2.4"/>', 5) +
        ln('M176 132 Q184 126 188 134 M172 144 Q182 140 186 148', '#7f95a4', 3) +
        '<path d="M148 120 Q170 134 184 116" fill="none" stroke="' + O + '" stroke-width="12" stroke-linecap="round"/>' +
        '<path d="M148 120 Q170 134 184 116" fill="none" stroke="#fffdf4" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="154" cy="84" r="5" fill="' + O + '"/><circle cx="155.5" cy="82.5" r="1.6" fill="#fff"/>' +
        '<g fill="' + l + '" stroke="' + O + '" stroke-width="2.4"><ellipse cx="144" cy="157" rx="5" ry="3"/><ellipse cx="156" cy="157" rx="5" ry="3"/><ellipse cx="62" cy="159" rx="5" ry="3"/><ellipse cx="74" cy="159" rx="5" ry="3"/></g>' +
        '<circle cx="26" cy="134" r="5" fill="' + d + '" stroke="' + O + '" stroke-width="3"/>';
    },
    // Palmier : tronc annelé et courbe, palmes dentelées, noix de coco
    palm: function () {
      const fr = function (a, L) {
        return '<g transform="translate(52 36) rotate(' + a + ')"><path d="M0 0 C' + L * 0.3 + ' ' + (-L * 0.3) + ' ' + L * 0.72 + ' ' + (-L * 0.28) + ' ' + L + ' ' + L * 0.24 + ' C' + L * 0.7 + ' ' + (-L * 0.02) + ' ' + L * 0.34 + ' ' + (-L * 0.02) + ' 0 7 Z" fill="#5fb840"/>' +
          '<path d="M6 0 C' + L * 0.4 + ' ' + (-L * 0.18) + ' ' + L * 0.7 + ' ' + (-L * 0.1) + ' ' + L * 0.94 + ' ' + L * 0.22 + '" fill="none" stroke="#2f7a2a" stroke-width="2"/></g>';
      };
      return shadow(50, 91, 22, 4) + g(
        '<path d="M44 90 Q42 64 52 40 L60 42 Q52 66 56 90 Z" fill="#c9a070"/>', 3) +
        ln('M44 80 Q50 82 56 80 M44 70 Q50 72 55 70 M46 60 Q51 62 56 60 M48 50 Q53 52 58 50', '#8a6238', 2) +
        g(fr(-178, 40) + fr(-150, 42) + fr(-122, 34) + fr(-58, 34) + fr(-30, 42) + fr(-2, 40), 2.6) +
        g('<circle cx="49" cy="43" r="5" fill="#8a5a3a"/><circle cx="58" cy="45" r="5" fill="#7a4a2a"/>', 2.4);
    }
  };

  function woodShelf() {
    const cols = ['#9a8ad8', '#e8e4f6', '#c46a8a', '#6a7ac8', '#e8c46a', '#6fb59a'];
    let books = '';
    [30, 54, 78].forEach(function (y, r) {
      let x = 20;
      for (let i = 0; i < 6; i++) {
        const w = 7 + ((i + r) % 3) * 2, h = 14 + ((i * 2 + r) % 3) * 2;
        books += '<rect x="' + x + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '" fill="' + cols[(i * 2 + r) % 6] + '" stroke-width="1.6"/>';
        x += w + 1;
        if (x > 76) break;
      }
    });
    return shadow(50, 91, 38, 6) + g(
      '<rect x="12" y="5" width="76" height="86" rx="3" fill="#a07a52"/>' +
      '<rect x="17" y="11" width="66" height="74" fill="#4a3426" stroke-width="2.5"/>' + books +
      '<path d="M17 31 H83 M17 55 H83 M17 79 H83" stroke="#b58a5e" stroke-width="5"/>' +
      '<path d="M17 31 H83 M17 55 H83 M17 79 H83" stroke-width="1.5"/>' +
      '<rect x="9" y="3" width="82" height="9" rx="3" fill="#bf9468"/>', 3) +
      hl('M14 7 H70', 2, 0.55);
  }

  function flowerHead(x, y, c, center) {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5 - Math.PI / 2;
      s += '<circle cx="' + (x + Math.cos(a) * 5.4).toFixed(1) + '" cy="' + (y + Math.sin(a) * 5.4).toFixed(1) + '" r="5" fill="' + c + '" stroke="' + O + '" stroke-width="1.6"/>';
    }
    return s + '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + (center || '#f6e08a') + '" stroke="' + O + '" stroke-width="1.2"/>';
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

  ICONS.desk = ICONS.table;

  // Types dessinés comme surfaces fusionnées (pièces multi-cases) plutôt qu'icônes
  const SURFACES = { table: true, carpet: true, path: true, sand: true, water: true };
  // Types qui s'étirent sur 2 cases (icône 200 × 100)
  const LONG = { car: true, bed: true };
  // Types qui occupent un carré de 2 × 2 cases (icône 200 × 200)
  const BIG = { elephant: true };

  // Noms français des objets (légende, info-bulles)
  const NAMES = {
    chair: 'Chaise', table: 'Table',
    shelf: 'Étagère', tv: 'Télé', plant: 'Plante', present: 'Cadeau', register: 'Tiroir-caisse',
    teddy: 'Peluche', tree: 'Arbre', snowtree: 'Arbre', trash: 'Corbeille', door: 'Porte',
    box: 'Caisse', bonsai: 'Bonsaï', cactus: 'Cactus', shrub: 'Arbuste', flower: 'Fleurs',
    flowers: 'Fleurs', lily: 'Nénuphar', statue: 'Statue', easel: 'Chevalet', framed: 'Tableau encadré', oil: "Tache d'huile",
    tee: 'Départ', flag: 'Drapeau', cart: 'Voiturette', car: 'Voiture', bed: 'Lit', carpet: 'Tapis',
    path: 'Chemin', sand: 'Sable', water: 'Eau', house: 'Maison', shark: 'Requin', boulder: 'Rocher', rock: 'Rocher',
    lion: 'Lion', penguin: 'Manchot', bear: 'Ours', crocodile: 'Crocodile', elephant: 'Éléphant', palm: 'Palmier', animal: 'Animal'
  };

  root.MurdokuIcons = { ICONS: ICONS, SURFACES: SURFACES, LONG: LONG, BIG: BIG, NAMES: NAMES, shade: shade, OUTLINE: O, palette: C };
})(typeof window !== 'undefined' ? window : this);
