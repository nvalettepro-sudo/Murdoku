/* Murdoku — application (écrans, interactions, sauvegarde). */
(function () {
  'use strict';
  const E = window.MurdokuEngine, B = window.MurdokuBoard, A = window.MurdokuAvatars, I = window.MurdokuIcons;
  const esc = B.esc;
  const PUZZLES = (window.MURDOKU_PUZZLES || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  const SOLUTIONS = window.MURDOKU_SOLUTIONS || {};
  const KEY = 'murdoku:v1:';
  const app = document.getElementById('app');

  // ---------- stockage local (protégé : peut être indisponible) ----------
  function load(k, def) {
    try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function save(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* ignoré */ } }

  const settings = Object.assign({ shade: true, autoCheck: false, timer: true }, load('settings', {}));

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
    document.body.style.setProperty('--bg1', '#5f9292');
    document.body.style.setProperty('--bg2', '#3b3f86');
    document.title = 'Murdoku — Énigmes criminelles';
    const groups = [
      { title: 'Version famille', items: PUZZLES.filter(function (p) { return p.theme === 'family'; }) },
      { title: 'Enquêtes classiques', items: PUZZLES.filter(function (p) { return p.theme !== 'family'; }) }
    ];
    let html = '<main class="home"><header class="home-head"><div>' + logoSvg() +
      '<p>Lis les indices, place chaque suspect sur la scène de crime… et démasque le meurtrier.</p></div>' +
      '<div class="home-actions"><button class="pill-btn" data-act="rules">' + UI.help + 'Comment jouer</button>' +
      '<button class="pill-btn" data-act="settings">' + UI.gear + 'Options</button></div></header>';
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
    html += '<footer class="home-foot">Murdoku est un jeu créé par Manuel Garand (énigmes et concept). ' +
      'Les illustrations des fiches originales sont de Manuel Garand, Valentyna Bezdushna et Eli Voisin ; le golf et les îles sont de Craig Wallander. ' +
      'Cette adaptation web en français est non officielle, réalisée pour un usage personnel : ' +
      'les visuels sont redessinés. Retrouve le jeu officiel sur <a href="https://murdoku.com" target="_blank" rel="noopener">murdoku.com</a>.</footer></main>';
    app.innerHTML = html;
    app.querySelector('[data-act="rules"]').addEventListener('click', showRules);
    app.querySelector('[data-act="settings"]').addEventListener('click', showSettings);
  }

  function thumbSvg(def) {
    try {
      const P = getP(def);
      return '<svg viewBox="-16 -16 1032 1032" xmlns="http://www.w3.org/2000/svg">' + B.staticLayer(P, def.theme) + '</svg>';
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
      toolbar: [24, 922, 808, 70], culprit: [850, 926, 372, 66], topbtns: [1234, 926, 242, 66]
    },
    portrait: {
      W: 1000, H: 1420,
      brand: [26, 16, 600, 168], topbtns: [640, 24, 336, 66], rules3: [26, 190, 950, 154], legend: [26, 354, 950, 78],
      board: [195, 442, 610, 610], suspects: [26, 1062, 950, 200], detail: [26, 1268, 950, 62],
      toolbar: [26, 1340, 620, 72], culprit: [658, 1340, 318, 72]
    }
  };

  function orientation() {
    return window.innerWidth / window.innerHeight < 0.92 ? 'portrait' : 'landscape';
  }

  function newState(def) {
    const n = def.people.length;
    return { pos: new Array(n).fill(-1), crosses: {}, time: 0, solved: false };
  }

  function showGame(def) {
    const P = getP(def);
    const saved = load('p:' + def.id, null);
    const st = saved && saved.pos && saved.pos.length === def.people.length ? saved : newState(def);
    st.crosses = st.crosses || {};
    cur = {
      def: def, P: P, st: st, tool: 'pawn', selected: -1, hover: -1, history: [], future: [],
      highlight: [], marks: null, hint: null, orient: orientation()
    };
    const pal = def.palette || {};
    document.body.style.setProperty('--bg1', pal.bg1 || '#5f9292');
    document.body.style.setProperty('--bg2', pal.bg2 || '#3b3f86');
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
    const L = Object.assign({}, LAYOUT[cur.orient]);
    // Règles spéciales de l'énigme (parité, comptages…) : bandeau sous les fiches
    const notes = (def.globals || []).filter(function (g) { return g.text; });
    if (notes.length) {
      const sb = L.suspects.slice();
      const nh = cur.orient === 'portrait' ? 54 : 30 + 30 * notes.length;
      L.suspects = [sb[0], sb[1], sb[2], sb[3] - nh - 8];
      L.notes = [sb[0], sb[1] + sb[3] - nh, sb[2], nh];
    }
    cur.L = L;
    const fam = def.theme === 'family';
    const pal = def.palette || {};
    let html = '<div class="stage-wrap"><div class="stage ' + cur.orient + ' theme-' + (def.theme || 'classic') + (pal.titleDark ? ' dark-title' : '') + '" style="' + paletteVars(pal) + '">';
    // en-tête
    const h1 = def.title.length > 22 ? 30 : def.title.length > 15 ? 35 : 42;
    html += '<header class="region brand" style="' + box(L.brand) + ';--h1:' + h1 + 'px">' + (fam ? '<span class="family-tag">FAMILY</span>' : '') + logoSvg() +
      (fam ? '<span class="family-sub">version famille</span>' : '') +
      '<h1>' + esc(def.title) + '</h1>' + (fam ? '' : '<div class="diff">difficulté : ' + esc(def.difficulty) + '</div>') + '</header>';
    // bulles de règles
    html += '<section class="region rules3" style="' + box(L.rules3) + '">' + rulesBubbles(def) + '</section>';
    // légende
    html += '<section class="region legend" style="' + box(L.legend) + '">' + legendHtml(P) + '</section>';
    // plateau
    html += '<section class="region boardbox" style="' + box(L.board) + '"><svg class="board" viewBox="' + (-B.PAD) + ' ' + (-B.PAD) + ' ' + (B.SIZE + 2 * B.PAD) + ' ' + (B.SIZE + 2 * B.PAD) + '" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Scène de crime">' +
      '<g class="static">' + B.staticLayer(P, def.theme) + '</g><g class="dyn"></g></svg></section>';
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
      toolBtn('pawn', 'Pion', UI.pawn) + toolBtn('cross', 'Croix', UI.cross) + toolBtn('erase', 'Gomme', UI.eraser) +
      actBtn('undo', 'Annuler', UI.undo, 'sep') + actBtn('redo', 'Rétablir', UI.redo) +
      actBtn('hint', 'Indice', UI.hint, 'sep') + actBtn('check', 'Vérifier', UI.check) + actBtn('reset', 'Effacer', UI.reset) +
      (settings.timer && cur.orient === 'landscape' ? '<span class="timer" aria-label="Temps">' + fmtTime(cur.st.time) + '</span>' : '') + '</section>';
    html += '<section class="region culprit" style="' + box(L.culprit) + '" role="button" tabindex="0"></section>';
    html += '<nav class="region topbtns" style="' + box(L.topbtns) + '">' + actBtn('home', 'Énigmes', UI.grid) + actBtn('rules', 'Règles', UI.help) + actBtn('settings', 'Options', UI.gear) + '</nav>';
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
  }

  function toolBtn(id, label, icon) {
    return '<button class="tool" data-tool="' + id + '" aria-pressed="' + (cur.tool === id) + '" title="' + label + '">' + icon + '<span>' + label + '</span></button>';
  }
  function actBtn(id, label, icon, cls) {
    return '<button class="tool ' + (cls || '') + '" data-act="' + id + '" title="' + label + '">' + icon + '<span>' + label + '</span></button>';
  }

  function rulesBubbles(def) {
    const victim = def.victim ? def.people.find(function (p) { return p.name === def.victim; }) : null;
    const fam = def.theme === 'family';
    const b1 = '<div class="bubble"><span class="num">1</span><h3>' + md(def.intro || '') + '</h3>' +
      '<p>' + (fam ? '' : 'Lis l’indice de chaque suspect et retrouve sa position exacte sur la scène de crime.') + '</p>' +
      '<p class="goal">' + (def.goalText ? md(def.goalText) : 'Le <b>meurtrier</b> était <b>seul avec la victime</b>, dans la même zone.') + '</p>' +
      (def.note ? '<p class="goal"><b>Note :</b> ' + md(def.note) + '</p>' : '') + '</div>';
    void victim;
    const b2 = '<div class="bubble"><span class="num">2</span><h3>Règle : une personne par rangée et par colonne</h3>' +
      '<div class="mini"><figure>' + miniGrid(false) + 'dès que tu places quelqu’un…</figure><figure>' + miniGrid(true) + '…bloque toute sa <span style="color:#3a5ab8">rangée</span> et sa <span style="color:#3a5ab8">colonne</span></figure></div></div>';
    const b3 = '<div class="bubble"><span class="num">3</span><h3>Que veut dire « à côté » ?</h3>' +
      '<p style="font-size:14px">à gauche, à droite, au-dessus ou en dessous de quelque chose, et dans la même zone</p>' +
      '<div class="mini3"><span>sont<br>à côté<br>du ●</span>' + miniBeside() + '<span class="no">✕ ne sont<br>pas à côté<br>du ●</span></div></div>';
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
    g += '<circle cx="' + 2.5 * s + '" cy="' + 0.5 * s + '" r="9" fill="#fff" stroke="' + o + '" stroke-width="2"/><text x="' + 2.5 * s + '" y="' + (0.5 * s + 4.5) + '" text-anchor="middle" font-size="12" font-weight="800" font-family="Rubik, sans-serif" fill="' + o + '">A</text>';
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

  function legendHtml(P) {
    const def = P.def;
    const occ = new Set(def.occupiable || []);
    const seenOk = {}, seenNo = {};
    const ok = [], no = [];
    P.pieces.forEach(function (p) {
      const vis = p.type;
      const isOk = occ.has(p.logical);
      const key = (I.NAMES[vis] || vis);
      if (isOk) { if (seenOk[key]) return; seenOk[key] = 1; ok.push(p); }
      else { if (seenNo[key]) return; seenNo[key] = 1; no.push(p); }
    });
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
    if (ok.length) html += '<div class="lg ok' + dense + '"><h4>Peut être occupé</h4><div class="items">' + ok.map(item).join('') + '</div></div>';
    if (no.length) html += '<div class="lg no' + dense + '"><h4>Ne peut pas être occupé</h4><div class="items">' + no.map(item).join('') + '</div></div>';
    return html;
  }

  // ---------- fiches suspects ----------
  function renderCards() {
    const def = cur.def, P = cur.P;
    const box2 = cur.stage.querySelector('.suspects');
    box2.innerHTML = P.people.map(function (p, i) {
      const isV = i === P.victim;
      return '<button class="card' + (isV ? ' victim' : '') + '" data-i="' + i + '" aria-label="' + esc(p.name) + '">' +
        (p.quote ? '<span class="quote">' + esc(p.quote) + '</span>' : '') +
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
    const L = cur.L || LAYOUT[cur.orient];
    const n = cur.P.people.length;
    const fam = cur.def.theme === 'family';
    const W = L.suspects[2], H = L.suspects[3];
    const cap = fam ? 19 : 21;
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
    const minFs = cur.orient === 'portrait' ? 13.5 : 12.5;
    let best = measure('vert');
    if (best.fs < 15 && !fam) {
      const hz = measure('horiz');
      if (hz.fs > best.fs) best = hz;
    }
    if (best.fs < minFs) best = measure('compact');
    const fs = Math.min(best.fs, fam ? 19 : 21);
    box2.classList.toggle('compact', best.mode === 'compact');
    box2.classList.toggle('horiz', best.mode === 'horiz');
    box2.style.setProperty('--fs', fs.toFixed(2) + 'px');
    box2.style.gridTemplateColumns = 'repeat(' + best.cols + ', max-content)';
    box2.style.columnGap = best.gapX + 'px';
    box2.style.rowGap = best.gapY + 'px';
    cur.compact = best.mode === 'compact';
    if (!cur.compact) cur.stage.querySelector('.detail').classList.remove('show');
  }

  function renderDetail() {
    const det = cur.stage.querySelector('.detail');
    if (!cur.compact) { det.classList.remove('show'); return; }
    const i = cur.selected;
    if (i < 0) {
      det.innerHTML = '<span class="txt">Touche un suspect pour lire son indice, puis une case pour le placer.</span>';
    } else {
      const p = cur.P.people[i];
      det.innerHTML = '<span class="who">' + esc(p.name) + '</span><span class="txt">' + md(p.clue || '') + (p.quote ? ' <i style="color:#7a7060">« ' + esc(p.quote) + ' »</i>' : '') + '</span>';
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
      pos: st.pos, crosses: st.crosses, shade: settings.shade && !st.solved, hover: cur.hover,
      highlight: cur.highlight, marks: cur.marks, selected: cur.selected, solved: st.solved, culprit: culprit,
      crossColor: cur.def.theme === 'family' ? '#c0392b' : '#33335f'
    });
    cur.svg.classList.toggle('solved', !!st.solved);
  }

  function renderCulprit() {
    const el = cur.stage.querySelector('.culprit');
    const def = cur.def;
    const q = def.culpritQuestion || 'Le meurtrier est…';
    let name = '';
    if (cur.st.solved) {
      const c = E.culpritOf(cur.P, cur.st.pos);
      name = c >= 0 ? cur.P.people[c].name : '';
    }
    el.classList.toggle('found', !!name);
    el.classList.toggle('has-hint', !!def.culpritHint);
    el.innerHTML = '<span class="q">' + esc(q) + '</span><span class="line">' + esc(name) + '</span>' +
      (def.culpritHint ? '<span class="hint">' + esc(def.culpritHint) + '</span>' : '');
  }

  function updateButtons() {
    const u = cur.stage.querySelector('[data-act="undo"]'), r = cur.stage.querySelector('[data-act="redo"]');
    if (u) u.disabled = !cur.history.length;
    if (r) r.disabled = !cur.future.length;
    cur.stage.querySelectorAll('[data-tool]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tool === cur.tool); });
  }

  // ---------- mise à l'échelle ----------
  function fitStage() {
    if (!cur || !cur.stage) return;
    const L = cur.L || LAYOUT[cur.orient];
    const vw = window.innerWidth, vh = window.innerHeight;
    const sc = Math.min(vw / L.W, vh / L.H);
    cur.stage.style.transform = 'scale(' + sc + ') translate(-50%, -50%)';
    cur.stage.style.transformOrigin = '0 0';
    cur.stage.style.left = '50%';
    cur.stage.style.top = '50%';
    cur.stage.style.transform = 'translate(-50%, -50%) scale(' + sc + ')';
    cur.stage.style.transformOrigin = 'center center';
    cur.stage.style.marginLeft = '0';
  }
  let resizeT = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      if (!cur) return;
      const o = orientation();
      if (o !== cur.orient) { cur.orient = o; buildStage(); } else fitStage();
    }, 80);
  });

  // ---------- état, historique ----------
  function snapshot() { return JSON.stringify({ pos: cur.st.pos, crosses: cur.st.crosses }); }
  function pushHistory() {
    cur.history.push(snapshot());
    if (cur.history.length > 300) cur.history.shift();
    cur.future = [];
  }
  function restore(snap) {
    const o = JSON.parse(snap);
    cur.st.pos = o.pos; cur.st.crosses = o.crosses;
  }
  function persist() {
    save('p:' + cur.def.id, { pos: cur.st.pos, crosses: cur.st.crosses, time: cur.st.time, solved: cur.st.solved });
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
    const P = cur.P, st = cur.st;
    if (st.solved) return;
    if (P.blocked[k]) {
      const what = cellName(k);
      toast('Cette case ne peut pas être occupée' + (what ? ' (' + what + ')' : '') + '.');
      return;
    }
    pushHistory();
    const occ = st.pos.indexOf(k);
    if (occ >= 0 && occ !== i) st.pos[occ] = -1;
    st.pos[i] = k;
    delete st.crosses[k];
    cur.selected = -1;
    changed();
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
    if (!!st.crosses[k] === on) return false;
    if (on) st.crosses[k] = 1; else delete st.crosses[k];
    return true;
  }

  function tapCell(k) {
    const st = cur.st;
    if (st.solved) { toast('Énigme résolue ! Touche « Effacer » pour recommencer.'); return; }
    const occ = st.pos.indexOf(k);
    if (cur.selected >= 0) {
      if (occ === cur.selected) {
        pushHistory(); st.pos[occ] = -1; changed(); return;
      }
      placeAt(cur.selected, k);
      return;
    }
    if (occ >= 0) { selectPerson(occ); return; }
    pushHistory();
    setCross(k, !st.crosses[k]);
    changed();
  }

  function selectPerson(i) {
    cur.selected = cur.selected === i ? -1 : i;
    if (cur.tool !== 'pawn') { cur.tool = 'pawn'; }
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
    confirmModal('Effacer la grille ?', 'Tous les pions et toutes les croix seront retirés.', 'Effacer', function () {
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
        cur.tool = b.dataset.tool;
        if (cur.tool !== 'pawn') cur.selected = -1;
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
      });
    });
    stage.querySelector('.suspects').addEventListener('click', function (e) {
      const c = e.target.closest('.card');
      if (c) selectPerson(+c.dataset.i);
    });
    stage.querySelector('.culprit').addEventListener('click', function () {
      if (cur.st.solved) showWin();
      else toast('Place tout le monde sur la grille pour démasquer le coupable.');
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
      if (cur.st.solved && gest.tool !== 'pawn') { gest = null; return; }
      if (gest.tool === 'cross') {
        pushHistory(); gest.pushed = true;
        gest.on = !cur.st.crosses[k];
        if (cur.st.pos.indexOf(k) >= 0) gest.on = false;
        setCross(k, gest.on);
        renderBoard();
      } else if (gest.tool === 'erase') {
        pushHistory(); gest.pushed = true;
        const occ = cur.st.pos.indexOf(k);
        if (occ >= 0) cur.st.pos[occ] = -1;
        delete cur.st.crosses[k];
        renderBoard();
      } else {
        // appui long = croix rapide
        gest.timer = setTimeout(function () {
          if (!gest || gest.moved) return;
          gest.done = true;
          if (cur.st.pos.indexOf(k) >= 0 || cur.st.solved) return;
          pushHistory();
          setCross(k, !cur.st.crosses[k]);
          if (navigator.vibrate) navigator.vibrate(12);
          changed();
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
      if (gest.tool === 'cross') { if (setCross(k, gest.on)) renderBoard(); }
      else if (gest.tool === 'erase') {
        const occ = cur.st.pos.indexOf(k);
        if (occ >= 0) cur.st.pos[occ] = -1;
        delete cur.st.crosses[k];
        renderBoard();
      } else if (gest.timer) { clearTimeout(gest.timer); }
    });
    function end(e) {
      if (!gest) return;
      const g = gest; gest = null;
      if (g.timer) clearTimeout(g.timer);
      if (g.tool === 'cross' || g.tool === 'erase') { changed(); return; }
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
    if (k === '1') { cur.tool = 'pawn'; renderAll(); return; }
    if (k === '2') { cur.tool = 'cross'; cur.selected = -1; renderAll(); return; }
    if (k === '3') { cur.tool = 'erase'; cur.selected = -1; renderAll(); return; }
    if (k === '?') { doHint(); return; }
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

  function showWin() {
    const P = cur.P, def = cur.def;
    const c = E.culpritOf(P, cur.st.pos);
    const p = c >= 0 ? P.people[c] : null;
    const idx = PUZZLES.indexOf(def);
    const next = PUZZLES[idx + 1];
    const fam = def.theme === 'family';
    const m = openModal('<div class="win"><h2>' + (fam ? 'Le coupable est démasqué !' : 'Le meurtrier a été démasqué !') + '</h2>' +
      '<p>Voici où se trouvait chaque personne. ' + esc(def.culpritQuestion || 'Le meurtrier est…') + '</p>' +
      (p ? '<div class="portrait">' + A.avatar(p.look) + '</div><div class="big">' + esc(p.name) + '</div>' : '') +
      '<p>Temps : <b>' + fmtTime(cur.st.time) + '</b></p><div class="actions">' +
      '<button class="pill-btn" data-x="see">Voir la grille</button>' +
      (next ? '<button class="pill-btn btn-primary" data-x="next">Énigme suivante</button>' : '') +
      '<button class="pill-btn" data-x="home">Toutes les énigmes</button></div></div>');
    m.querySelector('[data-x="see"]').addEventListener('click', closeModal);
    if (next) m.querySelector('[data-x="next"]').addEventListener('click', function () { closeModal(); location.hash = '#/p/' + next.id; });
    m.querySelector('[data-x="home"]').addEventListener('click', function () { closeModal(); location.hash = '#/'; });
  }

  function showSettings() {
    const rows = [
      ['shade', 'Griser les rangées et colonnes occupées', 'Une personne par rangée et par colonne : les cases bloquées sont assombries.'],
      ['autoCheck', 'Signaler les indices non respectés', 'Affiche ✓ ou ✗ sur la fiche d’un suspect placé. Plus facile !'],
      ['timer', 'Afficher le chronomètre', 'Le temps est toujours enregistré.']
    ];
    const m = openModal('<h2>Options</h2>' + rows.map(function (r) {
      return '<div class="row"><div><b>' + r[1] + '</b><br><span style="font-size:15px;color:#666">' + r[2] + '</span></div>' +
        '<label class="switch"><input type="checkbox" data-k="' + r[0] + '"' + (settings[r[0]] ? ' checked' : '') + ' aria-label="' + esc(r[1]) + '"><span></span></label></div>';
    }).join('') + '<h3>Commandes</h3><ul>' +
      '<li><b>Placer :</b> touche une fiche, puis une case. Touche le pion à nouveau pour le retirer.</li>' +
      '<li><b>Croix :</b> appui long sur une case (ou clic droit), ou outil « Croix » en glissant le doigt.</li>' +
      '<li><b>Clavier :</b> initiale d’un suspect pour le sélectionner, 1-2-3 pour les outils, Ctrl+Z pour annuler, ? pour un indice.</li></ul>' +
      '<h3>Progression</h3><p><button class="pill-btn" data-x="wipe">Effacer toute ma progression</button></p>');
    m.querySelectorAll('input[data-k]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        settings[inp.dataset.k] = inp.checked;
        save('settings', settings);
        if (cur) { if (inp.dataset.k === 'timer') buildStage(); else renderAll(); }
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
    openModal('<h2>Comment jouer</h2>' +
      '<p>Un meurtre a été commis ! Chaque énigme est une <b>scène de crime</b> vue de dessus, découpée en <b>zones</b> (pièces, jardins, trous de golf…). ' +
      'Chaque suspect donne un <b>indice</b>. Ton but : retrouver la <b>case exacte</b> de chaque personne, victime comprise, puis démasquer le coupable.</p>' +
      '<h3>Les règles</h3><ol>' +
      '<li><b>Une personne par rangée et par colonne.</b> Dès que tu places quelqu’un, toute sa rangée et toute sa colonne sont bloquées.</li>' +
      '<li><b>Chaque indice est vrai.</b> Traite-le comme une règle, pas comme une simple piste.</li>' +
      '<li><b>Le plan est une preuve.</b> Certains objets peuvent être occupés (chaise, tapis, lit, voiture…), d’autres non (table, étagère, plante, arbre…). La légende de chaque énigme les précise.</li>' +
      '<li><b>Le meurtrier était seul avec la victime</b>, dans la même zone. On le trouve à la fin, une fois tout le monde placé.</li></ol>' +
      '<h3>Que veut dire « à côté » ?</h3><p>À gauche, à droite, au-dessus ou en dessous (jamais en diagonale), <b>et dans la même zone</b>. Deux cases qui se touchent de part et d’autre d’un mur ne sont pas « à côté ».</p>' +
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
      '<li><b>Raye rangées et colonnes :</b> chaque personne placée élimine sa rangée et sa colonne pour les autres.</li>' +
      '<li><b>Placements forcés :</b> si une personne n’a plus qu’une case possible, ou si une rangée ne peut plus accueillir qu’une seule personne, place-la.</li>' +
      '<li><b>Capacité des zones :</b> compte les cases libres d’une zone et les personnes qui doivent y aller.</li>' +
      '<li><b>Lis les indices à la lettre :</b> « seul », « seule personne », « à côté » ont un sens précis.</li>' +
      '<li><b>Garde le meurtre pour la fin :</b> la paire victime-meurtrier sert de vérification finale.</li></ul>' +
      '<h3>Commandes</h3><ul>' +
      '<li>Touche une <b>fiche suspect</b>, puis une <b>case</b> pour y poser son pion. Touche le pion pour le retirer, ou une autre case pour le déplacer.</li>' +
      '<li><b>Appui long</b> (ou clic droit) sur une case : croix « impossible ». L’outil <b>Croix</b> permet d’en tracer plusieurs en glissant.</li>' +
      '<li><b>Indice</b> : 1er appui = qui regarder, 2e = cases possibles, 3e = placement. <b>Vérifier</b> signale les pions mal placés.</li>' +
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
