/* Murdoku — version de l'application.
 * À chaque mise à jour : incrémenter VERSION, mettre la DATE du jour et ajouter une ligne en tête de HISTORY.
 * Le test « node tests/check-version.js » vérifie que ce fichier et le cache hors ligne (sw.js) concordent.
 */
(function (root) {
  'use strict';
  root.MURDOKU_VERSION = {
    VERSION: '1.13',
    DATE: '2026-10-23',
    HISTORY: [
      { v: '1.13', d: '2026-10-23', t: 'iPhone : fond plein sur toute la hauteur (plus de bande blanche), titre net (ombre retirée), barre d’état teintée aux couleurs de l’énigme, marges de sécurité en haut et en bas pour l’application installée (iOS 26).' },
      { v: '1.12', d: '2026-10-23', t: 'iPhone : mise en page dédiée en portrait (légende sur deux lignes, plateau pleine largeur, règles spéciales dans la boîte d’information), zones sûres (encoche, barre du bas) respectées, fond sans bande blanche.' },
      { v: '1.11', d: '2026-10-23', t: 'Petits écrans (tablette Android 10\u2033, iPad Air…) : mise en page compacte. Plateau et fiches agrandis, textes plus lisibles, bulles de règles retirées de l’écran de jeu (elles restent dans Règles et le Menu). Mode sombre automatique du navigateur désactivé (couleurs inversées). Mise en page recalculée quand la police arrive tard.' },
      { v: '1.10', d: '2026-10-23', t: 'Tests : les parcours de jeu complets (iPad paysage et portrait, PC) tournent désormais automatiquement sur GitHub. Aucun changement du jeu.' },
      { v: '1.9', d: '2026-10-23', t: 'Publication : les liens d’aperçu des PR sont listés dans le résumé du job (onglet Actions). Aucun changement du jeu.' },
      { v: '1.8', d: '2026-10-23', t: 'Un seul appui sur un pion le retire. Le double appui qui zoomait la page sur iPad est bloqué.' },
      { v: '1.7', d: '2026-10-22', t: 'Indices reformulés sans ambiguïté : « seul » précise « dans sa zone », « au nord » précise « sur une rangée plus haute » ou « juste au-dessus », etc.' },
      { v: '1.6', d: '2026-10-22', t: 'Bandeau « Le meurtrier est… » supprimé. Résumé de fin à gauche, au-dessus des suspects : portraits du meurtrier et de la victime, avec l’explication. La grille reste visible.' },
      { v: '1.5', d: '2026-10-22', t: 'Menu : Quick guide en 3 points qui résume les règles du jeu et la manière de jouer dans cette version.' },
      { v: '1.4', d: '2026-10-22', t: 'Boutons Indice et Vérifier masqués par défaut (activables dans les Options). Le portrait d’un suspect placé sur la grille est grisé dans la liste.' },
      { v: '1.3', d: '2026-10-22', t: 'Police unique, étiquettes de pièces dans leur pièce, bouton Menu, aide fusionnée (règles et instructions), croix tracées en glissant sans bouton, suppression des énigmes famille.' },
      { v: '1.2', d: '2026-10-22', t: 'Numéro de version et date affichés sur l’accueil et dans les Options.' },
      { v: '1.1', d: '2026-10-22', t: 'Pions avec le visage des suspects, mode Brouillon, croix automatiques, barre d’outils simplifiée, prénoms toujours dans leur cadre.' },
      { v: '1.0', d: '2026-10-22', t: 'Première version : 13 énigmes, iPad et PC, indices, vérification, sauvegarde, jeu hors ligne.' }
    ]
  };
})(typeof window !== 'undefined' ? window : this);
