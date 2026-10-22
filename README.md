# Murdoku — version web en français

Adaptation web, non officielle, du jeu de logique **Murdoku** de Manuel Garand.
Le jeu fonctionne sur iPad et sur PC, en paysage comme en portrait.
Le but : lire les indices, placer chaque suspect sur la scène de crime et démasquer le meurtrier.

## Jouer

Ouvre `index.html` via un serveur web, par exemple GitHub Pages ou un serveur local :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Sur iPad, utilise **Partager → Sur l'écran d'accueil**.
Le jeu s'installe alors comme une application, et reste jouable hors ligne après la première visite.

## Contenu

| Énigme | Original | Grille | Difficulté |
|---|---|---|---|
| Le voleur de biscuits | The Cookie Thief | 6×6 | très facile (famille) |
| Netflix & Crime | Netflix and Kill | 6×6 | facile |
| Le Garage | Car Repair | 6×6 | facile |
| La Caricature | The Caricature | 7×7 | facile (famille) |
| Le Jardin | The Backyard Garden | 9×9 | facile |
| Le Tribunal | The Courtroom | 9×9 | facile |
| L'École d'art | The Art School | 9×9 | moyen |
| Les Survivalistes | Preppers | 9×9 | moyen |
| Shopping de Noël | Holiday Shopping | 11×11 | moyen |
| Le Jardin botanique | The Botanical Garden | 12×12 | difficile |
| Le Parcours de golf | The Golf Course | 16×16 | expert |
| Les Îles mystérieuses | The Mystery Islands | 16×16 | expert |
| Le Zoo | The Zoo | 16×16 | expert |

Le solveur a vérifié chaque énigme : elle a une solution unique, et le coupable correspond à la page solution officielle.
Pour Les Îles mystérieuses, l'unicité est vérifiée à partir de la première déduction de la solution officielle, qui place Joseph et Lyra. La recherche complète dépasse 25 minutes.

## Fonctionnalités

- **Placement** : touche une fiche suspect, puis une case. Le pion montre le visage du suspect et son initiale. Touche le pion pour le sélectionner, puis encore pour le retirer.
- **Croix** : touche une case vide, fais un appui long ou un clic droit. Le bouton Croix permet aussi de glisser sur plusieurs cases.
- **Croix automatiques** : quand un suspect est placé, les cases libres de sa rangée et de sa colonne reçoivent une croix claire. Les objets non occupables n'en reçoivent pas. Ce comportement se désactive dans les Options.
- **Brouillon** : active le bouton, choisis un suspect et touche toutes ses cases possibles. Des vignettes apparaissent, jusqu'à 4 visibles par case. Un appui long sur une vignette la transforme en vrai pion.
- **Indice progressif** : le premier appui désigne qui regarder, le deuxième montre les cases possibles, le troisième place le pion.
- **Vérifier** : signale les pions mal placés.
- **Annuler et rétablir**, chronomètre, et sauvegarde automatique sur l'appareil.
- **Options** : griser les rangées et colonnes occupées, et signaler les indices non respectés.
- **Clavier** : l'initiale d'un suspect le sélectionne. La touche 1 revient au mode normal, 2 active Croix, 3 active Brouillon. Ctrl+Z annule.

## Structure

```
index.html            page unique
css/style.css         styles (thèmes classique et famille)
js/engine.js          moteur logique : règles, solveur, unicité, aide
js/icons.js           icônes SVG des objets
js/avatars.js         portraits SVG des suspects
js/board.js           rendu SVG du plateau
js/app.js             écrans, interactions, sauvegarde
puzzles/*.js          une énigme par fichier (grille, zones, objets, indices)
tests/                vérification des énigmes et test de bout en bout
```

### Ajouter une énigme

Chaque énigme décrit :
- la grille de zones, avec une lettre par case ;
- les objets et leurs cases ;
- les types d'objets que l'on peut occuper ;
- les personnages, chacun avec son indice en français et sa règle logique.

La règle logique est une petite expression, par exemple `inArea('K') && beside('table')`.
Lance ensuite les tests pour vérifier que la solution est unique :

```bash
node tests/solve-all.js          # résolution complète, 3 à 5 minutes pour les 16×16
node tests/solve-all.js --quick  # vérification rapide, utilisée en intégration continue
node tests/gen-solutions.js <id> # enregistre la solution dans le fichier de l'énigme
```

Le test de bout en bout joue des parties dans Chromium. Il demande Playwright et un serveur local :

```bash
node tests/e2e.js http://localhost:8000/
```

## Crédits

- **Murdoku** : énigmes et concept de Manuel Garand ([murdoku.com](https://murdoku.com)). Les énigmes golf et îles sont de Craig Wallander.
- **Illustrations originales** des fiches : Manuel Garand, Valentyna Bezdushna et Eli Voisin.
- **Visuels de cette version** : entièrement redessinés en SVG. Aucune image des fiches originales n'est reprise.

Projet personnel, sans but commercial.
