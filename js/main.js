// Point d'entrée principal pour ClimaQuest
import { setupUI } from './modules/interface.js';
import { initGame } from './modules/engine.js';

// Ajouter une gestion des erreurs globales
window.onerror = function(message, source, lineno, colno, error) {
  console.error(`Erreur: ${message} à la ligne ${lineno}:${colno}`);
  console.error(error);
  return true;
};

// Ajouter une fonction pour gérer le chargement des ressources
function loadResources() {
  return new Promise((resolve, reject) => {
    // Dans une version plus élaborée, on pourrait charger des images, des sons, etc.
    // Pour l'instant, on simule un chargement rapide
    setTimeout(() => {
      console.log("Ressources chargées avec succès");
      resolve();
    }, 100);
  });
}

// Ajouter un écran de chargement
function showLoadingScreen() {
  const loadingScreen = document.createElement('div');
  loadingScreen.id = 'loading-screen';
  loadingScreen.innerHTML = `
    <div class="loading-content">
      <h2>Chargement de ClimaQuest...</h2>
      <div class="loading-spinner"></div>
      <p>Préparation de votre Conseil Climatique</p>
    </div>
  `;
  document.body.appendChild(loadingScreen);
}

// Masquer l'écran de chargement
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
}

// Démarrer l'application
async function startApp() {
  try {
    console.log("Démarrage de l'application...");
    
    // Afficher l'écran de chargement
    showLoadingScreen();
    
    // Charger les ressources nécessaires
    await loadResources();
    
    // Initialiser le jeu
    initGame();
    
    // Configurer l'interface utilisateur
    setupUI();
    
    // Masquer l'écran de chargement
    hideLoadingScreen();
    
    // Afficher un message de bienvenue
    console.log("Initialisation complète! Bienvenue dans ClimaQuest");
    
    // Afficher un message d'introduction après un court délai
    setTimeout(() => {
      showIntroduction();
    }, 500);
    
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    
    // Masquer l'écran de chargement en cas d'erreur
    hideLoadingScreen();
    
    // Afficher un message d'erreur à l'utilisateur
    alert(`Une erreur est survenue lors du démarrage de l'application: ${error.message}`);
  }
}

// Afficher le message d'introduction
function showIntroduction() {
  const introContainer = document.createElement('div');
  introContainer.className = 'intro-overlay';
  
  introContainer.innerHTML = `
    <div class="intro-content">
      <h2>Bienvenue au Conseil Climatique</h2>
      <p>En tant qu'Architecte de l'Avenir, vous devez guider votre région à travers les défis climatiques du 21ème siècle.</p>
      <p>Prenez des décisions stratégiques, répondez aux crises environnementales et construisez un avenir durable pour les générations futures.</p>
      <div class="intro-advisors">
        <div class="intro-advisor">
          <div class="advisor-avatar dr-chen">C</div>
          <div class="advisor-name">Dr. Chen</div>
          <div class="advisor-title">Scientifique Environnemental</div>
        </div>
        <div class="intro-advisor">
          <div class="advisor-avatar ministre-dubois">D</div>
          <div class="advisor-name">Ministre Dubois</div>
          <div class="advisor-title">Ministre de l'Économie</div>
        </div>
        <div class="intro-advisor">
          <div class="advisor-avatar prof-moreau">M</div>
          <div class="advisor-name">Prof. Moreau</div>
          <div class="advisor-title">Sociologue</div>
        </div>
        <div class="intro-advisor">
          <div class="advisor-avatar ingenieur-garcia">G</div>
          <div class="advisor-name">Ingénieur Garcia</div>
          <div class="advisor-title">Directeur de l'Innovation</div>
        </div>
      </div>
      <p>Vos conseillers vous aideront à prendre les meilleures décisions pour votre région. Êtes-vous prêt à relever le défi ?</p>
      <button id="start-game" class="btn btn-primary">Commencer votre mandat</button>
    </div>
  `;
  
  document.body.appendChild(introContainer);
  
  // Ajouter un écouteur d'événement pour le bouton de démarrage
  document.getElementById('start-game').addEventListener('click', () => {
    introContainer.classList.add('fade-out');
    setTimeout(() => {
      introContainer.remove();
    }, 500);
  });
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', startApp);
