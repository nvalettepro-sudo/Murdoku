/* Murdoku — moteur logique
 * Compile une énigme, évalue les indices, résout la grille et vérifie l'unicité.
 * Fonctionne dans le navigateur (window.MurdokuEngine) et sous Node (module.exports).
 */
(function (root) {
  'use strict';

  // Exception levée quand un indice ne peut pas encore être évalué (personne non placée).
  const UNKNOWN = { unknown: true };
  // Nombre max de cases candidates examinées pour une personne non placée dans un quantificateur
  const DEEP_LIMIT = 48;

  // Types d'objets que l'on peut occuper par défaut (surchargés par l'énigme).
  const DEFAULT_OCCUPIABLE = ['chair', 'carpet', 'bed', 'car', 'oil', 'path', 'sand',
    'door', 'framed', 'tee', 'flag', 'cart', 'house', 'paint', 'puddle'];

  function baseType(t) { return t.split(':')[0]; }

  function parseCells(str) {
    return str.trim().split(/\s+/).map(function (p) {
      const a = p.split(',');
      return [parseInt(a[0], 10), parseInt(a[1], 10)];
    });
  }

  function compileRule(def, label, src) {
    try { return new Function('h', 'with (h) { return (' + src + '); }'); }
    catch (e) { throw new Error(def.id + ': règle invalide pour ' + label + ' : ' + src + ' (' + e.message + ')'); }
  }

  /** Compile une définition d'énigme en structure exploitable. */
  function compile(def) {
    const N = def.size;
    const area = [];
    const areaIds = [];
    for (let r = 0; r < N; r++) {
      const row = def.grid[r].replace(/\s+/g, '');
      if (row.length !== N) throw new Error(def.id + ': rangée ' + r + ' de longueur ' + row.length);
      for (let c = 0; c < N; c++) {
        const a = row[c];
        if (!def.areas[a]) throw new Error(def.id + ': zone inconnue ' + a);
        area.push(a);
        if (areaIds.indexOf(a) < 0) areaIds.push(a);
      }
    }
    const objs = [];
    for (let i = 0; i < N * N; i++) objs.push(new Set());
    const pieces = [];
    const aliases = def.aliases || {};
    (def.objects || []).forEach(function (o) {
      const cells = parseCells(o.at);
      const vis = baseType(o.t);
      const logical = aliases[vis] || vis; // type logique utilisé par les indices
      cells.forEach(function (rc) {
        if (rc[0] < 0 || rc[0] >= N || rc[1] < 0 || rc[1] >= N) throw new Error(def.id + ': case hors grille ' + o.at);
        objs[rc[0] * N + rc[1]].add(logical);
      });
      pieces.push({ t: o.t, type: vis, logical: logical, cells: cells, v: o.v, dir: o.t.split(':')[1] || null });
    });
    const occ = new Set(def.occupiable || DEFAULT_OCCUPIABLE);
    const blocked = [];
    for (let i = 0; i < N * N; i++) {
      let b = false;
      objs[i].forEach(function (t) { if (!occ.has(t)) b = true; });
      blocked.push(b);
    }
    // Voisins orthogonaux dans la même zone (définition officielle de « à côté »)
    const nbr = [];
    for (let k = 0; k < N * N; k++) {
      const r = Math.floor(k / N), c = k % N, out = [];
      if (r > 0) out.push(k - N);
      if (r < N - 1) out.push(k + N);
      if (c > 0) out.push(k - 1);
      if (c < N - 1) out.push(k + 1);
      nbr.push(out.filter(function (n) { return area[n] === area[k]; }));
    }
    const people = def.people.map(function (p, idx) {
      return Object.assign({}, p, { idx: idx, fn: p.rule ? compileRule(def, p.name, p.rule) : null });
    });
    const globals = (def.globals || []).map(function (g) {
      return { text: g.text, fn: compileRule(def, 'règle globale', g.rule) };
    });
    const pid = {};
    people.forEach(function (p) { pid[p.id] = p.idx; pid[p.name] = p.idx; });
    const P = {
      def: def, id: def.id, N: N, area: area, areaIds: areaIds, objs: objs, pieces: pieces,
      blocked: blocked, nbr: nbr, people: people, globals: globals, pid: pid,
      victim: def.victim ? pid[def.victim] : -1
    };
    P.st = { pos: null, reach: null, cands: null, depth: 0 };
    P.proxies = people.map(function (p, i) { return makeProxy(P, i); });
    P.helpers = people.map(function (p, i) { return makeHelpers(P, i); });
    P.gHelpers = makeHelpers(P, -1);
    return P;
  }

  function cellOf(P, i) { const k = P.st.pos[i]; if (k < 0) throw UNKNOWN; return k; }

  // Une personne non placée peut-elle encore atteindre la zone a ? (info fournie par le solveur)
  function makeCanReach(P) {
    return function (i, a) {
      const reach = P.st.reach;
      if (!reach || !reach[i]) return true;
      return reach[i].has(a);
    };
  }

  /** Vue d'une personne. Lire sa position alors qu'elle n'est pas placée lève UNKNOWN. */
  function makeProxy(P, i) {
    const p = P.people[i];
    const N = P.N;
    return {
      idx: i, id: p.id, name: p.name, gender: p.gender, role: p.role,
      man: p.gender === 'm',
      woman: p.gender === 'f',
      get placed() { return P.st.pos[i] >= 0; },
      get cell() { return cellOf(P, i); },
      get r() { return Math.floor(cellOf(P, i) / N); },
      get c() { return cellOf(P, i) % N; },
      get area() { return P.area[cellOf(P, i)]; },
      on: function (t) { return P.objs[cellOf(P, i)].has(t); },
      beside: function (t) {
        const nb = P.nbr[cellOf(P, i)];
        for (let j = 0; j < nb.length; j++) if (P.objs[nb[j]].has(t)) return true;
        return false;
      },
      besideCount: function (t) {
        const nb = P.nbr[cellOf(P, i)];
        let n = 0;
        for (let j = 0; j < nb.length; j++) if (P.objs[nb[j]].has(t)) n++;
        return n;
      },
      inArea: function () { const a = P.area[cellOf(P, i)]; return Array.prototype.indexOf.call(arguments, a) >= 0; },
      get sitting() { return P.objs[cellOf(P, i)].has('chair'); },
      // Évaluations du point de vue de cette personne
      alone: function () { cellOf(P, i); return P.helpers[i].alone(); },
      aloneWith: function (pred) { cellOf(P, i); return P.helpers[i].aloneWith(pred); },
      onlyOn: function (t) { cellOf(P, i); return P.helpers[i].onlyOn(t); }
    };
  }

  /** Fonctions disponibles dans les règles (« with (h) »). selfIdx = -1 pour les règles globales. */
  function makeHelpers(P, selfIdx) {
    const N = P.N;
    const nP = P.people.length;
    const me = selfIdx >= 0 ? P.proxies[selfIdx] : null;
    const canReach = makeCanReach(P);
    function idx(x) {
      if (typeof x === 'number') return x;
      const i = P.pid[x];
      if (i === undefined) throw new Error('Personne inconnue : ' + x);
      return i;
    }
    // Compte les autres personnes satisfaisant pred. t = vrai, unk = indéterminé.
    // Pour une personne non placée dont on connaît les cases candidates (fournies par le
    // solveur), on teste ces cases : si aucune ne peut satisfaire pred, elle ne compte pas.
    function scan(pred, includeSelf) {
      const pos = P.st.pos;
      const cands = P.st.cands;
      let t = 0, unk = 0;
      for (let i = 0; i < nP; i++) {
        if (!includeSelf && i === selfIdx) continue;
        if (pos[i] < 0) {
          if (cands && cands[i] && cands[i].length <= DEEP_LIMIT && P.st.depth === 0) {
            if (couldSatisfy(i, cands[i], pred)) unk++;
          } else unk++;
          continue;
        }
        try { if (pred(P.proxies[i])) t++; }
        catch (e) { if (e === UNKNOWN) unk++; else throw e; }
      }
      return { t: t, unk: unk };
    }
    function couldSatisfy(i, list, pred) {
      const pos = P.st.pos;
      P.st.depth++;
      try {
        for (let j = 0; j < list.length; j++) {
          const k = list[j], r = Math.floor(k / N), c = k % N;
          let clash = false;
          for (let x = 0; x < nP; x++) {
            const kx = pos[x];
            if (kx >= 0 && (kx === k || Math.floor(kx / N) === r || kx % N === c)) { clash = true; break; }
          }
          if (clash) continue;
          pos[i] = k;
          try { if (pred(P.proxies[i])) return true; }
          catch (e) { if (e === UNKNOWN) return true; throw e; }
          finally { pos[i] = -1; }
        }
        return false;
      } finally {
        P.st.depth--;
      }
    }
    const h = {
      me: me,
      P: function (x) { return P.proxies[idx(x)]; },
      // --- position de soi
      on: function (t) { return me.on(t); },
      sitting: function () { return me.on('chair'); },
      beside: function (t) { return me.beside(t); },
      besideCount: function (t) { return me.besideCount(t); },
      inArea: function () { return me.inArea.apply(null, arguments); },
      row: function () { return me.r; },
      col: function () { return me.c; },
      areaHas: function (t) {
        const a = me.area;
        for (let k = 0; k < N * N; k++) if (P.area[k] === a && P.objs[k].has(t)) return true;
        return false;
      },
      // Un objet t se trouve-t-il dans ma rangée / ma colonne ?
      rowHas: function (t) {
        const r = me.r;
        for (let c = 0; c < N; c++) if (P.objs[r * N + c].has(t)) return true;
        return false;
      },
      colHas: function (t) {
        const c = me.c;
        for (let r = 0; r < N; r++) if (P.objs[r * N + c].has(t)) return true;
        return false;
      },
      // Case voisine dans une direction (n, s, e, o/w), même zone, contenant t
      dirHas: function (dir, t) {
        const k = me.cell, r = Math.floor(k / N), c = k % N;
        const d = { n: [-1, 0], s: [1, 0], e: [0, 1], o: [0, -1], w: [0, -1] }[dir];
        const rr = r + d[0], cc = c + d[1];
        if (rr < 0 || rr >= N || cc < 0 || cc >= N) return false;
        const n = rr * N + cc;
        return P.area[n] === P.area[k] && P.objs[n].has(t);
      },
      // --- relations avec une autre personne
      withP: function (x) { return me.area === P.proxies[idx(x)].area; },
      notWith: function (x) { return me.area !== P.proxies[idx(x)].area; },
      northOf: function (x) { return me.r < P.proxies[idx(x)].r; },
      southOf: function (x) { return me.r > P.proxies[idx(x)].r; },
      westOf: function (x) { return me.c < P.proxies[idx(x)].c; },
      eastOf: function (x) { return me.c > P.proxies[idx(x)].c; },
      // --- quantificateurs sur les autres personnes
      exists: function (pred) {
        const s = scan(pred, false);
        if (s.t > 0) return true;
        if (s.unk === 0) return false;
        throw UNKNOWN;
      },
      none: function (pred) {
        const s = scan(pred, false);
        if (s.t > 0) return false;
        if (s.unk === 0) return true;
        throw UNKNOWN;
      },
      count: function (pred, includeSelf) {
        const s = scan(pred, includeSelf);
        if (s.unk === 0) return s.t;
        throw UNKNOWN;
      },
      exactly: function (n, pred, includeSelf) {
        const s = scan(pred, includeSelf);
        if (s.t > n) return false;
        if (s.unk === 0) return s.t === n;
        if (s.t + s.unk < n) return false;
        throw UNKNOWN;
      },
      atLeast: function (n, pred, includeSelf) {
        const s = scan(pred, includeSelf);
        if (s.t >= n) return true;
        if (s.t + s.unk < n) return false;
        throw UNKNOWN;
      },
      atMost: function (n, pred, includeSelf) {
        const s = scan(pred, includeSelf);
        if (s.t > n) return false;
        if (s.t + s.unk <= n) return true;
        throw UNKNOWN;
      },
      // Seul dans sa zone
      alone: function () {
        const a = me.area;
        return h.exactly(0, function (q) { return q.area === a; });
      },
      // Seul avec exactement une autre personne (optionnellement filtrée)
      aloneWith: function (pred) {
        const a = me.area;
        const s = scan(function (q) { return q.area === a; }, false);
        if (s.t > 1) return false;
        if (s.unk === 0) {
          if (s.t !== 1) return false;
          if (!pred) return true;
          return h.exists(function (q) { return q.area === a && pred(q); });
        }
        if (s.t === 1 && pred) {
          const ok = scan(function (q) { return q.area === a && pred(q); }, false);
          if (ok.t === 0 && ok.unk === 0) return false;
        }
        throw UNKNOWN;
      },
      // Seule personne sur un type d'objet
      onlyOn: function (t) {
        if (!me.on(t)) return false;
        return h.none(function (q) { return q.on(t); });
      },
      // Nombre de personnes dans une zone
      countIn: function (a) {
        return h.count(function (q) { return q.area === a; }, true);
      },
      // Nombre de personnes dans une zone, avec bornes connues (pour élagage)
      countRange: function (a) {
        const pos = P.st.pos;
        let min = 0, max = 0;
        for (let i = 0; i < nP; i++) {
          if (pos[i] >= 0) { if (P.area[pos[i]] === a) { min++; max++; } }
          else if (canReach(i, a)) max++;
        }
        return { min: min, max: max };
      },
      // Parité imposée par zone : map { zone: 0 (pair) | 1 (impair) }. Élagage par accessibilité.
      parity: function (map) {
        const pos = P.st.pos;
        const keys = Object.keys(map);
        let U = 0;
        for (let i = 0; i < nP; i++) if (pos[i] < 0) U++;
        let odd = 0;
        for (let j = 0; j < keys.length; j++) {
          const a = keys[j];
          let cur = 0, reach = 0;
          for (let i = 0; i < nP; i++) {
            if (pos[i] >= 0) { if (P.area[pos[i]] === a) cur++; }
            else if (canReach(i, a)) reach++;
          }
          const need = ((map[a] - cur) % 2 + 2) % 2;
          if (need === 1) { if (reach === 0) return false; odd++; }
        }
        if (odd > U) return false;
        if (keys.length === P.areaIds.length && (U - odd) % 2 !== 0) return false;
        if (U === 0) return odd === 0;
        throw UNKNOWN;
      },
      // Nombres d'occupants tous différents entre les zones listées (0 compris)
      distinctCounts: function (areas) {
        const ranges = areas.map(function (a) { return h.countRange(a); });
        let open = false;
        for (let x = 0; x < ranges.length; x++) {
          if (ranges[x].min !== ranges[x].max) { open = true; continue; }
          for (let y = x + 1; y < ranges.length; y++) {
            if (ranges[y].min === ranges[y].max && ranges[y].min === ranges[x].min) return false;
          }
        }
        if (open) throw UNKNOWN;
        return true;
      },
      // Au moins une personne satisfaisant pred dans la zone a (élagage par accessibilité)
      someIn: function (a, pred) {
        const pos = P.st.pos;
        let maybe = false;
        for (let i = 0; i < nP; i++) {
          if (pos[i] >= 0) {
            if (P.area[pos[i]] === a) {
              try { if (!pred || pred(P.proxies[i])) return true; }
              catch (e) { if (e === UNKNOWN) maybe = true; else throw e; }
            }
          } else if (canReach(i, a)) {
            try { if (!pred || pred(P.proxies[i]) !== false) maybe = true; }
            catch (e) { if (e === UNKNOWN) maybe = true; else throw e; }
          }
        }
        if (maybe) throw UNKNOWN;
        return false;
      },
      UNKNOWN: UNKNOWN
    };
    return h;
  }

  /** Évalue une règle : true, false, ou null si indéterminé. selfIdx = -1 pour une règle globale. */
  function evalRule(P, fn, pos, selfIdx) {
    const prev = P.st.pos;
    P.st.pos = pos;
    try {
      return !!fn(selfIdx >= 0 ? P.helpers[selfIdx] : P.gHelpers);
    } catch (e) {
      if (e === UNKNOWN) return null;
      throw e;
    } finally {
      P.st.pos = prev;
    }
  }

  const VICTIM_FN = function (h) { return h.aloneWith(); };

  /**
   * Liste des contraintes : règles des personnes, règle implicite de la victime, règles globales.
   * owner = index de la personne dont la règle dépend toujours (-1 pour les globales).
   */
  function constraintsOf(P) {
    if (P._cons) return P._cons;
    const cons = [];
    P.people.forEach(function (p, i) { if (p.fn) cons.push({ fn: p.fn, self: i }); });
    if (P.victim >= 0) cons.push({ fn: VICTIM_FN, self: P.victim });
    P.globals.forEach(function (g) { cons.push({ fn: g.fn, self: -1 }); });
    P._cons = cons;
    return cons;
  }

  /** Vérifie toutes les contraintes sur une affectation partielle. false = violation certaine. */
  function consistent(P, pos) {
    const nP = P.people.length;
    for (let i = 0; i < nP; i++) if (pos[i] >= 0 && P.blocked[pos[i]]) return false;
    const cons = constraintsOf(P);
    for (let j = 0; j < cons.length; j++) {
      const c = cons[j];
      if (c.self >= 0 && pos[c.self] < 0) continue;
      if (evalRule(P, c.fn, pos, c.self) === false) return false;
    }
    return true;
  }

  /** Domaine statique : cases non bloquées où la règle propre de la personne n'est pas fausse. */
  function staticDomains(P) {
    if (P._doms) return P._doms;
    const N = P.N, nP = P.people.length;
    const doms = [];
    const pos = new Array(nP).fill(-1);
    const cons = constraintsOf(P);
    // Une contrainte « locale » ne dépend que de sa propre personne : elle est entièrement
    // traitée par le domaine statique et n'a plus à être réévaluée pendant la recherche.
    const local = cons.map(function () { return true; });
    for (let i = 0; i < nP; i++) {
      const d = [];
      for (let k = 0; k < N * N; k++) {
        if (P.blocked[k]) continue;
        pos[i] = k;
        let ok = true;
        for (let j = 0; j < cons.length; j++) {
          if (cons[j].self !== i) continue;
          const v = evalRule(P, cons[j].fn, pos, i);
          if (v === null) local[j] = false;
          if (v === false) { ok = false; }
        }
        if (ok) d.push(k);
      }
      pos[i] = -1;
      doms.push(d);
    }
    cons.forEach(function (c, j) { if (c.self < 0) local[j] = false; });
    P._doms = doms;
    P._local = local;
    return doms;
  }

  /**
   * Réduction par paires : retire la case k de la personne i si une autre personne j
   * n'a plus aucune case compatible avec (i en k). Itère jusqu'au point fixe.
   */
  function pairReduce(P, doms0) {
    const N = P.N, nP = P.people.length;
    const doms = doms0.map(function (d) { return d.slice(); });
    const pos = new Array(nP).fill(-1);
    let changed = true, rounds = 0;
    while (changed && rounds < 20) {
      changed = false; rounds++;
      for (let i = 0; i < nP; i++) {
        const keep = [];
        for (let a = 0; a < doms[i].length; a++) {
          const k = doms[i][a];
          const rk = Math.floor(k / N), ck = k % N;
          pos[i] = k;
          let ok = consistent(P, pos);
          for (let j = 0; ok && j < nP; j++) {
            if (j === i) continue;
            let sup = false;
            const dj = doms[j];
            for (let b = 0; b < dj.length; b++) {
              const k2 = dj[b];
              if (Math.floor(k2 / N) === rk || k2 % N === ck) continue;
              pos[j] = k2;
              const v = consistent(P, pos);
              pos[j] = -1;
              if (v) { sup = true; break; }
            }
            if (!sup) ok = false;
          }
          pos[i] = -1;
          if (ok) keep.push(k); else changed = true;
        }
        doms[i] = keep;
      }
    }
    return doms;
  }

  /**
   * Résolution par backtracking : heuristique MRV, déductions par rangée/colonne,
   * et mémorisation des contraintes déjà satisfaites (monotones).
   */
  function solve(P, opts) {
    opts = opts || {};
    const limit = opts.limit || 2;
    const N = P.N, nP = P.people.length;
    let doms = staticDomains(P);
    if (opts.pairs) doms = pairReduce(P, doms);
    const cons = constraintsOf(P);
    const local = P._local;
    const pos = (opts.fixed ? opts.fixed.slice() : new Array(nP).fill(-1));
    const usedR = new Array(N).fill(false), usedC = new Array(N).fill(false);
    for (let i = 0; i < nP; i++) if (pos[i] >= 0) { usedR[Math.floor(pos[i] / N)] = true; usedC[pos[i] % N] = true; }
    const done = cons.map(function (c, j) { return local[j]; }); // contrainte définitivement vraie
    const sols = [];
    let nodes = 0;
    const maxNodes = opts.maxNodes || 2e6;

    // Évalue les contraintes non encore satisfaites ; renvoie false si violation.
    // Si `mark` est fourni, enregistre celles devenues vraies (pour annulation).
    function check(mark) {
      for (let j = 0; j < cons.length; j++) {
        if (done[j]) continue;
        const c = cons[j];
        if (c.self >= 0 && pos[c.self] < 0) continue;
        const v = evalRule(P, c.fn, pos, c.self);
        if (v === false) return false;
        if (v === true && mark) { done[j] = true; mark.push(j); }
      }
      return true;
    }

    function candidates(i) {
      const out = [];
      const d = doms[i];
      for (let j = 0; j < d.length; j++) {
        const k = d[j];
        if (usedR[Math.floor(k / N)] || usedC[k % N]) continue;
        pos[i] = k;
        if (check(null)) out.push(k);
        pos[i] = -1;
      }
      return out;
    }

    function rec() {
      if (sols.length >= limit || nodes > maxNodes) return;
      nodes++;
      const cand = [];
      let best = -1;
      for (let i = 0; i < nP; i++) {
        if (pos[i] >= 0) { cand.push(null); continue; }
        const c = candidates(i);
        if (c.length === 0) return;
        cand.push(c);
        if (best < 0 || c.length < cand[best].length) best = i;
      }
      if (best < 0) {
        if (consistent(P, pos)) sols.push(pos.slice());
        return;
      }
      // Zones encore accessibles à chaque personne non placée (sert aux règles de comptage)
      const prevReach = P.st.reach, prevCands = P.st.cands;
      P.st.cands = cand;
      if (P.globals.length) {
        const reach = cand.map(function (c) {
          if (!c) return null;
          const s = new Set();
          for (let j = 0; j < c.length; j++) s.add(P.area[c[j]]);
          return s;
        });
        P.st.reach = reach;
        for (let g = 0; g < cons.length; g++) {
          if (cons[g].self >= 0 || done[g]) continue;
          if (evalRule(P, cons[g].fn, pos, -1) === false) { P.st.reach = prevReach; P.st.cands = prevCands; return; }
        }
      }
      try {
        branch(cand, best);
      } finally {
        P.st.reach = prevReach;
        P.st.cands = prevCands;
      }
    }

    function branch(cand, best) {
      // Chaque rangée / colonne libre doit pouvoir accueillir quelqu'un.
      // Si une seule personne peut l'occuper, on la force (singleton caché).
      let forced = null;
      for (let axis = 0; axis < 2 && !forced; axis++) {
        for (let line = 0; line < N; line++) {
          if ((axis === 0 ? usedR : usedC)[line]) continue;
          let who = -1, cnt = 0, opts2 = null;
          for (let i = 0; i < nP; i++) {
            if (!cand[i]) continue;
            const inLine = cand[i].filter(function (k) { return (axis === 0 ? Math.floor(k / N) : k % N) === line; });
            if (inLine.length) { cnt++; who = i; opts2 = inLine; if (cnt > 1) break; }
          }
          if (cnt === 0) return;
          if (cnt === 1 && (!forced || opts2.length < forced.cells.length)) forced = { i: who, cells: opts2 };
        }
      }
      let bi = best, bc = cand[best];
      if (forced && forced.cells.length <= bc.length) { bi = forced.i; bc = forced.cells; }
      for (let j = 0; j < bc.length; j++) {
        const k = bc[j];
        pos[bi] = k; usedR[Math.floor(k / N)] = true; usedC[k % N] = true;
        const mark = [];
        if (check(mark)) rec();
        for (let m = 0; m < mark.length; m++) done[mark[m]] = false;
        pos[bi] = -1; usedR[Math.floor(k / N)] = false; usedC[k % N] = false;
        if (sols.length >= limit) return;
      }
    }
    const savedReach = P.st.reach, savedCands = P.st.cands;
    P.st.reach = null;
    // Au départ, les candidats sont les domaines (statiques ou réduits par paires)
    P.st.cands = doms.map(function (d, i) { return pos[i] >= 0 ? null : d; });
    try {
      if (check(null)) rec();
    } finally {
      P.st.reach = savedReach;
      P.st.cands = savedCands;
    }
    return { solutions: sols, nodes: nodes, exhausted: nodes > maxNodes };
  }

  /** Personne seule avec la victime (le meurtrier) pour une solution donnée. */
  function murdererOf(P, sol) {
    if (P.victim < 0) return -1;
    const a = P.area[sol[P.victim]];
    let m = -1;
    for (let i = 0; i < sol.length; i++) {
      if (i !== P.victim && P.area[sol[i]] === a) m = i;
    }
    return m;
  }

  /** Le coupable est la personne seule avec la victime. */
  function culpritOf(P, sol) { return murdererOf(P, sol); }

  /**
   * Candidats pour l'aide : pour chaque personne non placée, cases compatibles avec
   * les placements fournis (supposés corrects), les rangées/colonnes prises et les indices.
   */
  function candidatesFor(P, fixed) {
    const N = P.N, nP = P.people.length;
    const doms = staticDomains(P);
    const pos = fixed.slice();
    const usedR = new Array(N).fill(false), usedC = new Array(N).fill(false);
    for (let i = 0; i < nP; i++) if (pos[i] >= 0) { usedR[Math.floor(pos[i] / N)] = true; usedC[pos[i] % N] = true; }
    const res = [];
    for (let i = 0; i < nP; i++) {
      if (pos[i] >= 0) { res.push(null); continue; }
      const out = [];
      doms[i].forEach(function (k) {
        if (usedR[Math.floor(k / N)] || usedC[k % N]) return;
        pos[i] = k;
        if (consistent(P, pos)) out.push(k);
        pos[i] = -1;
      });
      res.push(out);
    }
    return res;
  }

  /** Vérifie l'indice d'une personne dans une grille complète ou partielle (true/false/null). */
  function clueStatus(P, pos, i) {
    const p = P.people[i];
    if (pos[i] < 0) return null;
    if (P.blocked[pos[i]]) return false;
    let v = p.fn ? evalRule(P, p.fn, pos, i) : true;
    if (v !== false && i === P.victim) {
      const w = evalRule(P, VICTIM_FN, pos, i);
      if (w === false) v = false; else if (w === null && v === true) v = null;
    }
    return v;
  }

  const api = {
    UNKNOWN: UNKNOWN, compile: compile, solve: solve, consistent: consistent,
    staticDomains: staticDomains, murdererOf: murdererOf, culpritOf: culpritOf,
    candidatesFor: candidatesFor, evalRule: evalRule, clueStatus: clueStatus,
    parseCells: parseCells, baseType: baseType
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MurdokuEngine = api;
})(typeof window !== 'undefined' ? window : this);
