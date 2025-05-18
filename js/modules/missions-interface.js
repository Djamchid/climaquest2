// Interface pour les missions et événements narratifs
import { state, actions, nextTurn, applyAction } from './engine.js';
import { missionSystem } from './missions.js';
import { narrativeSystem, characters } from './narrative-events.js';
import { achievementSystem } from './achievements.js';

// Éléments DOM pour l'interface des missions
let missionsPanel;
let missionsContent;
let missionTabs;
let currentMissionTab = 'active';

// Éléments DOM pour les événements narratifs
let narrativeOverlay;
let narrativeContainer;

// Éléments DOM pour les notifications
const notificationQueue = [];
let currentNotification = null;
let notificationTimer = null;

// Initialiser l'interface des missions et narratives
export function setupMissionsInterface() {
  // Créer le panneau de missions s'il n'existe pas
  if (!document.getElementById('missions-panel')) {
    createMissionsPanel();
  }
  
  // Créer l'overlay narratif s'il n'existe pas
  if (!document.getElementById('narrative-overlay')) {
    createNarrativeOverlay();
  }
  
  // Récupérer les références aux éléments DOM
  missionsPanel = document.getElementById('missions-panel');
  missionsContent = document.getElementById('missions-content');
  missionTabs = document.querySelectorAll('.mission-tab');
  narrativeOverlay = document.getElementById('narrative-overlay');
  narrativeContainer = document.getElementById('narrative-container');
  
  // Ajouter les écouteurs d'événements pour les onglets de mission
  missionTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Mettre à jour l'onglet actif
      missionTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Mettre à jour le contenu en fonction de l'onglet sélectionné
      currentMissionTab = tab.dataset.tab;
      renderMissions();
    });
  });
  
  // Initialiser le système de missions
  missionSystem.initialize();
  
  // Initialiser le système narratif
  narrativeSystem.initialize();
  
  // Rendre les missions initiales
  renderMissions();
  
  console.log("Interface des missions et événements narratifs initialisée");
}

// Créer le panneau de missions
function createMissionsPanel() {
  const missionsHTML = `
    <div id="missions-panel">
      <div class="missions-header">
        <h2>Missions</h2>
        <div class="missions-era-indicator">
          <div class="missions-era-icon">1</div>
          <span id="current-era-name">Éveil climatique (2025-2035)</span>
        </div>
      </div>
      <div class="missions-tabs">
        <div class="mission-tab active" data-tab="active">
          En cours
          <div class="mission-tab-counter" id="active-missions-count">0</div>
        </div>
        <div class="mission-tab" data-tab="available">
          Disponibles
          <div class="mission-tab-counter" id="available-missions-count">0</div>
        </div>
        <div class="mission-tab" data-tab="completed">
          Complétées
          <div class="mission-tab-counter" id="completed-missions-count">0</div>
        </div>
      </div>
      <div id="missions-content" class="missions-content">
        <!-- Le contenu des missions sera ajouté ici dynamiquement -->
      </div>
    </div>
  `;
  
  // Trouver un emplacement approprié dans le DOM
  const container = document.querySelector('.container');
  
  // Insérer après le HUD
  const hud = document.getElementById('hud');
  if (hud && container) {
    const missionsPanelElement = document.createElement('div');
    missionsPanelElement.innerHTML = missionsHTML;
    container.insertBefore(missionsPanelElement.firstElementChild, hud.nextSibling);
  } else {
    // Fallback: ajouter à la fin du conteneur
    container.innerHTML += missionsHTML;
  }
}

// Créer l'overlay pour les événements narratifs
function createNarrativeOverlay() {
  const narrativeHTML = `
    <div id="narrative-overlay" class="narrative-overlay">
      <div id="narrative-container" class="narrative-container">
        <div class="narrative-header">
          <h2 class="narrative-title">Titre de l'événement</h2>
          <div class="narrative-year">2025</div>
        </div>
        <div class="narrative-content">
          <div class="narrative-description">
            Description de l'événement narratif...
          </div>
          <div class="narrative-choices">
            <!-- Les choix seront ajoutés ici dynamiquement -->
          </div>
          <div id="narrative-result" class="narrative-result">
            <div class="narrative-result-title">Résultat</div>
            <div id="narrative-result-text" class="narrative-result-text">
              Le résultat de votre choix...
            </div>
          </div>
        </div>
        <div class="narrative-footer">
          <div class="narrative-effects">
            <!-- Les effets du choix seront affichés ici -->
          </div>
          <button id="narrative-skip" class="narrative-skip">Passer</button>
          <button id="narrative-continue" class="narrative-continue">Continuer</button>
        </div>
      </div>
    </div>
  `;
  
  // Ajouter à la fin du body
  const narrativeElement = document.createElement('div');
  narrativeElement.innerHTML = narrativeHTML;
  document.body.appendChild(narrativeElement.firstElementChild);
  
  // Ajouter les écouteurs d'événements
  setTimeout(() => {
    const skipButton = document.getElementById('narrative-skip');
    const continueButton = document.getElementById('narrative-continue');
    
    skipButton.addEventListener('click', () => {
      closeNarrativeEvent();
    });
    
    continueButton.addEventListener('click', () => {
      closeNarrativeEvent();
    });
  }, 0);
}

// Mettre à jour l'interface après chaque tour
export function updateAfterTurn() {
  // Vérifier les missions
  const completedMissions = missionSystem.updateMissions();
  
  // Si des missions ont été complétées, afficher des notifications
  completedMissions.forEach(missionId => {
    const mission = missionSystem.getMissionById(missionId);
    showNotification({
      title: `Mission accomplie : ${mission.title}`,
      message: `Félicitations ! Vous avez reçu : ${mission.reward.description}`,
      type: "mission-completed"
    });
  });
  
  // Vérifier les nouveaux événements narratifs
  const event = narrativeSystem.checkEventTriggers();
  if (event) {
    // Planifier l'affichage de l'événement narratif (après les notifications)
    setTimeout(() => {
      showNarrativeEvent(event);
    }, notificationQueue.length * 4000 + 500);
  }
  
  // Vérifier les badges et réalisations
  const newBadges = achievementSystem.checkAchievements();
  if (newBadges) {
    // Afficher des notifications pour les nouveaux badges
    showNotification({
      title: `Nouveau trophée débloqué !`,
      message: `Vous avez obtenu le trophée "${newBadges.title}"`,
      type: "achievement"
    });
  }
  
  // Mettre à jour l'affichage des missions
  renderMissions();
  
  // Mettre à jour l'ère active
  updateEraDisplay();
}

// Mettre à jour l'affichage de l'ère active
function updateEraDisplay() {
  const eraName = document.getElementById('current-era-name');
  const eraIcon = document.querySelector('.missions-era-icon');
  
  if (eraName && eraIcon) {
    // Obtenir l'ère active depuis le système de missions
    const activeEra = missionSystem.activeEra;
    const era = missionSystem.getEraById(activeEra);
    
    if (era) {
      eraName.textContent = `${era.name} (${era.yearStart}-${era.yearEnd})`;
      
      // Mettre à jour l'icône avec le numéro d'ère
      const eraNumber = era.id.match(/era-(\d+)/)[1] || '1';
      eraIcon.textContent = eraNumber;
      
      // Mettre à jour la couleur en fonction de l'ère
      const eraColor = `var(--era-${eraNumber}-color)`;
      document.querySelector('.missions-header').style.background = 
        `linear-gradient(90deg, ${eraColor}, ${eraColor}aa)`;
    }
  }
}

// Rendre les missions dans l'interface
function renderMissions() {
  if (!missionsContent) return;
  
  // Vider le contenu
  missionsContent.innerHTML = '';
  
  // Récupérer les missions selon l'onglet actif
  let missions = [];
  
  switch (currentMissionTab) {
    case 'active':
      missions = missionSystem.currentMissions();
      break;
    case 'available':
      missions = missionSystem.getUnlockedMissions();
      break;
    case 'completed':
      missions = missionSystem.getCompletedMissions();
      break;
  }
  
  // Mettre à jour les compteurs
  updateMissionCounters();
  
  // Si aucune mission dans cette catégorie
  if (missions.length === 0) {
    missionsContent.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--medium);">
        Aucune mission ${
          currentMissionTab === 'active' ? 'active' : 
          currentMissionTab === 'available' ? 'disponible' : 'complétée'
        } pour le moment.
      </div>
    `;
    return;
  }
  
  // Rendre chaque mission
  missions.forEach(mission => {
    const missionElement = createMissionCard(mission);
    missionsContent.appendChild(missionElement);
  });
}

// Créer une carte de mission
function createMissionCard(mission) {
  // Créer l'élément de la carte
  const missionCard = document.createElement('div');
  missionCard.className = 'mission-card';
  
  // Déterminer le statut et le style
  let statusText, statusClass;
  let canActivate = false;
  
  switch (mission.status) {
    case 'active':
      statusText = 'En cours';
      statusClass = 'active';
      break;
    case 'unlocked':
      statusText = 'Disponible';
      statusClass = 'unlocked';
      canActivate = true;
      break;
    case 'completed':
      statusText = 'Terminée';
      statusClass = 'completed';
      break;
    default:
      statusText = 'Disponible';
      statusClass = 'unlocked';
      canActivate = true;
  }
  
  // Calculer la progression pour les missions actives
  let progressHTML = '';
  let objectivesHTML = '';
  
  if (mission.status === 'active') {
    const progress = missionSystem.getMissionProgress(mission.id);
    
    progressHTML = `
      <div class="mission-progress-bar">
        <div class="mission-progress-bar-inner" style="width: ${progress.progress}%"></div>
      </div>
    `;
    
    // Générer la liste des objectifs avec leur état
    objectivesHTML = `
      <h4>Objectifs :</h4>
      <ul class="mission-objectives">
        ${mission.objectives.map(obj => {
          const objectiveStatus = progress.objectives.find(o => o.id === obj.id);
          const isCompleted = objectiveStatus && objectiveStatus.completed;
          
          return `
            <li class="mission-objective ${isCompleted ? 'completed' : ''}">
              <div class="mission-objective-icon ${isCompleted ? 'completed' : 'incomplete'}">
                ${isCompleted ? '✓' : '•'}
              </div>
              <div class="mission-objective-text">${obj.description}</div>
              <div class="mission-objective-progress">
                ${isCompleted ? 'Complété' : 
                  objectiveStatus ? `${objectiveStatus.currentValue.toFixed(1)} / ${obj.target.replace(/[<>=!]+/, '')}` : 'En cours'}
              </div>
            </li>
          `;
        }).join('')}
      </ul>
    `;
  }
  
  // Construire la carte de mission
  missionCard.innerHTML = `
    <div class="mission-card-header">
      <h3 class="mission-card-title">${mission.title}</h3>
      <div class="mission-card-status ${statusClass}">${statusText}</div>
    </div>
    <div class="mission-card-body">
      <div class="mission-description">${mission.description}</div>
      ${objectivesHTML}
      ${progressHTML}
      <div class="mission-reward">
        <div class="mission-reward-title">Récompense :</div>
        <div class="mission-reward-description">${mission.reward.description}</div>
      </div>
    </div>
    <div class="mission-card-actions">
      <button class="mission-btn mission-btn-details">Détails</button>
      ${canActivate ? `<button class="mission-btn mission-btn-activate">Activer</button>` : ''}
    </div>
  `;
  
  // Ajouter des écouteurs d'événements
  setTimeout(() => {
    const activateBtn = missionCard.querySelector('.mission-btn-activate');
    const detailsBtn = missionCard.querySelector('.mission-btn-details');
    
    if (activateBtn) {
      activateBtn.addEventListener('click', () => {
        missionSystem.activateMission(mission.id);
        renderMissions();
      });
    }
    
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => {
        // Afficher les détails de la mission (pourrait être une modale ou un panneau extensible)
        alert(`Détails de la mission "${mission.title}":\n\n${mission.description}`);
      });
    }
  }, 0);
  
  return missionCard;
}

// Mettre à jour les compteurs de missions
function updateMissionCounters() {
  const activeMissionsCount = document.getElementById('active-missions-count');
  const availableMissionsCount = document.getElementById('available-missions-count');
  const completedMissionsCount = document.getElementById('completed-missions-count');
  
  if (activeMissionsCount) {
    activeMissionsCount.textContent = missionSystem.currentMissions.length;
  }
  
  if (availableMissionsCount) {
    availableMissionsCount.textContent = missionSystem.unlockedMissions.length;
  }
  
  if (completedMissionsCount) {
    completedMissionsCount.textContent = missionSystem.completedMissions.length;
  }
}

// Afficher un événement narratif
function showNarrativeEvent(event) {
  if (!narrativeOverlay || !narrativeContainer) return;
  
  // Mettre à jour le contenu de l'événement
  const titleElement = narrativeContainer.querySelector('.narrative-title');
  const yearElement = narrativeContainer.querySelector('.narrative-year');
  const descriptionElement = narrativeContainer.querySelector('.narrative-description');
  const choicesElement = narrativeContainer.querySelector('.narrative-choices');
  const resultElement = document.getElementById('narrative-result');
  const continueButton = document.getElementById('narrative-continue');
  const skipButton = document.getElementById('narrative-skip');
  
  // Réinitialiser l'état
  resultElement.classList.remove('visible');
  continueButton.classList.remove('visible');
  skipButton.style.display = 'block';
  
  // Définir le contenu
  titleElement.textContent = event.title;
  yearElement.textContent = state.year;
  descriptionElement.textContent = event.description;
  
  // Générer les choix
  choicesElement.innerHTML = '';
  
  event.choices.forEach(choice => {
    const choiceElement = document.createElement('div');
    choiceElement.className = 'narrative-choice';
    choiceElement.dataset.choiceId = choice.id;
    
    // Récupérer le personnage conseiller
    const character = characters[choice.character];
    
    choiceElement.innerHTML = `
      <div class="narrative-choice-text">${choice.text}</div>
      <div class="narrative-choice-advisor">
        <div class="advisor-avatar ${choice.character}">${character ? character.name.charAt(0) : '?'}</div>
        <div class="advisor-content">
          <div class="advisor-name">${character ? character.name : 'Conseiller inconnu'}</div>
          <div class="advisor-advice">"${choice.advice}"</div>
        </div>
      </div>
    `;
    
    // Ajouter un écouteur d'événement pour le choix
    choiceElement.addEventListener('click', () => {
      selectNarrativeChoice(event, choice);
    });
    
    choicesElement.appendChild(choiceElement);
  });
  
  // Afficher l'overlay
  narrativeOverlay.classList.add('active');
  
  // Définir l'événement actif dans le système narratif
  narrativeSystem.activeEvent = event;
}

// Sélectionner un choix dans un événement narratif
function selectNarrativeChoice(event, choice) {
  // Marquer le choix sélectionné
  const choices = document.querySelectorAll('.narrative-choice');
  choices.forEach(c => {
    c.classList.remove('selected');
    c.style.pointerEvents = 'none'; // Désactiver les clics sur tous les choix
  });
  
  const selectedChoice = document.querySelector(`.narrative-choice[data-choice-id="${choice.id}"]`);
  if (selectedChoice) {
    selectedChoice.classList.add('selected');
  }
  
  // Afficher les effets dans le footer
  const effectsElement = narrativeContainer.querySelector('.narrative-effects');
  effectsElement.innerHTML = '';
  
  if (choice.effects) {
    Object.entries(choice.effects).forEach(([key, value]) => {
      const isPositive = (key === 'co2' && value < 0) || 
                        (key === 'biodiversity' && value > 0) || 
                        (key === 'temp' && value < 0) || 
                        (key === 'sea' && value < 0) ||
                        (key === 'budget' && value > 0);
      
      const effectElement = document.createElement('div');
      effectElement.className = 'narrative-effect';
      
      let icon, label;
      switch (key) {
        case 'co2':
          icon = 'CO₂';
          label = 'CO₂';
          break;
        case 'temp':
          icon = '🌡️';
          label = 'Température';
          break;
        case 'sea':
          icon = '🌊';
          label = 'Niveau de la mer';
          break;
        case 'biodiversity':
          icon = '🌿';
          label = 'Biodiversité';
          break;
        case 'budget':
          icon = '💰';
          label = 'Budget';
          break;
        default:
          icon = '📊';
          label = key;
      }
      
      effectElement.innerHTML = `
        <div class="effect-icon">${icon}</div>
        <div class="effect-label">${label}:</div>
        <div class="effect-value ${isPositive ? 'positive' : 'negative'}">${value > 0 ? '+' : ''}${value}</div>
      `;
      
      effectsElement.appendChild(effectElement);
    });
  }
  
  // Traiter le choix dans le système narratif
  narrativeSystem.processChoice(choice.id);
  
  // Afficher le résultat
  const resultElement = document.getElementById('narrative-result');
  const resultTextElement = document.getElementById('narrative-result-text');
  
  if (resultElement && resultTextElement && choice.results) {
    resultTextElement.textContent = choice.results;
    
    // Afficher le résultat après un court délai pour l'animation
    setTimeout(() => {
      resultElement.classList.add('visible');
      
      // Afficher le bouton "continuer" et masquer le bouton "passer"
      const continueButton = document.getElementById('narrative-continue');
      const skipButton = document.getElementById('narrative-skip');
      
      if (continueButton && skipButton) {
        continueButton.classList.add('visible');
        skipButton.style.display = 'none';
      }
    }, 1000);
  }
}

// Fermer l'événement narratif
function closeNarrativeEvent() {
  if (!narrativeOverlay) return;
  
  // Masquer l'overlay
  narrativeOverlay.classList.remove('active');
  
  // Réinitialiser l'événement actif
  narrativeSystem.activeEvent = null;
  
  // Avancer au tour suivant si c'était un événement auto-déclenché
  nextTurn();
  
  // Mettre à jour les missions
  renderMissions();
}

// Afficher une notification
export function showNotification(options = {}) {
  // Options par défaut
  const defaultOptions = {
    title: 'Notification',
    message: '',
    type: 'info', // info, mission, event, era-change, tipping-point, achievement
    duration: 5000, // 5 secondes
    action: null // Fonction à exécuter si l'utilisateur clique sur l'action
  };
  
  // Fusionner avec les options fournies
  const notificationOptions = { ...defaultOptions, ...options };
  
  // Ajouter à la file d'attente
  notificationQueue.push(notificationOptions);
  
  // Si aucune notification n'est affichée, afficher la suivante
  if (!currentNotification) {
    showNextNotification();
  }
}

// Afficher la notification suivante dans la file d'attente
function showNextNotification() {
  if (notificationQueue.length === 0) {
    currentNotification = null;
    return;
  }
  
  // Récupérer la prochaine notification
  const notification = notificationQueue.shift();
  currentNotification = notification;
  
  // Créer l'élément de notification s'il n'existe pas
  let notificationElement = document.getElementById('notification');
  
  if (!notificationElement) {
    notificationElement = document.createElement('div');
    notificationElement.id = 'notification';
    notificationElement.className = 'notification';
    document.body.appendChild(notificationElement);
  }
  
  // Définir le contenu de la notification
  notificationElement.innerHTML = `
    <div class="notification-header notification-${notification.type}">
      <div>${getNotificationTypeLabel(notification.type)}</div>
      <button class="notification-close">&times;</button>
    </div>
    <div class="notification-body">
      <div class="notification-title">${notification.title}</div>
      <div class="notification-message">${notification.message}</div>
    </div>
    ${notification.action ? `
      <div class="notification-actions">
        <button class="notification-action">${notification.action.label || 'Voir'}</button>
      </div>
    ` : ''}
  `;
  
  // Ajouter les écouteurs d'événements
  const closeButton = notificationElement.querySelector('.notification-close');
  const actionButton = notificationElement.querySelector('.notification-action');
  
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      closeNotification(notificationElement);
    });
  }
  
  if (actionButton && notification.action) {
    actionButton.addEventListener('click', () => {
      notification.action.callback();
      closeNotification(notificationElement);
    });
  }
  
  // Afficher la notification
  setTimeout(() => {
    notificationElement.classList.add('active');
  }, 10);
  
  // Configurer le timer pour fermer automatiquement
  if (notification.duration) {
    if (notificationTimer) {
      clearTimeout(notificationTimer);
    }
    
    notificationTimer = setTimeout(() => {
      closeNotification(notificationElement);
    }, notification.duration);
  }
}

// Fermer une notification
function closeNotification(notificationElement) {
  // Masquer la notification
  notificationElement.classList.remove('active');
  
  // Nettoyer le timer
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
  
  // Attendre la fin de l'animation pour afficher la suivante
  setTimeout(() => {
    showNextNotification();
  }, 500);
}

// Obtenir le libellé d'un type de notification
function getNotificationTypeLabel(type) {
  switch (type) {
    case 'mission':
    case 'mission-completed':
    case 'mission-activated':
    case 'mission-unlocked':
      return 'Mission';
    case 'event':
      return 'Événement';
    case 'era-change':
      return 'Nouvelle ère';
    case 'tipping-point':
      return 'Point de bascule';
    case 'achievement':
      return 'Réalisation';
    default:
      return 'Information';
  }
}

// Exporter les fonctions utilisées par d'autres modules
export { 
  showNarrativeEvent, 
  closeNarrativeEvent
};
