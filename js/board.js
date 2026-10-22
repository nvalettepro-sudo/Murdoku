/* Murdoku — rendu SVG du plateau (scène de crime). */
(function (root) {
  'use strict';
  const I = root.MurdokuIcons;
  const O = I.OUTLINE;
  const S = 1000; // taille du plateau en unités SVG
  const PAD = 16;
  const FONT_ATTR = 'Montserrat, system-ui, -apple-system, Segoe UI, sans-serif';

  // Couleurs des pions (une par personne, la victime a sa propre couleur)
  const PAWN = ['#d9574b', '#2f8a55', '#3f9fb5', '#5566b8', '#8a4f9e', '#d27b33', '#c34d7d', '#2c7a8c',
    '#7f8f34', '#a35a35', '#4e5ca8', '#b5416b', '#3b8a76', '#8c6a28', '#6a4cb3', '#3d6b3d', '#9a3a8a'];
  const VICTIM_PAWN = '#3f3f86';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /** Motif de sol pour une zone (pattern SVG). */
  function floorPattern(id, type, color, s) {
    const d = I.shade(color, -0.1), l = I.shade(color, 0.18);
    const sz = s; // un motif par case
    let inner = '';
    switch (type) {
      case 'wood':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          [0.25, 0.5, 0.75].map(function (f) { return '<path d="M' + sz * f + ' 0 V' + sz + '" stroke="' + d + '" stroke-width="' + sz * 0.012 + '"/>'; }).join('') +
          '<path d="M' + sz * 0.12 + ' ' + sz * 0.35 + ' h' + sz * 0.13 + ' M' + sz * 0.62 + ' ' + sz * 0.7 + ' h' + sz * 0.13 + ' M' + sz * 0.37 + ' ' + sz * 0.15 + ' h' + sz * 0.13 + '" stroke="' + d + '" stroke-width="' + sz * 0.01 + '"/>';
        break;
      case 'checker':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          '<rect width="' + sz / 2 + '" height="' + sz / 2 + '" fill="' + d + '" opacity=".55"/><rect x="' + sz / 2 + '" y="' + sz / 2 + '" width="' + sz / 2 + '" height="' + sz / 2 + '" fill="' + d + '" opacity=".55"/>';
        break;
      case 'diamond':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/><path d="M' + sz / 2 + ' ' + sz * 0.08 + ' L' + sz * 0.92 + ' ' + sz / 2 + ' L' + sz / 2 + ' ' + sz * 0.92 + ' L' + sz * 0.08 + ' ' + sz / 2 + ' Z" fill="' + d + '" opacity=".7"/>';
        break;
      case 'tiles':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          '<path d="M0 ' + sz / 2 + ' H' + sz + ' M' + sz / 3 + ' 0 V' + sz / 2 + ' M' + sz * 0.75 + ' ' + sz / 2 + ' V' + sz + '" stroke="' + I.shade(color, -0.25) + '" stroke-width="' + sz * 0.025 + '"/>';
        break;
      case 'brick':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          [0.25, 0.5, 0.75].map(function (f) { return '<path d="M0 ' + sz * f + ' H' + sz + '" stroke="' + d + '" stroke-width="' + sz * 0.015 + '"/>'; }).join('') +
          '<path d="M' + sz * 0.3 + ' 0 V' + sz * 0.25 + ' M' + sz * 0.8 + ' 0 V' + sz * 0.25 + ' M' + sz * 0.55 + ' ' + sz * 0.25 + ' V' + sz * 0.5 + ' M' + sz * 0.05 + ' ' + sz * 0.25 + ' V' + sz * 0.5 + ' M' + sz * 0.3 + ' ' + sz * 0.5 + ' V' + sz * 0.75 + ' M' + sz * 0.8 + ' ' + sz * 0.5 + ' V' + sz * 0.75 + ' M' + sz * 0.55 + ' ' + sz * 0.75 + ' V' + sz + '" stroke="' + d + '" stroke-width="' + sz * 0.015 + '"/>';
        break;
      case 'grass': case 'fairway': case 'rough': {
        const base = type === 'rough' ? I.shade(color, -0.05) : color;
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + base + '"/>';
        const tufts = [[0.2, 0.25], [0.65, 0.18], [0.4, 0.55], [0.82, 0.6], [0.15, 0.8], [0.6, 0.85]];
        inner += tufts.map(function (t) {
          const x = t[0] * sz, y = t[1] * sz, h = sz * 0.07;
          return '<path d="M' + (x - h * 0.6) + ' ' + y + ' l' + h * 0.3 + ' -' + h + ' M' + x + ' ' + y + ' l0 -' + h * 1.2 + ' M' + (x + h * 0.6) + ' ' + y + ' l-' + h * 0.3 + ' -' + h + '" stroke="' + I.shade(base, -0.18) + '" stroke-width="' + sz * 0.014 + '" stroke-linecap="round"/>';
        }).join('');
        if (type === 'fairway') inner += '<rect width="' + sz + '" height="' + sz / 2 + '" fill="' + l + '" opacity=".25"/>';
        break;
      }
      case 'water':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          [0.2, 0.5, 0.8].map(function (f, i) {
            const y = sz * f, x0 = i % 2 ? sz * 0.1 : -sz * 0.15;
            return '<path d="M' + x0 + ' ' + y + ' q' + sz * 0.1 + ' -' + sz * 0.08 + ' ' + sz * 0.2 + ' 0 t' + sz * 0.2 + ' 0 t' + sz * 0.2 + ' 0 t' + sz * 0.2 + ' 0 t' + sz * 0.2 + ' 0" fill="none" stroke="#ffffff" stroke-opacity=".75" stroke-width="' + sz * 0.035 + '" stroke-linecap="round"/>';
          }).join('');
        break;
      case 'sand':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          [[0.2, 0.3], [0.7, 0.2], [0.45, 0.6], [0.85, 0.75], [0.15, 0.85], [0.6, 0.9], [0.35, 0.12]].map(function (p) {
            return '<circle cx="' + p[0] * sz + '" cy="' + p[1] * sz + '" r="' + sz * 0.012 + '" fill="' + I.shade(color, -0.25) + '"/>';
          }).join('') +
          '<path d="M' + sz * 0.1 + ' ' + sz * 0.5 + ' q' + sz * 0.15 + ' -' + sz * 0.06 + ' ' + sz * 0.3 + ' 0" stroke="' + I.shade(color, -0.12) + '" stroke-width="' + sz * 0.012 + '" fill="none"/>';
        break;
      case 'stone':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          [[0.25, 0.25, 0.2], [0.72, 0.28, 0.22], [0.3, 0.72, 0.22], [0.75, 0.75, 0.2]].map(function (p) {
            return '<ellipse cx="' + p[0] * sz + '" cy="' + p[1] * sz + '" rx="' + p[2] * sz + '" ry="' + p[2] * sz * 0.8 + '" fill="' + l + '" stroke="' + d + '" stroke-width="' + sz * 0.02 + '"/>';
          }).join('');
        break;
      case 'gravel':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          [[0.1, 0.2], [0.3, 0.1], [0.5, 0.3], [0.8, 0.15], [0.2, 0.5], [0.65, 0.55], [0.9, 0.45], [0.4, 0.8], [0.75, 0.85], [0.1, 0.9]].map(function (p) {
            return '<circle cx="' + p[0] * sz + '" cy="' + p[1] * sz + '" r="' + sz * 0.02 + '" fill="' + d + '"/>';
          }).join('');
        break;
      case 'snow':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/><path d="M0 0 H' + sz + ' V' + sz + '" stroke="' + d + '" stroke-width="' + sz * 0.01 + '" fill="none"/>';
        break;
      case 'cloud':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          [[0.25, 0.3], [0.7, 0.65]].map(function (p) {
            const x = p[0] * sz, y = p[1] * sz, r = sz * 0.07;
            return '<path d="M' + (x - 2 * r) + ' ' + y + ' a' + r + ' ' + r + ' 0 0 1 ' + 2 * r + ' 0 a' + r + ' ' + r + ' 0 0 1 ' + 2 * r + ' 0" fill="none" stroke="' + d + '" stroke-width="' + sz * 0.015 + '"/>';
          }).join('');
        break;
      case 'stairs':
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>' +
          [0.15, 0.4, 0.65, 0.9].map(function (f) { return '<rect x="0" y="' + sz * f + '" width="' + sz + '" height="' + sz * 0.1 + '" fill="' + d + '"/>'; }).join('');
        break;
      default:
        inner = '<rect width="' + sz + '" height="' + sz + '" fill="' + color + '"/>';
    }
    return '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + sz + '" height="' + sz + '">' + inner + '</pattern>';
  }

  /** Surface fusionnée (table, tapis, chemin…) : rectangles par case, contour par double passe. */
  function surface(piece, s, opts) {
    const set = {};
    piece.cells.forEach(function (rc) { set[rc[0] + ',' + rc[1]] = true; });
    function has(r, c) { return !!set[r + ',' + c]; }
    const terrain = piece.type === 'path' || piece.type === 'sand' || piece.type === 'water';
    const m = terrain ? 0 : s * (piece.type === 'carpet' ? 0.08 : 0.1);
    const rects = piece.cells.map(function (rc) {
      const r = rc[0], c = rc[1];
      const x0 = c * s + (has(r, c - 1) ? 0 : m), x1 = (c + 1) * s - (has(r, c + 1) ? 0 : m);
      const y0 = r * s + (has(r - 1, c) ? 0 : m), y1 = (r + 1) * s - (has(r + 1, c) ? 0 : m * 1.6);
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, r: r, c: c };
    });
    function rectsSvg(fill, stroke, sw) {
      return rects.map(function (q) {
        return '<rect x="' + q.x.toFixed(1) + '" y="' + q.y.toFixed(1) + '" width="' + q.w.toFixed(1) + '" height="' + q.h.toFixed(1) + '" fill="' + fill + '"' +
          (stroke ? ' stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linejoin="round"' : '') + '/>';
      }).join('');
    }
    const sw = Math.max(3, s * 0.045);
    let out = '';
    if (piece.type === 'path') {
      return rectsSvg('url(#pat-path-' + opts.uid + ')');
    }
    if (piece.type === 'sand') return rectsSvg('url(#pat-sand-' + opts.uid + ')');
    if (piece.type === 'water') return rectsSvg('url(#pat-water-' + opts.uid + ')') +
      rects.map(function (q) { return has(q.r - 1, q.c) ? '' : '<rect x="' + q.x + '" y="' + q.y + '" width="' + q.w + '" height="' + s * 0.08 + '" fill="#e8f8fb" opacity=".9"/>'; }).join('');
    if (piece.type === 'carpet') {
      const c = piece.v || '#c9a0c0';
      out += rectsSvg(I.shade(c, -0.25), I.shade(c, -0.25), sw * 1.2) + rectsSvg(c);
      // liseré intérieur
      const inset = s * 0.07;
      out += piece.cells.map(function (rc) {
        const r = rc[0], c2 = rc[1];
        const x0 = c2 * s + (has(r, c2 - 1) ? 0 : m + inset), x1 = (c2 + 1) * s - (has(r, c2 + 1) ? 0 : m + inset);
        const y0 = r * s + (has(r - 1, c2) ? 0 : m + inset), y1 = (r + 1) * s - (has(r + 1, c2) ? 0 : m * 1.6 + inset);
        return '<rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" fill="' + I.shade(c, 0.12) + '"/>';
      }).join('');
      return out;
    }
    // table / bureau : plateau avec contour, chant inférieur et pieds
    const top = piece.v || (opts.tableColor || '#6e6a86');
    out += rectsSvg(O, O, sw * 2) + rectsSvg(I.shade(top, -0.2));
    out += rects.map(function (q) {
      return '<rect x="' + q.x + '" y="' + q.y + '" width="' + q.w + '" height="' + Math.max(0, q.h - s * 0.1) + '" fill="' + top + '"/>';
    }).join('');
    // pieds sous les cases du bas
    rects.forEach(function (q) {
      if (has(q.r + 1, q.c)) return;
      const yb = q.y + q.h, lw = s * 0.06;
      if (!has(q.r, q.c - 1)) out += '<rect x="' + (q.x + s * 0.04) + '" y="' + yb + '" width="' + lw + '" height="' + s * 0.1 + '" fill="' + O + '"/>';
      if (!has(q.r, q.c + 1)) out += '<rect x="' + (q.x + q.w - s * 0.04 - lw) + '" y="' + yb + '" width="' + lw + '" height="' + s * 0.1 + '" fill="' + O + '"/>';
    });
    // reflets / papiers sur certaines tables
    return out;
  }

  /** Icône placée dans une case ou une boîte englobante. */
  function placeIcon(piece, s) {
    const f = I.ICONS[piece.type] || I.ICONS[piece.logical];
    if (!f) return '';
    const rs = piece.cells.map(function (c) { return c[0]; }), cs = piece.cells.map(function (c) { return c[1]; });
    const r0 = Math.min.apply(null, rs), r1 = Math.max.apply(null, rs), c0 = Math.min.apply(null, cs), c1 = Math.max.apply(null, cs);
    if (I.BIG && I.BIG[piece.type] && piece.cells.length > 1) {
      const w = (c1 - c0 + 1) * s, h = (r1 - r0 + 1) * s;
      return '<g transform="translate(' + c0 * s + ',' + r0 * s + ') scale(' + (w / 200) + ',' + (h / 200) + ')">' + f(piece) + '</g>';
    }
    if (I.LONG[piece.type] && piece.cells.length > 1) {
      const horiz = (c1 - c0) >= (r1 - r0);
      if (horiz) {
        const w = (c1 - c0 + 1) * s, h = s;
        return '<g transform="translate(' + c0 * s + ',' + r0 * s + ') scale(' + (w / 200) + ',' + (h / 100) + ')">' + f(piece) + '</g>';
      }
      const h2 = (r1 - r0 + 1) * s;
      return '<g transform="translate(' + (c0 + 1) * s + ',' + r0 * s + ') rotate(90) scale(' + (h2 / 200) + ',' + (s / 100) + ')">' + f(piece) + '</g>';
    }
    return piece.cells.map(function (rc) {
      return '<g transform="translate(' + rc[1] * s + ',' + rc[0] * s + ') scale(' + (s / 100) + ')">' + f(piece) + '</g>';
    }).join('');
  }

  /** Couche statique du plateau (sols, murs, objets, étiquettes). */
  function staticLayer(P) {
    const N = P.N, s = S / N, def = P.def;
    const pal = def.palette || {};
    let defs = '<defs>';
    P.areaIds.forEach(function (a) {
      const ar = def.areas[a];
      defs += floorPattern('fl-' + def.id + '-' + a, ar.floor || 'plain', ar.color || '#eee', s);
    });
    const uid = def.id;
    defs += floorPattern('pat-path-' + uid, 'brick', '#f6ead2', s);
    defs += floorPattern('pat-sand-' + uid, 'sand', '#f8e6bd', s);
    defs += floorPattern('pat-water-' + uid, 'water', '#9fd3ef', s);
    defs += '</defs>';
    let out = defs;
    // sols
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const a = P.area[r * N + c];
        out += '<rect x="' + c * s + '" y="' + r * s + '" width="' + (s + 0.6) + '" height="' + (s + 0.6) + '" fill="url(#fl-' + def.id + '-' + a + ')"/>';
      }
    }
    // grands numéros de zone (trous de golf)
    P.areaIds.forEach(function (a) {
      const ar = def.areas[a];
      if (ar.number && ar.label) {
        const x = (ar.label[1] + 0.5) * s, y = (ar.label[0] + 0.5) * s;
        out += '<text x="' + x + '" y="' + (y + s * 0.32) + '" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, sans-serif" font-weight="800" font-size="' + s * 0.95 + '" fill="#2f7a55" opacity=".8">' + esc(a) + '</text>';
      }
    });
    // fines lignes de grille
    let grid = '';
    for (let i = 1; i < N; i++) {
      grid += 'M' + i * s + ' 0V' + S + 'M0 ' + i * s + 'H' + S;
    }
    out += '<path d="' + grid + '" stroke="rgba(30,30,50,.28)" stroke-width="' + Math.max(1.2, s * 0.012) + '"/>';
    // terrains d'abord (chemin, sable, eau), puis surfaces, puis icônes
    const terr = P.pieces.filter(function (p) { return p.type === 'path' || p.type === 'sand' || p.type === 'water'; });
    const surf = P.pieces.filter(function (p) { return I.SURFACES[p.type] && terr.indexOf(p) < 0 && !(p.type === 'table' && p.cells.length === 1 && false); });
    const icons = P.pieces.filter(function (p) { return !I.SURFACES[p.type]; });
    terr.forEach(function (p) { out += surface(p, s, { uid: uid }); });
    // re-tracer la grille fine par-dessus les terrains
    out += '<path d="' + grid + '" stroke="rgba(30,30,50,.22)" stroke-width="' + Math.max(1.2, s * 0.012) + '"/>';
    surf.forEach(function (p) { out += surface(p, s, { tableColor: pal.table, uid: uid }); });
    // murs entre zones
    const wall = Math.max(5, s * 0.075);
    let walls = '';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const a = P.area[r * N + c];
        if (c < N - 1 && P.area[r * N + c + 1] !== a) walls += 'M' + (c + 1) * s + ' ' + (r * s - wall / 2) + 'V' + ((r + 1) * s + wall / 2);
        if (r < N - 1 && P.area[(r + 1) * N + c] !== a) walls += 'M' + (c * s - wall / 2) + ' ' + (r + 1) * s + 'H' + ((c + 1) * s + wall / 2);
      }
    }
    // icônes triées par rangée (les objets du bas recouvrent ceux du haut)
    icons.sort(function (a, b) { return Math.min.apply(null, a.cells.map(function (x) { return x[0]; })) - Math.min.apply(null, b.cells.map(function (x) { return x[0]; })); });
    const edgeIcons = icons.filter(function (p) { return p.type === 'door'; });
    const shelfStyle = pal.shelf || null;
    icons.filter(function (p) { return edgeIcons.indexOf(p) < 0; }).forEach(function (p) {
      out += placeIcon(shelfStyle && p.type === 'shelf' ? Object.assign({}, p, { style: shelfStyle }) : p, s);
    });
    out += '<path d="' + walls + '" stroke="' + O + '" stroke-width="' + wall + '" stroke-linecap="square"/>';
    edgeIcons.forEach(function (p) { out += placeIcon(p, s); });
    // cadre extérieur
    out += '<rect x="' + (-PAD / 2) + '" y="' + (-PAD / 2) + '" width="' + (S + PAD) + '" height="' + (S + PAD) + '" fill="none" stroke="' + O + '" stroke-width="' + PAD + '" rx="3"/>';
    // étiquettes de zones
    out += '<g class="area-labels">' + P.areaIds.map(function (a) { return areaLabel(P, a, s); }).join('') + '</g>';
    return out;
  }

  /**
   * Étiquette d'une zone. On choisit la plus large suite de cases de la zone sur une rangée
   * (de préférence celle indiquée par `label`), puis fitLabels() ajuste le texte à l'écran
   * (réduction de la police, puis passage sur deux lignes) pour qu'il reste dans la pièce.
   */
  function areaLabel(P, a, s) {
    const ar = P.def.areas[a];
    if (ar.number || ar.hideLabel) return '';
    const N = P.N;
    const txt = ar.name.toUpperCase();
    const fs0 = Math.max(15, Math.min(25, s * 0.25));
    // suites de cases de la zone, par rangée
    const runs = [];
    for (let r = 0; r < N; r++) {
      let c = 0;
      while (c < N) {
        if (P.area[r * N + c] !== a) { c++; continue; }
        let c1 = c;
        while (c1 + 1 < N && P.area[r * N + c1 + 1] === a) c1++;
        runs.push({ r: r, c0: c, c1: c1, w: (c1 - c + 1) * s });
        c = c1 + 1;
      }
    }
    if (!runs.length) return '';
    const hint = ar.label || null;
    const est = function (f) { return txt.length * f * 0.8 + f * 1.1; }; // largeur estimée (majuscules)
    let run = null;
    if (hint) run = runs.find(function (q) { return q.r === hint[0] && hint[1] >= q.c0 && hint[1] <= q.c1; }) || null;
    // la suite choisie doit pouvoir accueillir le texte (au besoin sur deux lignes, police réduite)
    const longest = txt.split(' ').reduce(function (m, w2) { return Math.max(m, w2.length); }, 1);
    const fits = function (q) { return est(fs0 * 0.85) <= q.w - 8 || (longest * fs0 * 0.7 * 0.8 + fs0) <= q.w - 8; };
    if (!run || !fits(run)) {
      const ok = runs.filter(fits);
      const pool = ok.length ? ok : runs;
      run = pool.reduce(function (best, q) {
        if (!best) return q;
        if (q.w !== best.w) return q.w > best.w ? q : best;
        return q.r > best.r ? q : best; // à largeur égale, la plus basse
      }, null);
    }
    const hx = hint ? (hint[1] + 0.5) * s : (run.c0 + run.c1 + 1) / 2 * s;
    const l = run.c0 * s, r2 = (run.c1 + 1) * s, bottom = (run.r + 1) * s;
    const w0 = Math.min(est(fs0), run.w - 8), h0 = fs0 * 1.35;
    const cx0 = Math.max(l + w0 / 2 + 4, Math.min(r2 - w0 / 2 - 4, hx));
    return '<g class="lbl" data-area="' + esc(a) + '" data-text="' + esc(txt) + '" data-fs="' + fs0.toFixed(2) + '" data-max="' + (run.w - 10).toFixed(1) +
      '" data-l="' + l.toFixed(1) + '" data-r="' + r2.toFixed(1) + '" data-hx="' + hx.toFixed(1) + '" data-bottom="' + bottom.toFixed(1) +
      '" transform="translate(' + cx0.toFixed(1) + ',' + (bottom - h0 / 2 - 3).toFixed(1) + ')">' +
      '<rect x="' + (-w0 / 2).toFixed(1) + '" y="' + (-h0 / 2).toFixed(1) + '" width="' + w0.toFixed(1) + '" height="' + h0.toFixed(1) + '" rx="' + (h0 / 2).toFixed(1) + '" fill="#ffffff" stroke="' + O + '" stroke-width="' + Math.max(2.5, fs0 * 0.13).toFixed(1) + '"/>' +
      '<text y="' + (fs0 * 0.36).toFixed(1) + '" text-anchor="middle" font-size="' + fs0.toFixed(2) + '" font-family="' + FONT_ATTR + '" font-weight="700" fill="' + O + '">' + esc(txt) + '</text></g>';
  }

  /**
   * Ajuste les étiquettes de zones aux dimensions réelles du texte (une fois la police chargée) :
   * police réduite, puis deux lignes, jusqu'à tenir dans la largeur de la pièce.
   */
  function fitLabels(rootEl) {
    const NS = 'http://www.w3.org/2000/svg';
    Array.prototype.forEach.call(rootEl.querySelectorAll('g.lbl'), function (g) {
      const t = g.querySelector('text'), rc = g.querySelector('rect');
      if (!t || !rc || !t.getBBox) return;
      const txt = g.getAttribute('data-text');
      const fs0 = +g.getAttribute('data-fs'), max = +g.getAttribute('data-max');
      const l = +g.getAttribute('data-l'), r = +g.getAttribute('data-r');
      const hx = +g.getAttribute('data-hx'), bottom = +g.getAttribute('data-bottom');
      function layout(lines, fs) {
        while (t.firstChild) t.removeChild(t.firstChild);
        const lh = fs * 1.12;
        t.setAttribute('font-size', fs.toFixed(2));
        t.setAttribute('y', (-(lines.length - 1) * lh / 2 + fs * 0.36).toFixed(2));
        lines.forEach(function (ln, i) {
          const ts = document.createElementNS(NS, 'tspan');
          ts.setAttribute('x', '0');
          if (i) ts.setAttribute('dy', lh.toFixed(2));
          ts.textContent = ln;
          t.appendChild(ts);
        });
        const bb = t.getBBox();
        return { w: bb.width + fs * 1.1, h: lines.length * lh + fs * 0.5 };
      }
      let fs = fs0, lines = [txt], m = layout(lines, fs);
      if (!(m.w > 0)) return; // texte non rendu (élément masqué) : on garde l'estimation
      // 1) une ligne, police réduite jusqu'à 85 %
      while (m.w > max && fs > fs0 * 0.85) { fs *= 0.96; m = layout(lines, fs); }
      // 2) deux lignes si besoin
      if (m.w > max && txt.indexOf(' ') > 0) {
        const words = txt.split(' ');
        let best = null;
        for (let i = 1; i < words.length; i++) {
          const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
          const sc = Math.max(a.length, b.length);
          if (!best || sc < best.sc) best = { sc: sc, lines: [a, b] };
        }
        lines = best.lines; fs = fs0 * 0.92; m = layout(lines, fs);
        while (m.w > max && fs > fs0 * 0.6) { fs *= 0.95; m = layout(lines, fs); }
      } else {
        while (m.w > max && fs > fs0 * 0.6) { fs *= 0.95; m = layout(lines, fs); }
      }
      rc.setAttribute('x', (-m.w / 2).toFixed(1));
      rc.setAttribute('y', (-m.h / 2).toFixed(1));
      rc.setAttribute('width', m.w.toFixed(1));
      rc.setAttribute('height', m.h.toFixed(1));
      rc.setAttribute('rx', Math.min(m.h / 2, fs * 0.9).toFixed(1));
      const cx = (r - l) >= m.w + 8 ? Math.max(l + m.w / 2 + 4, Math.min(r - m.w / 2 - 4, hx)) : (l + r) / 2;
      g.setAttribute('transform', 'translate(' + cx.toFixed(1) + ',' + (bottom - m.h / 2 - 3).toFixed(1) + ')');
    });
  }

  /** Pion d'une personne (bouteille avec initiale), dessiné dans un repère 100 × 100. */
  function pawnSvg(color, letter, extra) {
    const d = I.shade(color, -0.3), l = I.shade(color, 0.25);
    return '<ellipse cx="50" cy="86" rx="30" ry="9" fill="rgba(20,15,40,.3)"/>' +
      '<path d="M28 84 Q24 62 36 54 Q28 46 32 34 Q36 20 50 20 Q64 20 68 34 Q72 46 64 54 Q76 62 72 84 Q50 92 28 84 Z" fill="' + color + '" stroke="' + O + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M28 84 Q50 92 72 84 L72 78 Q50 86 28 78 Z" fill="' + d + '"/>' +
      '<path d="M40 26 Q36 34 38 44" stroke="' + l + '" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>' +
      '<rect x="40" y="8" width="20" height="16" rx="4" fill="' + d + '" stroke="' + O + '" stroke-width="3"/>' +
      '<text x="50" y="73" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, sans-serif" font-weight="800" font-size="30" fill="#ffffff" stroke="' + O + '" stroke-width="1.2" paint-order="stroke">' + esc(letter) + '</text>' + (extra || '');
  }

  /**
   * Pion « portrait » : visage du personnage dans un carré, avec son initiale dans une pastille.
   * Dessiné dans un repère 100 × 100 (une case).
   */
  function portraitPawn(P, i, extra) {
    const A = root.MurdokuAvatars;
    const p = P.people[i];
    const color = pawnColor(P, i);
    P._tiles = P._tiles || [];
    if (!P._tiles[i]) {
      P._tiles[i] = A.avatar(p.look, { tile: true })
        .replace('<svg ', '<svg x="13" y="11" width="74" height="74" preserveAspectRatio="xMidYMin slice" ');
    }
    return '<rect x="9" y="10" width="86" height="86" rx="10" fill="rgba(20,15,40,.28)"/>' +
      '<rect x="6" y="6" width="86" height="86" rx="10" fill="#ffffff" stroke="' + color + '" stroke-width="6"/>' +
      P._tiles[i] +
      '<rect x="13" y="11" width="74" height="74" fill="none" stroke="' + O + '" stroke-width="2.5"/>' +
      // pastille plus grande sur les grandes grilles pour rester lisible
      (P.N >= 11
        ? '<circle cx="74" cy="74" r="25" fill="' + color + '" stroke="' + O + '" stroke-width="4"/>' +
          '<text x="74" y="86" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, sans-serif" font-weight="800" font-size="34" fill="#ffffff">' + esc(p.name[0].toUpperCase()) + '</text>'
        : '<circle cx="80" cy="80" r="17" fill="' + color + '" stroke="' + O + '" stroke-width="3.5"/>' +
          '<text x="80" y="88.5" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, sans-serif" font-weight="800" font-size="23" fill="#ffffff">' + esc(p.name[0].toUpperCase()) + '</text>') +
      (extra || '');
  }

  function pawnColor(P, i) {
    return i === P.victim ? VICTIM_PAWN : PAWN[i % PAWN.length];
  }

  /** Couche dynamique : surlignages, croix, pions. */
  function dynamicLayer(P, st) {
    const N = P.N, s = S / N;
    let out = '';
    // cases mises en évidence (aide)
    (st.highlight || []).forEach(function (k) {
      const r = Math.floor(k / N), c = k % N;
      out += '<rect class="hl" x="' + (c * s + 3) + '" y="' + (r * s + 3) + '" width="' + (s - 6) + '" height="' + (s - 6) + '" rx="' + s * 0.12 + '" fill="rgba(255,214,64,.28)" stroke="#f4b400" stroke-width="' + Math.max(3, s * 0.06) + '"/>';
    });
    // case survolée
    if (st.hover >= 0 && st.hover !== undefined) {
      const r = Math.floor(st.hover / N), c = st.hover % N;
      out += '<rect x="' + c * s + '" y="' + r * s + '" width="' + s + '" height="' + s + '" fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.9)" stroke-width="' + Math.max(2, s * 0.03) + '"/>';
    }
    // croix : automatiques (claires, autour des suspects placés) puis manuelles (foncées)
    const xw = Math.max(4, s * 0.09);
    function crossPath(k, m) {
      const r = Math.floor(k / N), c = k % N;
      return 'M' + (c * s + m) + ' ' + (r * s + m) + 'L' + ((c + 1) * s - m) + ' ' + ((r + 1) * s - m) +
        'M' + ((c + 1) * s - m) + ' ' + (r * s + m) + 'L' + (c * s + m) + ' ' + ((r + 1) * s - m);
    }
    const auto = {};
    if (st.autoCross) {
      const rows = {}, cols = {};
      st.pos.forEach(function (k) { if (k >= 0) { rows[Math.floor(k / N)] = true; cols[k % N] = true; } });
      let d = '';
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const k = r * N + c;
        if (!(rows[r] || cols[c])) continue;
        if (st.pos.indexOf(k) >= 0 || P.blocked[k] || (st.crosses && st.crosses[k])) continue; // option 1 : pas de croix sur les objets
        auto[k] = true;
        d += crossPath(k, s * 0.28);
      }
      if (d) out += '<path class="xauto" d="' + d + '" stroke="' + (st.autoCrossColor || '#97a0c6') + '" stroke-width="' + (xw * 0.62).toFixed(1) + '" stroke-linecap="round" opacity=".9"/>';
    }
    let dm = '';
    Object.keys(st.crosses || {}).forEach(function (key) {
      if (st.crosses[key]) dm += crossPath(+key, s * 0.24);
    });
    if (dm) {
      out += '<path d="' + dm + '" stroke="#ffffff" stroke-width="' + (xw + 4) + '" stroke-linecap="round" opacity=".75"/>' +
        '<path class="xman" d="' + dm + '" stroke="' + (st.crossColor || '#3a3a6a') + '" stroke-width="' + xw + '" stroke-linecap="round"/>';
    }
    // vignettes de brouillon (hypothèses) : jusqu'à 4 par case, en 2 × 2
    Object.keys(st.notes || {}).forEach(function (key) {
      const k = +key, l = st.notes[key] || [];
      if (!l.length || st.pos.indexOf(k) >= 0) return;
      const r = Math.floor(k / N), c = k % N;
      const show = l.length > 4 ? l.slice(0, 3) : l;
      const q = s / 2, pad = s * 0.05, w = q - pad * 1.6;
      const dim = auto[k] || (st.crosses && st.crosses[k]) ? ' opacity=".45"' : '';
      out += '<g class="note"' + dim + '>';
      show.forEach(function (i, j) {
        const x = c * s + (j % 2) * q + pad, y = r * s + Math.floor(j / 2) * q + pad;
        const sel = st.selected === i;
        out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + w.toFixed(1) + '" rx="' + (w * 0.22).toFixed(1) + '" fill="' + pawnColor(P, i) + '" stroke="' + (sel ? '#ffd54a' : '#ffffff') + '" stroke-width="' + Math.max(1.5, w * (sel ? 0.12 : 0.07)).toFixed(1) + '" stroke-dasharray="' + (sel ? 'none' : (w * 0.18).toFixed(1) + ' ' + (w * 0.1).toFixed(1)) + '"/>' +
          '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y + w * 0.73).toFixed(1) + '" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, sans-serif" font-weight="800" font-size="' + (w * 0.64).toFixed(1) + '" fill="#ffffff">' + esc(P.people[i].name[0].toUpperCase()) + '</text>';
      });
      if (l.length > 4) {
        const x = c * s + q + pad, y = r * s + q + pad;
        out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + w.toFixed(1) + '" rx="' + (w * 0.22).toFixed(1) + '" fill="#ffffff" stroke="' + O + '" stroke-width="' + Math.max(1.5, w * 0.06).toFixed(1) + '"/>' +
          '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y + w * 0.7).toFixed(1) + '" text-anchor="middle" font-family="Montserrat, system-ui, -apple-system, Segoe UI, sans-serif" font-weight="800" font-size="' + (w * 0.5).toFixed(1) + '" fill="' + O + '">+' + (l.length - 3) + '</text>';
      }
      out += '</g>';
    });
    // pions
    st.pos.forEach(function (k, i) {
      if (k < 0) return;
      const r = Math.floor(k / N), c = k % N;
      const p = P.people[i];
      const mark = st.marks && st.marks[i];
      let ring = '';
      if (mark === 'bad') ring = '<rect x="2" y="2" width="94" height="94" rx="13" fill="none" stroke="#e53935" stroke-width="7" stroke-dasharray="12 7"/>';
      if (mark === 'good') ring = '<rect x="2" y="2" width="94" height="94" rx="13" fill="none" stroke="#2e9e4f" stroke-width="6"/>';
      const sel = st.selected === i ? '<rect x="2" y="2" width="94" height="94" rx="13" fill="none" stroke="#ffd54a" stroke-width="7"/>' : '';
      const knife = st.solved && st.culprit === i ? '<g transform="translate(74,2) rotate(25)"><path d="M0 0 L6 0 L6 34 L3 40 L0 34 Z" fill="#e8eef2" stroke="' + O + '" stroke-width="2.5"/><rect x="-3" y="34" width="12" height="5" fill="#5a4a3a" stroke="' + O + '" stroke-width="2"/></g>' : '';
      void p;
      out += '<g class="pawn" data-i="' + i + '" transform="translate(' + c * s + ',' + r * s + ') scale(' + s / 100 + ')">' + portraitPawn(P, i, knife) + ring + sel + '</g>';
    });
    return out;
  }

  root.MurdokuBoard = {
    SIZE: S, PAD: PAD, staticLayer: staticLayer, fitLabels: fitLabels, dynamicLayer: dynamicLayer,
    pawnSvg: pawnSvg, portraitPawn: portraitPawn, pawnColor: pawnColor, esc: esc
  };
})(typeof window !== 'undefined' ? window : this);
