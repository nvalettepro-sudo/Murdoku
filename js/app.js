/* Murdoku — application (écrans, interactions, sauvegarde). */
(function () {
  'use strict';
  const E = window.MurdokuEngine, B = window.MurdokuBoard, A = window.MurdokuAvatars, I = window.MurdokuIcons;
  const esc = B.esc;
  const PUZZLES = (window.MURDOKU_PUZZLES || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  const SOLUTIONS = window.MURDOKU_SOLUTIONS || {};
  // Les aperçus de PR (…/preview/pr-N/) ont leurs propres sauvegardes, séparées du site officiel
  const PREVIEW = (location.pathname.match(/\/preview\/(pr-\d+)\//) || [])[1] || null;
  const KEY = PREVIEW ? 'murdoku:' + PREVIEW + ':' : 'murdoku:v1:';
  const VER = window.MURDOKU_VERSION || { VERSION: '?', DATE: '', HISTORY: [] };
  // Date au format français (2026-10-22 → 22/10/2026)
  function frDate(iso) { const a = String(iso).split('-'); return a.length === 3 ? a[2] + '/' + a[1] + '/' + a[0] : iso; }
  function versionLabel() { return 'Version ' + VER.VERSION + ' du ' + frDate(VER.DATE); }
  const app = document.getElementById('app');

  // ---------- stockage local (protégé : peut être indisponible) ----------
  function load(k, def) {
    try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function save(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* ignoré */ } }

  // iPad : un double appui rapide zoome la page ; on l'empêche (les gestes du jeu n'utilisent que des appuis simples).
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (e) {
    const now = Date.now();
    if (now - lastTouchEnd < 350 && e.cancelable && !(e.target.closest && e.target.closest('input, textarea'))) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  const settings = Object.assign({ autoCross: true, autoCheck: false, timer: true, showHint: false, showCheck: false }, load('settings', {}));
  delete settings.shade; // ancien réglage (grisé), remplacé par les croix automatiques

  // ---------- utilitaires ----------
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
  function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
  let toastTimer = null;
  function toast(msg, ms) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  }
  function fmtTime(sec) {
    sec = Math.floor(sec || 0);
    const m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function diffClass(d) { return 'd-' + (d || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'); }

  // Cache des énigmes compilées et des solutions
  const compiled = {};
  function getP(def) {
    if (!compiled[def.id]) compiled[def.id] = E.compile(def);
    return compiled[def.id];
  }
  function getSolution(def) {
    const P = getP(def);
    if (P._sol) return P._sol;
    let sol = SOLUTIONS[def.id];
    if (!sol && def.solution) {
      sol = new Array(P.people.length).fill(-1);
      def.solution.trim().split(/\s+/).forEach(function (t) {
        const a = t.split(':'), rc = a[1].split(',');
        sol[P.pid[a[0]]] = (+rc[0]) * P.N + (+rc[1]);
      });
      if (sol.indexOf(-1) >= 0) sol = null;
    }
    if (!sol) {
      const res = E.solve(P, { limit: 1, pairs: P.N >= 12 });
      sol = res.solutions[0] || null;
    }
    P._sol = sol;
    return sol;
  }

  // ---------- icônes d'interface ----------
  const UI = {
    pawn: '<svg viewBox="0 0 32 32"><path d="M9 28 Q8 21 12 18 Q9 15 10.5 11 Q12 6 16 6 Q20 6 21.5 11 Q23 15 20 18 Q24 21 23 28 Z" fill="currentColor"/></svg>',
    cross: '<svg viewBox="0 0 32 32"><path d="M8 8 L24 24 M24 8 L8 24" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>',
    pencil: '<svg viewBox="0 0 32 32"><path d="M6 26 L8 19 L21 6 L26 11 L13 24 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M18 9 L23 14" stroke="currentColor" stroke-width="3"/><path d="M6 26 L11 25" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    eraser: '<svg viewBox="0 0 32 32"><path d="M5 20 L17 8 L26 17 L17 26 L11 26 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M11 14 L20 23" stroke="currentColor" stroke-width="3"/><path d="M17 26 H27" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    undo: '<svg viewBox="0 0 32 32"><path d="M12 9 L6 15 L12 21" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 15 H19 Q26 15 26 21 Q26 27 19 27 H15" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
    redo: '<svg viewBox="0 0 32 32"><g transform="translate(32,0) scale(-1,1)"><path d="M12 9 L6 15 L12 21" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 15 H19 Q26 15 26 21 Q26 27 19 27 H15" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></g></svg>',
    hint: '<svg viewBox="0 0 32 32"><path d="M16 4 Q24 4 25 12 Q25 17 21 20 L20 23 H12 L11 20 Q7 17 7 12 Q8 4 16 4 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M12 27 H20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 32 32"><circle cx="14" cy="14" r="9" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M21 21 L28 28" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M10 14 L13 17 L18 11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reset: '<svg viewBox="0 0 32 32"><path d="M26 16 A10 10 0 1 1 22 8" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M22 3 V9 H16" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    grid: '<svg viewBox="0 0 32 32"><g fill="currentColor"><rect x="5" y="5" width="9" height="9" rx="2"/><rect x="18" y="5" width="9" height="9" rx="2"/><rect x="5" y="18" width="9" height="9" rx="2"/><rect x="18" y="18" width="9" height="9" rx="2"/></g></svg>',
    help: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="3"/><path d="M12 12.5 Q12 8.5 16 8.5 Q20 8.5 20 12 Q20 14.5 16.5 15.8 L16 19" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="23.5" r="2" fill="currentColor"/></svg>',
    gear: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="4.5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M16 3 V7 M16 25 V29 M3 16 H7 M25 16 H29 M6.8 6.8 L9.6 9.6 M22.4 22.4 L25.2 25.2 M6.8 25.2 L9.6 22.4 M22.4 9.6 L25.2 6.8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
  };

  function logoSvg(color) {
    // « MUR[DO]KU » : le D-O dessine une loupe avec une goutte
    return '<span class="logo" aria-label="Murdoku"><span class="l1">M</span><span class="l2">U</span><span class="l3">R</span><svg viewBox="2 0 106 80" aria-hidden="true">' +
      '<path d="M6 10 H34 Q62 10 62 40 Q62 70 34 70 H6 Z" fill="#3fb3c0" stroke="#1d1d24" stroke-width="6"/>' +
      '<path d="M40 64 Q46 82 40 90 Q36 82 40 64 Z M70 64 Q78 84 70 92 Q64 84 70 64 Z" fill="#e8607a"/>' +
      '<path d="M18 62 Q30 74 50 72 Q66 80 86 72 Q100 66 96 58 L20 58 Z" fill="#e8607a" stroke="#1d1d24" stroke-width="4"/>' +
      '<circle cx="78" cy="40" r="27" fill="#1d1d24"/><circle cx="78" cy="40" r="16" fill="#3fb3c0"/><circle cx="78" cy="40" r="7" fill="#1d1d24"/>' +
      '</svg><span class="l4">K</span><span class="l5">U</span></span>';
  }

  // ---------- routage ----------
  function route() {
    const hsh = location.hash.replace(/^#\/?/, '');
    const parts = hsh.split('/');
    stopTimer();
    if (parts[0] === 'p' && parts[1]) {
      const def = PUZZLES.find(function (p) { return p.id === parts[1]; });
      if (def) { showGame(def); return; }
    }
    showHome();
  }
  window.addEventListener('hashchange', route);

  // =====================================================================
  //  ACCUEIL
  // =====================================================================
  function showHome() {
    cur = null;
    document.documentElement.style.setProperty('--bg1', '#5f9292');
    document.documentElement.style.setProperty('--bg2', '#3b3f86');
    document.title = 'Murdoku — Menu';
    const groups = [{ title: 'Les enquêtes', items: PUZZLES }];
    let html = '<main class="home"><header class="home-head"><div>' + logoSvg() +
      '<p>Lis les indices, place chaque suspect sur la scène de crime… et démasque le meurtrier.</p></div>' +
      '<div class="home-actions"><button class="pill-btn" data-act="rules">' + UI.help + 'Comment jouer</button>' +
      '<button class="pill-btn" data-act="settings">' + UI.gear + 'Options</button></div></header>' +
      '<section class="home-section howto"><h2>Quick guide : les règles en 3 points</h2><div class="steps">' + stepsHtml() + '</div>' +
      '<p class="more">Toutes les règles du jeu et les astuces de l’application : <button class="link-btn" data-act="rules2">Comment jouer</button></p></section>';
    groups.forEach(function (g) {
      if (!g.items.length) return;
      html += '<section class="home-section"><h2>' + g.title + '</h2><div class="puzzle-grid">';
      g.items.forEach(function (def) {
        const st = load('p:' + def.id, null);
        const pal = def.palette || {};
        let status = '<span class="chip">Nouvelle</span>';
        if (st && st.solved) status = '<span class="chip solved">Résolue · ' + fmtTime(st.time) + '</span>';
        else if (st && st.pos && st.pos.some(function (k) { return k >= 0; })) status = '<span class="chip progress">En cours</span>';
        html += '<a class="pcard" href="#/p/' + def.id + '" style="--pc1:' + (pal.bg1 || '#5f9292') + ';--pc2:' + (pal.bg2 || '#3b3f86') + ';text-decoration:none">' +
          '<div class="thumb">' + thumbSvg(def) + '</div><div class="meta"><h3>' + esc(def.title) + '</h3>' +
          '<div class="orig">' + esc(def.original || '') + '</div><div class="chips">' +
          '<span class="chip ' + diffClass(def.difficulty) + '">' + esc(def.difficulty) + '</span>' +
          '<span class="chip">' + def.size + '×' + def.size + '</span>' +
          '<span class="chip">' + def.people.length + ' personnages</span>' + status + '</div></div></a>';
      });
      html += '</div></section>';
    });
    html += '<footer class="home-foot"><p class="version"><b>' + esc(versionLabel()) + '</b>' + (PREVIEW ? ' · <span class="preview-tag">Aperçu ' + esc(PREVIEW.replace('pr-', 'PR #')) + '</span>' : '') + '</p>Murdoku est un jeu créé par Manuel Garand (énigmes et concept). ' +
      'Les illustrations des fiches originales sont de Manuel Garand, Valentyna Bezdushna et Eli Voisin ; le golf et les îles sont de Craig Wallander. ' +
      'Cette adaptation web en français est non officielle, réalisée pour un usage personnel : ' +
      'les visuels sont redessinés. Retrouve le jeu officiel sur <a href="https://murdoku.com" target="_blank" rel="noopener">murdoku.com</a>.</footer></main>';
    app.innerHTML = html;
    app.querySelector('[data-act="rules"]').addEventListener('click', showRules);
    app.querySelector('[data-act="rules2"]').addEventListener('click', showRules);
    app.querySelector('[data-act="settings"]').addEventListener('click', showSettings);
    B.fitLabels(app);
  }

  // Quick guide : 3 points (règle du jeu + geste dans cette version), affichés sur le Menu
  function stepsHtml() {
    const items = [
      ['1', 'Lis les indices et place les suspects',
        'Chaque suspect se trouve dans une case libre, selon son indice (pièce, objet, voisin).',
        'Touche un suspect, puis sa case. Un appui sur son pion le retire.'],
      ['2', 'Une personne par rangée et par colonne',
        'Dès qu’un suspect est placé, plus personne d’autre sur sa rangée ni sur sa colonne.',
        'Touche une case vide pour une croix, ou glisse pour en tracer plusieurs. Des croix claires se posent aussi toutes seules.'],
      ['3', 'Démasque le meurtrier',
        'Place tout le monde, victime comprise : le meurtrier était seul avec elle, dans la même pièce.',
        'Un doute ? Active Brouillon, pose un suspect sur plusieurs cases, puis appui long sur une vignette pour la valider.']
    ];
    return items.map(function (it) {
      return '<div class="step"><span class="n">' + it[0] + '</span><div><h3>' + it[1] + '</h3>' +
        '<p class="rule">' + it[2] + '</p><p class="app"><b>Sur l’écran :</b> ' + it[3] + '</p></div></div>';
    }).join('');
  }

  function thumbSvg(def) {
    try {
      const P = getP(def);
      return '<svg viewBox="-16 -16 1032 1032" xmlns="http://www.w3.org/2000/svg">' + B.staticLayer(P) + '</svg>';
    } catch (e) {
      return '';
    }
  }

  // =====================================================================
  //  JEU
  // =====================================================================
  let cur = null; // état de la partie en cours

  const LAYOUT = {
    landscape: {
      W: 1500, H: 1000,
      brand: [28, 18, 410, 196], rules3: [452, 24, 1024, 166], legend: [850, 198, 626, 82],
      board: [850, 290, 626, 626], suspects: [24, 222, 808, 682], detail: [24, 836, 808, 66],
      toolbar: [24, 922, 808, 70], result: [24, 222, 808, 692], topbtns: [1234, 926, 242, 66]
    },
    portrait: {
      W: 1000, H: 1420,
      brand: [26, 16, 600, 168], topbtns: [640, 24, 336, 66], rules3: [26, 190, 950, 154], legend: [26, 354, 950, 78],
      board: [195, 442, 610, 610], suspects: [26, 1062, 950, 200], detail: [26, 1268, 950, 62],
      toolbar: [26, 1340, 620, 72], result: [26, 1062, 950, 270]
    }
  };

  // Zones sûres (encoche, îlot dynamique, barre du bas de l'iPhone). Test : ajouter ?safe=haut,droite,bas,gauche à l'adresse.
  function safeInsets() {
    const q = /[?&]safe=(\d+),(\d+),(\d+),(\d+)/.exec(location.search);
    if (q) return { t: +q[1], r: +q[2], b: +q[3], l: +q[4] };
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(d);
    const cs = getComputedStyle(d);
    const r = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
    document.body.removeChild(d);
    return r;
  }
  function availSize() {
    const i = safeInsets();
    // Application installée (iOS 26) : le système floute les bords haut et bas ; on garde le contenu à distance
    const standalone = (window.navigator && window.navigator.standalone) || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    if (standalone && !/[?&]safe=/.test(location.search)) { if (i.t > 0) i.t += 14; if (i.b > 0) i.b += 6; }
    const vh = window.visualViewport ? Math.min(window.innerHeight, window.visualViewport.height) : window.innerHeight;
    return { w: window.innerWidth - i.l - i.r, h: vh - i.t - i.b, ins: i };
  }

  function orientation() {
    return window.innerWidth / window.innerHeight < 0.92 ? 'portrait' : 'landscape';
  }

  // Petits écrans en paysage (tablette Android 10", iPad Air/mini…) : la scène fixe 1500×1000 y serait réduite à moins de 85 %.
  // On construit alors une scène à l'échelle fixe 0,8, aux dimensions de l'écran : plateau plus grand, fiches plus grandes,
  // sans les trois bulles de règles (elles restent dans « Règles » et dans le Menu).
  const COMPACT_K = 0.8;
  function layoutFor(orient) {
    const av = availSize(), vw = av.w, vh = av.h;
    if (orient === 'portrait' && vw < 600) return layoutPhone(vw, vh);
    if (orient === 'portrait' && Math.min(vw / 1000, vh / 1420) < 0.85) return layoutPortraitCompact(vw, vh);
    if (orient !== 'landscape' || Math.min(vw / 1500, vh / 1000) >= 0.85) {
      const std = Object.assign({ key: orient }, LAYOUT[orient]);
      if (orient === 'landscape' && legendExtra()) { // 16 px de plus pour la légende, pris sur le plateau
        std.legend = [850, 194, 626, 98]; std.board = [858, 302, 610, 610]; std.key += ':lg';
      }
      return std;
    }
    const W = Math.round(vw / COMPACT_K), H = Math.round(vh / COMPACT_K);
    const m = 18, gap = 14, legendH = 76 + 24 * legendExtra(), toolH = 70, brandH = 88;
    const dense = cur && cur.def && cur.def.people.length > 10; // beaucoup de fiches : plateau un peu plus petit, fiches plus larges
    const B = Math.min(H - 2 * m - legendH - gap - (dense ? toolH + 10 : 0), Math.round(W * 0.5), dense ? 660 : 9999);
    const x0 = W - m - B, Lw = x0 - m - 22;
    // beaucoup de fiches : la barre d'outils passe sous le plateau, ce qui rend toute la hauteur aux fiches
    const tool = dense ? [x0, m + legendH + gap + B + 10, B, toolH] : [m, H - m - toolH, Lw, toolH];
    const sTop = m + brandH + 10, sH = (dense ? H - m : H - m - toolH - 10) - sTop;
    return {
      key: 'compact:' + vw + 'x' + vh, compact: true, k: COMPACT_K, minFs: dense ? 12.5 : 14,
      W: W, H: H, brand: [m, m, Lw - 262, brandH], rules3: null, legend: [x0, m, B, legendH],
      board: [x0, m + legendH + gap, B, B], suspects: [m, sTop, Lw, sH], detail: [m, sTop + sH - 66, Lw, 66],
      toolbar: tool, result: [m, sTop - 14, Lw, sH + 14], topbtns: [m + Lw - 250, m + 6, 250, 66]
    };
  }

  // Téléphone tenu verticalement : échelle fixe 0,75, plateau pleine largeur, légende sur deux lignes, fiches en portraits seuls.
  function layoutPhone(vw, vh) {
    const k = 0.75, W = Math.round(vw / k), H = Math.round(vh / k);
    const m = 14, brandH = 58, toolH = 70;
    const notes = cur && cur.def ? (cur.def.globals || []).filter(function (g) { return g.text; }).length : 0;
    const dense = cur && cur.def && cur.def.people.length > 10;
    const detH = notes ? 22 + 48 * notes : 66; // règles spéciales de l'énigme : affichées dans la boîte d'information
    const legendH = (cur && cur.legendH) || 104;
    const yLeg = m + brandH + 8, yB = yLeg + legendH + 8;
    const B = Math.max(280, Math.min(W - 2 * m, dense ? 430 : 9999, H - yB - 8 - 200 - toolH - 2 * m));
    const sTop = yB + B + 8, sAll = H - m - toolH - 8 - sTop, sH = sAll - detH - 4;
    return {
      key: 'phone:' + vw + 'x' + vh, compact: true, phone: true, k: k, minFs: 11,
      W: W, H: H, brand: [m, m, W - 2 * m - 238, brandH], topbtns: [W - m - 232, m - 2, 232, 66], rules3: null,
      legend: [m, yLeg, W - 2 * m, legendH], board: [Math.round((W - B) / 2), yB, B, B], legendH: legendH,
      suspects: [m, sTop, W - 2 * m, sH], detail: [m, sTop + sH + 4, W - 2 * m, detH],
      toolbar: [m, H - m - toolH, W - 2 * m, toolH], result: [m, sTop - 6, W - 2 * m, sAll + 6]
    };
  }

  // Même idée en portrait (tablette tenue verticalement) : échelle fixe 0,85, sans les bulles de règles.
  function layoutPortraitCompact(vw, vh) {
    const k = 0.85, W = Math.round(vw / k), H = Math.round(vh / k);
    const m = 16, brandH = 88, legendH = 74, toolH = 70;
    const y1 = m + brandH + 10 + legendH + 12;
    // Le plateau prend toute la largeur possible ; dessous, on ne garde que le strict minimum :
    // deux rangées de petits portraits, la ligne d'information et, s'il y en a, le bandeau des règles spéciales.
    const nNotes = cur && cur.def ? (cur.def.globals || []).filter(function (g) { return g.text; }).length : 0;
    const nPeople = cur && cur.def ? cur.def.people.length : 12;
    const reserve = (nPeople > 9 ? 190 : 130) + 68 + (nNotes ? 62 : 0); // 9 portraits tiennent sur une seule rangée
    const B = Math.max(300, Math.min(W - 2 * m, H - m - toolH - 10 - reserve - y1 - 12));
    const sTop = y1 + B + 12, sAll = H - m - toolH - 10 - sTop, sH = sAll - 62 - 6; // le détail d'un suspect s'affiche sous les fiches
    return {
      key: 'compactp:' + vw + 'x' + vh, compact: true, k: k, minFs: 13,
      W: W, H: H, brand: [m, m, W - 2 * m - 262, brandH], topbtns: [W - m - 250, m + 6, 250, 66], rules3: null,
      legend: [m, m + brandH + 10, W - 2 * m, legendH], board: [Math.round((W - B) / 2), y1, B, B],
      suspects: [m, sTop, W - 2 * m, sH], detail: [m, sTop + sH + 6, W - 2 * m, 62],
      toolbar: [m, H - m - toolH, W - 2 * m, toolH], result: [m, sTop - 6, W - 2 * m, sAll + 6]
    };
  }

  function newState(def) {
    const n = def.people.length;
    return { pos: new Array(n).fill(-1), crosses: {}, notes: {}, time: 0, solved: false };
  }

  function showGame(def) {
    const P = getP(def);
    const saved = load('p:' + def.id, null);
    const st = saved && saved.pos && saved.pos.length === def.people.length ? saved : newState(def);
    st.crosses = st.crosses || {};
    st.notes = st.notes || {};
    cur = {
      def: def, P: P, st: st, tool: 'normal', selected: -1, hover: -1, history: [], future: [],
      highlight: [], marks: null, hint: null, orient: orientation()
    };
    const pal = def.palette || {};
    document.documentElement.style.setProperty('--bg1', pal.bg1 || '#5f9292');
    document.documentElement.style.setProperty('--bg2', pal.bg2 || '#3b3f86');
    const tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.content = pal.bg1 || '#5f9292'; // teinte de la barre d'état
    document.title = def.title + ' — Murdoku';
    buildStage();
    startTimer();
  }

  const LOGOS = {
    pastel: ['#8a7ab8', '#c05a8e', '#d0906a', '#b7a0cf', '#e49a8e'],
    dark: ['#1d1d24', '#1d1d24', '#1d1d24', '#1d1d24', '#1d1d24'],
    gold: ['#c9a95a', '#c9a95a', '#c9a95a', '#c9a95a', '#c9a95a']
  };
  function paletteVars(pal) {
    const map = { card: '--card', card2: '--card2', victim: '--victim', title: '--title', panel: '--panel', legendOk: '--legend-ok', legendNo: '--legend-no', ink: '--ink', diff: '--diff' };
    let css = Object.keys(map).filter(function (k) { return pal[k]; }).map(function (k) { return map[k] + ':' + pal[k]; }).join(';');
    const lg = LOGOS[pal.logo];
    if (lg) css += ';' + lg.map(function (c, i) { return '--logo' + (i + 1) + ':' + c; }).join(';');
    return css;
  }

  function box(r) { return 'left:' + r[0] + 'px;top:' + r[1] + 'px;width:' + r[2] + 'px;height:' + r[3] + 'px'; }

  function buildStage() {
    const def = cur.def, P = cur.P;
    const L = Object.assign({}, layoutFor(cur.orient));
    // Règles spéciales de l'énigme (parité, comptages…) : bandeau sous les fiches
    const notes = (def.globals || []).filter(function (g) { return g.text; });
    if (notes.length && !L.phone) {
      const sb = L.suspects.slice();
      const nh = L.phone ? 14 + 50 * notes.length : cur.orient === 'portrait' ? 54 : 30 + 30 * notes.length;
      L.suspects = [sb[0], sb[1], sb[2], sb[3] - nh - 8];
      L.notes = [sb[0], sb[1] + sb[3] - nh, sb[2], nh];
      if (L.compact && cur.orient === 'landscape') L.detail = [sb[0], L.suspects[1] + L.suspects[3] - L.detail[3], sb[2], L.detail[3]]; // au-dessus du bandeau de règles
    }
    cur.L = L;
    const pal = def.palette || {};
    let html = '<div class="stage-wrap"><div class="stage ' + cur.orient + (L.compact ? ' compact-l' : '') + (L.phone ? ' phone' : '') + (L.compact && !L.phone && L.brand[2] < 440 ? ' slim' : '') + (pal.titleDark ? ' dark-title' : '') + '" style="' + paletteVars(pal) + (L.compact ? ';width:' + L.W + 'px;height:' + L.H + 'px' : '') + '">';
    // en-tête
    const h1 = L.compact ? (def.title.length > 18 ? 26 : 32) : def.title.length > 22 ? 30 : def.title.length > 15 ? 35 : 42;
    html += '<header class="region brand" style="' + box(L.brand) + ';--h1:' + h1 + 'px">' + logoSvg() +
      '<h1>' + esc(def.title) + '</h1><div class="diff">difficulté : ' + esc(def.difficulty) + '</div></header>';
    // bulles de règles
    if (L.rules3) html += '<section class="region rules3" style="' + box(L.rules3) + '">' + rulesBubbles(def) + '</section>';
    // légende
    html += '<section class="region legend" style="' + box(L.legend) + '">' + legendHtml(P) + '</section>';
    // plateau
    html += '<section class="region boardbox" style="' + box(L.board) + '"><svg class="board" viewBox="' + (-B.PAD) + ' ' + (-B.PAD) + ' ' + (B.SIZE + 2 * B.PAD) + ' ' + (B.SIZE + 2 * B.PAD) + '" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Scène de crime">' +
      '<g class="static">' + B.staticLayer(P) + '</g><g class="dyn"></g></svg></section>';
    // suspects
    html += '<section class="region suspects" style="' + box(L.suspects) + '" aria-label="Suspects"></section>';
    html += '<section class="region detail" style="' + box(L.detail) + '" aria-live="polite"></section>';
    if (L.notes) {
      html += '<section class="region notes" style="' + box(L.notes) + '">' + notes.map(function (g, j) {
        return '<div class="note"><span class="num">' + (j + 1) + '</span><span>' + md(g.text) + '</span></div>';
      }).join('') + '</section>';
    }
    // outils
    html += '<section class="region toolbar" style="' + box(L.toolbar) + '">' +
      toolBtn('draft', 'Brouillon', UI.pencil) +
      actBtn('undo', 'Annuler', UI.undo, 'sep') + actBtn('redo', 'Rétablir', UI.redo) +
      (settings.showHint ? actBtn('hint', 'Indice', UI.hint, 'sep') : '') +
      (settings.showCheck ? actBtn('check', 'Vérifier', UI.check, settings.showHint ? '' : 'sep') : '') +
      actBtn('reset', 'Effacer', UI.reset, settings.showHint || settings.showCheck ? '' : 'sep') +
      '<button class="tool result-btn" data-act="result" title="Résultat" hidden>' + UI.grid + '<span>Résultat</span></button>' +
      (settings.timer && cur.orient === 'landscape' ? '<span class="timer" aria-label="Temps">' + fmtTime(cur.st.time) + '</span>' : '') + '</section>';
    html += '<nav class="region topbtns" style="' + box(L.topbtns) + '">' + actBtn('home', 'Menu', UI.grid) + actBtn('rules', 'Règles', UI.help) + actBtn('settings', 'Options', UI.gear) + '</nav>';
    html += '</div></div>';
    app.innerHTML = html;
    cur.stage = app.querySelector('.stage');
    cur.svg = app.querySelector('svg.board');
    cur.dyn = cur.svg.querySelector('.dyn');
    renderCards();
    layoutCards();
    renderAll();
    fitStage();
    bindStage();
    B.fitLabels(cur.svg);
    if (L.compact && !L.phone) fitBrand();
    if (L.phone) fitLegendPhone();
    fitLegend(cur.stage);
  }

  // Téléphone : la légende s'étend selon le nombre d'objets ; on reconstruit une fois avec la hauteur mesurée
  function fitLegendPhone() {
    const lg = cur.stage.querySelector('.legend');
    lg.style.height = 'auto';
    const need = Math.ceil(lg.offsetHeight);
    lg.style.height = cur.L.legend[3] + 'px';
    if (Math.abs(need - cur.L.legend[3]) > 3 && !cur.legendFixed) { cur.legendH = need; cur.legendFixed = true; buildStage(); }
  }

  // Légende : le contenu de chaque bulle est réduit, si besoin, pour tenir dans la bulle (jamais de texte qui dépasse)
  function fitLegend(root) {
    Array.prototype.forEach.call(root.querySelectorAll('.legend .lg'), function (lg) {
      const inner = lg.querySelector('.lgi');
      if (!inner) return;
      inner.style.transform = '';
      const cs = getComputedStyle(lg);
      const availH = lg.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const availW = lg.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const sc = Math.min(1, availH / inner.offsetHeight, availW / inner.scrollWidth);
      if (sc < 0.999) { inner.style.transform = 'scale(' + sc.toFixed(3) + ')'; inner.style.transformOrigin = 'center center'; }
    });
  }

  // En-tête compact : le titre se réduit jusqu'à tenir à côté de la difficulté, sur une seule ligne
  function fitBrand() {
    const br = cur.stage.querySelector('.brand'), h1 = br.querySelector('h1'), diff = br.querySelector('.diff');
    if (!h1 || !diff) return;
    const slim = cur.stage.classList.contains('slim');
    const avail = slim ? br.clientWidth : br.clientWidth - diff.offsetWidth - 20;
    let fs = parseFloat(getComputedStyle(h1).fontSize), guard = 0;
    while (h1.scrollWidth > avail && fs > 15 && guard++ < 30) { fs -= 1; h1.style.fontSize = fs + 'px'; }
  }

  function toolBtn(id, label, icon) {
    return '<button class="tool" data-tool="' + id + '" aria-pressed="' + (cur.tool === id) + '" title="' + label + '">' + icon + '<span>' + label + '</span></button>';
  }
  function actBtn(id, label, icon, cls) {
    return '<button class="tool ' + (cls || '') + '" data-act="' + id + '" title="' + label + '">' + icon + '<span>' + label + '</span></button>';
  }

  function rulesBubbles(def) {
    const b1 = '<div class="bubble"><span class="num">1</span><h3>' + md(def.intro || '') + '</h3>' +
      '<p>Lis les indices et place chaque suspect. Le <b>meurtrier</b> était <b>seul avec la victime</b>, dans la même zone.</p>' +
      (def.note ? '<p class="note-line"><b>Note :</b> ' + md(def.note) + '</p>' : '') + '</div>';
    const b2 = '<div class="bubble"><span class="num">2</span><h3>Une personne par rangée et par colonne</h3>' +
      '<div class="mini"><figure>' + miniGrid(false) + 'quand tu places quelqu’un…</figure><figure>' + miniGrid(true) + '…sa rangée et sa colonne sont bloquées</figure></div></div>';
    const b3 = '<div class="bubble"><span class="num">3</span><h3>Que veut dire « à côté » ?</h3>' +
      '<div class="b3">' + miniBeside() + '<div class="b3txt"><p>À gauche, à droite, au-dessus ou en dessous, <b>dans la même zone</b>.</p>' +
      '<p class="key"><span class="ok">Silhouette</span> : à côté du ●<br><span class="no">✕</span> : pas à côté</p></div></div></div>';
    return b1 + b2 + b3;
  }

  function miniGrid(blocked) {
    const s = 26, o = '#2b2838';
    let g = '<svg viewBox="-3 -3 84 84">';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const area2 = (r === 2 && c >= 1) || (r === 1 && c === 2);
      g += '<rect x="' + c * s + '" y="' + r * s + '" width="' + s + '" height="' + s + '" fill="' + (area2 ? '#fff' : '#bfe6f2') + '" stroke="' + o + '" stroke-width="1.6"/>';
    }
    g += '<path d="M' + s + ' ' + 3 * s + ' V' + 2 * s + ' H' + 2 * s + ' V' + s + ' H' + 3 * s + '" fill="none" stroke="' + o + '" stroke-width="4"/>';
    g += '<rect x="0" y="0" width="' + 3 * s + '" height="' + 3 * s + '" fill="none" stroke="' + o + '" stroke-width="4"/>';
    g += '<circle cx="' + 2.5 * s + '" cy="' + 0.5 * s + '" r="9" fill="#fff" stroke="' + o + '" stroke-width="2"/><text x="' + 2.5 * s + '" y="' + (0.5 * s + 4.5) + '" text-anchor="middle" font-size="12" font-weight="800" font-family="Montserrat, system-ui, sans-serif" fill="' + o + '">A</text>';
    if (blocked) {
      [[0, 0], [0, 1], [1, 2], [2, 2]].forEach(function (rc) {
        const x = rc[1] * s, y = rc[0] * s, m = 7;
        g += '<path d="M' + (x + m) + ' ' + (y + m) + ' L' + (x + s - m) + ' ' + (y + s - m) + ' M' + (x + s - m) + ' ' + (y + m) + ' L' + (x + m) + ' ' + (y + s - m) + '" stroke="#3a5ab8" stroke-width="3.5" stroke-linecap="round"/>';
      });
    }
    return g + '</svg>';
  }

  function miniBeside() {
    const s = 26, o = '#2b2838';
    let g = '<svg viewBox="-3 -3 84 84">';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      g += '<rect x="' + c * s + '" y="' + r * s + '" width="' + s + '" height="' + s + '" fill="' + (r === 2 ? '#fff' : '#bfe6f2') + '" stroke="' + o + '" stroke-width="1.6"/>';
    }
    g += '<path d="M0 ' + 2 * s + ' H' + 3 * s + '" stroke="' + o + '" stroke-width="4"/><rect x="0" y="0" width="' + 3 * s + '" height="' + 3 * s + '" fill="none" stroke="' + o + '" stroke-width="4"/>';
    g += '<circle cx="' + 1.5 * s + '" cy="' + 1.5 * s + '" r="7" fill="#4a5aa8"/>';
    const person = function (x, y) { return '<g transform="translate(' + (x - 7) + ',' + (y - 10) + ')"><circle cx="7" cy="4" r="3.6" fill="' + o + '"/><path d="M2 20 L3 9 Q7 7 11 9 L12 20 Z" fill="' + o + '"/></g>'; };
    g += person(1.5 * s, 0.5 * s) + person(0.5 * s, 1.5 * s);
    const x = function (cx, cy) { const m = 6; return '<path d="M' + (cx - m) + ' ' + (cy - m) + ' L' + (cx + m) + ' ' + (cy + m) + ' M' + (cx + m) + ' ' + (cy - m) + ' L' + (cx - m) + ' ' + (cy + m) + '" stroke="#c0397a" stroke-width="3.5" stroke-linecap="round"/>'; };
    g += x(0.5 * s, 0.5 * s) + x(1.5 * s, 2.5 * s);
    return g + '</svg>';
  }

  // Objets distincts de la légende : ceux où l'on peut se tenir, et les autres
  function legendLists(P) {
    const occ = new Set(P.def.occupiable || []);
    const seenOk = {}, seenNo = {};
    const ok = [], no = [];
    P.pieces.forEach(function (p) {
      const vis = p.type;
      const isOk = occ.has(p.logical);
      const key = (I.NAMES[vis] || vis);
      if (isOk) { if (seenOk[key]) return; seenOk[key] = 1; ok.push(p); }
      else { if (seenNo[key]) return; seenNo[key] = 1; no.push(p); }
    });
    return { ok: ok, no: no };
  }
  // Légende chargée (plus de 9 objets, ex. le zoo) : on lui donne plus de hauteur dans les mises en page paysage
  function legendExtra() {
    if (!cur || !cur.P) return 0;
    const l = legendLists(cur.P);
    return l.ok.length + l.no.length > 9 ? 1 : 0;
  }

  function legendHtml(P) {
    const def = P.def;
    const lists = legendLists(P), ok = lists.ok, no = lists.no;
    function item(p) {
      const name = I.NAMES[p.type] || p.type;
      let svg;
      if (p.type === 'path' || p.type === 'sand' || p.type === 'water') {
        const col = { path: '#f6ead2', sand: '#f8e6bd', water: '#9fd3ef' }[p.type];
        svg = '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="6" fill="' + col + '" stroke="#2b2838" stroke-width="5"/></svg>';
      } else if (p.type === 'carpet') {
        svg = '<svg viewBox="0 0 100 100"><rect x="14" y="14" width="72" height="72" rx="6" fill="' + (p.v || '#c9a0c0') + '" stroke="#2b2838" stroke-width="5"/><rect x="24" y="24" width="52" height="52" fill="' + I.shade(p.v || '#c9a0c0', 0.15) + '"/></svg>';
      } else if (p.type === 'table' || p.type === 'desk') {
        svg = '<svg viewBox="0 0 100 100">' + I.ICONS[p.type === 'desk' ? 'desk' : 'table']({ v: p.v || (def.palette && def.palette.table) }) + '</svg>';
      } else if (I.BIG && I.BIG[p.type]) {
        svg = '<svg viewBox="0 0 200 200">' + I.ICONS[p.type](p) + '</svg>';
      } else if (I.LONG[p.type]) {
        svg = '<svg class="long" viewBox="0 0 200 100">' + I.ICONS[p.type](p) + '</svg>';
      } else if (p.type === 'door') {
        svg = '<svg viewBox="0 0 100 100"><g transform="translate(50,0)">' + I.ICONS.door({ dir: 'l' }) + '</g></svg>';
      } else if (p.type === 'window') {
        svg = '<svg viewBox="0 0 100 100"><g transform="translate(42,0)">' + I.ICONS.window({}) + '</g></svg>';
      } else if (I.ICONS[p.type]) {
        svg = '<svg viewBox="0 0 100 100">' + I.ICONS[p.type](Object.assign({}, p, { dir: null })) + '</svg>';
      } else svg = '';
      return '<div class="it">' + svg + '<span>' + esc(name) + '</span></div>';
    }
    let html = '';
    const dense = ok.length + no.length > 9 ? ' dense' : '';
    if (dense) html += '<span hidden class="dense-flag"></span>';
    if (ok.length) html += '<div class="lg ok' + dense + '"><div class="lgi"><h4>Peut être occupé</h4><div class="items">' + ok.map(item).join('') + '</div></div></div>';
    if (no.length) html += '<div class="lg no' + dense + '"><div class="lgi"><h4>Ne peut pas être occupé</h4><div class="items">' + no.map(item).join('') + '</div></div></div>';
    return html;
  }

  // ---------- fiches suspects ----------
  function renderCards() {
    const def = cur.def, P = cur.P;
    const box2 = cur.stage.querySelector('.suspects');
    box2.innerHTML = P.people.map(function (p, i) {
      const isV = i === P.victim;
      return '<button class="card' + (isV ? ' victim' : '') + '" data-i="' + i + '" aria-label="' + esc(p.name) + '">' +
        '<span class="polaroid"><span class="photo">' + A.avatar(p.look, { victim: isV }) + '</span><span class="name' + (p.name.length >= 8 ? ' long' : '') + '">' + esc(p.name) + '</span></span>' +
        '<span class="clue">' + (p.tag ? '<i class="tag ' + (p.role || '') + '">' + esc(p.tag) + '</i>' : '') + md(p.clue || '') + '</span>' +
        '<span class="badge" style="background:' + B.pawnColor(P, i) + '">' + esc(p.name[0]) + '</span></button>';
    }).join('');
    void def;
  }

  // Ajuste la taille et la disposition des fiches pour remplir la zone disponible.
  // Trois modes : verticale (polaroïd + bulle dessous), horizontale (bulle à droite), compacte (portrait seul).
  function layoutCards() {
    const box2 = cur.stage.querySelector('.suspects');
    const L = cur.L;
    const n = cur.P.people.length;
    const W = L.suspects[2], H = L.suspects[3];
    const cap = 21;
    function measure(mode) {
      box2.classList.toggle('compact', mode === 'compact');
      box2.classList.toggle('horiz', mode === 'horiz');
      box2.style.setProperty('--fs', '16px');
      box2.style.gridTemplateColumns = 'repeat(' + n + ', max-content)';
      let cw = 0, ch = 0;
      Array.prototype.forEach.call(box2.children, function (c) { cw = Math.max(cw, c.offsetWidth); ch = Math.max(ch, c.offsetHeight); });
      let best = { fs: 0, cols: 1, mode: mode };
      for (let cols = 1; cols <= n; cols++) {
        const rows = Math.ceil(n / cols);
        const gapX = mode === 'horiz' ? 18 : 14, gapY = mode === 'compact' ? 8 : 16;
        const sx = (W - gapX * (cols - 1)) / (cols * cw), sy = (H - gapY * (rows - 1)) / (rows * ch);
        const fs = Math.min(16 * Math.min(sx, sy), cap);
        // à taille égale (plafonnée), on préfère plus de colonnes : fiches mieux réparties
        if (fs > best.fs + 0.01 || (Math.abs(fs - best.fs) <= 0.01 && cols <= Math.ceil(n / 2) + 1)) best = { fs: fs, cols: cols, gapX: gapX, gapY: gapY, mode: mode };
      }
      return best;
    }
    const minFs = L.minFs || (cur.orient === 'portrait' ? 13.5 : 12.5);
    let best = measure('vert');
    if (best.fs < 15) {
      const hz = measure('horiz');
      if (hz.fs > best.fs) best = hz;
    }
    if (best.fs < minFs) best = measure('compact');
    const fs = Math.min(best.fs, 21);
    box2.classList.toggle('compact', best.mode === 'compact');
    box2.classList.toggle('horiz', best.mode === 'horiz');
    box2.style.setProperty('--fs', fs.toFixed(2) + 'px');
    box2.style.gridTemplateColumns = 'repeat(' + best.cols + ', max-content)';
    box2.style.columnGap = best.gapX + 'px';
    box2.style.rowGap = best.gapY + 'px';
    cur.compact = best.mode === 'compact';
    fitNames(box2);
    if (!cur.compact) cur.stage.querySelector('.detail').classList.remove('show');
  }

  // Réduit la police d'un prénom tant qu'il dépasse du cadre polaroïd (tous niveaux, tous modes).
  function fitNames(root2) {
    Array.prototype.forEach.call(root2.querySelectorAll('.card .name'), function (el) {
      el.style.fontSize = '';
      const frame = el.parentNode; // .polaroid
      const cs = getComputedStyle(el);
      const pad = function () { return parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) * 2; };
      const avail = function () { return frame.clientWidth * 0.9 - pad(); }; // marge pour les jambages
      const range = document.createRange();
      range.selectNodeContents(el);
      let guard = 0;
      while (range.getBoundingClientRect().width / scaleOf(frame) > avail() && guard++ < 25) {
        const fsz = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = (fsz * 0.94).toFixed(2) + 'px';
      }
    });
  }
  // Rapport entre taille affichée et taille CSS (la planche est mise à l'échelle par transform)
  function scaleOf(el) {
    return el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
  }
  // Les polices web peuvent arriver après le premier rendu (réseau lent) : le texte s'élargit alors.
  // On refait donc toute la mise en page des fiches, des prénoms, des étiquettes et de l'en-tête.
  function refitAll() {
    if (cur && cur.stage) {
      layoutCards(); B.fitLabels(cur.svg); fitLegend(cur.stage);
      if (cur.L.compact) { const h1 = cur.stage.querySelector('.brand h1'); if (h1) h1.style.fontSize = ''; fitBrand(); }
      if (cur.compact) renderDetail();
    } else B.fitLabels(app);
  }
  if (document.fonts) {
    if (document.fonts.ready) document.fonts.ready.then(refitAll);
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refitAll);
  }

  function renderDetail() {
    const det = cur.stage.querySelector('.detail');
    if (!cur.compact) { det.classList.remove('show'); return; }
    const i = cur.selected;
    if (i < 0) {
      const gl = (cur.def.globals || []).filter(function (g) { return g.text; });
      det.innerHTML = cur.L.phone && gl.length
        ? '<div class="gl">' + gl.map(function (g, j) { return '<div class="note"><span class="num">' + (j + 1) + '</span><span>' + md(g.text) + '</span></div>'; }).join('') + '</div>'
        : '<span class="txt">Touche un suspect pour lire son indice, puis une case pour le placer.</span>';
    } else {
      const p = cur.P.people[i];
      det.innerHTML = '<span class="who">' + esc(p.name) + '</span><span class="txt">' + md(p.clue || '') + '</span>';
    }
    det.classList.add('show');
  }

  function updateCards() {
    const P = cur.P, st = cur.st;
    cur.stage.querySelectorAll('.card').forEach(function (el) {
      const i = +el.dataset.i;
      el.classList.toggle('placed', st.pos[i] >= 0);
      el.classList.toggle('selected', cur.selected === i);
      el.setAttribute('aria-pressed', cur.selected === i);
      let s = el.querySelector('.status');
      const want = settings.autoCheck && st.pos[i] >= 0 ? E.clueStatus(P, st.pos, i) : null;
      if (want === null || want === undefined) { if (s) s.remove(); return; }
      if (!s) { s = document.createElement('span'); el.appendChild(s); }
      s.className = 'status ' + (want ? 'ok' : 'ko');
      s.textContent = want ? '✓' : '✗';
      s.title = want ? 'Indice respecté' : 'Indice non respecté';
    });
  }

  // ---------- rendu ----------
  function renderAll() {
    renderBoard();
    updateCards();
    renderDetail();
    renderCulprit();
    updateButtons();
  }

  function renderBoard() {
    const st = cur.st;
    const culprit = st.solved ? E.culpritOf(cur.P, st.pos) : -1;
    cur.dyn.innerHTML = B.dynamicLayer(cur.P, {
      pos: st.pos, crosses: st.crosses, notes: st.notes, autoCross: settings.autoCross && !st.solved, hover: cur.hover,
      highlight: cur.highlight, marks: cur.marks, selected: cur.selected, solved: st.solved, culprit: culprit,
      crossColor: '#33335f',
      autoCrossColor: '#97a0c6'
    });
    cur.svg.classList.toggle('solved', !!st.solved);
  }

  function renderCulprit() {
    const btn = cur.stage.querySelector('.result-btn');
    if (btn) btn.hidden = !cur.st.solved;
    if (!cur.st.solved) hideWin();
  }

  function updateButtons() {
    const u = cur.stage.querySelector('[data-act="undo"]'), r = cur.stage.querySelector('[data-act="redo"]');
    if (u) u.disabled = !cur.history.length;
    if (r) r.disabled = !cur.future.length;
    cur.stage.querySelectorAll('[data-tool]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tool === cur.tool); });
    cur.stage.classList.toggle('mode-draft', cur.tool === 'draft');
  }

  // ---------- mise à l'échelle ----------
  function fitStage() {
    if (!cur || !cur.stage) return;
    const L = cur.L || LAYOUT[cur.orient];
    const av = availSize();
    const sc = Math.min(av.w / L.W, av.h / L.H);
    cur.stage.style.left = (av.ins.l + av.w / 2) + 'px';
    cur.stage.style.top = (av.ins.t + av.h / 2) + 'px';
    cur.stage.style.transformOrigin = 'center center';
    cur.stage.style.transform = 'translate(-50%, -50%) scale(' + sc + ')';
    cur.stage.style.marginLeft = '0';
  }
  let resizeT = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      if (!cur) return;
      const o = orientation();
      if (o !== cur.orient || layoutFor(o).key !== cur.L.key) { cur.orient = o; buildStage(); } else fitStage();
    }, 80);
  });

  // ---------- état, historique ----------
  function snapshot() { return JSON.stringify({ pos: cur.st.pos, crosses: cur.st.crosses, notes: cur.st.notes }); }
  function pushHistory() {
    cur.history.push(snapshot());
    if (cur.history.length > 300) cur.history.shift();
    cur.future = [];
  }
  function restore(snap) {
    const o = JSON.parse(snap);
    cur.st.pos = o.pos; cur.st.crosses = o.crosses; cur.st.notes = o.notes || {};
  }
  function persist() {
    save('p:' + cur.def.id, { pos: cur.st.pos, crosses: cur.st.crosses, notes: cur.st.notes, time: cur.st.time, solved: cur.st.solved });
  }
  function changed() {
    cur.marks = null;
    cur.highlight = [];
    persist();
    renderAll();
    checkComplete();
  }

  // ---------- actions sur le plateau ----------
  function cellName(k) {
    const P = cur.P, N = P.N;
    const objs = Array.from(P.objs[k]);
    return objs.length ? objs.map(function (t) { return (I.NAMES[t] || t).toLowerCase(); }).join(', ') : '';
  }

  function placeAt(i, k) {
    const P = cur.P, st = cur.st, N = P.N;
    if (st.solved) return false;
    if (P.blocked[k]) {
      const what = cellName(k);
      toast('Cette case ne peut pas être occupée' + (what ? ' (' + what + ')' : '') + '.');
      return false;
    }
    // une personne par rangée et par colonne : on signale le conflit plutôt que de l'accepter
    const r = Math.floor(k / N), c = k % N;
    for (let j = 0; j < st.pos.length; j++) {
      if (j === i || st.pos[j] < 0) continue;
      const rj = Math.floor(st.pos[j] / N), cj = st.pos[j] % N;
      if (rj === r || cj === c) {
        toast((rj === r ? 'Cette rangée' : 'Cette colonne') + ' est déjà occupée par ' + P.people[j].name + '.');
        return false;
      }
    }
    pushHistory();
    st.pos[i] = k;
    delete st.crosses[k];
    clearNotesOf(i);
    cur.selected = -1;
    changed();
    return true;
  }

  // Retire toutes les vignettes de brouillon d'un suspect (il vient d'être placé pour de bon)
  function clearNotesOf(i) {
    const notes = cur.st.notes;
    Object.keys(notes).forEach(function (k) {
      const l = notes[k].filter(function (x) { return x !== i; });
      if (l.length) notes[k] = l; else delete notes[k];
    });
  }

  // Ajoute ou retire la vignette du suspect i dans la case k
  function toggleNote(i, k) {
    const P = cur.P, st = cur.st;
    if (P.blocked[k]) { toast('Cette case ne peut pas être occupée.'); return; }
    if (st.pos.indexOf(k) >= 0) { toast('Cette case est déjà occupée par un pion.'); return; }
    pushHistory();
    const l = (st.notes[k] || []).slice();
    const at = l.indexOf(i);
    if (at >= 0) l.splice(at, 1); else l.push(i);
    if (l.length) st.notes[k] = l; else delete st.notes[k];
    persist();
    renderAll();
  }

  function removeAt(k) {
    const st = cur.st;
    const occ = st.pos.indexOf(k);
    if (occ < 0 && !st.crosses[k]) return false;
    pushHistory();
    if (occ >= 0) st.pos[occ] = -1;
    delete st.crosses[k];
    return true;
  }

  function setCross(k, on) {
    const st = cur.st;
    if (st.pos.indexOf(k) >= 0) return false;
    if (on && cur.P.blocked[k]) return false; // un objet non occupable est déjà « interdit » : pas de croix
    if (!!st.crosses[k] === on) return false;
    if (on) st.crosses[k] = 1; else delete st.crosses[k];
    return true;
  }

  function tapCell(k) {
    const st = cur.st;
    if (st.solved) { toast('Énigme résolue ! Touche « Effacer » pour recommencer.'); return; }
    const occ = st.pos.indexOf(k);
    if (cur.tool === 'draft') {
      if (cur.selected < 0) {
        if (occ >= 0) { pushHistory(); st.pos[occ] = -1; changed(); return; }
        toast('Brouillon : choisis un suspect, puis touche toutes les cases possibles.');
        return;
      }
      if (occ === cur.selected) { pushHistory(); st.pos[occ] = -1; changed(); return; }
      toggleNote(cur.selected, k);
      return;
    }
    if (cur.selected >= 0) {
      if (occ === cur.selected) {
        pushHistory(); st.pos[occ] = -1; cur.selected = -1; changed(); return;
      }
      placeAt(cur.selected, k);
      return;
    }
    if (occ >= 0) { pushHistory(); st.pos[occ] = -1; changed(); return; }
    pushHistory();
    setCross(k, !st.crosses[k]);
    changed();
  }

  // Appui long : en brouillon, transforme une vignette en vrai pion ; sinon, croix rapide.
  function longPress(k) {
    const st = cur.st;
    if (st.solved || st.pos.indexOf(k) >= 0) return false;
    if (cur.tool === 'draft') {
      const l = st.notes[k] || [];
      let who = -1;
      if (cur.selected >= 0 && l.indexOf(cur.selected) >= 0) who = cur.selected;
      else if (l.length === 1) who = l[0];
      if (who >= 0) {
        if (placeAt(who, k)) toast(cur.P.people[who].name + ' est placé' + (cur.P.people[who].gender === 'f' ? 'e' : '') + ' : hypothèse validée.');
        return true;
      }
      if (l.length > 1) { toast('Plusieurs vignettes ici : choisis d\u2019abord le suspect à valider.'); return true; }
    }
    pushHistory();
    setCross(k, !st.crosses[k]);
    changed();
    return true;
  }

  function selectPerson(i) {
    cur.selected = cur.selected === i ? -1 : i;
    renderAll();
  }

  // ---------- vérifications ----------
  function checkComplete() {
    const st = cur.st, P = cur.P;
    if (st.solved) return;
    if (st.pos.some(function (k) { return k < 0; })) return;
    if (E.consistent(P, st.pos)) {
      st.solved = true;
      persist();
      stopTimer();
      renderAll();
      setTimeout(showWin, 450);
    } else {
      const sol = getSolution(cur.def);
      let good = 0;
      if (sol) st.pos.forEach(function (k, i) { if (k === sol[i]) good++; });
      toast(sol ? good + ' / ' + st.pos.length + ' positions correctes. Continue l’enquête !' : 'Quelque chose cloche… Vérifie les indices.', 3600);
    }
  }

  function doCheck() {
    const st = cur.st, sol = getSolution(cur.def);
    if (!sol) { toast('Vérification indisponible.'); return; }
    const marks = {};
    let bad = 0, placed = 0;
    st.pos.forEach(function (k, i) {
      if (k < 0) return;
      placed++;
      if (k === sol[i]) marks[i] = 'good'; else { marks[i] = 'bad'; bad++; }
    });
    // croix posées sur la case d'une solution
    let badX = 0;
    Object.keys(st.crosses).forEach(function (k) { if (sol.indexOf(+k) >= 0) badX++; });
    cur.marks = marks;
    renderBoard();
    if (!placed && !badX) toast('Place d’abord quelques suspects.');
    else if (!bad && !badX) toast('Tout est juste pour l’instant (' + placed + ' / ' + st.pos.length + ').');
    else toast((bad ? bad + ' pion' + (bad > 1 ? 's' : '') + ' mal placé' + (bad > 1 ? 's' : '') : '') + (bad && badX ? ' et ' : '') + (badX ? badX + ' croix sur une bonne case' : '') + '.', 3600);
  }

  function doHint() {
    const st = cur.st, P = cur.P, sol = getSolution(cur.def);
    if (st.solved) return;
    if (!sol) { toast('Indice indisponible.'); return; }
    // 1) pion mal placé
    const wrong = [];
    st.pos.forEach(function (k, i) { if (k >= 0 && k !== sol[i]) wrong.push(i); });
    if (wrong.length) {
      const i = wrong[0];
      cur.marks = {}; cur.marks[i] = 'bad';
      cur.hint = null;
      renderBoard();
      toast(P.people[i].name + ' n’est pas à sa place. Relis son indice !', 3600);
      pulseCard(i);
      return;
    }
    // 2) prochaine déduction : la personne la plus contrainte
    const fixed = st.pos.slice();
    const cands = E.candidatesFor(P, fixed);
    let best = -1;
    cands.forEach(function (c, i) { if (c && (best < 0 || c.length < cands[best].length)) best = i; });
    if (best < 0) return;
    const c = cands[best];
    const same = cur.hint && cur.hint.i === best;
    const level = same ? Math.min(cur.hint.level + 1, 3) : 1;
    cur.hint = { i: best, level: level };
    const name = P.people[best].name;
    if (level === 1) {
      cur.selected = best;
      renderAll();
      pulseCard(best);
      toast('Regarde l’indice de ' + name + ' : c’est la piste la plus prometteuse.', 3600);
    } else if (level === 2) {
      cur.selected = best;
      cur.highlight = c.indexOf(sol[best]) >= 0 ? c : [sol[best]];
      renderAll();
      toast(name + ' : ' + (cur.highlight.length === 1 ? 'une seule case possible !' : cur.highlight.length + ' cases encore possibles.'), 3600);
    } else {
      placeAt(best, sol[best]);
      cur.hint = null;
      toast(name + ' est placé' + (P.people[best].gender === 'f' ? 'e' : '') + '.');
    }
  }

  function pulseCard(i) {
    const el = cur.stage.querySelector('.card[data-i="' + i + '"]');
    if (!el) return;
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
  }

  function doReset() {
    confirmModal('Effacer la grille ?', 'Tous les pions, croix et vignettes de brouillon seront retirés.', 'Effacer', function () {
      pushHistory();
      const t = cur.st.solved ? 0 : cur.st.time;
      cur.st = newState(cur.def);
      cur.st.time = t;
      cur.selected = -1;
      changed();
      startTimer();
    });
  }

  function undo() {
    if (!cur.history.length) return;
    cur.future.push(snapshot());
    restore(cur.history.pop());
    cur.marks = null; cur.highlight = [];
    persist(); renderAll();
  }
  function redo() {
    if (!cur.future.length) return;
    cur.history.push(snapshot());
    restore(cur.future.pop());
    persist(); renderAll();
  }

  // ---------- liaisons d'événements ----------
  function bindStage() {
    const stage = cur.stage;
    stage.querySelectorAll('[data-tool]').forEach(function (b) {
      b.addEventListener('click', function () {
        // Croix et Brouillon sont des interrupteurs : un second appui revient au mode normal
        cur.tool = cur.tool === b.dataset.tool ? 'normal' : b.dataset.tool;
        if (cur.tool === 'draft') toast('Brouillon : choisis un suspect, puis touche toutes les cases possibles. Appui long sur une vignette pour la valider.', 4200);
        renderAll();
      });
    });
    stage.querySelectorAll('[data-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        const a = b.dataset.act;
        if (a === 'undo') undo();
        else if (a === 'redo') redo();
        else if (a === 'hint') doHint();
        else if (a === 'check') doCheck();
        else if (a === 'reset') doReset();
        else if (a === 'home') location.hash = '#/';
        else if (a === 'rules') showRules();
        else if (a === 'settings') showSettings();
        else if (a === 'result') showWin();
      });
    });
    stage.querySelector('.suspects').addEventListener('click', function (e) {
      const c = e.target.closest('.card');
      if (c) selectPerson(+c.dataset.i);
    });
    bindBoard();
  }

  function cellFromEvent(e) {
    const svg = cur.svg;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return -1;
    const p = pt.matrixTransform(m.inverse());
    const N = cur.P.N, s = B.SIZE / N;
    const c = Math.floor(p.x / s), r = Math.floor(p.y / s);
    if (r < 0 || r >= N || c < 0 || c >= N) return -1;
    return r * N + c;
  }

  function bindBoard() {
    const svg = cur.svg;
    let gest = null;
    svg.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    svg.addEventListener('pointerdown', function (e) {
      const k = cellFromEvent(e);
      if (k < 0) return;
      e.preventDefault();
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
      const right = e.button === 2;
      gest = { k: k, last: k, tool: right ? 'cross' : cur.tool, moved: false, done: false, start: Date.now(), pushed: false };
      if (cur.st.solved && gest.tool === 'cross') { gest = null; return; }
      if (gest.tool === 'cross') {
        pushHistory(); gest.pushed = true;
        gest.on = !cur.st.crosses[k];
        if (cur.st.pos.indexOf(k) >= 0) gest.on = false;
        setCross(k, gest.on);
        renderBoard();
      } else {
        // appui long : croix rapide, ou validation d'une vignette en mode brouillon
        gest.timer = setTimeout(function () {
          if (!gest || gest.moved) return;
          gest.done = true;
          if (longPress(k) && navigator.vibrate) navigator.vibrate(12);
        }, 450);
      }
    });
    svg.addEventListener('pointermove', function (e) {
      const k = cellFromEvent(e);
      if (!gest) {
        if (e.pointerType === 'mouse' && k !== cur.hover) { cur.hover = k; renderBoard(); }
        return;
      }
      if (k < 0 || k === gest.last) return;
      gest.last = k; gest.moved = true;
      if (gest.tool === 'cross') { if (setCross(k, gest.on)) renderBoard(); return; }
      if (gest.timer) { clearTimeout(gest.timer); gest.timer = null; }
      // glissé sur des cases vides, sans suspect sélectionné : on trace des croix en série
      if (!gest.paint && gest.tool === 'normal' && cur.selected < 0 && !cur.st.solved && cur.st.pos.indexOf(gest.k) < 0) {
        gest.paint = true;
        pushHistory();
        gest.on = !cur.st.crosses[gest.k];
        setCross(gest.k, gest.on);
      }
      if (gest.paint && setCross(k, gest.on)) renderBoard();
      else if (gest.paint) renderBoard();
    });
    function end(e) {
      if (!gest) return;
      const g = gest; gest = null;
      if (g.timer) clearTimeout(g.timer);
      if (g.tool === 'cross' || g.paint) { changed(); return; }
      if (g.done) return;
      const k = cellFromEvent(e);
      if (k >= 0 && k === g.k) tapCell(k);
    }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', function () { if (gest && gest.timer) clearTimeout(gest.timer); gest = null; });
    svg.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && cur.hover !== -1) { cur.hover = -1; renderBoard(); } });
  }

  document.addEventListener('keydown', function (e) {
    if (!cur || document.querySelector('.modal-back')) {
      if (e.key === 'Escape') closeModal();
      return;
    }
    const k = e.key;
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (k === 'Escape') { cur.selected = -1; cur.highlight = []; renderAll(); return; }
    if (k === '1') { cur.tool = 'normal'; renderAll(); return; }
    if (k === '2') { cur.tool = 'draft'; renderAll(); return; }
    if (k === '?') { if (settings.showHint) doHint(); return; }
    if (/^[a-zA-Z]$/.test(k)) {
      const i = cur.P.people.findIndex(function (p) { return p.name[0].toLowerCase() === k.toLowerCase(); });
      if (i >= 0) selectPerson(i);
    }
  });

  // ---------- chronomètre ----------
  let timerId = null;
  function startTimer() {
    stopTimer();
    if (!cur || cur.st.solved) return;
    timerId = setInterval(function () {
      if (!cur || cur.st.solved || document.hidden) return;
      cur.st.time = (cur.st.time || 0) + 1;
      const t = cur.stage && cur.stage.querySelector('.timer');
      if (t) t.textContent = fmtTime(cur.st.time);
      if (cur.st.time % 5 === 0) persist();
    }, 1000);
  }
  function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }

  // =====================================================================
  //  FENÊTRES
  // =====================================================================
  function openModal(inner, cls) {
    closeModal();
    const back = h('<div class="modal-back" role="dialog" aria-modal="true"><div class="modal ' + (cls || '') + '"><button class="close" aria-label="Fermer">✕</button>' + inner + '</div></div>');
    document.body.appendChild(back);
    back.addEventListener('click', function (e) { if (e.target === back) closeModal(); });
    back.querySelector('.close').addEventListener('click', closeModal);
    const f = back.querySelector('.close');
    if (f) f.focus();
    return back;
  }
  function closeModal() {
    const m = document.querySelector('.modal-back');
    if (m) m.remove();
  }

  function confirmModal(title, text, okLabel, onOk) {
    const m = openModal('<h2>' + esc(title) + '</h2><p>' + esc(text) + '</p><div class="win"><div class="actions">' +
      '<button class="pill-btn" data-x="cancel">Annuler</button><button class="pill-btn btn-primary" data-x="ok">' + esc(okLabel) + '</button></div></div>');
    m.querySelector('[data-x="cancel"]').addEventListener('click', closeModal);
    m.querySelector('[data-x="ok"]').addEventListener('click', function () { closeModal(); onOk(); });
  }

  function hideWin() {
    const w = document.querySelector('.stage .winpanel');
    if (w) w.remove();
  }

  // Résumé de fin : meurtrier, victime et raison, affiché à gauche, au-dessus des suspects (la grille reste visible)
  function showWin() {
    const P = cur.P, def = cur.def;
    const c = E.culpritOf(P, cur.st.pos), v = P.victim;
    if (c < 0 || v < 0) return;
    hideWin();
    const kill = P.people[c], vic = P.people[v];
    const zoneOf = function (i) { const a = def.areas[P.area[cur.st.pos[i]]]; return a ? a.name : ''; };
    const zone = zoneOf(v);
    const others = P.people.map(function (q, i) { return i; }).filter(function (i) { return i !== c && i !== v; });
    const idx = PUZZLES.indexOf(def), next = PUZZLES[idx + 1];
    const f = vic.gender === 'f' ? 'e' : '';
    const because = '<p class="why"><b>' + esc(kill.name) + '</b> est le meurtrier, car ' + esc(kill.name) + ' était <b>seul' + (kill.gender === 'f' ? 'e' : '') + ' avec la victime</b>. ' +
      esc(vic.name) + ' a été retrouvé' + f + ' dans la zone « ' + esc(zone) + ' », et ' + esc(kill.name) + ' est la seule autre personne de cette zone.</p>' +
      (others.length ? '<p class="why2">Les autres étaient ailleurs : ' + others.map(function (i) { return esc(P.people[i].name) + ' (' + esc(zoneOf(i)) + ')'; }).join(', ') + '.</p>' : '') +
      (kill.clue ? '<p class="why2">Son indice : « ' + md(kill.clue) + ' »</p>' : '');
    const box2 = function (cls, label, q, v2) {
      return '<div class="who ' + cls + '"><span class="lab">' + label + '</span><div class="portrait">' + A.avatar(q.look, v2 ? { victim: true } : {}) + '</div><div class="nm">' + esc(q.name) + '</div></div>';
    };
    const el = h('<section class="region winpanel" style="' + box(cur.L.result) + '">' +
      '<h2>Le meurtrier est démasqué !</h2>' +
      '<div class="body"><div class="duo">' + box2('killer', 'Le meurtrier', kill, false) + box2('victim', 'La victime', vic, true) + '</div>' +
      '<div class="txt">' + because + '<p class="time">Résolu en <b>' + fmtTime(cur.st.time) + '</b></p></div></div>' +
      '<div class="actions"><button class="pill-btn" data-x="hide">Voir les suspects</button>' +
      (next ? '<button class="pill-btn btn-primary" data-x="next">Énigme suivante</button>' : '') +
      '<button class="pill-btn" data-x="home">Menu</button></div></section>');
    cur.stage.appendChild(el);
    el.querySelector('[data-x="hide"]').addEventListener('click', hideWin);
    if (next) el.querySelector('[data-x="next"]').addEventListener('click', function () { location.hash = '#/p/' + next.id; });
    el.querySelector('[data-x="home"]').addEventListener('click', function () { location.hash = '#/'; });
  }

  function showSettings() {
    const rows = [
      ['autoCross', 'Croix automatiques', 'Quand un suspect est placé, les cases libres de sa rangée et de sa colonne reçoivent une croix claire. Tes croix restent en foncé.'],
      ['autoCheck', 'Signaler les indices non respectés', 'Affiche ✓ ou ✗ sur la fiche d’un suspect placé. Plus facile !'],
      ['showHint', 'Afficher le bouton Indice', 'Ajoute le bouton Indice dans la barre d’outils : il désigne un suspect, puis ses cases possibles, puis le place.'],
      ['showCheck', 'Afficher le bouton Vérifier', 'Ajoute le bouton Vérifier dans la barre d’outils : il signale les pions mal placés.'],
      ['timer', 'Afficher le chronomètre', 'Le temps est toujours enregistré.']
    ];
    const m = openModal('<h2>Options</h2>' + rows.map(function (r) {
      return '<div class="row"><div><b>' + r[1] + '</b><br><span style="font-size:15px;color:#666">' + r[2] + '</span></div>' +
        '<label class="switch"><input type="checkbox" data-k="' + r[0] + '"' + (settings[r[0]] ? ' checked' : '') + ' aria-label="' + esc(r[1]) + '"><span></span></label></div>';
    }).join('') + '<h3>Progression</h3><p><button class="pill-btn" data-x="wipe">Effacer toute ma progression</button></p>' +
      '<h3>' + esc(versionLabel()) + '</h3><ul class="history">' + VER.HISTORY.map(function (h2) {
        return '<li><b>' + esc(h2.v) + '</b> (' + esc(frDate(h2.d)) + ') : ' + esc(h2.t) + '</li>';
      }).join('') + '</ul>');
    m.querySelectorAll('input[data-k]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        settings[inp.dataset.k] = inp.checked;
        save('settings', settings);
        if (cur) { if (/^(timer|showHint|showCheck)$/.test(inp.dataset.k)) buildStage(); else renderAll(); }
      });
    });
    m.querySelector('[data-x="wipe"]').addEventListener('click', function () {
      PUZZLES.forEach(function (p) { try { localStorage.removeItem(KEY + 'p:' + p.id); } catch (e) { /* ignoré */ } });
      closeModal();
      toast('Progression effacée.');
      if (cur) showGame(cur.def); else showHome();
    });
  }

  function showRules() {
    function pair(title, rule, screen) {
      return '<h3>' + title + '</h3><p class="pair"><span class="tag">Règle</span>' + rule + '</p>' +
        '<p class="pair"><span class="tag app">Sur l’écran</span>' + screen + '</p>';
    }
    openModal('<h2>Comment jouer</h2>' +
      '<p>Un meurtre a été commis ! Chaque énigme est une <b>scène de crime</b> vue de dessus, découpée en <b>zones</b> (pièces, jardins, trous de golf…). ' +
      'Chaque suspect donne un <b>indice</b>. Ton but : retrouver la <b>case exacte</b> de chaque personne, victime comprise, puis démasquer le meurtrier.</p>' +
      pair('1. Placer les suspects',
        'Chaque personne occupe une case. <b>Une seule personne par rangée et par colonne.</b>',
        'Touche la fiche d’un suspect, puis la case voulue : son pion apparaît avec son visage et son initiale. Un seul appui sur le pion le retire. Si la rangée ou la colonne est déjà prise, un message te le dit.') +
      pair('2. Éliminer des cases',
        'Dès qu’un suspect est placé, sa rangée et sa colonne sont interdites à tous les autres.',
        'Des <b>croix claires</b> se posent toutes seules (réglable dans Options). Pose les tiennes, en foncé : touche une case vide, ou fais un appui long ou un clic droit. Pour en tracer plusieurs, <b>glisse le doigt</b> sur les cases vides. Touche une croix pour l’enlever.') +
      pair('3. Lire le plan',
        'Le plan est une preuve. Certains objets peuvent être occupés (chaise, tapis, lit, voiture…), d’autres non (table, étagère, plante, arbre…). <b>« À côté »</b> veut dire à gauche, à droite, au-dessus ou en dessous, jamais en diagonale, <b>et dans la même zone</b>.',
        'La légende au-dessus du plan classe les objets de chaque énigme. Si tu poses un pion sur un objet interdit, un message nomme l’objet. Les objets n’ont jamais de croix.') +
      pair('4. Poser des hypothèses',
        'Chaque indice est vrai : traite-le comme une règle. Quand deux cases restent possibles, tu peux tester une piste.',
        'Active <b>Brouillon</b>, choisis un suspect, puis touche toutes ses cases possibles : une vignette apparaît dans chacune, avec autant de suspects que tu veux. Elles ne bloquent rien. Un <b>appui long</b> sur une vignette la transforme en vrai pion, et les autres vignettes de ce suspect disparaissent.') +
      pair('5. Trouver le meurtrier',
        'Le meurtrier était <b>seul avec la victime</b>, dans la même zone. On le trouve à la fin, une fois tout le monde placé.',
        'Quand la grille est juste, un résumé s’affiche à gauche, au-dessus des suspects : le meurtrier, la victime et la raison. Le bouton Résultat le rouvre. Une grille complète mais fausse t’indique combien de positions sont correctes.') +
      '<h3>Se faire aider</h3><ul>' +
      '<li><b>Indice</b> : 1er appui, la personne à regarder ; 2e appui, ses cases possibles ; 3e appui, le placement.</li>' +
      '<li><b>Vérifier</b> entoure les pions mal placés. <b>Annuler</b> et <b>Rétablir</b> remontent dans tes actions. <b>Effacer</b> vide la grille.</li>' +
      '<li><b>Options</b> : l’option « signaler les indices non respectés » affiche ✓ ou ✗ sur chaque fiche placée.</li></ul>' +
      '<h3>Petit glossaire des indices</h3><table>' +
      '<tr><th>Indice</th><th>Signification</th></tr>' +
      '<tr><td>Au nord / au sud de…</td><td>Strictement plus haut / plus bas sur le plan, dans n’importe quelle colonne.</td></tr>' +
      '<tr><td>À l’ouest / à l’est de…</td><td>Strictement plus à gauche / à droite, dans n’importe quelle rangée.</td></tr>' +
      '<tr><td>Au nord-ouest de…</td><td>Plus haut <b>et</b> plus à gauche.</td></tr>' +
      '<tr><td>Exactement une rangée au nord de…</td><td>Dans la rangée juste au-dessus (n’importe quelle colonne).</td></tr>' +
      '<tr><td>Directement au sud d’un objet</td><td>Sur la case juste en dessous de l’objet, dans la même zone.</td></tr>' +
      '<tr><td>La seule personne sur…</td><td>Personne d’autre n’occupe ce type d’objet.</td></tr>' +
      '<tr><td>Seul(e)</td><td>Personne d’autre dans sa zone.</td></tr>' +
      '<tr><td>Seul(e) avec…</td><td>Exactement deux personnes dans la zone.</td></tr>' +
      '<tr><td>Avec X / dans la même pièce que X</td><td>Dans la même zone que X.</td></tr>' +
      '<tr><td>Au moins deux personnes dans…</td><td>Deux ou plus (trois est permis, un ne l’est pas).</td></tr></table>' +
      '<h3>Techniques de résolution</h3><ul>' +
      '<li><b>Commence par les indices fermés :</b> une zone précise, un objet rare, une rangée ou une colonne imposée.</li>' +
      '<li><b>Regarde les croix :</b> chaque suspect placé élimine sa rangée et sa colonne pour les autres.</li>' +
      '<li><b>Placements forcés :</b> si une personne n’a plus qu’une case possible, ou si une rangée ne peut plus accueillir qu’une seule personne, place-la.</li>' +
      '<li><b>Capacité des zones :</b> compte les cases libres d’une zone et les personnes qui doivent y aller.</li>' +
      '<li><b>Lis les indices à la lettre :</b> « seul », « seule personne », « à côté » ont un sens précis.</li>' +
      '<li><b>Garde le meurtre pour la fin :</b> la paire victime-meurtrier sert de vérification finale.</li></ul>' +
      '<h3>Raccourcis clavier et sauvegarde</h3><ul>' +
      '<li>Initiale d’un suspect : le sélectionne. Touche 1 : mode normal. Touche 2 : Brouillon. Touche ? : un indice. Ctrl+Z : annuler. Échap : désélectionner.</li>' +
      '<li>La partie est sauvegardée automatiquement sur cet appareil.</li></ul>' +
      '<p style="font-size:14px;color:#6a6a7a;margin-top:20px">Murdoku est une création de Manuel Garand (murdoku.com). Adaptation web non officielle, en français, pour un usage personnel.</p>');
  }

  // Installation hors ligne (PWA)
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* hors ligne indisponible */ });
    });
  }

  route();
})();
