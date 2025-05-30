// Correction de l'interface des missions pour ClimaQuest
// Fichier: js/modules/missions-interface.js

/**
 * missions-interface.js
 * Gère l'interface utilisateur pour le système de missions de ClimaQuest
 */

// Référence au système de mission (injecté depuis engine.js)
let missionSystem = null;
// Catalogue des missions
let missionsData = [];

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
  
  // Récupérer le catalogue des missions
  loadMissionsCatalog();
  
  // Configurer les écouteurs d'événements globaux
  setupEventListeners();
  
  return true;
}

/**
 * Charge le catalogue des missions depuis les sources disponibles
 */
function loadMissionsCatalog() {
  // Essayer différentes sources pour obtenir les missions
  if (window.missions && Array.isArray(window.missions)) {
    missionsData = window.missions;
    console.log("Catalogue de missions chargé depuis window.missions");
    return true;
  }
  
  if (window.missionModule && window.missionModule.missions) {
    missionsData = window.missionModule.missions;
    console.log("Catalogue de missions chargé depuis window.missionModule");
    return true;
  }
  
  // Dernière tentative: essayer d'importer directement
  try {
    import('../data/missions.js').then(module => {
      if (module.missions) {
        missionsData = module.missions;
        console.log("Catalogue de missions chargé dynamiquement");
        updateMissionsInterface();
        return true;
      }
    }).catch(error => {
      console.warn("Impossible de charger le module missions.js:", error);
    });
  } catch (error) {
    console.warn("Erreur lors de l'import dynamique des missions:", error);
  }
  
  return false;
}

/**
 * Prépare l'interface des missions avec les éléments DOM nécessaires
 * @param {MissionSystem} missionSys - Optionnel: système de mission à utiliser
 */
function setupMissionsInterface(missionSys) {
  try {
    console.log("Configuration de l'interface des missions...");
    
    // Stocker la référence au système de mission s'il est fourni
    if (missionSys) {
      missionSystem = missionSys;
    }
    
    // Vérifier si le système de mission est disponible
    if (!missionSystem) {
      console.warn("Système de mission non disponible. L'interface sera configurée plus tard.");
      return false;
    }
    
    // Vérifier si les éléments nécessaires existent
    const missionsPanelElement = document.getElementById('missions-panel');
    if (!missionsPanelElement) {
      console.error("Panneau des missions non trouvé dans le DOM");
      return false;
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
    
    // Charger le catalogue de missions si nécessaire
    if (missionsData.length === 0) {
      loadMissionsCatalog();
    }
    
    // Mettre à jour l'interface avec les données actuelles
    updateMissionsInterface();
    
    console.log("Interface des missions configurée avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la configuration de l'interface des missions:", error);
    return false;
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
 * Trouve une mission par son ID dans le catalogue de missions
 * @param {string} missionId - Identifiant de la mission à trouver
 * @return {Object|null} La mission trouvée ou null
 */
function findMissionById(missionId) {
  // D'abord chercher dans notre catalogue local
  if (missionsData && missionsData.length > 0) {
    const mission = missionsData.find(m => m.id === missionId);
    if (mission) return mission;
  }
  
  // Chercher dans window.missions (version globale)
  if (window.missions && Array.isArray(window.missions)) {
    const mission = window.missions.find(m => m.id === missionId);
    if (mission) return mission;
  }
  
  // Chercher dans window.missionModule
  if (window.missionModule && window.missionModule.missions) {
    const mission = window.missionModule.missions.find(m => m.id === missionId);
    if (mission) return mission;
  }
  
  // Fallback: chercher dans le système de mission si disponible
  if (missionSystem && missionSystem.missions) {
    const mission = missionSystem.missions.find(m => m.id === missionId);
    if (mission) return mission;
  }
  
  console.warn(`Impossible de trouver la mission ${missionId}`);
  return null;
}

/**
 * Affiche les détails d'une mission dans un modal
 * @param {string} missionId - Identifiant de la mission à afficher
 */
function showMissionDetails(missionId) {
  // Vérifier si le système de mission est disponible
  if (!missionSystem) {
    console.error("Système de mission non disponible");
    showNotification({
      title: "Erreur",
      message: "Impossible d'afficher les détails de la mission",
      type: "error"
    });
    return;
  }
  
  // Trouver la mission appropriée
  const mission = findMissionById(missionId);
  
  if (!mission) {
    console.error(`Mission avec ID ${missionId} non trouvée`);
    return;
  }
  
  // Déterminer l'état de la mission
  let isMissionActive = false;
  let isMissionCompleted = false;
  
  if (missionSystem.currentMissions && missionSystem.currentMissions.includes(missionId)) {
    isMissionActive = true;
  } else if (missionSystem.completedMissions && missionSystem.completedMissions.includes(missionId)) {
    isMissionCompleted = true;
  }
  
  // Créer ou obtenir le modal
  let missionModal = document.getElementById('mission-details-modal');
  if (!missionModal) {
    missionModal = document.createElement('div');
    missionModal.id = 'mission-details-modal';
    document.body.appendChild(missionModal);
  }
  
  // Obtenir les objectifs de la mission avec leur statut actuel
  let objectives = mission.objectives || [];
  let objectiveStatus = null;
  
  if (isMissionActive) {
    // Si la mission est active, obtenir le statut des objectifs
    objectiveStatus = missionSystem.checkMissionObjectives(missionId);
  }
  
  // Générer le contenu du modal
  let objectivesHTML = '';
  if (objectives && objectives.length) {
    objectivesHTML = '<ul class="mission-objectives detailed">';
    for (const obj of objectives) {
      let isCompleted = false;
      
      // Vérifier si l'objectif est complété
      if (objectiveStatus && objectiveStatus.objectives) {
        const matchingObj = objectiveStatus.objectives.find(o => o.id === obj.id);
        if (matchingObj) {
          isCompleted = matchingObj.completed || false;
        }
      }
      
      const statusClass = isCompleted ? 'completed' : 'pending';
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
        <span class="mission-era-badge">${mission.eraId || 'Ère actuelle'}</span>
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
        ${!isMissionCompleted ? `
          ${!isMissionActive ? `<button class="btn btn-primary mission-accept-btn" data-mission-id="${mission.id}">Accepter</button>` : ''}
          ${isMissionActive ? `<button class="btn btn-warning mission-abandon-btn" data-mission-id="${mission.id}">Abandonner</button>` : ''}
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
    updateMissionsInterface();
    
    // Fermer le modal
    const modal = document.getElementById('mission-details-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Notification
    showNotification({
      title: "Mission acceptée",
      message: `Vous avez accepté la mission!`,
      type: "success"
    });
  } else {
    showNotification({
      title: "Impossible d'accepter la mission",
      message: "Vous avez déjà atteint le nombre maximum de missions actives ou la mission n'est pas disponible.",
      type: "error"
    });
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
    updateMissionsInterface();
    
    // Fermer le modal
    const modal = document.getElementById('mission-details-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Notification
    showNotification({
      title: "Mission abandonnée",
      message: `Vous avez abandonné la mission.`,
      type: "warning"
    });
  } else {
    showNotification({
      title: "Impossible d'abandonner la mission",
      message: "Une erreur s'est produite.",
      type: "error"
    });
  }
}

/**
 * Affiche les missions actives dans l'interface utilisateur
 */
function renderMissions() {
  // Validation du système de mission
  if (!missionSystem || typeof missionSystem !== 'object') {
    console.error("Système de mission invalide ou non initialisé");
    return;
  }

  // Obtenir les missions actives
  const activeMissionIds = missionSystem.currentMissions || [];
  const missionsContainer = document.getElementById('active-missions-container');
  
  // Vider le conteneur actuel
  if (missionsContainer) {
    missionsContainer.innerHTML = '';
  } else {
    console.warn("Conteneur de missions actives non trouvé dans le DOM");
    return;
  }

  // Vérifier s'il y a des missions actives
  if (activeMissionIds.length === 0) {
    missionsContainer.innerHTML = '<div class="empty-missions-message">Aucune mission active. Consultez les missions disponibles pour en sélectionner une.</div>';
    return;
  }

  // Afficher chaque mission active
  for (const missionId of activeMissionIds) {
    const mission = findMissionById(missionId);
    if (!mission) {
      console.warn(`Mission ${missionId} non trouvée dans le catalogue`);
      continue;
    }

    const missionElement = document.createElement('div');
    missionElement.className = 'mission-card';
    missionElement.dataset.missionId = mission.id;

    // Obtenir les objectifs de la mission avec leur statut actuel
    const status = missionSystem.checkMissionObjectives(missionId);
    let objectivesHTML = '';
    
    if (status && status.objectives && status.objectives.length > 0) {
      objectivesHTML = '<ul class="mission-objectives">';
      for (const objective of status.objectives) {
        if (!objective) continue;
        
        // Déterminer si l'objectif est complété
        const statusClass = objective.completed ? 'completed' : 'pending';
        
        objectivesHTML += `
          <li class="mission-objective ${statusClass}">
            <span class="objective-status-icon"></span>
            <span class="objective-description">${objective.description || 'Objectif'}</span>
          </li>
        `;
      }
      objectivesHTML += '</ul>';
      
      // Ajouter une barre de progression
      objectivesHTML += `
        <div class="mission-progress">
          <div class="mission-progress-label">Progression: ${Math.round(status.progress)}%</div>
          <div class="mission-progress-bar">
            <div class="mission-progress-bar-inner" style="width: ${status.progress}%"></div>
          </div>
        </div>
      `;
    }

    // Créer le contenu HTML de la mission
    missionElement.innerHTML = `
      <div class="mission-header">
        <h3 class="mission-title">${mission.title}</h3>
        <span class="mission-era">${mission.eraId || 'Ère actuelle'}</span>
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
}

/**
 * Affiche les missions disponibles dans l'interface utilisateur
 */
function renderAvailableMissions() {
  if (!missionSystem) {
    console.error("Système de mission invalide");
    return;
  }
  
  const availableMissionIds = missionSystem.unlockedMissions || [];
  const container = document.getElementById('available-missions-container');
  
  if (!container) {
    console.warn("Conteneur de missions disponibles non trouvé");
    return;
  }
  
  // Vider le conteneur
  container.innerHTML = '';
  
  // Vérifier s'il y a des missions disponibles
  if (availableMissionIds.length === 0) {
    container.innerHTML = '<div class="empty-missions-message">Aucune mission disponible pour le moment. Progressez dans le jeu pour débloquer plus de missions.</div>';
    return;
  }
  
  // Afficher chaque mission disponible
  for (const missionId of availableMissionIds) {
    const mission = findMissionById(missionId);
    if (!mission) {
      console.warn(`Mission ${missionId} non trouvée dans le catalogue`);
      continue;
    }
    
    const missionElement = document.createElement('div');
    missionElement.className = 'mission-card available';
    missionElement.dataset.missionId = mission.id;
    
    missionElement.innerHTML = `
      <div class="mission-header">
        <h3 class="mission-title">${mission.title}</h3>
        <span class="mission-era">${mission.eraId || 'Ère actuelle'}</span>
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
 */
function renderCompletedMissions() {
  if (!missionSystem) {
    console.error("Système de mission invalide");
    return;
  }
  
  const completedMissionIds = missionSystem.completedMissions || [];
  const container = document.getElementById('completed-missions-container');
  
  if (!container) {
    console.warn("Conteneur de missions complétées non trouvé");
    return;
  }
  
  // Vider le conteneur
  container.innerHTML = '';
  
  // Vérifier s'il y a des missions complétées
  if (completedMissionIds.length === 0) {
    container.innerHTML = '<div class="empty-missions-message">Aucune mission complétée pour le moment. Terminez des missions pour les voir apparaître ici.</div>';
    return;
  }
  
  // Afficher chaque mission complétée
  for (const missionId of completedMissionIds) {
    const mission = findMissionById(missionId);
    if (!mission) {
      console.warn(`Mission ${missionId} non trouvée dans le catalogue`);
      continue;
    }
    
    const missionElement = document.createElement('div');
    missionElement.className = 'mission-card completed';
    missionElement.dataset.missionId = mission.id;
    
    missionElement.innerHTML = `
      <div class="mission-header">
        <h3 class="mission-title">${mission.title}</h3>
        <span class="mission-era">${mission.eraId || 'Ère passée'}</span>
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
    <div class="notification-header notification-${notificationType}">
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
    if (notification && notification.style.display === 'block') {
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
  
  // S'assurer que nous avons le catalogue de missions
  if (missionsData.length === 0) {
    // Essayer d'abord de le charger depuis les sources globales
    if (window.missions && Array.isArray(window.missions)) {
      missionsData = window.missions;
    } else if (window.missionModule && window.missionModule.missions) {
      missionsData = window.missionModule.missions;
    } else {
      // Tenter un import si rien n'est disponible
      try {
        import('../data/missions.js').then(module => {
          if (module && module.missions) {
            missionsData = module.missions;
            // Une fois les missions chargées, mettre à jour l'interface
            renderAllMissions();
          }
        }).catch(err => {
          console.warn("Impossible de charger dynamiquement le catalogue des missions:", err);
        });
        
        // Sortir pour éviter de rendre avant que les missions soient chargées
        return;
      } catch (error) {
        console.warn("Échec de l'import dynamique des missions:", error);
      }
    }
  }
  
  // Rendre toutes les catégories de missions
  renderAllMissions();
}

/**
 * Rend toutes les catégories de missions
 */
function renderAllMissions() {
  // Vérifier les objectifs des missions actives
  if (typeof missionSystem.checkMissionObjectives === 'function' && missionSystem.currentMissions) {
    missionSystem.currentMissions.forEach(missionId => {
      missionSystem.checkMissionObjectives(missionId);
    });
  } else if (typeof missionSystem.updateMissions === 'function') {
    missionSystem.updateMissions();
  }
  
  // Mettre à jour l'affichage des missions
  renderMissions();
  renderAvailableMissions();
  renderCompletedMissions();
}

export {
  initMissionsInterface,
  setupMissionsInterface,
  updateMissionsInterface as updateAfterTurn,
  showMissionDetails,
  showNotification
};
