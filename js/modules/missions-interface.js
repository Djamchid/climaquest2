/**
 * missions-interface.js
 * Gère l'interface utilisateur pour le système de missions de ClimaQuest
 */

// Référence au système de mission (injecté depuis engine.js)
let missionSystem = null;

/**
 * Initialise l'interface des missions
 * @param {MissionSystem} missionSys - Le système de mission du jeu
 */
function initMissionsInterface(missionSys) {
  if (!missionSys) {
    console.error("Système de mission non fourni à l'initialisation de l'interface");
    return;
  }
  
  missionSystem = missionSys;
  console.log("Interface des missions initialisée");
  
  // Configurer les écouteurs d'événements globaux
  setupEventListeners();
}

/**
 * Prépare l'interface des missions avec les éléments DOM nécessaires
 */
function setupMissionsInterface() {
  try {
    console.log("Configuration de l'interface des missions...");
    
    // Vérifier si les éléments nécessaires existent
    const missionsPanelElement = document.getElementById('missions-panel');
    if (!missionsPanelElement) {
      console.error("Panneau des missions non trouvé dans le DOM");
      return;
    }
    
    // Créer la structure de base si elle n'existe pas déjà
    if (!document.getElementById('active-missions-container')) {
      missionsPanelElement.innerHTML = `
        <div class="missions-header">
          <h2>Missions</h2>
          <div class="missions-tabs">
            <button class="mission-tab active" data-tab="active">Actives</button>
            <button class="mission-tab" data-tab="available">Disponibles</button>
            <button class="mission-tab" data-tab="completed">Complétées</button>
          </div>
        </div>
        <div class="missions-content">
          <div id="active-missions-container" class="mission-container active"></div>
          <div id="available-missions-container" class="mission-container"></div>
          <div id="completed-missions-container" class="mission-container"></div>
        </div>
      `;
      
      // Ajouter les écouteurs pour les onglets
      document.querySelectorAll('.mission-tab').forEach(tab => {
        tab.addEventListener('click', function() {
          switchMissionTab(this.dataset.tab);
        });
      });
    }
    
    // Rendre les missions dans leurs conteneurs respectifs
    renderMissions(missionSystem);
    renderAvailableMissions(missionSystem);
    renderCompletedMissions(missionSystem);
    
    console.log("Interface des missions configurée avec succès");
  } catch (error) {
    console.error("Erreur lors de la configuration de l'interface des missions:", error);
  }
}

/**
 * Change l'onglet des missions actif
 * @param {string} tabName - Nom de l'onglet à activer ('active', 'available', 'completed')
 */
function switchMissionTab(tabName) {
  // Mettre à jour les onglets
  document.querySelectorAll('.mission-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Mettre à jour les conteneurs
  document.querySelectorAll('.mission-container').forEach(container => {
    container.classList.remove('active');
  });
  
  const targetContainer = document.getElementById(`${tabName}-missions-container`);
  if (targetContainer) {
    targetContainer.classList.add('active');
  }
}

/**
 * Configure les écouteurs d'événements pour les interactions avec les missions
 */
function setupEventListeners() {
  // Écouteur global pour gérer les clics sur les boutons des missions
  document.addEventListener('click', function(event) {
    // Gestion du bouton de détails
    if (event.target.classList.contains('mission-details-btn')) {
      const missionId = event.target.dataset.missionId;
      showMissionDetails(missionId);
    }
    
    // Gestion du bouton d'acceptation
    if (event.target.classList.contains('mission-accept-btn')) {
      const missionId = event.target.dataset.missionId;
      acceptMission(missionId);
    }
    
    // Gestion du bouton d'abandon
    if (event.target.classList.contains('mission-abandon-btn')) {
      const missionId = event.target.dataset.missionId;
      abandonMission(missionId);
    }
  });
}

/**
 * Attache des écouteurs d'événements spécifiques aux éléments de mission
 */
function attachMissionEventListeners() {
  // Cette fonction peut être utilisée pour attacher des écouteurs spécifiques
  // après le rendu des missions, si nécessaire
}

/**
 * Affiche les détails d'une mission dans un modal
 * @param {string} missionId - Identifiant de la mission à afficher
 */
function showMissionDetails(missionId) {
  // Trouver la mission dans l'une des listes
  let mission = null;
  if (missionSystem.currentMissions && missionSystem.currentMissions.length) {
    mission = missionSystem.currentMissions.find(m => m.id === missionId);
  }
  
  if (!mission && missionSystem.availableMissions && missionSystem.availableMissions.length) {
    mission = missionSystem.availableMissions.find(m => m.id === missionId);
  }
  
  if (!mission && missionSystem.completedMissions && missionSystem.completedMissions.length) {
    mission = missionSystem.completedMissions.find(m => m.id === missionId);
  }
  
  if (!mission) {
    console.error(`Mission avec ID ${missionId} non trouvée`);
    return;
  }
  
  // Créer ou obtenir le modal
  let missionModal = document.getElementById('mission-details-modal');
  if (!missionModal) {
    missionModal = document.createElement('div');
    missionModal.id = 'mission-details-modal';
    document.body.appendChild(missionModal);
  }
  
  // Générer le contenu du modal
  let objectivesHTML = '';
  if (mission.objectives && mission.objectives.length) {
    objectivesHTML = '<ul class="mission-objectives detailed">';
    for (const obj of mission.objectives) {
      const statusClass = obj.completed ? 'completed' : 'pending';
      objectivesHTML += `
        <li class="mission-objective ${statusClass}">
          <span class="objective-status-icon"></span>
          <span class="objective-description">${obj.description}</span>
          <span class="objective-target">${obj.parameter}: ${obj.target}</span>
        </li>
      `;
    }
    objectivesHTML += '</ul>';
  }
  
  // Générer HTML pour les récompenses
  let rewardHTML = '';
  if (mission.reward) {
    rewardHTML = `
      <div class="mission-reward">
        <h4>Récompense</h4>
        <p>${mission.reward.description || 'Description non disponible'}</p>
        ${mission.reward.type === 'unlock' ? `<p>Débloque: ${mission.reward.content}</p>` : ''}
        ${mission.reward.budgetBonus ? `<p>Bonus de budget: +${mission.reward.budgetBonus}</p>` : ''}
      </div>
    `;
  }
  
  // Définir le contenu du modal
  missionModal.innerHTML = `
    <div class="modal-content mission-modal">
      <span class="close-modal">&times;</span>
      <div class="mission-details-header">
        <h3>${mission.title}</h3>
        <span class="mission-era-badge">${mission.era || 'Ère actuelle'}</span>
      </div>
      <div class="mission-details-body">
        <p class="mission-description">${mission.description}</p>
        <div class="mission-objectives-container">
          <h4>Objectifs</h4>
          ${objectivesHTML}
        </div>
        ${rewardHTML}
      </div>
      <div class="mission-details-footer">
        ${!mission.completed ? `
          ${!mission.active ? `<button class="btn btn-primary mission-accept-btn" data-mission-id="${mission.id}">Accepter</button>` : ''}
          ${mission.active ? `<button class="btn btn-warning mission-abandon-btn" data-mission-id="${mission.id}">Abandonner</button>` : ''}
        ` : '<span class="mission-completed-badge">Mission complétée</span>'}
        <button class="btn btn-secondary close-details-btn">Fermer</button>
      </div>
    </div>
  `;
  
  // Gérer la fermeture du modal
  const closeButtons = missionModal.querySelectorAll('.close-modal, .close-details-btn');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      missionModal.style.display = 'none';
    });
  });
  
  // Afficher le modal
  missionModal.style.display = 'block';
}

/**
 * Accepte une mission disponible
 * @param {string} missionId - Identifiant de la mission à accepter
 */
function acceptMission(missionId) {
  if (!missionSystem || typeof missionSystem.acceptMission !== 'function') {
    console.error("Système de mission invalide ou méthode acceptMission non disponible");
    return;
  }
  
  const success = missionSystem.acceptMission(missionId);
  if (success) {
    // Mettre à jour l'interface
    renderMissions(missionSystem);
    renderAvailableMissions(missionSystem);
    
    // Fermer le modal
    const modal = document.getElementById('mission-details-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Notification
    showNotification('Mission acceptée', `Vous avez accepté la mission: ${missionId}`, 'success');
  } else {
    showNotification('Impossible d\'accepter la mission', 'Vous avez déjà atteint le nombre maximum de missions actives ou la mission n\'est pas disponible.', 'error');
  }
}

/**
 * Abandonne une mission active
 * @param {string} missionId - Identifiant de la mission à abandonner
 */
function abandonMission(missionId) {
  // Demander confirmation
  if (!confirm('Êtes-vous sûr de vouloir abandonner cette mission? Votre progression sera perdue.')) {
    return;
  }
  
  if (!missionSystem || typeof missionSystem.abandonMission !== 'function') {
    console.error("Système de mission invalide ou méthode abandonMission non disponible");
    return;
  }
  
  const success = missionSystem.abandonMission(missionId);
  if (success) {
    // Mettre à jour l'interface
    renderMissions(missionSystem);
    renderAvailableMissions(missionSystem);
    
    // Fermer le modal
    const modal = document.getElementById('mission-details-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Notification
    showNotification('Mission abandonnée', `Vous avez abandonné la mission: ${missionId}`, 'warning');
  } else {
    showNotification('Impossible d\'abandonner la mission', 'Une erreur s\'est produite.', 'error');
  }
}

/**
 * Affiche les missions actives dans l'interface utilisateur
 * @param {MissionSystem} missionSystem - Le système de mission
 */
function renderMissions(missionSystem) {
  // Validation du système de mission
  if (!missionSystem || typeof missionSystem !== 'object') {
    console.error("Système de mission invalide ou non initialisé");
    return;
  }

  // Obtenir les missions actives (maintenant comme propriété, pas comme fonction)
  const activeMissions = missionSystem.currentMissions || [];
  const missionsContainer = document.getElementById('active-missions-container');
  
  // Vider le conteneur actuel
  if (missionsContainer) {
    missionsContainer.innerHTML = '';
  } else {
    console.warn("Conteneur de missions actives non trouvé dans le DOM");
    return;
  }

  // Vérifier s'il y a des missions actives
  if (activeMissions.length === 0) {
    missionsContainer.innerHTML = '<div class="empty-missions-message">Aucune mission active. Consultez les missions disponibles pour en sélectionner une.</div>';
    return;
  }

  // Afficher chaque mission active
  for (const mission of activeMissions) {
    if (!mission || !mission.id || !mission.title) {
      console.warn("Mission invalide détectée:", mission);
      continue;
    }

    const missionElement = document.createElement('div');
    missionElement.className = 'mission-card';
    missionElement.dataset.missionId = mission.id;

    // Vérifier si la mission a des objectifs
    const objectives = mission.objectives || [];
    let objectivesHTML = '';
    
    if (objectives.length > 0) {
      objectivesHTML = '<ul class="mission-objectives">';
      for (const objective of objectives) {
        if (!objective || !objective.description) continue;
        
        // Déterminer si l'objectif est complété
        const isCompleted = objective.completed ? true : false;
        const statusClass = isCompleted ? 'completed' : 'pending';
        
        objectivesHTML += `
          <li class="mission-objective ${statusClass}">
            <span class="objective-status-icon"></span>
            <span class="objective-description">${objective.description}</span>
          </li>
        `;
      }
      objectivesHTML += '</ul>';
    }

    // Créer le contenu HTML de la mission
    missionElement.innerHTML = `
      <div class="mission-header">
        <h3 class="mission-title">${mission.title}</h3>
        <span class="mission-era">${mission.era || 'Ère actuelle'}</span>
      </div>
      <p class="mission-description">${mission.description || 'Description non disponible'}</p>
      ${objectivesHTML}
      <div class="mission-footer">
        <button class="btn mission-details-btn" data-mission-id="${mission.id}">Détails</button>
        <button class="btn mission-abandon-btn" data-mission-id="${mission.id}">Abandonner</button>
      </div>
    `;

    missionsContainer.appendChild(missionElement);
  }

  // Ajouter des écouteurs d'événements pour les boutons
  attachMissionEventListeners();
}

/**
 * Affiche les missions disponibles dans l'interface utilisateur
 * @param {MissionSystem} missionSystem - Le système de mission
 */
function renderAvailableMissions(missionSystem) {
  if (!missionSystem || !missionSystem.availableMissions) {
    console.error("Système de mission invalide ou missions disponibles non définies");
    return;
  }
  
  const availableMissions = missionSystem.availableMissions || [];
  const container = document.getElementById('available-missions-container');
  
  if (!container) {
    console.warn("Conteneur de missions disponibles non trouvé");
    return;
  }
  
  // Vider le conteneur
  container.innerHTML = '';
  
  // Vérifier s'il y a des missions disponibles
  if (availableMissions.length === 0) {
    container.innerHTML = '<div class="empty-missions-message">Aucune mission disponible pour le moment. Progressez dans le jeu pour débloquer plus de missions.</div>';
    return;
  }
  
  // Afficher chaque mission disponible
  for (const mission of availableMissions) {
    const missionElement = document.createElement('div');
    missionElement.className = 'mission-card available';
    missionElement.dataset.missionId = mission.id;
    
    missionElement.innerHTML = `
      <div class="mission-header">
        <h3 class="mission-title">${mission.title}</h3>
        <span class="mission-era">${mission.era || 'Ère actuelle'}</span>
      </div>
      <p class="mission-description">${mission.description || 'Description non disponible'}</p>
      <div class="mission-footer">
        <button class="btn btn-primary mission-accept-btn" data-mission-id="${mission.id}">Accepter</button>
        <button class="btn mission-details-btn" data-mission-id="${mission.id}">Détails</button>
      </div>
    `;
    
    container.appendChild(missionElement);
  }
}

/**
 * Affiche les missions complétées dans l'interface utilisateur
 * @param {MissionSystem} missionSystem - Le système de mission
 */
function renderCompletedMissions(missionSystem) {
  if (!missionSystem || !missionSystem.completedMissions) {
    console.error("Système de mission invalide ou missions complétées non définies");
    return;
  }
  
  const completedMissions = missionSystem.completedMissions || [];
  const container = document.getElementById('completed-missions-container');
  
  if (!container) {
    console.warn("Conteneur de missions complétées non trouvé");
    return;
  }
  
  // Vider le conteneur
  container.innerHTML = '';
  
  // Vérifier s'il y a des missions complétées
  if (completedMissions.length === 0) {
    container.innerHTML = '<div class="empty-missions-message">Aucune mission complétée pour le moment. Terminez des missions pour les voir apparaître ici.</div>';
    return;
  }
  
  // Afficher chaque mission complétée
  for (const mission of completedMissions) {
    const missionElement = document.createElement('div');
    missionElement.className = 'mission-card completed';
    missionElement.dataset.missionId = mission.id;
    
    missionElement.innerHTML = `
      <div class="mission-header">
        <h3 class="mission-title">${mission.title}</h3>
        <span class="mission-era">${mission.era || 'Ère passée'}</span>
        <span class="mission-completed-badge">✓ Complétée</span>
      </div>
      <p class="mission-description">${mission.description || 'Description non disponible'}</p>
      <div class="mission-footer">
        <button class="btn mission-details-btn" data-mission-id="${mission.id}">Détails</button>
      </div>
    `;
    
    container.appendChild(missionElement);
  }
}

// 2. Modify the showNotification function to accept either separate parameters or an object

// Find the showNotification function in missions-interface.js (around line 395)
// and replace it with this flexible version:

/**
 * Shows a notification to the user
 * @param {string|object} titleOrOptions - Either the title string or an options object
 * @param {string} [message] - The message (if using separate parameters)
 * @param {string} [type='info'] - The notification type (if using separate parameters)
 * @param {number} [duration=5000] - How long to show the notification in ms
 */
function showNotification(titleOrOptions, message, type = 'info', duration = 5000) {
  // Handle both parameter styles
  let title, notificationType = type, notificationDuration = duration;
  
  if (typeof titleOrOptions === 'object') {
    // Object parameter style
    title = titleOrOptions.title;
    message = titleOrOptions.message;
    notificationType = titleOrOptions.type || 'info';
    notificationDuration = titleOrOptions.duration || 5000;
  } else {
    // Individual parameters style
    title = titleOrOptions;
  }
  
  // Create notification element if it doesn't exist
  let notification = document.getElementById('game-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'game-notification';
    document.body.appendChild(notification);
  }
  
  // Set class based on type
  notification.className = `notification ${notificationType}`;
  
  // Set content
  notification.innerHTML = `
    <div class="notification-header">
      <h4>${title}</h4>
      <span class="close-notification">&times;</span>
    </div>
    <div class="notification-body">
      <p>${message}</p>
    </div>
  `;
  
  // Handle notification close
  const closeBtn = notification.querySelector('.close-notification');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.classList.add('hiding');
      setTimeout(() => {
        notification.style.display = 'none';
        notification.classList.remove('hiding');
      }, 300);
    });
  }
  
  // Show notification
  notification.style.display = 'block';
  
  // Auto-hide after the specified duration
  setTimeout(() => {
    if (notification) {
      notification.classList.add('hiding');
      setTimeout(() => {
        notification.style.display = 'none';
        notification.classList.remove('hiding');
      }, 300);
    }
  }, notificationDuration);
}

/**
 * Met à jour l'interface des missions après des changements de l'état du jeu
 */
function updateMissionsInterface() {
  if (!missionSystem) {
    console.warn("Système de mission non initialisé, impossible de mettre à jour l'interface");
    return;
  }
  
  // Vérifier les objectifs des missions actives
  if (typeof missionSystem.checkMissionObjectives === 'function') {
    missionSystem.checkMissionObjectives();
  }
  
  // Mettre à jour l'affichage des missions
  renderMissions(missionSystem);
  renderAvailableMissions(missionSystem);
  renderCompletedMissions(missionSystem);
}

//  1. Fix missions-interface.js exports
// Open js/modules/missions-interface.js and modify the export statement at the end:

// Change to this new export statement:
export {
  initMissionsInterface,
  setupMissionsInterface,
  updateMissionsInterface as updateAfterTurn, // Alias for updateAfterTurn
  showMissionDetails,
  showNotification
};
