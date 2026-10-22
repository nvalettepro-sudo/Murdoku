(window.MURDOKU_PUZZLES = window.MURDOKU_PUZZLES || []).push({
  id: 'car-repair',
  title: 'Le Garage',
  original: 'Car Repair',
  difficulty: 'facile',
  order: 2,
  palette: { table: '#5f6385', bg1: '#5f9292', bg2: '#3b3f86', card: '#d4f1f3', card2: '#ddd8f7', victim: '#f3c9d5', ink: '#20233a', title: '#fff4c2', panel: '#d8f3f5', legendOk: '#bcd9f2', legendNo: '#d3c8f0', label: '#ffffff' },
  size: 6,
  victim: 'Vaughn',
  intro: 'Vaughn a été assassiné ! Sauras-tu trouver le coupable ?',
  grid: [
    'RRRWSS',
    'RRRWWS',
    'RRRWWW',
    'RGGGGG',
    'GGGGGG',
    'GGGGGG'
  ],
  areas: {
    R: { name: 'Réception', floor: 'wood', color: '#b7d3ea', label: [2, 1] },
    W: { name: "Salle d'attente", floor: 'checker', color: '#a9c8f0', label: [2, 4] },
    S: { name: 'Réserve', floor: 'wood', color: '#b9a3d6', label: [1, 5] },
    G: { name: 'Garage', floor: 'tiles', color: '#d3e3e3', label: [5, 2] }
  },
  objects: [
    { t: 'table', at: '0,0' }, { t: 'chair', at: '0,1' }, { t: 'table', at: '0,2 1,1 1,2' },
    { t: 'tv', at: '0,3' }, { t: 'shelf', at: '0,5' }, { t: 'plant', at: '1,4' },
    { t: 'shelf', at: '2,2' }, { t: 'chair', at: '2,3' }, { t: 'chair', at: '2,4' },
    { t: 'shelf', at: '3,3' }, { t: 'shelf', at: '3,4' },
    { t: 'car', at: '4,1 4,2', v: '#aab8f5' }, { t: 'oil', at: '4,3' }, { t: 'oil', at: '5,1' },
    { t: 'car', at: '5,3 5,4', v: '#e6dcc4' }
  ],
  occupiable: ['oil', 'car', 'chair'],
  people: [
    { id: 'A', name: 'Anthony', gender: 'm', clue: 'Il était dans une **voiture**.', rule: "on('car')",
      look: { skin: '#f2c99b', hair: 'side', hairColor: '#f4e27c', beard: 'full', beardColor: '#f4e27c', bg: '#6c6fa0', shirt: '#4c6fa8' } },
    { id: 'B', name: 'Brock', gender: 'm', clue: "Il était sur une **tache d'huile**.", rule: "on('oil')",
      look: { skin: '#d9a77c', hair: 'curly', hairColor: '#2c2b33', glasses: true, bg: '#9fb3f2', shirt: '#4c6fa8' } },
    { id: 'C', name: 'Crystal', gender: 'f', clue: 'Elle était assise sur une **chaise**.', rule: 'sitting()',
      look: { skin: '#f4c4a1', hair: 'bob', hairColor: '#e98a55', bg: '#d6f5f7', shirt: '#4c6fa8' } },
    { id: 'D', name: 'Diane', gender: 'f', clue: "Elle était **seule** dans la **Salle d'attente**.", rule: "inArea('W') && alone()",
      look: { skin: '#f0c4a0', hair: 'long', hairColor: '#9a5b3c', glasses: true, bg: '#a7d3dc', shirt: '#8a4f9c' } },
    { id: 'E', name: 'Emilio', gender: 'm', clue: "Il était à côté d'une **étagère**.", rule: "beside('shelf')",
      look: { skin: '#e9b48e', hair: 'buzz', hairColor: '#f0f0f0', beard: 'goatee', beardColor: '#f5f5f5', bg: '#8d7aa0', shirt: '#3b4a7a' } },
    { id: 'V', name: 'Vaughn', gender: 'm', victim: true, clue: '**La victime.** Il était seul avec le meurtrier.',
      look: { skin: '#f0c49f', hair: 'side', hairColor: '#b9b08a', beard: 'mustache', beardColor: '#8f8462', bg: '#9b4c55', shirt: '#4b4b5a' } }
  ],
  expected: 'Crystal',
  solution: 'Anthony:5,4 Brock:4,3 Crystal:0,1 Diane:2,5 Emilio:3,2 Vaughn:1,0'
});
