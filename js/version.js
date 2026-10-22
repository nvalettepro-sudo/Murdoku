/* Murdoku — version de l'application.
 * À chaque mise à jour : incrémenter VERSION, mettre la DATE du jour et ajouter une ligne en tête de HISTORY.
 * Le test « node tests/check-version.js » vérifie que ce fichier et le cache hors ligne (sw.js) concordent.
 */
(function (root) {
  'use strict';
  root.MURDOKU_VERSION = {
    VERSION: '1.5',
    DATE: '2026-10-22',
    HISTORY: [
      { v: '1.5', d: '2026-10-22', t: 'Menu : Quick guide en 3 points qui résume les règles du jeu et la manière de jouer dans cette version.' },
      { v: '1.4', d: '2026-10-22', t: 'Boutons Indice et Vérifier masqués par défaut (activables dans les Options). Le portrait d’un suspect placé sur la grille est grisé dans la liste.' },
      { v: '1.3', d: '2026-10-22', t: 'Police unique, étiquettes de pièces dans leur pièce, bouton Menu, aide fusionnée (règles et instructions), croix tracées en glissant sans bouton, suppression des énigmes famille.' },
      { v: '1.2', d: '2026-10-22', t: 'Numéro de version et date affichés sur l’accueil et dans les Options.' },
      { v: '1.1', d: '2026-10-22', t: 'Pions avec le visage des suspects, mode Brouillon, croix automatiques, barre d’outils simplifiée, prénoms toujours dans leur cadre.' },
      { v: '1.0', d: '2026-10-22', t: 'Première version : 13 énigmes, iPad et PC, indices, vérification, sauvegarde, jeu hors ligne.' }
    ]
  };
})(typeof window !== 'undefined' ? window : this);
