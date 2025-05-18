// main.js - Complete revised file

// Point d'entrée principal pour ClimaQuest
import { setupUI } from './modules/interface.js';
import { initGame } from './modules/engine.js';

// Ajouter une gestion des erreurs globales
window.onerror = function(message, source, lineno, colno, error) {
  console.error(`Erreur: ${message} à la ligne ${lineno}:${colno}`);
  console.error(error);
  return true;
};

// Fonction pour vérifier si le navigateur supporte les fonctionnalités requises
function checkBrowserCompatibility() {
  const requiredFeatures = {
    'localStorage': typeof localStorage !== 'undefined',
    'ES6 Modules': (function() { 
      try { 
        new Function('import("")'); 
        return true; 
      } catch (e) { 
        return false; 
      }
    })(),
    'Promises': typeof Promise !== 'undefined',
    'Canvas API': typeof document.createElement('canvas').getContext === 'function'
  };
  
  const missingFeatures = Object.entries(requiredFeatures)
    .filter(([feature, supported]) => !supported)
    .map(([feature]) => feature);
  
  if (missingFeatures.length > 0) {
    console.error("Navigateur incompatible. Fonctionnalités manquantes:", missingFeatures.join(', '));
    
    // Afficher un message d'erreur à l'utilisateur
    const errorMessage = document.createElement('div');
    errorMessage.className = 'browser-error';
    errorMessage.innerHTML = `
      <h2>Navigateur non supporté</h2>
      <p>Votre navigateur ne supporte pas les fonctionnalités suivantes nécessaires à ClimaQuest:</p>
      <ul>${missingFeatures.map(feature => `<li>${feature}</li>`).join('')}</ul>
      <p>Veuillez mettre à jour votre navigateur ou utiliser un navigateur moderne comme Chrome, Firefox, Edge ou Safari.</p>
    `;
    
    document.body.prepend(errorMessage);
    return false;
  }
  
  return true;
}

// Ajouter une fonction pour gérer le chargement des ressources
function loadResources() {
  return new Promise((resolve, reject) => {
    // Créer un écran de chargement des ressources
    const resourceLoadingScreen = document.createElement('div');
    resourceLoadingScreen.className = 'resource-loading-screen';
    resourceLoadingScreen.innerHTML = `
      <div class="loading-content">
        <h2>Chargement des ressources...</h2>
        <div class="loading-spinner"></div>
        <p>Préparation des données climatiques</p>
      </div>
    `;
    
    document.body.appendChild(resourceLoadingScreen);
    
    // Liste des ressources à précharger (images, sons, etc.)
    const resourcesToLoad = [
      // Précharger les icônes principales
      { type: 'image', url: 'assets/images/earth-favicon.svg' },
      // Ajouter d'autres ressources à précharger si nécessaire
    ];
    
    // Compteur de ressources chargées
    let loadedCount = 0;
    
    // Pas de ressources à charger
    if (resourcesToLoad.length === 0) {
      // Masquer l'écran de chargement
      setTimeout(() => {
        resourceLoadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
          resourceLoadingScreen.remove();
        }, 500);
        
        resolve();
      }, 500);
      
      return;
    }
    
    // Charger chaque ressource
    resourcesToLoad.forEach(resource => {
      switch (resource.type) {
        case 'image':
          const img = new Image();
          img.onload = () => {
            loadedCount++;
            checkIfComplete();
          };
          img.onerror = () => {
            console.warn(`Impossible de charger l'image: ${resource.url}`);
            loadedCount++;
            checkIfComplete();
          };
          img.src = resource.url;
          break;
        
        // Ajouter d'autres types de ressources si nécessaire
        
        default:
          console.warn(`Type de ressource non pris en charge: ${resource.type}`);
          loadedCount++;
          checkIfComplete();
      }
    });
    
    // Vérifier si toutes les ressources sont chargées
    function checkIfComplete() {
      if (loadedCount === resourcesToLoad.length) {
        // Masquer l'écran de chargement
        setTimeout(() => {
          resourceLoadingScreen.classList.add('fade-out');
          
          setTimeout(() => {
            resourceLoadingScreen.remove();
          }, 500);
          
          resolve();
        }, 500);
      }
    }
    
    // Ajouter un timeout pour éviter les blocages
    setTimeout(() => {
      if (loadedCount < resourcesToLoad.length) {
        console.warn(`Certaines ressources n'ont pas pu être chargées (${loadedCount}/${resourcesToLoad.length})`);
        resourceLoadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
          resourceLoadingScreen.remove();
        }, 500);
        
        resolve();
      }
    }, 10000); // 10 secondes max
  });
}

// Fonction pour précharger les modules JS nécessaires
function preloadModules() {
  return Promise.all([
    import('./modules/engine.js'),
    import('./modules/interface.js'),
    import('./modules/missions.js'),
    import('./modules/narrative-events.js'),
    import('./data/actions.js'),
    import('./data/events.js')
  ]).catch(error => {
    console.error("Erreur lors du préchargement des modules:", error);
    // Continuer malgré l'erreur
    return [];
  });
}

// Créer un élément d'écran de chargement persistant qui sera géré par engine.js
function createLoadingScreen() {
  // Vérifier si l'écran existe déjà
  if (document.getElementById('loading-screen')) {
    return;
  }
  
  // Créer l'écran de chargement
  const loadingScreen = document.createElement('div');
  loadingScreen.id = 'loading-screen';
  loadingScreen.className = 'loading-screen';
  loadingScreen.innerHTML = `
    <div class="loading-content">
      <h2>ClimaQuest</h2>
      <div class="loading-spinner"></div>
      <p>Initialisation du Conseil Climatique...</p>
      <div class="loading-progress-bar">
        <div class="loading-progress-bar-inner" style="width: 0%"></div>
      </div>
      <div class="loading-progress-text">0%</div>
    </div>
  `;
  
  document.body.appendChild(loadingScreen);
}

// Démarrer l'application
async function startApp() {
  try {
    console.log("Démarrage de l'application...");
    
    // Vérifier la compatibilité du navigateur
    if (!checkBrowserCompatibility()) {
      return;
    }
    
    // Précharger les modules JS nécessaires
    await preloadModules();
    
    // Créer l'écran de chargement principal (sera géré par engine.js)
    createLoadingScreen();
    
    // Charger les ressources
    await loadResources();
    
    // Initialiser le jeu (engine.js gère son propre écran de chargement)
    initGame();
    
    // Configurer l'interface utilisateur
    setupUI();
    
    console.log("Initialisation complète! Bienvenue dans ClimaQuest");
    
    // L'écran de chargement sera masqué par engine.js une fois l'initialisation terminée
    
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    
    // Masquer l'écran de chargement en cas d'erreur
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }
    
    // Afficher un message d'erreur à l'utilisateur
    alert(`Une erreur est survenue lors du démarrage de l'application: ${error.message}`);
  }
}

// Afficher le message d'introduction
function showIntroduction() {
  return new Promise((resolve) => {
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
        resolve();
      }, 500);
    });
  });
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', async () => {
  // Démarrer l'application
  await startApp();
  
  // Afficher l'introduction seulement après l'initialisation complète
  // Cela sera géré par la fonction d'initialisation du moteur
  /*
  // Écoutons un événement personnalisé indiquant que l'initialisation est terminée
  document.addEventListener('climaquest-initialized', async () => {
    // Afficher l'introduction
    await showIntroduction();
  });
  */
});
