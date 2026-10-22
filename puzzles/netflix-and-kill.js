(window.MURDOKU_PUZZLES = window.MURDOKU_PUZZLES || []).push({
  id: 'netflix-and-kill',
  title: 'Netflix & Crime',
  original: 'Netflix and Kill',
  difficulty: 'facile',
  order: 1,
  palette: { table: '#e9c98c', bg1: '#2e5f5c', bg2: '#8fb7b4', card: '#bfe8ee', card2: '#bfe8ee', victim: '#efc4cd', ink: '#1e2b2b', title: '#ffffff', panel: '#d5f1f2', legendOk: '#b9daf0', legendNo: '#cfc5f0', label: '#ffffff' },
  size: 6,
  victim: 'Vaughn',
  intro: 'Vaughn a été assassiné ! Sauras-tu trouver le coupable ?',
  grid: [
    'BBBBTT',
    'BBBBTT',
    'BBLLLT',
    'KKLLLL',
    'KKLLLL',
    'KKLLLL'
  ],
  areas: {
    B: { name: 'Chambre', floor: 'wood', color: '#e2d8d8', label: [1, 2] },
    T: { name: 'Salle de bain', floor: 'tiles', color: '#c6cfcf', label: [1, 4] },
    L: { name: 'Salon', floor: 'wood', color: '#c4e3f2', label: [5, 4] },
    K: { name: 'Cuisine', floor: 'checker', color: '#f6d8bf', label: [5, 1] }
  },
  objects: [
    { t: 'bed', at: '0,0 0,1', v: '#a8c98a' }, { t: 'plant', at: '0,4' }, { t: 'chair', at: '0,5' },
    { t: 'chair', at: '1,3' }, { t: 'shelf', at: '2,0' }, { t: 'plant', at: '2,1' },
    { t: 'chair', at: '2,3' }, { t: 'chair', at: '2,4' }, { t: 'shelf', at: '4,0' },
    { t: 'chair', at: '4,2' }, { t: 'chair', at: '4,4' }, { t: 'tv', at: '4,5' },
    { t: 'table', at: '5,0 5,1' }, { t: 'shelf', at: '5,2' }, { t: 'plant', at: '5,5' }
  ],
  occupiable: ['bed', 'chair'],
  people: [
    { id: 'A', name: 'Austin', gender: 'm', clue: "Il était à côté d'une **étagère**.", rule: "beside('shelf')",
      look: { skin: '#e8b48a', hair: 'side', hairColor: '#24242c', bg: '#7fb7c9', shirt: '#f2e4c9' } },
    { id: 'B', name: 'Barbara', gender: 'f', clue: 'Elle était sur le **lit**.', rule: "on('bed')",
      look: { skin: '#8a5a3c', hair: 'long', hairColor: '#24242c', bg: '#7fb7c9', shirt: '#e8c43c' } },
    { id: 'C', name: 'Charlotte', gender: 'f', clue: 'Elle était la **seule** personne assise sur une **chaise**.', rule: "onlyOn('chair')",
      look: { skin: '#f0bf9c', hair: 'spiky', hairColor: '#fbf3b0', bg: '#7fb7c9', shirt: '#7a5a4a' } },
    { id: 'D', name: 'Dean', gender: 'm', clue: 'Il était dans la **Cuisine**.', rule: "inArea('K')",
      look: { skin: '#9a6a48', hair: 'buzz', hairColor: '#24242c', bg: '#7fb7c9', shirt: '#ffffff' } },
    { id: 'E', name: 'Enid', gender: 'f', clue: "Elle était à côté de la **télé**.", rule: "beside('tv')",
      look: { skin: '#f0bf9c', hair: 'curly', hairColor: '#9a5fb5', bg: '#7fb7c9', shirt: '#b98ad0' } },
    { id: 'V', name: 'Vaughn', gender: 'm', victim: true, clue: '**La victime.** Il était seul avec le meurtrier.',
      look: { skin: '#d9a17e', hair: 'wavy', hairColor: '#2a2226', bg: '#c4574a', shirt: '#8f8fae' } }
  ],
  expected: 'Barbara',
  solution: 'Austin:5,3 Barbara:0,0 Charlotte:2,4 Dean:4,1 Enid:3,5 Vaughn:1,2'
});
