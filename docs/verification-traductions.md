# Vérification des indices : original anglais ↔ français ↔ règle du jeu

Contrôle fait le 23/10/2026 sur les 11 énigmes, à partir des feuilles PDF d’origine (dossier Drive « Murdoku »).
Colonne 1 : texte anglais de la feuille. Colonne 2 : texte affiché dans le jeu. Colonne 3 : règle logique utilisée par le solveur.
Sens vérifiés avec le glossaire officiel : « nord de » = rangée strictement plus haute, toutes colonnes ; « à côté » = case voisine en haut, bas, gauche ou droite, dans la même zone ; « exactement une rangée au nord » = rangée − 1.

**Corrections de ce contrôle (v1.18)** : Everly (L’École d’art), reformulée sans ambiguïté ; zone « Île déserte » du Mystery Islands renommée « Île vide » (Empty Island), car trop proche d’« Île du désert » (Desert Island).

## L'École d'art (The Art School)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Anthony | He was alone. | Il était seul dans sa zone. | `alone()` |
| Ben | There was a framed painting on his square. | Il y avait un tableau encadré sur sa case. | `on('framed')` |
| Coralie | She was beside a statue. | Elle était à côté d'une statue. | `beside('statue')` |
| Delilah | There was a woman alone in the Gallery one row north of her. | Une autre femme était seule dans la Galerie, sur la rangée juste au-dessus de Delilah. | `exists(q => q.woman && q.area === 'G' && q.r === me.r - 1 && q.alone())` |
| Everly | She was beside an easel, directly south of it. | Il y avait un chevalet sur la case juste au-dessus d'elle, dans sa zone. | `dirHas('n', 'easel')` |
| Fritz | He was on a carpet. | Il était sur un tapis. | `on('carpet')` |
| Ginevra | She was the only person sitting in a chair. | Elle était la seule personne de toute la grille assise sur une chaise. | `onlyOn('chair')` |
| Hartley | He was beside a table. | Il était à côté d'une table. | `beside('table')` |
| Veronica | The Victim. She was alone with the murderer. | La victime. Dans sa zone, il n'y avait qu'elle et le meurtrier. | `—` |

## Le Jardin (The Backyard Garden)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Aaron | He was with Elyse in the Living Room. | Il était avec Elyse dans le Salon. | `inArea('L') && withP('Elyse')` |
| Bruce | He was in the Shed. | Il était dans la Cabane. | `inArea('S')` |
| Carissa | She was beside a tree. | Elle était à côté d'un arbre. | `beside('tree')` |
| Denise | She was in the Bedroom or in the Sunroom. | Elle était dans la Chambre ou dans la Véranda. | `inArea('B', 'R')` |
| Elyse | She was sitting in a chair. | Elle était assise sur une chaise. | `sitting()` |
| Franklin | He was on a carpet. | Il était sur un tapis. | `on('carpet')` |
| Gilbert | He was in the Garden. | Il était dans le Jardin. | `inArea('G')` |
| Holden | He was alone. | Il était seul dans sa zone. | `alone()` |
| Violet | The Victim. She was alone with the murderer. | La victime. Dans sa zone, il n'y avait qu'elle et le meurtrier. | `—` |

## Le Jardin botanique (The Botanical Garden)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Aveline | She was one row north of Della. | Elle était sur la rangée juste au-dessus de Della. | `row() === P('Della').r - 1` |
| Brielle | She was sitting in a chair in the Arboretum. | Elle était assise sur une chaise dans l'Arboretum. | `sitting() && inArea('A')` |
| Collin | He was beside a table. | Il était à côté d'une table. | `beside('table')` |
| Della | She was on a path. She was alone. | Elle était sur un chemin, seule dans sa zone. | `on('path') && alone()` |
| Evelyn | She was sitting in a chair. She was alone with a man. | Elle était assise sur une chaise. Dans sa zone, il n'y avait qu'elle et un homme. | `sitting() && aloneWith(q => q.man)` |
| Florian | He was alone. | Il était seul dans sa zone. | `alone()` |
| Gary | He was beside a bonsai. | Il était à côté d'un bonsaï. | `beside('bonsai')` |
| Harlow | She was beside a shrub. | Elle était à côté d'un arbuste. | `beside('shrub')` |
| Idara | She was sitting in a chair. She was alone. | Elle était assise sur une chaise, seule dans sa zone. | `sitting() && alone()` |
| Joss | He was beside a Lily pad. | Il était à côté d'un nénuphar. | `beside('lily')` |
| Kaela | She was beside a cactus. | Elle était à côté d'un cactus. | `beside('cactus')` |
| Veronica | The Victim. She was alone with the murderer. | La victime. Dans sa zone, il n'y avait qu'elle et le meurtrier. | `—` |

## Le Garage (Car Repair)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Anthony | He was in a car. | Il était dans une voiture. | `on('car')` |
| Brock | He was on an oil slick. | Il était sur une tache d'huile. | `on('oil')` |
| Crystal | She was sitting in a chair. | Elle était assise sur une chaise. | `sitting()` |
| Diane | She was alone in the Waiting Area | Elle était seule dans la Salle d'attente. | `inArea('W') && alone()` |
| Emilio | He was beside a shelf. | Il était à côté d'une étagère. | `beside('shelf')` |
| Vaughn | The Victim. He was alone with the murderer. | La victime. Dans sa zone, il n'y avait que lui et le meurtrier. | `—` |

## Le Tribunal (The Courtroom)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Arthur | He was at the Judge’s Bench. | Il était au Banc du juge. | `inArea('J')` |
| Benjamin | He was with the only person sitting in a chair. | Il était dans la même zone que la seule personne de toute la grille assise sur une chaise. | `exists(q => q.area === me.area && q.onlyOn('chair'))` |
| Camila | She was in the Gallery. | Elle était dans le Public. | `inArea('G')` |
| Daisy | She was on a carpet. | Elle était sur un tapis. | `on('carpet')` |
| Eliza | She was at the Witness Stand. | Elle était à la Barre des témoins. | `inArea('W')` |
| Fritz | He was beside a table. | Il était à côté d'une table. | `beside('table')` |
| Graham | He was in the Security area. | Il était dans la zone de Sécurité. | `inArea('S')` |
| Howard | He was beside a plant. | Il était à côté d'une plante. | `beside('plant')` |
| Vanessa | The Victim. She was alone with the murderer. | La victime. Dans sa zone, il n'y avait qu'elle et le meurtrier. | `—` |

## Shopping de Noël (Holiday Shopping)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Avery | He was north of Vlimbo. | Il était sur une rangée plus haute que Vlimbo (au nord), dans n'importe quelle colonne. | `northOf('Vlimbo')` |
| Bashir | He was in the Walkway, in front of a door. | Il était dans l'Allée, devant une porte. | `inArea('W') && on('door')` |
| Crystal | She was beside a teddy bear. | Elle était à côté d'un ours en peluche. | `beside('teddy')` |
| Dana | She was beside a register. | Elle était à côté d'une caisse enregistreuse. | `beside('register')` |
| Eva | She was in the Coffee Shop. She was not with Figgy. | Elle était dans le Café, pas dans la même zone que Figgy. | `inArea('C') && notWith('Figgy')` |
| Figgy | She was the only person sitting in a chair. | Elle était la seule personne de toute la grille assise sur une chaise. | `onlyOn('chair')` |
| Gemma | She was in the Bookstore. | Elle était dans la Librairie. | `inArea('B')` |
| Santa | He was alone in Santa’s Lodge. | Il était seul dans le Chalet du Père Noël. | `inArea('L') && alone()` |
| Isabella | She was in the fifth column. | Elle était dans la cinquième colonne. | `col() === 4` |
| Jack | He was exactly one row north of Gemma. | Il était sur la rangée juste au-dessus de Gemma. | `row() === P('Gemma').r - 1` |
| Vlimbo | The Victim. He was alone with the murderer. | La victime. Dans sa zone, il n'y avait que lui et le meurtrier. | `—` |

## Netflix & Crime (Netflix and Kill)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Austin | He was beside a shelf. | Il était à côté d'une étagère. | `beside('shelf')` |
| Barbara | She was on the bed. | Elle était sur le lit. | `on('bed')` |
| Charlotte | She was the only person sitting in a chair. | Elle était la seule personne assise sur une chaise. | `onlyOn('chair')` |
| Dean | He was in the Kitchen. | Il était dans la Cuisine. | `inArea('K')` |
| Enid | She was beside the TV. | Elle était à côté de la télé. | `beside('tv')` |
| Vaughn | The Victim. He was alone with the murderer. | La victime. Dans sa zone, il n'y avait que lui et le meurtrier. | `—` |

## Les Survivalistes (Preppers)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Angelo | There was a box in his area. He was not beside any box. | Il y avait une caisse dans sa zone. Il n'était à côté d'aucune caisse. | `areaHas('box') && !beside('box')` |
| Blake | He was in the Bedroom. | Il était dans la Chambre. | `inArea('B')` |
| Carolina | There was a man on the bed in her area. | Un homme était sur le lit de sa zone. | `exists(q => q.man && q.on('bed') && q.area === me.area)` |
| Daryl | Someone else was beside a shelf in her area. | Une autre personne de sa zone était à côté d'une étagère. | `exists(q => q.area === me.area && q.beside('shelf'))` |
| Edna | She was in the bottom row. | Elle était sur la rangée du bas. | `row() === 8` |
| Friedrich | He was beside a TV. | Il était à côté d'une télé. | `beside('tv')` |
| Greg | He was sitting in a chair. | Il était assis sur une chaise. | `sitting()` |
| Howie | He was in the Bathroom | Il était dans la Salle de bain. | `inArea('A')` |
| Vivianna | The Victim. She was alone with the murderer. | La victime. Dans sa zone, il n'y avait qu'elle et le meurtrier. | `—` |

## Le Zoo (The Zoo)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Alfred | He was exactly one row north of Ivan. | Il était sur la rangée juste au-dessus d’Ivan. | `row() === P('Ivan').r - 1 && !inArea('L','P','B','C','E','S')` |
| Barry | He was in Concessions alone with a Visitor. | Il était à la Buvette, avec exactement une autre personne : un visiteur. | `inArea('O') && aloneWith(q => q.role === 'visitor')` |
| Carolyn | She was exactly one row north of Deborah. | Elle était sur la rangée juste au-dessus de Deborah. | `row() === P('Deborah').r - 1 && !inArea('L','P','B','C','E','S')` |
| Deborah | She was in the Main Area. | Elle était dans l'Allée principale. | `inArea('M')` |
| Eloise | She was beside a table. She was not sitting. | Elle était à côté d'une table. Elle n'était pas assise. | `beside('table') && !sitting() && !inArea('L','P','B','C','E','S')` |
| Flavia | She was beside a chair. | Elle était à côté d'une chaise. | `beside('chair') && !inArea('L','P','B','C','E','S')` |
| Gordon | He was sitting in a chair. He was alone. | Il était assis sur une chaise, seul dans sa zone. | `sitting() && alone() && !inArea('L','P','B','C','E','S')` |
| Henry | He was alone. | Il était seul dans sa zone. | `alone() && !inArea('L','P','B','C','E','S')` |
| Ivan | He was beside an animal. | Il était à côté d'un animal. | `beside('animal')` |
| Jim | He was not in water. He was beside water. | Il n'était pas dans l'eau. Il était à côté de l'eau. | `!on('water') && beside('water')` |
| Kaiden | She was alone with Mara. | Dans sa zone, il n'y avait qu'elle et Mara. | `aloneWith(q => q.name === 'Mara')` |
| Langston | He was in water. He was not beside an animal. | Il était dans l'eau. Il n'était pas à côté d'un animal. | `on('water') && !beside('animal')` |
| Mara | She was in the 2nd column. | Elle était dans la 2e colonne. | `col() === 1` |
| Nancy | She was beside a tree. | Elle était à côté d'un arbre. | `beside('tree')` |
| Oliver | He was beside a boulder. | Il était à côté d'un rocher. | `beside('boulder')` |
| Vlad | The Victim. He was alone with the murderer. | La victime. Dans sa zone, il n'y avait que lui et le meurtrier. | `—` |

## Le Parcours de golf (The Golf Course)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Anna | She was beside a water square. | Elle était à côté d'une case d'eau. | `beside('water')` |
| Berta | She was beside a tree in Hole 4. She had a higher hole number than Harry. | Elle était dans le Trou 4, à côté d'un arbre. Le numéro de son trou était plus grand que celui du trou de Harry. | `inArea('4') && beside('tree') && 4 > +P('Harry').area` |
| Carson | He was not in the first or the last column. | Il n'était ni dans la première ni dans la dernière colonne. | `col() > 0 && col() < 15` |
| Drew | He was beside a flag. | Il était à côté d'un drapeau. | `beside('flag')` |
| Edna | She occupied the flag in an even-numbered hole. | Elle occupait le drapeau d'un trou de numéro pair. | `on('flag') && +me.area % 2 === 0` |
| Flor | She did not occupy the hole immediately before Naomi’s hole. | Elle n'était pas dans le trou dont le numéro précède celui de Naomi (si Naomi est au trou 5, Flor n'est pas au trou 4). | `+me.area !== +P('Naomi').area - 1` |
| Gerald | He was the only man to occupy a golf tee. | Il était le seul homme à occuper un départ (tee). | `on('tee') && none(q => q.man && q.on('tee'))` |
| Harry | In his hole, there was a woman in a cart. | Dans son trou, il y avait une femme dans une voiturette. | `exists(q => q.woman && q.on('cart') && q.area === me.area)` |
| Iris | She was northwest of Flor, and in the same hole. | Elle était dans le même trou que Flor, sur une rangée plus haute et dans une colonne plus à gauche (au nord-ouest). | `row() < P('Flor').r && col() < P('Flor').c && withP('Flor')` |
| Jana | She occupied the golf tee on either the Hole 6, 7 or 8. | Elle occupait le départ (tee) du Trou 6, 7 ou 8. | `on('tee') && inArea('6','7','8')` |
| Kent | He was in the same hole as Mona. | Il était dans le même trou que Mona. | `withP('Mona')` |
| Lars | His hole number is greater than Naomi’s hole number. | Le numéro de son trou était plus grand que celui du trou de Naomi. | `+me.area > +P('Naomi').area` |
| Mona | She was on the flag for either Hole 3, 4 or 5. | Elle était sur le drapeau du Trou 3, 4 ou 5. | `on('flag') && inArea('3','4','5')` |
| Naomi | She was within a sand pit. | Elle était dans un bunker (sable). | `on('sand')` |
| Oscar | He was in the northmost row and beside a tree. | Il était sur la rangée du haut (la plus au nord), à côté d'un arbre. | `row() === 0 && beside('tree')` |
| Vinny | The Victim. He was alone with the murderer. | La victime. Dans sa zone, il n'y avait que lui et le meurtrier. | `—` |

## Les Îles mystères (Mystery Islands)

| Suspect | Original (EN) | Affiché (FR) | Règle |
|---|---|---|---|
| Ayla | She was on Empty or Desert Island. There was a shark in her row. | Elle était sur l'Île vide ou l'Île du désert. Il y avait un requin quelque part sur sa rangée. | `inArea('E', 'D') && rowHas('shark')` |
| Bastian | The only man on Desert Island. He was beside exactly two cacti. | Il était le seul homme de l'Île du désert, à côté d'exactement deux cactus. | `inArea('D') && none(q => q.man && q.area === 'D') && besideCount('cactus') === 2` |
| Cassius | He was alone with someone in the sea. He was east of Olivia. | Il était dans la mer, avec exactement une autre personne. Il était dans une colonne plus à l'est (à droite) qu'Olivia. | `inArea('S') && aloneWith() && eastOf('Olivia')` |
| Denise | She was northeast of Ayla. | Elle était sur une rangée plus haute et dans une colonne plus à droite qu'Ayla (au nord-est). | `row() < P('Ayla').r && col() > P('Ayla').c` |
| Emma | She was on a sand tile. | Elle était sur une case de sable. | `on('sand')` |
| Fred | He was the southmost person on Town Island. | Il était sur l'Île de la ville, et personne sur cette île n'était sur une rangée plus basse (plus au sud) que lui. | `inArea('T') && none(q => q.area === 'T' && q.r > me.r)` |
| Graham | He was six rows south of Joseph, who was on the same island. | Il était six rangées plus bas que Joseph, sur la même île. | `row() === P('Joseph').r + 6 && withP('Joseph') && !inArea('S')` |
| Helena | She was with Denise. Both were not beside a tree or cactus. | Elle était avec Denise. Aucune des deux n'était à côté d'un arbre ou d'un cactus. | `withP('Denise') && !beside('tree') && !beside('cactus') && !P('Denise').beside('tree') && !P('Denise').beside('cactus')` |
| Irene | She was north of Nikita and on the same island. | Elle était sur une rangée plus haute que Nikita (au nord), sur la même île. | `northOf('Nikita') && withP('Nikita') && !inArea('S')` |
| Joseph | He was beside a tree and east of Lyra. | Il était à côté d'un arbre, dans une colonne plus à l'est (à droite) que Lyra. | `beside('tree') && eastOf('Lyra')` |
| Kent | He was the only person in a house. | Il était sur une maison, et personne d'autre n'était sur une maison. | `onlyOn('house')` |
| Lyra | She was beside a tree on a four people island of exactly three women. | Elle était à côté d'un arbre, sur une île de quatre personnes dont exactement trois femmes. | `beside('tree') && !inArea('S') && exactly(4, q => q.area === me.area, true) && exactly(3, q => q.woman && q.area === me.area, true)` |
| Michael | There was at least one shark in his column. He was on an island. | Il était sur une île, avec au moins un requin quelque part dans sa colonne. | `colHas('shark') && !inArea('S')` |
| Nikita | She was south of Irene and on the same island. | Elle était sur une rangée plus basse qu'Irene (plus au sud), sur la même île. | `southOf('Irene') && withP('Irene') && !inArea('S')` |
| Olivia | Exactly two people were south of her. | Exactement deux personnes étaient sur des rangées plus basses (plus au sud) qu'elle. | `exactly(2, q => q.r > me.r)` |
| Vincent | The Victim. He was alone with the murderer. | La victime. Dans sa zone, il n'y avait que lui et le meurtrier. | `—` |
