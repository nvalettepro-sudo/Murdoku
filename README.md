# Murdoku — version web en français

**Jouer : https://nvalettepro-sudo.github.io/Murdoku/**

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
| Netflix & Crime | Netflix and Kill | 6×6 | facile |
| Le Garage | Car Repair | 6×6 | facile |
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

- **Pas de double appui** : le jeu n'en demande jamais, et il bloque le zoom que le double appui déclenche sur iPad.
- **Placement** : touche une fiche suspect, puis une case. Le pion montre le visage du suspect et son initiale. Un seul appui sur le pion le retire. Un suspect placé sur la grille est grisé dans la liste ; le Brouillon ne le grise pas.
- **Croix** : touche une case vide, fais un appui long ou un clic droit. Glisse le doigt sur plusieurs cases vides pour en tracer en série.
- **Croix automatiques** : quand un suspect est placé, les cases libres de sa rangée et de sa colonne reçoivent une croix claire. Les objets non occupables n'en reçoivent pas. Ce comportement se désactive dans les Options.
- **Brouillon** : active le bouton, choisis un suspect et touche toutes ses cases possibles. Des vignettes apparaissent, jusqu'à 4 visibles par case. Un appui long sur une vignette la transforme en vrai pion.
- **Indice progressif** (bouton masqué par défaut, à activer dans les Options) : le premier appui désigne qui regarder, le deuxième montre les cases possibles, le troisième place le pion.
- **Vérifier** (bouton masqué par défaut, à activer dans les Options) : signale les pions mal placés.
- **Annuler et rétablir**, chronomètre, et sauvegarde automatique sur l'appareil.
- **Options** : activer ou non les croix automatiques, signaler les indices non respectés, afficher le chronomètre.
- **Clavier** : l'initiale d'un suspect le sélectionne. La touche 1 revient au mode normal, 2 active Brouillon. Ctrl+Z annule.

## Petits écrans

Sous 85 % de l'échelle de la scène standard (1500×1000 en paysage, 1000×1420 en portrait), le jeu passe en **mise en page compacte** : échelle fixe 0,8 (0,85 en portrait) aux dimensions de l'écran, plateau et fiches agrandis, sans les trois bulles de règles (elles restent dans « Règles » et le Menu). C'est le cas d'une tablette Android 10" comme la Galaxy Tab S10 Lite (≈ 1280×690 en Chrome ⚠️ estimation) ou d'un iPad Air. Le test de bout en bout joue ces tailles.

## Aperçus avant mise en ligne

Chaque PR ouverte est publiée à sa propre adresse, par exemple :
`https://nvalettepro-sudo.github.io/Murdoku/preview/pr-3/`

- Le lien se déduit du numéro de la PR. Aucun commentaire automatique n'est posté, donc aucun e-mail GitHub.
- Les liens d'aperçu sont listés dans le résumé du job « Publication » (onglet Actions de GitHub), sous la forme `https://nvalettepro-sudo.github.io/Murdoku/preview/pr-<numéro>/`.
- L'aperçu se met à jour après chaque modification de la PR, une fois les tests passés.
- Il affiche une étiquette « Aperçu PR #n » en bas de l'accueil.
- Ses sauvegardes sont séparées de celles du site officiel.

C'est le workflow `.github/workflows/pages.yml` qui publie le site. Il faut un réglage unique dans GitHub : **Settings → Pages → Source → GitHub Actions**.

## Versions

Le numéro de version et la date s'affichent en bas de l'accueil et à la fin des Options, avec l'historique des versions.
Ils sont définis dans `js/version.js`. À chaque mise à jour :
1. Incrémente `VERSION`, mets la `DATE` du jour et ajoute une ligne en tête de `HISTORY`.
2. Reporte le même numéro dans `CACHE` de `sw.js`. Les iPad téléchargent alors la nouvelle version.
3. Lance `node tests/check-version.js`. La CI le lance aussi.

## Structure

```
index.html            page unique
css/style.css         styles
js/version.js         numéro de version, date et historique
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

Le test de bout en bout joue des parties dans Chromium. La CI le lance aussi (job « e2e », avec le Chrome du runner). En local, il demande Playwright et un serveur local :

```bash
node tests/e2e.js http://localhost:8000/
```

## Crédits

- **Murdoku** : énigmes et concept de Manuel Garand ([murdoku.com](https://murdoku.com)). Les énigmes golf et îles sont de Craig Wallander.
- **Illustrations originales** des fiches : Manuel Garand, Valentyna Bezdushna et Eli Voisin.
- **Visuels de cette version** : entièrement redessinés en SVG. Aucune image des fiches originales n'est reprise.

Projet personnel, sans but commercial.
