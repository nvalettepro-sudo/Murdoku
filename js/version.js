/* Murdoku — version de l'application.
 * À chaque mise à jour : incrémenter VERSION, mettre la DATE du jour et ajouter une ligne en tête de HISTORY.
 * Le test « node tests/check-version.js » vérifie que ce fichier et le cache hors ligne (sw.js) concordent.
 */
(function (root) {
  'use strict';
  root.MURDOKU_VERSION = {
    VERSION: '1.2',
    DATE: '2026-10-22',
    HISTORY: [
      { v: '1.2', d: '2026-10-22', t: 'Numéro de version et date affichés sur l’accueil et dans les Options.' },
      { v: '1.1', d: '2026-10-22', t: 'Pions avec le visage des suspects, mode Brouillon, croix automatiques, barre d’outils simplifiée, prénoms toujours dans leur cadre.' },
      { v: '1.0', d: '2026-10-22', t: 'Première version : 13 énigmes, iPad et PC, indices, vérification, sauvegarde, jeu hors ligne.' }
    ]
  };
})(typeof window !== 'undefined' ? window : this);
