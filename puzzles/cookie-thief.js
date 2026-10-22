(window.MURDOKU_PUZZLES = window.MURDOKU_PUZZLES || []).push({
  id: 'cookie-thief',
  title: 'Le voleur de biscuits',
  original: 'The Cookie Thief',
  difficulty: 'très facile',
  order: 0,
  theme: 'family',
  palette: { logo: 'gold', bg1: '#f7ead6', bg2: '#efdcbf', card: '#f4ecdc', card2: '#f4ecdc', victim: '#f4ecdc', ink: '#2c2420', title: '#8d7a3e', panel: '#e5c79a', legendOk: '#f6eecd', legendNo: '#e8cfa6', label: '#fffbe9' },
  size: 6,
  victim: null,
  culprit: { onObject: 'crumbs' },
  intro: 'Quelqu’un a mangé tous les biscuits ! Les miettes sont encore par terre… mais qui est le coupable ?',
  goalText: 'Le voleur de biscuits se tenait sur les **miettes**.',
  culpritQuestion: 'La personne qui a mangé les biscuits est…',
  culpritHint: 'Qui se tenait sur des miettes ?',
  grid: [
    'KKKCCC',
    'KKKCCC',
    'KKKCCC',
    'FFSSSS',
    'FFSSSS',
    'FFSSSS'
  ],
  areas: {
    K: { name: 'Cuisine', floor: 'brick', color: '#f6dcae', label: [2, 1] },
    C: { name: 'Chambre principale', floor: 'cloud', color: '#cdc6f2', label: [2, 4] },
    F: { name: 'Chambre de Fred', floor: 'cloud', color: '#bfe8cf', label: [5, 1] },
    S: { name: 'Salon', floor: 'wood', color: '#f5d2d4', label: [5, 4] }
  },
  objects: [
    { t: 'flowerpot', at: '0,0' }, { t: 'roundtable', at: '0,1' }, { t: 'shelf', at: '0,2' },
    { t: 'bed', at: '0,4 0,5', v: '#e9b9d6' }, { t: 'shelf', at: '1,0' }, { t: 'crumbs', at: '1,2' },
    { t: 'roundtable', at: '1,4' }, { t: 'shelf', at: '1,5' }, { t: 'shelf', at: '2,2' },
    { t: 'crumbs', at: '2,3' }, { t: 'present', at: '2,4' }, { t: 'bed', at: '3,0 4,0', v: '#a9dcb4' },
    { t: 'roundtable', at: '3,2' }, { t: 'armchair', at: '3,3' }, { t: 'crumbs', at: '3,4' },
    { t: 'crumbs', at: '4,3' }, { t: 'xmastree', at: '4,4' }, { t: 'shelf', at: '5,0' },
    { t: 'armchair', at: '5,2' }, { t: 'armchair', at: '5,3' }, { t: 'crumbs', at: '5,4' }, { t: 'present', at: '5,5' }
  ],
  // alias : fauteuil = chaise, table ronde = table, pot de fleurs = plante, sapin = arbre
  aliases: { armchair: 'chair', roundtable: 'table', flowerpot: 'plant', xmastree: 'tree' },
  occupiable: ['crumbs', 'chair', 'bed'],
  people: [
    { id: 'A', name: 'Adam', gender: 'm', clue: "Il était **à côté** d'un **cadeau**.", rule: "beside('present')",
      quote: 'Moi ? J’étais en train d’inspecter les cadeaux. Contrôle de qualité !',
      look: { skin: '#f0c49f', hair: 'side', hairColor: '#7a4a2a', beard: 'full', beardColor: '#7a4a2a', glasses: true, bg: '#f4ecdc', shirt: '#3f8a4a', family: true } },
    { id: 'B', name: 'Beth', gender: 'f', clue: 'Elle était dans le **Salon**.', rule: "inArea('S')",
      quote: 'Si je les avais mangés, on le verrait dans ma Story.',
      look: { skin: '#f6d0b0', hair: 'long', hairColor: '#f2d27a', bg: '#f4ecdc', shirt: '#d84a4a', family: true } },
    { id: 'C', name: 'Carissa', gender: 'f', clue: "Elle était **à côté** d'une **table** à la **Cuisine**.", rule: "inArea('K') && beside('table')",
      quote: 'Je suis trop occupée à cuisiner pour les manger.',
      look: { skin: '#f6d0b0', hair: 'ponytail', hairColor: '#f2d27a', bg: '#f4ecdc', shirt: '#8fd0a0', family: true } },
    { id: 'D', name: 'Denise', gender: 'f', clue: "Elle était dans une **Chambre**. Elle n'était **pas** sur un **lit**.", rule: "inArea('C','F') && !on('bed')",
      quote: 'Oui, j’ai donné des biscuits à mon bébé ! Ben, elle fait semblant d’en manger.',
      look: { skin: '#f0c49f', hair: 'ponytail', hairColor: '#6a3f22', bg: '#f4ecdc', shirt: '#9fd0a8', family: true } },
    { id: 'E', name: 'Ella', gender: 'f', clue: 'Elle était dans la **même pièce** que **Carissa**.', rule: "withP('Carissa')",
      quote: 'Neu-non ! Mes mains sont prop’ ! Regade !',
      look: { skin: '#f6d0b0', hair: 'bob', hairColor: '#f2d27a', bg: '#f4ecdc', shirt: '#b9a5e0', family: true } },
    { id: 'F', name: 'Fred', gender: 'm', clue: 'Il était **assis** sur une **chaise**.', rule: 'sitting()',
      quote: 'J’étais en train de lire. Une chose à la fois.',
      look: { skin: '#f6d0b0', hair: 'curly', hairColor: '#d8743a', glasses: true, bg: '#f4ecdc', shirt: '#d84a4a', family: true } }
  ],
  expected: 'Beth',
  solution: 'Adam:4,5 Beth:3,4 Carissa:1,1 Denise:0,3 Ella:2,0 Fred:5,2'
});
