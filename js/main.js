import {setupUI, renderMap} from './modules/interface.js';
import {initGame} from './modules/engine.js';

// Ajouter une gestion des erreurs globales
window.onerror = function(message, source, lineno, colno, error) {
  console.error(`Erreur: ${message} à la ligne ${lineno}:${colno}`);
  console.error(error);
  return true;
};

try {
  console.log("Démarrage de l'application...");
  initGame();
  setupUI();
  renderMap();
  console.log("Initialisation complète!");
} catch (error) {
  console.error("Erreur d'initialisation:", error);
}
