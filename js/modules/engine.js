// engine.js - Complete revised file

// Moteur de jeu amélioré pour ClimaQuest
import { DEFAULT_STATE } from '../data/climate-model.js';
import actions from '../data/actions.js';
import events from '../data/events.js';
import { saveState, loadState } from './storage.js';
import { setupMissionsInterface, updateAfterTurn, showNotification, initMissionsInterface } from './missions-interface.js';
import { missionSystem } from './missions.js';
import { narrativeSystem } from './narrative-events.js';
import { achievementSystem } from './achievements.js';
import { climatePathTracker } from './progress-tracking.js';
import { visualizationSystem } from './visualization.js';
import { setupClimateDashboard, updateDashboard } from './climate-dashboard.js';

// Remplacer structuredClone par JSON parse/stringify
export let state = loadState() || JSON.parse(JSON.stringify(DEFAULT_STATE));
export let yearIndex = 0;
export let activeInvestments = []; // Pour suivre les investissements actifs
export let previousState = {}; // Pour le suivi des tendances

// Variable pour suivre l'état d'initialisation
export let initializationComplete = false;
export let initializationProgress = {
  total: 5, // Nombre total de systèmes à initialiser
  completed: 0, // Nombre de systèmes initialisés
  systems: {
    missions: false,
    narrative: false,
    tracker: false,
    achievements: false,
    visualization: false
  }
};

// Sécuriser l'état pour s'assurer qu'il contient tous les champs nécessaires
function ensureStateFields() {
  // Vérifier si le state a toutes les propriétés nécessaires
  // et les ajouter si elles n'existent pas
  if (!state.tippingPoints) {
    state.tippingPoints = {
      greenland: false,
      westAntarctica: false,
      amazon: false,
      permafrost: false
    };
  }
  
  if (!state.biodiversity && state.biodiversity !== 0) {
    state.biodiversity = 0;
  }
  
  // Considérer le CO2 comme un facteur de température si ce n'est pas explicite
  if (state.temp === undefined && state.co2) {
    state.temp = ((state.co2 - 280) * 0.008);
  }
  
  // S'assurer que le niveau de la mer est défini
  if (state.sea === undefined) {
    state.sea = 0;
  }
  
  // Nouvelles statistiques pour le système de badges
  if (!state.stats) {
    state.stats = {
      tech_investments: 0,
      renewable_actions: 0,
      diplomatic_choices: 0,
      education_actions: 0,
      social_satisfaction: 70,
      reputation: 50,
      public_awareness: 50
    };
  }
}

export function applyAction(actionId) {
  console.log(`Application de l'action ${actionId}`);
  const action = actions.find(a => a.id === actionId);
  if (!action) {
    console.error(`Action ${actionId} non trouvée`);
    return false;
  }
  if (state.budget < action.cost) {
    console.log(`Budget insuffisant. Actuel: ${state.budget}, Requis: ${action.cost}`);
    return false;
  }
  
  // Sauvegarder l'état précédent pour le suivi des tendances
  previousState = JSON.parse(JSON.stringify(state));
  
  state.budget -= action.cost;
  
  // Si c'est un investissement avec retour budgétaire
  if (action.budgetReturn && action.duration) {
    activeInvestments.push({
      id: action.id,
      name: action.name,
      return: action.budgetReturn,
      remainingYears: action.duration
    });
    console.log(`Nouvel investissement ajouté: ${action.name}`);
  }
  
  // Appliquer les effets de l'action sur l'état du jeu
  Object.entries(action.effects).forEach(([k, v]) => {
    if (state[k] !== undefined) {
      state[k] += v;
    } else {
      console.warn(`Propriété ${k} non trouvée dans l'état`);
    }
  });
  
  // Mettre à jour les statistiques pour le système de badges
  updateStatsFromAction(action);
  
  // Enregistrer l'action comme une décision clé dans le tracker de parcours
  climatePathTracker.recordDecision({
    id: `action-${actionId}-${Date.now()}`,
    type: 'action',
    name: action.name,
    description: `Vous avez mis en œuvre: ${action.name}`,
    year: state.year,
    effects: action.effects
  });
  
  // Mettre à jour l'interface du jeu
  updateGameInterface();
  
  console.log("État après action:", JSON.stringify(state));
  return true;
}

// Mettre à jour les statistiques pour le système de badges en fonction de l'action appliquée
function updateStatsFromAction(action) {
  // Mise à jour des stats en fonction de la catégorie de l'action
  switch (action.category) {
    case 'Technologie':
      state.stats.tech_investments++;
      break;
    case 'Énergie':
      if (action.id === 'solar' || action.id === 'wind') {
        state.stats.renewable_actions++;
      }
      break;
    case 'Éducation':
      state.stats.education_actions++;
      // Augmenter la sensibilisation du public
      state.stats.public_awareness = Math.min(100, state.stats.public_awareness + 2);
      break;
    case 'Économie':
      // Suivre les investissements économiques
      if (action.budgetReturn) {
        state.stats.tech_investments++;
      }
      break;
  }
  
  // Mise à jour des autres statistiques en fonction des effets
  if (action.effects) {
    // Impact sur la satisfaction sociale
    if (action.effects.biodiversity && action.effects.biodiversity > 0) {
      state.stats.social_satisfaction = Math.min(100, state.stats.social_satisfaction + 1);
    }
    
    // Impact sur la réputation internationale
    if (action.effects.co2 && action.effects.co2 < -1.0) {
      state.stats.reputation = Math.min(100, state.stats.reputation + 2);
    }
  }
  
  // Mettre à jour les statistiques dans le système de badges
  achievementSystem.updateStat('tech_investments', state.stats.tech_investments);
  achievementSystem.updateStat('renewable_actions', state.stats.renewable_actions);
  achievementSystem.updateStat('education_actions', state.stats.education_actions);
  achievementSystem.updateStat('public_awareness', state.stats.public_awareness);
  achievementSystem.updateStat('social_satisfaction', state.stats.social_satisfaction);
  achievementSystem.updateStat('reputation', state.stats.reputation);
}

function applyEvent(ev) {
  console.log(`Application de l'événement: ${ev.description}`);
  // Sauvegarder l'état précédent pour le suivi des tendances
  previousState = JSON.parse(JSON.stringify(state));
  
  Object.entries(ev.effects).forEach(([k, v]) => {
    if (state[k] !== undefined) {
      state[k] += v;
    } else {
      console.warn(`Propriété ${k} non trouvée dans l'état`);
    }
  });
  
  // Enregistrer l'événement aléatoire dans le tracker de parcours
  climatePathTracker.recordDecision({
    id: `random-event-${Date.now()}`,
    type: 'random-event',
    name: ev.description,
    description: ev.description,
    year: state.year,
    effects: ev.effects
  });
}

// Calcule l'effet du CO2 sur la température
function calculateTemperatureEffect() {
  // Formule simplifiée basée sur la sensibilité climatique
  // Une augmentation de 100ppm de CO₂ entraîne environ +0.8°C
  const baselineCO2 = 280; // Niveau préindustriel en ppm
  const climateSensitivity = 0.008; // °C par ppm de CO₂
  
  // Calcul de l'effet de température basé sur le niveau actuel de CO₂
  const tempEffect = (state.co2 - baselineCO2) * climateSensitivity;
  
  // Ajout d'une inertie (la température ne change pas instantanément)
  const inertiaFactor = 0.1; // 10% de l'effet total par an
  
  // Appliquer l'effet avec inertie
  state.temp = state.temp + (tempEffect - state.temp) * inertiaFactor;
  console.log(`Température calculée: ${state.temp.toFixed(2)}°C`);
}

// Calcule l'impact de la température sur le niveau de la mer
function calculateSeaLevelEffect() {
  // Valeur simplifiée : chaque degré d'augmentation contribue à la montée des eaux
  const seaLevelSensitivity = 0.02; // Par an et par degré
  
  // La montée des eaux est proportionnelle à la température
  if (state.temp > 0) {
    const seaLevelEffect = state.temp * seaLevelSensitivity;
    state.sea += seaLevelEffect;
    console.log(`Montée des eaux: +${seaLevelEffect.toFixed(4)} m`);
  }
}

// Applique les boucles de rétroaction climatique
function applyFeedbackLoops() {
  // Fonte du permafrost libérant du méthane (accélère le réchauffement)
  if (state.temp > 1.5) {
    const permafrostEffect = Math.max(0, (state.temp - 1.5) * 0.4);
    state.co2 += permafrostEffect;
    console.log(`Effet permafrost: +${permafrostEffect.toFixed(2)} CO₂`);
  }
  
  // Perte d'albédo due à la fonte des glaces (accélère le réchauffement)
  if (state.temp > 1.0) {
    const albedoEffect = Math.max(0, (state.temp - 1.0) * 0.01);
    state.temp += albedoEffect;
    console.log(`Effet albédo: +${albedoEffect.toFixed(4)} °C`);
  }
  
  // Effet de la biodiversité sur la capture du carbone
  if (state.biodiversity > 0) {
    const biodiversityEffect = state.biodiversity * 0.2;
    state.co2 -= biodiversityEffect;
    console.log(`Effet biodiversité: -${biodiversityEffect.toFixed(2)} CO₂`);
  }
}

// Vérifie les points de bascule climatiques
function checkTippingPoints() {
  // Point de bascule : fonte irréversible du Groenland
  if (state.temp > 2.0 && !state.tippingPoints.greenland) {
    state.tippingPoints.greenland = true;
    state.sea += 0.05; // Effet immédiat
    console.log("POINT DE BASCULE: La fonte du Groenland s'accélère");
    
    // Enregistrer le point de bascule dans le tracker de parcours
    climatePathTracker.recordCriticalEvent({
      id: "tipping-point-greenland",
      name: "Point de Bascule: Fonte du Groenland",
      description: "Le réchauffement a atteint un seuil critique, déclenchant une fonte irréversible du Groenland. Cela accélère la montée des eaux et perturbe la circulation océanique.",
      year: state.year,
      type: "tipping-point",
      impact: "negative",
      effects: { sea: 0.05 }
    });
    
    // Afficher une notification au joueur
    showNotification({
      title: "Point de Bascule Atteint",
      message: "La fonte du Groenland s'accélère, marquant un point de non-retour pour cette calotte glaciaire.",
      type: "tipping-point",
      duration: 8000
    });
  }
  
  // Point de bascule : instabilité de l'Antarctique Ouest
  if (state.temp > 2.5 && !state.tippingPoints.westAntarctica) {
    state.tippingPoints.westAntarctica = true;
    state.sea += 0.08;
    console.log("POINT DE BASCULE: L'Antarctique Ouest commence à s'effondrer");
    
    // Enregistrer le point de bascule dans le tracker de parcours
    climatePathTracker.recordCriticalEvent({
      id: "tipping-point-west-antarctica",
      name: "Point de Bascule: Effondrement de l'Antarctique Ouest",
      description: "Les plateformes glaciaires de l'Antarctique Ouest sont déstabilisées, entraînant une accélération de la fonte et une hausse significative du niveau des mers.",
      year: state.year,
      type: "tipping-point",
      impact: "negative",
      effects: { sea: 0.08 }
    });
    
    // Afficher une notification au joueur
    showNotification({
      title: "Point de Bascule Critique",
      message: "L'instabilité de l'Antarctique Ouest s'accélère, menaçant d'une montée des eaux de plusieurs mètres à long terme.",
      type: "tipping-point",
      duration: 8000
    });
  }
  
  // Point de bascule : dépérissement de l'Amazonie
  if (state.temp > 3.0 && !state.tippingPoints.amazon) {
    state.tippingPoints.amazon = true;
    state.co2 += 5.0;
    state.biodiversity -= 1.0;
    console.log("POINT DE BASCULE: La forêt amazonienne commence à se transformer en savane");
    
    // Enregistrer le point de bascule dans le tracker de parcours
    climatePathTracker.recordCriticalEvent({
      id: "tipping-point-amazon",
      name: "Point de Bascule: Dépérissement de l'Amazonie",
      description: "La forêt amazonienne commence à se transformer en savane, libérant d'énormes quantités de carbone et réduisant drastiquement la biodiversité mondiale.",
      year: state.year,
      type: "tipping-point",
      impact: "negative",
      effects: { co2: 5.0, biodiversity: -1.0 }
    });
    
    // Afficher une notification au joueur
    showNotification({
      title: "Point de Bascule Écologique",
      message: "L'Amazonie commence à se transformer en savane, libérant d'énormes quantités de CO2 et détruisant un habitat crucial.",
      type: "tipping-point",
      duration: 8000
    });
    
    // Déclencher un effet visuel de sécheresse dans la visualisation
    if (visualizationSystem) {
      visualizationSystem.triggerEffect('drought', 10000, 0.8);
    }
  }
  
  // Point de bascule : dégel du permafrost
  if (state.temp > 1.5 && !state.tippingPoints.permafrost) {
    state.tippingPoints.permafrost = true;
    state.co2 += 3.0;
    console.log("POINT DE BASCULE: Le dégel du permafrost libère du méthane");
    
    // Enregistrer le point de bascule dans le tracker de parcours
    climatePathTracker.recordCriticalEvent({
      id: "tipping-point-permafrost",
      name: "Point de Bascule: Dégel du Permafrost",
      description: "Le permafrost arctique a commencé à dégeler massivement, libérant d'énormes quantités de méthane et de CO2 piégés depuis des millénaires.",
      year: state.year,
      type: "tipping-point",
      impact: "negative",
      effects: { co2: 3.0 }
    });
    
    // Afficher une notification au joueur
    showNotification({
      title: "Point de Bascule Arctique",
      message: "Le permafrost commence à dégeler massivement, libérant du méthane et accélérant le réchauffement climatique.",
      type: "tipping-point",
      duration: 8000
    });
  }
}

// Augmentation naturelle des émissions
function naturalEmissionsIncrease() {
  // Augmentation naturelle des émissions (0.2% par an)
  const emissionsGrowthRate = 0.002;
  const baseEmissions = 2.0; // ppm par an
  
  // La croissance des émissions devient exponentielle sans action
  const yearsSinceStart = state.year - 2025;
  const emissionsIncrease = baseEmissions * Math.pow(1 + emissionsGrowthRate, yearsSinceStart);
  
  state.co2 += emissionsIncrease;
  console.log(`Émissions naturelles: +${emissionsIncrease.toFixed(2)} CO₂`);
}

export function nextTurn() {
  // Vérifier si l'initialisation est complète
  if (!initializationComplete) {
    showNotification({
      title: "Système en cours d'initialisation",
      message: "Veuillez patienter pendant l'initialisation du système",
      type: "warning",
      duration: 3000
    });
    return false;
  }

  console.log("Passage au tour suivant");
  
  // Vérifier si un événement narratif est actif
  if (narrativeSystem.activeEvent) {
    console.log("Un événement narratif est en cours, attendez de faire un choix");
    return false;
  }
  
  // S'assurer que toutes les propriétés existent
  ensureStateFields();
  
  // Sauvegarder l'état précédent pour le suivi des tendances
  previousState = JSON.parse(JSON.stringify(state));
  
  // Simulation des émissions naturelles
  naturalEmissionsIncrease();
  
  // Application des modèles climatiques
  calculateTemperatureEffect();
  calculateSeaLevelEffect();
  applyFeedbackLoops();
  
  // Vérification des points de bascule
  checkTippingPoints();
  
  // Random event every year
  const ev = events[yearIndex % events.length];
  applyEvent(ev);
  yearIndex++;

  // Budget replenishment - base amount
  state.budget = 10;
  
  // Bonus budget basé sur les métriques environnementales
  // Bonus pour faible CO2
  if (state.co2 < 400) {
    state.budget += 2;
    console.log("Bonus de budget pour faible CO2: +2");
  }
  
  // Bonus pour biodiversité
  if (state.biodiversity > 1) {
    state.budget += 1;
    console.log("Bonus de budget pour biodiversité: +1");
  }
  
  // Retours sur investissements actifs
  let investmentReturns = 0;
  activeInvestments = activeInvestments.filter(inv => {
    if (inv.remainingYears > 0) {
      investmentReturns += inv.return;
      inv.remainingYears--;
      console.log(`Retour sur ${inv.name}: +${inv.return} (${inv.remainingYears} années restantes)`);
      return true; // Garder cet investissement
    }
    console.log(`Investissement ${inv.name} terminé`);
    return false; // Retirer cet investissement
  });
  
  state.budget += investmentReturns;
  console.log(`Total des retours sur investissement: +${investmentReturns}`);

  state.year += 1;

  // Vérifier les nouveaux événements narratifs
  const nextEvent = narrativeSystem.checkEventTriggers();
  if (nextEvent) {
    console.log(`Nouvel événement narratif déclenché: ${nextEvent.title}`);
  }
  
  // Mettre à jour les systèmes de jeu
  updateAfterTurn();
  updateDashboard();
  
  // Mettre à jour la visualisation
  if (visualizationSystem) {
    visualizationSystem.updateVisualization();
  }
  
  saveState(state);
  console.log("État sauvegardé:", JSON.stringify(state));
  
  // Retourner simplement l'événement pour compatibilité avec le code existant
  return ev;
}

// Partie à corriger dans engine.js

export function resetGame() {
  console.log("Réinitialisation du jeu");
  
  // Obtenir l'année actuelle
  const currentYear = new Date().getFullYear();
  
  // Créer un nouvel état à partir de DEFAULT_STATE
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  
  // Mettre à jour l'année si nécessaire
  if (currentYear > 2025) {
    state.year = currentYear;
  }
  
  // CORRECTION: S'assurer que l'objet stats existe et est correctement initialisé
  if (!state.stats) {
    state.stats = {
      tech_investments: 0,
      renewable_actions: 0,
      diplomatic_choices: 0,
      education_actions: 0,
      social_satisfaction: 70,
      reputation: 50,
      public_awareness: 50
    };
  }
  
  // Réinitialiser les autres variables
  yearIndex = 0;
  activeInvestments = [];
  previousState = JSON.parse(JSON.stringify(state));
  
  // Réinitialiser les systèmes
  missionSystem.initialize();
  narrativeSystem.initialize();
  climatePathTracker.initialize();
  achievementSystem.initialize();
  
  // Sauvegarder le nouvel état
  saveState(state);
  console.log("Jeu réinitialisé à l'état:", JSON.stringify(state));
  
  // Mettre à jour l'interface
  updateGameInterface();
  
  return true;
}
// Mettre à jour la progression d'initialisation
function updateInitProgress(system) {
  initializationProgress.systems[system] = true;
  initializationProgress.completed++;
  
  // Mettre à jour l'indicateur de chargement
  const progressPercent = (initializationProgress.completed / initializationProgress.total) * 100;
  updateLoadingProgress(progressPercent);
  
  // Vérifier si tous les systèmes sont initialisés
  if (initializationProgress.completed >= initializationProgress.total) {
    console.log("Initialisation de tous les systèmes terminée");
    initializationComplete = true;
    
    // Masquer l'écran de chargement après un court délai
    setTimeout(() => {
      hideLoadingScreen();
    }, 500);
  }
}

// Mettre à jour l'affichage de progression du chargement
function updateLoadingProgress(percent) {
  const loadingText = document.querySelector('.loading-progress-text');
  const progressBar = document.querySelector('.loading-progress-bar-inner');
  
  if (loadingText) {
    loadingText.textContent = `${Math.round(percent)}%`;
  }
  
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
}

// Masquer l'écran de chargement
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');
    
    // Retirer complètement après l'animation
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

export function initGame() {
  console.log("Initialisation du jeu avec l'état:", JSON.stringify(state));
  
  // S'assurer que toutes les propriétés sont définies
  ensureStateFields();
  
  // Initialiser previousState
  previousState = JSON.parse(JSON.stringify(state));
  
  // Initialiser les systèmes avec des Promises
  initializeAllSystems()
    .then(() => {
      console.log("Tous les systèmes sont initialisés avec succès");
      initializationComplete = true;
      
      // Prendre un snapshot initial
      climatePathTracker.generatePathSnapshot("État initial");
      
      // Masquer l'écran de chargement
      hideLoadingScreen();
    })
    .catch(error => {
      console.error("Erreur pendant l'initialisation des systèmes:", error);
      
      // Afficher une erreur à l'utilisateur
      showNotification({
        title: "Erreur d'initialisation",
        message: "Une erreur est survenue lors de l'initialisation du jeu. Veuillez recharger la page.",
        type: "error",
        duration: 10000
      });
    });
  
  saveState(state);
}

// Initialiser tous les systèmes en parallèle
function initializeAllSystems() {
  // Afficher l'écran de chargement
  showLoadingScreen();
  
  // Créer un tableau de Promises pour tous les systèmes
  const promises = [
    // Initialiser le système de missions
    new Promise((resolve, reject) => {
      try {
        missionSystem.initialize();
        updateInitProgress('missions');
        console.log("Système de missions initialisé");
        resolve();
      } catch (error) {
        console.error("Erreur lors de l'initialisation du système de missions:", error);
        reject(error);
      }
    }),
    
    // Initialiser le système narratif
    new Promise((resolve, reject) => {
      try {
        narrativeSystem.initialize();
        updateInitProgress('narrative');
        console.log("Système narratif initialisé");
        resolve();
      } catch (error) {
        console.error("Erreur lors de l'initialisation du système narratif:", error);
        reject(error);
      }
    }),
    
    // Initialiser le système de suivi du parcours
    new Promise((resolve, reject) => {
      try {
        climatePathTracker.initialize();
        updateInitProgress('tracker');
        console.log("Système de suivi du parcours climatique initialisé");
        resolve();
      } catch (error) {
        console.error("Erreur lors de l'initialisation du système de suivi:", error);
        reject(error);
      }
    }),
    
    // Initialiser le système de badges
    new Promise((resolve, reject) => {
      try {
        achievementSystem.initialize();
        updateInitProgress('achievements');
        console.log("Système de badges et récompenses initialisé");
        resolve();
      } catch (error) {
        console.error("Erreur lors de l'initialisation du système de badges:", error);
        reject(error);
      }
    }),
    
    // Initialiser le système de visualisation
    new Promise((resolve, reject) => {
      try {
        if (visualizationSystem) {
          visualizationSystem.initialize('map');
          updateInitProgress('visualization');
          console.log("Système de visualisation initialisé");
        } else {
          updateInitProgress('visualization'); // Marquer comme complété même si non disponible
          console.log("Système de visualisation non disponible");
        }
        resolve();
      } catch (error) {
        console.error("Erreur lors de l'initialisation du système de visualisation:", error);
        updateInitProgress('visualization'); // Marquer comme complété malgré l'erreur
        resolve(); // Ne pas rejeter pour permettre au jeu de continuer
      }
    })
  ];
  
  // Une fois tous les systèmes initialisés, configurer les interfaces
  return Promise.all(promises)
    .then(() => {
      // Initialiser les interfaces
      initMissionsInterface(missionSystem);
      setupMissionsInterface();
      setupClimateDashboard();
      
      // Mettre à jour les interfaces initiales
      updateHUD();
      updateInvestments();
      
      return "Initialisation complète";
    });
}

// Afficher l'écran de chargement
function showLoadingScreen() {
  // Vérifier si l'écran de chargement existe déjà
  let loadingScreen = document.getElementById('loading-screen');
  
  if (!loadingScreen) {
    // Créer l'écran de chargement s'il n'existe pas
    loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
      <div class="loading-content">
        <h2>ClimaQuest</h2>
        <div class="loading-spinner"></div>
        <p>Initialisation des systèmes du Conseil Climatique...</p>
        <div class="loading-progress-bar">
          <div class="loading-progress-bar-inner" style="width: 0%"></div>
        </div>
        <div class="loading-progress-text">0%</div>
      </div>
    `;
    
    document.body.appendChild(loadingScreen);
  } else {
    // Réinitialiser si déjà présent
    loadingScreen.style.display = 'flex';
    loadingScreen.classList.remove('fade-out');
    
    const progressBar = loadingScreen.querySelector('.loading-progress-bar-inner');
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    
    const progressText = loadingScreen.querySelector('.loading-progress-text');
    if (progressText) {
      progressText.textContent = '0%';
    }
  }
}

// Mettre à jour l'interface du jeu
function updateGameInterface() {
  // Cette fonction est appelée après des changements d'état importants
  // et coordonne la mise à jour de tous les composants d'interface
  
  // Mettre à jour l'interface standard (HUD, investissements, etc.)
  updateHUD();
  updateInvestments();
  
  // Mettre à jour la visualisation
  if (visualizationSystem) {
    visualizationSystem.updateVisualization();
  }
  
  // Mettre à jour le tableau de bord
  updateDashboard();
}

// Fonctions importées de l'ancien code pour la compatibilité
function updateHUD() {
  // Note: Cette fonction serait idéalement importée depuis interface.js
  // Ici on se contente d'une version simplifiée pour la compatibilité
  
  const yearEl = document.getElementById('year');
  const budgetEl = document.getElementById('budget');
  const tempEl = document.getElementById('temp');
  const co2El = document.getElementById('co2');
  const seaEl = document.getElementById('sea');
  const biodiversityEl = document.getElementById('biodiversity');
  
  if (yearEl) yearEl.innerHTML = `Année: <strong>${state.year}</strong>`;
  if (budgetEl) budgetEl.textContent = `Budget: ${state.budget}`;
  if (tempEl) tempEl.textContent = `ΔT: ${state.temp.toFixed(2)}°C`;
  if (co2El) co2El.textContent = `CO₂: ${state.co2.toFixed(0)} ppm`;
  if (seaEl) seaEl.textContent = `Niveau mer: ${state.sea.toFixed(2)} m`;
  if (biodiversityEl) biodiversityEl.textContent = `Biodiversité: ${state.biodiversity.toFixed(1)}`;
  
  // Mettre à jour l'état des boutons d'action
  document.querySelectorAll('.action-btn').forEach(btn => {
    const actionId = btn.dataset.actionId;
    const action = actions.find(a => a.id === actionId);
    if (action) {
      btn.disabled = state.budget < action.cost;
    }
  });
}

function updateInvestments() {
  // Note: Cette fonction serait idéalement importée depuis interface.js
  // Ici on se contente d'une version simplifiée pour la compatibilité
  
  const investmentsDiv = document.getElementById('investments');
  const noInvestmentsEl = document.getElementById('no-investments');
  
  if (!investmentsDiv || !noInvestmentsEl) return;
  
  // Vider le contenu actuel
  Array.from(investmentsDiv.children)
    .filter(el => el.id !== 'no-investments')
    .forEach(el => el.remove());
  
  // Afficher/masquer le message "aucun investissement"
  if (activeInvestments.length === 0) {
    noInvestmentsEl.style.display = 'block';
    return;
  } else {
    noInvestmentsEl.style.display = 'none';
  }
  
  // Ajouter chaque investissement actif
  activeInvestments.forEach(inv => {
    const div = document.createElement('div');
    div.className = 'investment-item';
    div.innerHTML = `<strong>${inv.name}</strong>: +${inv.return} budget/tour (${inv.remainingYears} tours restants)`;
    investmentsDiv.appendChild(div);
  });
}

export { actions };
