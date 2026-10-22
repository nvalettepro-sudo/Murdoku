/* Murdoku — portraits SVG générés (style plat « polaroïd » des fiches).
 * Visage sans traits avec ombrage en deux tons (thème classique),
 * ou visage cartoon avec yeux et sourire (thème famille).
 */
(function (root) {
  'use strict';
  const O = '#2b2838';
  let uid = 0;

  function shade(hex, amt) { return root.MurdokuIcons.shade(hex, amt); }

  /** Cheveux dessinés derrière la tête */
  function hairBack(st, hc) {
    switch (st) {
      case 'long': return '<path d="M26 46 Q24 18 50 16 Q76 18 74 46 L78 96 Q64 100 50 98 Q36 100 22 96 Z" fill="' + hc + '"/>';
      case 'wavy': return '<path d="M26 46 Q22 16 50 14 Q78 16 74 46 Q82 62 76 78 Q82 90 72 100 L28 100 Q18 90 24 78 Q18 62 26 46 Z" fill="' + hc + '"/>';
      case 'braids': return '<path d="M28 46 Q26 18 50 16 Q74 18 72 46 L72 70 L28 70 Z" fill="' + hc + '"/>' +
        '<path d="M26 56 Q20 76 28 98 M74 56 Q80 76 72 98" stroke="' + hc + '" stroke-width="10" fill="none" stroke-linecap="round"/>' +
        '<path d="M22 66 L32 70 M22 78 L32 82 M24 90 L32 92 M78 66 L68 70 M78 78 L68 82 M76 90 L68 92" stroke="' + shade(hc, -0.3) + '" stroke-width="2"/>';
      case 'bob': return '<path d="M26 50 Q22 16 50 16 Q78 16 74 50 L76 74 Q64 78 50 76 Q36 78 24 74 Z" fill="' + hc + '"/>';
      case 'ponytail': return '<path d="M66 30 Q90 40 82 74 Q78 86 70 90 Q76 70 70 50 Z" fill="' + hc + '"/>';
      case 'curly': return '<g fill="' + hc + '">' + [[30, 30, 12], [42, 20, 12], [58, 20, 12], [70, 30, 12], [26, 46, 10], [74, 46, 10], [28, 60, 9], [72, 60, 9]].map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; }).join('') + '</g>';
      case 'bun': return '<circle cx="50" cy="14" r="11" fill="' + hc + '"/>';
      case 'elf': case 'santa': return '';
      default: return '';
    }
  }

  /** Cheveux / coiffes dessinés devant la tête */
  function hairFront(st, hc) {
    const d = shade(hc, -0.2);
    switch (st) {
      case 'side': return '<path d="M30 46 Q28 20 50 20 Q72 20 70 44 Q66 32 56 30 Q46 36 32 38 Z" fill="' + hc + '"/><path d="M56 30 Q52 26 44 26" stroke="' + d + '" stroke-width="1.5" fill="none"/>';
      case 'buzz': return '<path d="M31 42 Q30 22 50 22 Q70 22 69 42 Q66 30 50 29 Q34 30 31 42 Z" fill="' + hc + '"/>';
      case 'curly': return '<g fill="' + hc + '">' + [[36, 28, 9], [48, 24, 9], [60, 27, 9], [32, 38, 7], [68, 38, 7]].map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; }).join('') + '</g>';
      case 'long': case 'wavy': return '<path d="M30 48 Q28 20 50 20 Q72 20 70 48 Q66 30 50 28 Q40 32 34 44 Z" fill="' + hc + '"/>';
      case 'braids': return '<path d="M30 46 Q28 20 50 20 Q72 20 70 46 Q64 30 50 28 Q36 30 30 46 Z" fill="' + hc + '"/><path d="M50 21 L50 30" stroke="' + d + '" stroke-width="2"/>';
      case 'bob': return '<path d="M30 50 Q28 20 50 20 Q72 20 70 50 Q68 34 58 30 Q44 38 30 50 Z" fill="' + hc + '"/>';
      case 'bun': case 'ponytail': return '<path d="M30 44 Q28 22 50 22 Q72 22 70 44 Q64 30 50 29 Q36 30 30 44 Z" fill="' + hc + '"/>';
      case 'spiky': return '<path d="M29 44 L26 30 L34 32 L32 18 L42 26 L46 12 L54 24 L62 12 L64 26 L74 20 L70 32 L76 34 L70 44 Q64 30 50 30 Q36 30 29 44 Z" fill="' + hc + '"/>';
      case 'bald': return '<path d="M30 48 Q30 40 33 38 L33 50 Z M70 48 Q70 40 67 38 L67 50 Z" fill="' + hc + '"/>';
      case 'elf': return '<path d="M26 34 Q50 26 74 34 L58 2 Q52 -2 50 6 Z" fill="#4caa4c" stroke="' + O + '" stroke-width="1.5"/>' +
        '<path d="M24 36 Q50 26 76 36 L74 42 Q50 34 26 42 Z" fill="#d84a4a" stroke="' + O + '" stroke-width="1.5"/>' +
        '<path d="M28 44 Q30 36 40 36 L34 52 Z M72 44 Q70 36 60 36 L66 52 Z" fill="' + hc + '"/>';
      case 'santa': return '<path d="M28 34 Q50 20 72 34 Q80 12 92 18" fill="#c83a3a" stroke="#c83a3a" stroke-width="2"/>' +
        '<path d="M26 34 Q50 14 74 34 Q86 20 92 26 L78 30 Z" fill="#c83a3a"/>' +
        '<rect x="24" y="30" width="52" height="10" rx="5" fill="#f6f6f6"/><circle cx="92" cy="24" r="6" fill="#f6f6f6"/>';
      case 'beanie': return '<path d="M28 40 Q28 14 50 14 Q72 14 72 40 Z" fill="' + hc + '"/><rect x="26" y="34" width="48" height="9" rx="4" fill="' + shade(hc, -0.15) + '"/>';
      case 'cap': return '<path d="M30 38 Q30 18 50 18 Q70 18 70 38 Z" fill="#d84a4a"/><path d="M50 36 L84 38 Q80 44 50 42 Z" fill="#c83a3a"/><path d="M30 40 Q30 46 32 50 L34 40 Z M70 40 L70 48 L66 40 Z" fill="' + hc + '"/>';
      case 'cowboy': return '<path d="M30 40 Q50 32 70 40 L68 18 Q60 12 50 16 Q40 12 32 18 Z" fill="#b8864a"/><path d="M10 40 Q50 26 90 40 Q86 46 50 40 Q14 46 10 40 Z" fill="#a8763a"/><rect x="31" y="32" width="38" height="5" fill="#7a5a3a"/>' +
        '<path d="M31 42 L33 54 M69 42 L67 54" stroke="' + hc + '" stroke-width="4"/>';
      default: return '';
    }
  }

  function beard(type, bc, skin) {
    switch (type) {
      case 'full': return '<path d="M31 50 Q32 76 50 80 Q68 76 69 50 Q66 60 58 62 Q50 58 42 62 Q34 60 31 50 Z" fill="' + bc + '"/><path d="M44 66 Q50 69 56 66" stroke="' + shade(skin, -0.25) + '" stroke-width="2.5" fill="none"/>';
      case 'goatee': return '<path d="M42 62 Q50 58 58 62 Q58 74 50 76 Q42 74 42 62 Z" fill="' + bc + '"/><path d="M45 66 Q50 68 55 66" stroke="' + shade(skin, -0.2) + '" stroke-width="2" fill="none"/>';
      case 'mustache': return '<path d="M38 64 Q44 58 50 61 Q56 58 62 64 Q56 63 50 65 Q44 63 38 64 Z" fill="' + bc + '"/>';
      case 'stubble': return '<path d="M32 54 Q34 76 50 79 Q66 76 68 54 Q62 66 50 66 Q38 66 32 54 Z" fill="' + bc + '" opacity=".45"/>';
      default: return '';
    }
  }

  function glasses(g) {
    if (!g) return '';
    if (g === 'sun') return '<g fill="#2b2838"><rect x="33" y="43" width="14" height="9" rx="4"/><rect x="53" y="43" width="14" height="9" rx="4"/></g><path d="M47 46 L53 46" stroke="#2b2838" stroke-width="2.5"/>';
    return '<g fill="rgba(255,255,255,.25)" stroke="#2b2838" stroke-width="2.4"><rect x="33" y="42" width="14" height="10" rx="4"/><rect x="53" y="42" width="14" height="10" rx="4"/></g><path d="M47 46 L53 46" stroke="#2b2838" stroke-width="2.4"/>';
  }

  /** Portrait SVG complet. look = { skin, hair, hairColor, beard, beardColor, glasses, bg, shirt, family } */
  function avatar(look, opts) {
    look = look || {};
    opts = opts || {};
    const id = 'av' + (++uid);
    const skin = look.skin || '#f0c49f';
    const hc = look.hairColor || '#4a3428';
    const bg = look.bg || '#9ab8d8';
    const shirt = look.shirt || '#5a6a9a';
    const fam = !!look.family;
    const stroke = fam ? ' stroke="' + O + '" stroke-width="2"' : '';
    let s = '<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" class="avatar" aria-hidden="true">';
    s += '<defs><clipPath id="' + id + 'h"><ellipse cx="50" cy="48" rx="19" ry="24"/></clipPath>' +
      '<clipPath id="' + id + 'f"><rect x="0" y="0" width="100" height="110"/></clipPath></defs>';
    s += '<g clip-path="url(#' + id + 'f)">';
    s += '<rect width="100" height="110" fill="' + (fam && !opts.tile ? 'transparent' : bg) + '"/>';
    s += hairBack(look.hair, hc);
    // épaules / vêtement
    s += '<path d="M6 112 Q8 88 34 82 L66 82 Q92 88 94 112 Z" fill="' + shirt + '"' + stroke + '/>';
    s += '<path d="M40 82 L50 94 L60 82" fill="' + shade(shirt, -0.15) + '"/>';
    // cou
    s += '<path d="M42 64 L42 84 Q50 90 58 84 L58 64 Z" fill="' + shade(skin, -0.12) + '"' + stroke + '/>';
    // oreilles + tête
    s += '<ellipse cx="31" cy="50" rx="4" ry="6" fill="' + skin + '"' + stroke + '/><ellipse cx="69" cy="50" rx="4" ry="6" fill="' + skin + '"' + stroke + '/>';
    s += '<ellipse cx="50" cy="48" rx="19" ry="24" fill="' + skin + '"' + stroke + '/>';
    if (!fam) {
      // ombrage deux tons caractéristique (moitié droite plus sombre)
      s += '<rect x="50" y="20" width="22" height="56" fill="rgba(60,30,20,.12)" clip-path="url(#' + id + 'h)"/>';
      s += '<path d="M50 40 L52 56 L48 56" fill="none" stroke="rgba(60,30,20,.18)" stroke-width="1.5"/>';
    } else {
      s += '<g fill="' + O + '"><ellipse cx="43" cy="47" rx="2.6" ry="3.4"/><ellipse cx="57" cy="47" rx="2.6" ry="3.4"/></g>' +
        '<path d="M38 40 Q43 37 47 40 M53 40 Q57 37 62 40" stroke="' + O + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M42 59 Q50 66 58 59" stroke="' + O + '" stroke-width="2.4" fill="#fff" stroke-linejoin="round"/>' +
        '<ellipse cx="38" cy="55" rx="4" ry="2.4" fill="#f08a8a" opacity=".45"/><ellipse cx="62" cy="55" rx="4" ry="2.4" fill="#f08a8a" opacity=".45"/>' +
        '<path d="M50 49 Q48 54 51 55" stroke="' + shade(skin, -0.35) + '" stroke-width="1.8" fill="none"/>';
    }
    s += beard(look.beard, look.beardColor || hc, skin);
    s += hairFront(look.hair, hc);
    s += glasses(look.glasses);
    s += '</g>';
    if (opts.victim) {
      s += '<path d="M24 26 L76 84 M76 26 L24 84" stroke="#e02a2a" stroke-width="4" stroke-linecap="round" opacity=".9"/>';
    }
    s += '</svg>';
    return s;
  }

  root.MurdokuAvatars = { avatar: avatar };
})(typeof window !== 'undefined' ? window : this);
