// missions.js - Complete revised file

// Système de missions pour ClimaQuest
import { state } from './engine.js';
import { saveState } from './storage.js';
import { showNotification } from './missions-interface.js';

// Définition des ères climatiques
export const CLIMATE_ERAS = [
  { id: "era-2025-2035", name: "Éveil climatique", yearStart: 2025, yearEnd: 2035 },
  { id: "era-2035-2045", name: "Transition énergétique", yearStart: 2035, yearEnd: 2045 },
  { id: "era-2045-2055", name: "Adaptation critique", yearStart: 2045, yearEnd: 2055 },
  { id: "era-2055-2065", name: "Résilience mondiale", yearStart: 2055, yearEnd: 2065 },
  { id: "era-2065-2075", name: "Héritage durable", yearStart: 2065, yearEnd: 2075 }
];

// Définition des missions
export const missions = [
  {
    id: "stability-2035",
    eraId: "era-2025-2035",
    title: "Stabilité 2035",
    description: "Limiter la hausse de température à 1.5°C d'ici 2035",
    objectives: [
      { id: "temp-under-15", description: "Maintenir la température sous 1.5°C", parameter: "temp", target: "<=1.5" },
      { id: "budget-minimum", description: "Conserver au moins 15 points de budget", parameter: "budget", target: ">=15" },
      { id: "biodiversity-up", description: "Améliorer la biodiversité de 0.5 point", parameter: "biodiversity", target: ">=0.5" }
    ],
    reward: { type: "unlock", content: "clean-energy-pack", description: "Nouvelles technologies d'énergie propre" }
  },
  {
    id: "sea-level-control",
    eraId: "era-2025-2035",
    title: "Maîtrise des Océans",
    description: "Limitez la montée des eaux tout en développant l'économie",
    objectives: [
      { id: "sea-under-02", description: "Maintenir la montée des eaux sous 0.2m", parameter: "sea", target: "<=0.2" },
      { id: "economy-growth", description: "Atteindre 20 points de budget", parameter: "budget", target: ">=20" }
    ],
    reward: { type: "bonus", content: "coastal-adaptation", description: "Technologies d'adaptation côtière" }
  },
  {
    id: "biodiversity-guardian",
    eraId: "era-2025-2035",
    title: "Gardien de la Biodiversité",
    description: "Protégez et restaurez les écosystèmes naturels",
    objectives: [
      { id: "biodiversity-boost", description: "Atteindre un indice de biodiversité de 2", parameter: "biodiversity", target: ">=2" },
      { id: "temp-control", description: "Maintenir la température sous 1.8°C", parameter: "temp", target: "<=1.8" }
    ],
    reward: { type: "unlock", content: "ecosystem-technologies", description: "Technologies de restauration écologique" }
  },
  {
    id: "carbon-neutrality",
    eraId: "era-2035-2045",
    title: "Neutralité Carbone",
    description: "Atteignez un niveau de CO₂ stable tout en maintenant la croissance",
    objectives: [
      { id: "co2-reduction", description: "Réduire le CO₂ à moins de 400ppm", parameter: "co2", target: "<=400" },
      { id: "economy-stable", description: "Maintenir au moins 15 points de budget", parameter: "budget", target: ">=15" }
    ],
    reward: { type: "bonus", content: "carbon-economy", description: "Nouvelles opportunités économiques vertes" }
  },
    // Deux nouvelles missions pour l'ère "Transition énergétique" (2035-2045)
  
  // À ajouter dans le tableau missions du fichier js/modules/missions.js
  
  {
    id: "resilient-cities",
    eraId: "era-2035-2045",
    title: "Villes Résilientes",
    description: "Transformez vos zones urbaines pour résister aux nouvelles conditions climatiques tout en garantissant une haute qualité de vie.",
    objectives: [
      { id: "temp-control", description: "Maintenir l'augmentation de température sous 2.0°C", parameter: "temp", target: "<=2.0" },
      { id: "high-biodiversity", description: "Atteindre un indice de biodiversité d'au moins 1.5", parameter: "biodiversity", target: ">=1.5" },
      { id: "economic-strength", description: "Maintenir un budget d'au moins 20 points", parameter: "budget", target: ">=20" }
    ],
    reward: { type: "unlock", content: "smart-cities-technologies", description: "Nouvelles technologies de villes intelligentes résilientes au climat" }
  },
  {
    id: "sustainable-economy",
    eraId: "era-2035-2045",
    title: "Économie Durable",
    description: "Créez un nouveau modèle économique fondé sur des principes durables et une croissance verte.",
    objectives: [
      { id: "co2-reduction-major", description: "Réduire les émissions de CO₂ à moins de 390ppm", parameter: "co2", target: "<=390" },
      { id: "strong-budget", description: "Atteindre un budget de 25 points", parameter: "budget", target: ">=25" },
      { id: "sea-level-check", description: "Limiter la montée des eaux à 0.3m maximum", parameter: "sea", target: "<=0.3" }
    ],
    reward: { type: "bonus", content: "green-economy-multiplier", description: "Multiplicateur de revenus pour les technologies vertes" }
  }
  // D'autres missions seront définies pour les ères ultérieures
];

// Clé locale pour le stockage des missions
const MISSIONS_STORAGE_KEY = 'climaquest_missions';

// Système de gestion des missions
class MissionSystem {
  constructor() {
    // Initialisation de l'état par défaut
    this.currentMissions = [];
    this.completedMissions = [];
    this.unlockedMissions = [];
    this.activeEra = null;
    this.badges = [];
    
    // État du système à sauvegarder
    this.systemState = {
      currentMissions: this.currentMissions,
      completedMissions: this.completedMissions,
      unlockedMissions: this.unlockedMissions,
      activeEra: this.activeEra,
      badges: this.badges
    };
  }
  
  // Initialiser le système au démarrage du jeu
  initialize() {
    // Charger l'état sauvegardé si disponible
    this.loadSystemState();
    
    // Déterminer l'ère active en fonction de l'année actuelle
    this.updateActiveEra(state.year);
    
    // Débloquer les missions de la première ère si on commence une nouvelle partie
    if (this.unlockedMissions.length === 0) {
      this.unlockEraStartingMissions(this.activeEra);
    }
    
    // Mettre à jour l'interface
    this.updateMissionDisplay();
    
    return this; // Pour le chaînage
  }
  
  // Mettre à jour l'ère active en fonction de l'année
  updateActiveEra(currentYear) {
    for (const era of CLIMATE_ERAS) {
      if (currentYear >= era.yearStart && currentYear <= era.yearEnd) {
        // Si l'ère a changé, débloquer les nouvelles missions
        if (this.activeEra !== era.id) {
          this.activeEra = era.id;
          this.unlockEraStartingMissions(era.id);
        }
        return;
      }
    }
  }
  
  // Débloquer les missions initiales d'une ère
  unlockEraStartingMissions(eraId) {
    const eraMissions = missions.filter(mission => mission.eraId === eraId);
    
    // Ajouter les 2 premières missions de l'ère aux missions débloquées
    // (dans une version plus avancée, on pourrait avoir une logique plus complexe)
    for (let i = 0; i < Math.min(2, eraMissions.length); i++) {
      if (!this.unlockedMissions.includes(eraMissions[i].id) && 
          !this.currentMissions.includes(eraMissions[i].id) &&
          !this.completedMissions.includes(eraMissions[i].id)) {
        this.unlockedMissions.push(eraMissions[i].id);
      }
    }
    
    // Sauvegarder l'état
    this.saveSystemState();
    
    // Notifier le joueur
    showNotification({
      title: `Nouvelle ère : ${CLIMATE_ERAS.find(era => era.id === eraId).name}`,
      message: "De nouvelles missions sont disponibles !",
      type: "era-change"
    });
  }
  
  // Activer une mission (la déplacer des missions débloquées aux missions actuelles)
  activateMission(missionId) {
    // Vérifier que la mission est débloquée
    const index = this.unlockedMissions.indexOf(missionId);
    if (index !== -1) {
      // Retirer de la liste des missions débloquées
      this.unlockedMissions.splice(index, 1);
      
      // Ajouter aux missions actuelles
      this.currentMissions.push(missionId);
      
      // Sauvegarder et mettre à jour l'affichage
      this.saveSystemState();
      this.updateMissionDisplay();
      
      // Notifier le joueur
      const mission = missions.find(m => m.id === missionId);
      showNotification({
        title: `Mission activée : ${mission.title}`,
        message: mission.description,
        type: "mission-activated"
      });
      
      return true;
    }
    return false;
  }
  
  // Accepter une mission (alias pour la compatibilité)
  acceptMission(missionId) {
    return this.activateMission(missionId);
  }
  
  // Abandonner une mission active
  abandonMission(missionId) {
    // Vérifier que la mission est active
    const index = this.currentMissions.indexOf(missionId);
    if (index !== -1) {
      // Retirer de la liste des missions actives
      this.currentMissions.splice(index, 1);
      
      // Remettre dans la liste des missions débloquées
      this.unlockedMissions.push(missionId);
      
      // Sauvegarder et mettre à jour l'affichage
      this.saveSystemState();
      this.updateMissionDisplay();
      
      // Notifier le joueur
      const mission = missions.find(m => m.id === missionId);
      showNotification({
        title: `Mission abandonnée : ${mission.title}`,
        message: "La mission a été abandonnée et replacée dans vos missions disponibles.",
        type: "mission-abandoned"
      });
      
      return true;
    }
    return false;
  }
  
  // Vérifier l'état des objectifs d'une mission
  checkMissionObjectives(missionId) {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return { completed: false, progress: 0 };
    
    let completedObjectives = 0;
    const objectiveStatus = [];
    
    // Vérifier chaque objectif de la mission
    for (const objective of mission.objectives) {
      const status = this.checkObjectiveStatus(objective);
      objectiveStatus.push({
        id: objective.id,
        description: objective.description,
        completed: status.completed,
        currentValue: status.currentValue,
        target: objective.target
      });
      
      if (status.completed) completedObjectives++;
    }
    
    // Calculer le pourcentage de progression
    const progress = mission.objectives.length > 0 
      ? (completedObjectives / mission.objectives.length) * 100 
      : 0;
    
    return {
      completed: completedObjectives === mission.objectives.length,
      progress: progress,
      objectives: objectiveStatus
    };
  }
  
  // Vérifier si un objectif spécifique est atteint
  checkObjectiveStatus(objective) {
    // Récupérer la valeur actuelle du paramètre dans l'état du jeu
    const currentValue = state[objective.parameter];
    
    // Si le paramètre n'existe pas, l'objectif n'est pas atteint
    if (currentValue === undefined) {
      return { completed: false, currentValue: null };
    }
    
    // Extraire l'opérateur et la valeur cible
    const match = objective.target.match(/([<>=!]+)(.+)/);
    if (!match) {
      return { completed: false, currentValue };
    }
    
    const operator = match[1];
    const targetValue = parseFloat(match[2]);
    
    // Vérifier si l'objectif est atteint selon l'opérateur
    let completed = false;
    switch (operator) {
      case "<=":
        completed = currentValue <= targetValue;
        break;
      case "<":
        completed = currentValue < targetValue;
        break;
      case ">=":
        completed = currentValue >= targetValue;
        break;
      case ">":
        completed = currentValue > targetValue;
        break;
      case "==":
      case "=":
        completed = currentValue === targetValue;
        break;
      case "!=":
        completed = currentValue !== targetValue;
        break;
      default:
        completed = false;
    }
    
    return { completed, currentValue };
  }
  
  // Vérifier et mettre à jour toutes les missions actives après un tour
  updateMissions() {
    const completedMissionIds = [];
    
    // Vérifier chaque mission active
    for (const missionId of this.currentMissions) {
      const status = this.checkMissionObjectives(missionId);
      
      // Si tous les objectifs sont atteints, marquer la mission comme complétée
      if (status.completed) {
        completedMissionIds.push(missionId);
        this.completeMission(missionId);
      }
    }
    
    // Mettre à jour l'affichage des missions
    this.updateMissionDisplay();
    
    return completedMissionIds;
  }
  
  // Marquer une mission comme complétée
  completeMission(missionId) {
    // Retirer la mission des missions actives
    const index = this.currentMissions.indexOf(missionId);
    if (index !== -1) {
      this.currentMissions.splice(index, 1);
      
      // Ajouter la mission aux missions complétées
      this.completedMissions.push(missionId);
      
      // Attribuer la récompense
      this.awardMissionReward(missionId);
      
      // Sauvegarder l'état
      this.saveSystemState();
      
      // Notifier le joueur
      const mission = missions.find(m => m.id === missionId);
      showNotification({
        title: `Mission accomplie : ${mission.title}`,
        message: `Félicitations ! Vous avez reçu : ${mission.reward.description}`,
        type: "mission-completed"
      });
      
      // Débloquer de nouvelles missions si nécessaire
      this.unlockNewMissions(missionId);
    }
  }
  
  // Attribuer la récompense d'une mission complétée
  awardMissionReward(missionId) {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;
    
    // Appliquer la récompense selon son type
    switch (mission.reward.type) {
      case "unlock":
        // Débloquer de nouvelles actions
        // La logique spécifique dépend du système d'actions
        console.log(`Débloqué: ${mission.reward.content}`);
        // Dans une version plus avancée, on débloquera de nouvelles actions
        break;
        
      case "bonus":
        // Bonus permanents (budget, technologie, etc.)
        // Dans une version plus avancée, on appliquera des bonus
        state.budget += 5; // Exemple: bonus de budget
        console.log(`Bonus appliqué: ${mission.reward.content}`);
        break;
        
      case "badge":
        // Décerner un badge ou trophée
        this.awardBadge(mission.reward.content);
        break;
    }
    
    // Sauvegarder l'état du jeu après avoir appliqué la récompense
    saveState(state);
  }
  
  // Débloquer de nouvelles missions après une mission complétée
  unlockNewMissions(completedMissionId) {
    // Dans cette version simplifiée, on débloque simplement une nouvelle mission de l'ère active
    // Dans une version plus avancée, on aurait un "arbre de missions" avec des dépendances
    
    const unlockedCount = this.unlockedMissions.length;
    const currentCount = this.currentMissions.length;
    
    // Si le joueur a moins de 3 missions (débloquées + actives), débloquer une nouvelle mission
    if (unlockedCount + currentCount < 3) {
      const possibleMissions = missions.filter(m => 
        m.eraId === this.activeEra && 
        !this.unlockedMissions.includes(m.id) && 
        !this.currentMissions.includes(m.id) && 
        !this.completedMissions.includes(m.id)
      );
      
      if (possibleMissions.length > 0) {
        // Sélectionner la première mission disponible
        // (dans une version plus avancée, on utiliserait une sélection plus sophistiquée)
        this.unlockedMissions.push(possibleMissions[0].id);
        
        // Notifier le joueur
        showNotification({
          title: "Nouvelle mission disponible",
          message: possibleMissions[0].title,
          type: "mission-unlocked"
        });
        
        // Sauvegarder l'état
        this.saveSystemState();
      }
    }
    
    // Vérifier le déblocage de la prochaine ère
    this.checkEraProgression();
  }
  
  // Vérifier si l'ère suivante doit être débloquée
  checkEraProgression() {
    // Identifier l'ère actuelle et la suivante
    const currentEraIndex = CLIMATE_ERAS.findIndex(era => era.id === this.activeEra);
    if (currentEraIndex < 0 || currentEraIndex >= CLIMATE_ERAS.length - 1) return;
    
    // Trouver toutes les missions de l'ère actuelle
    const currentEraMissions = missions.filter(m => m.eraId === this.activeEra);
    const completedEraMissions = currentEraMissions.filter(m => 
      this.completedMissions.includes(m.id)
    );
    
    // Si au moins 60% des missions de l'ère sont complétées, activer un événement de transition
    if (currentEraMissions.length > 0 && 
        completedEraMissions.length / currentEraMissions.length >= 0.6) {
      // Ici on pourrait déclencher un événement narratif spécial
      console.log("Conditions pour la transition vers la prochaine ère remplies");
      
      // Dans une version plus élaborée, on déclencherait un événement narratif
      // narrativeSystem.triggerEraTransitionEvent(this.activeEra, CLIMATE_ERAS[currentEraIndex+1].id);
    }
  }
  
  // Attribuer un badge au joueur
  awardBadge(badgeId) {
    if (!this.badges.includes(badgeId)) {
      this.badges.push(badgeId);
      
      // Sauvegarder l'état
      this.saveSystemState();
      
      // Notifier le joueur (dans une version plus avancée)
      console.log(`Badge obtenu: ${badgeId}`);
    }
  }
  
  // Mettre à jour l'affichage des missions
  updateMissionDisplay() {
    // Cette fonction sera implémentée dans interface.js
    // Elle mettra à jour l'interface utilisateur pour afficher les missions
    
    // Définir les missions accessibles pour l'interface
    this.availableMissions = missions.filter(m => this.unlockedMissions.includes(m.id));
    
    // Pour l'instant, on se contente de loguer l'état des missions
    console.log("Missions actives:", this.currentMissions);
    console.log("Missions débloquées:", this.unlockedMissions);
    console.log("Missions complétées:", this.completedMissions);
  }
  
  // Sauvegarder l'état du système de missions
  saveSystemState() {
    // Mettre à jour l'objet d'état
    this.systemState = {
      currentMissions: this.currentMissions,
      completedMissions: this.completedMissions,
      unlockedMissions: this.unlockedMissions,
      activeEra: this.activeEra,
      badges: this.badges
    };
    
    // Sauvegarder dans localStorage
    try {
      localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(this.systemState));
      console.log("État du système de missions sauvegardé");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'état des missions:", error);
    }
  }
  
  // Charger l'état du système de missions
  loadSystemState() {
    try {
      // Charger depuis localStorage
      const savedState = JSON.parse(localStorage.getItem(MISSIONS_STORAGE_KEY));
      
      if (savedState) {
        this.currentMissions = savedState.currentMissions || [];
        this.completedMissions = savedState.completedMissions || [];
        this.unlockedMissions = savedState.unlockedMissions || [];
        this.activeEra = savedState.activeEra || CLIMATE_ERAS[0].id;
        this.badges = savedState.badges || [];
        console.log("État du système de missions chargé");
      } else {
        console.log("Aucun état de missions sauvegardé trouvé");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'état des missions:", error);
      // Réinitialiser en cas d'erreur
      this.currentMissions = [];
      this.completedMissions = [];
      this.unlockedMissions = [];
      this.activeEra = CLIMATE_ERAS[0].id;
      this.badges = [];
    }
  }
}

// Exporter une instance unique du système de missions
export const missionSystem = new MissionSystem();
