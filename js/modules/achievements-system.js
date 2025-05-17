// Système de badges et récompenses pour ClimaQuest
import { state } from './engine.js';
import { climatePathTracker } from './progress-tracking.js';

// Définition des badges et récompenses
export const achievements = [
  // Catégorie: Innovation Technologique
  {
    id: "green-innovator",
    title: "Innovateur Vert",
    description: "Atteindre des réductions significatives d'émissions grâce à des investissements technologiques.",
    icon: "assets/icons/tech_badge.svg",
    category: "innovation",
    conditions: [
      { parameter: "tech_investments", condition: ">=10" },
      { parameter: "co2_reduction", condition: ">=15" }
    ],
    reward: { budgetBonus: 2, description: "Attractivité accrue pour les investissements technologiques" }
  },
  {
    id: "renewable-champion",
    title: "Champion des Renouvelables",
    description: "Réduire significativement les émissions de CO₂ par le déploiement d'énergies renouvelables.",
    icon: "assets/icons/renewable_badge.svg",
    category: "innovation",
    conditions: [
      { parameter: "renewable_actions", condition: ">=5" },
      { parameter: "co2", condition: "<=380" }
    ],
    reward: { actionBonus: "renewable", description: "Efficacité accrue des actions d'énergie renouvelable" }
  },
  
  // Catégorie: Diplomatie Climatique
  {
    id: "climate-diplomat",
    title: "Diplomate Climatique",
    description: "Exceller dans la résolution des défis climatiques à travers la coopération et le compromis.",
    icon: "assets/icons/diplomat_badge.svg",
    category: "diplomacy",
    conditions: [
      { parameter: "diplomatic_choices", condition: ">=4" },
      { parameter: "budget", condition: ">=20" }
    ],
    reward: { budgetBonus: 3, description: "Meilleures relations internationales et soutien financier" }
  },
  {
    id: "global-voice",
    title: "Voix Mondiale",
    description: "Devenir un leader international reconnu sur les questions climatiques.",
    icon: "assets/icons/global_badge.svg",
    category: "diplomacy",
    conditions: [
      { parameter: "international_events", condition: ">=3" },
      { parameter: "reputation", condition: ">=75" }
    ],
    reward: { unlockActions: ["international_climate_fund"], description: "Déblocage du Fonds Climatique International" }
  },
  
  // Catégorie: Équilibre Environnemental
  {
    id: "biodiversity-guardian",
    title: "Gardien de la Biodiversité",
    description: "Protéger et restaurer les écosystèmes naturels tout en développant l'économie.",
    icon: "assets/icons/biodiversity_badge.svg",
    category: "environment",
    conditions: [
      { parameter: "biodiversity", condition: ">=2.5" },
      { parameter: "budget", condition: ">=15" }
    ],
    reward: { biodiversityEfficiency: 1.5, description: "Efficacité accrue des actions de protection de la biodiversité" }
  },
  {
    id: "carbon-neutrality",
    title: "Neutralité Carbone",
    description: "Atteindre un équilibre parfait entre émissions et captage de carbone.",
    icon: "assets/icons/carbon_badge.svg",
    category: "environment",
    conditions: [
      { parameter: "co2_emissions", condition: "<=0" },
      { parameter: "year", condition: "<=2045" }
    ],
    reward: { globalInfluence: 2, description: "Influence mondiale accrue et nouvelles opportunités diplomatiques" }
  },
  
  // Catégorie: Résilience Sociale
  {
    id: "social-harmony",
    title: "Harmonie Sociale",
    description: "Gérer la transition climatique tout en maintenant un haut niveau de cohésion sociale.",
    icon: "assets/icons/social_badge.svg",
    category: "social",
    conditions: [
      { parameter: "social_satisfaction", condition: ">=80" },
      { parameter: "temp", condition: "<=2.0" }
    ],
    reward: { socialStability: 2, description: "Résilience accrue face aux crises et aux événements négatifs" }
  },
  {
    id: "climate-educator",
    title: "Éducateur Climatique",
    description: "Développer une population informée et engagée sur les questions climatiques.",
    icon: "assets/icons/education_badge.svg",
    category: "social",
    conditions: [
      { parameter: "education_actions", condition: ">=5" },
      { parameter: "public_awareness", condition: ">=75" }
    ],
    reward: { actionEfficiency: 1.2, description: "Efficacité accrue de toutes les actions grâce à une meilleure sensibilisation" }
  },
  
  // Catégorie: Triomphe Économique
  {
    id: "green-economy",
    title: "Économie Verte",
    description: "Créer une économie florissante et durable basée sur des principes écologiques.",
    icon: "assets/icons/economy_badge.svg",
    category: "economy",
    conditions: [
      { parameter: "budget", condition: ">=30" },
      { parameter: "co2", condition: "<=400" }
    ],
    reward: { budgetGrowth: 1.5, description: "Croissance économique verte accélérée" }
  },
  {
    id: "investment-guru",
    title: "Gourou de l'Investissement",
    description: "Exceller dans la gestion des investissements durables sur le long terme.",
    icon: "assets/icons/investment_badge.svg",
    category: "economy",
    conditions: [
      { parameter: "investments", condition: ">=10" },
      { parameter: "roi", condition: ">=50" }
    ],
    reward: { investmentEfficiency: 1.5, description: "Rendement accru sur tous les investissements" }
  }
];

// Classe pour gérer les badges et récompenses
class AchievementSystem {
  constructor() {
    this.earnedAchievements = [];
    this.trackedStats = {
      tech_investments: 0,
      co2_reduction: 0,
      renewable_actions: 0,
      diplomatic_choices: 0,
      international_events: 0,
      reputation: 50, // Valeur initiale
      education_actions: 0,
      public_awareness: 50, // Valeur initiale
      social_satisfaction: 70, // Valeur initiale
      investments: 0,
      roi: 0, // Return on Investment en pourcentage
      co2_emissions: 2.0 // Émissions nettes annuelles (à réduire à 0 pour la neutralité carbone)
    };
    
    // État du système à sauvegarder
    this.systemState = {
      earnedAchievements: this.earnedAchievements,
      trackedStats: this.trackedStats
    };
  }
  
  // Initialiser le système au démarrage du jeu
  initialize() {
    // Charger l'état sauvegardé si disponible
    this.loadSystemState();
    
    console.log("Système de badges et récompenses initialisé");
  }
  
  // Mettre à jour une statistique suivie
  updateStat(statName, value) {
    if (this.trackedStats[statName] !== undefined) {
      // Pour certaines statistiques, on veut ajouter la valeur
      const additive = ["tech_investments", "renewable_actions", "diplomatic_choices", 
                         "international_events", "education_actions", "investments"];
      
      if (additive.includes(statName)) {
        this.trackedStats[statName] += value;
      } else {
        // Pour d'autres, on veut définir la valeur directement
        this.trackedStats[statName] = value;
      }
      
      // Sauvegarder l'état après modification
      this.saveSystemState();
      
      // Vérifier si de nouveaux badges ont été débloqués
      this.checkAchievements();
      
      return true;
    }
    return false;
  }
  
  // Vérifier si de nouveaux badges peuvent être débloqués
  checkAchievements() {
    let newlyEarned = false;
    
    // Parcourir tous les badges
    for (const achievement of achievements) {
      // Ignorer les badges déjà obtenus
      if (this.earnedAchievements.some(a => a.id === achievement.id)) {
        continue;
      }
      
      // Vérifier si toutes les conditions sont remplies
      let allConditionsMet = true;
      
      for (const condition of achievement.conditions) {
        // Vérifier si le paramètre est une statistique suivie ou un état du jeu
        let paramValue;
        
        if (this.trackedStats[condition.parameter] !== undefined) {
          paramValue = this.trackedStats[condition.parameter];
        } else if (state[condition.parameter] !== undefined) {
          paramValue = state[condition.parameter];
        } else {
          // Paramètre inconnu, la condition n'est pas remplie
          allConditionsMet = false;
          break;
        }
        
        // Vérifier la condition
        const conditionMet = this.checkCondition(paramValue, condition.condition);
        if (!conditionMet) {
          allConditionsMet = false;
          break;
        }
      }
      
      // Si toutes les conditions sont remplies, débloquer le badge
      if (allConditionsMet) {
        this.unlockAchievement(achievement);
        newlyEarned = true;
      }
    }
    
    return newlyEarned;
  }
  
  // Vérifier si une condition est remplie
  checkCondition(value, condition) {
    // Extraire l'opérateur et la valeur cible
    const match = condition.match(/([<>=!]+)(.+)/);
    if (!match) return false;
    
    const operator = match[1];
    const targetValue = parseFloat(match[2]);
    
    // Vérifier la condition selon l'opérateur
    switch (operator) {
      case "<=": return value <= targetValue;
      case "<": return value < targetValue;
      case ">=": return value >= targetValue;
      case ">": return value > targetValue;
      case "==": 
      case "=": return value === targetValue;
      case "!=": return value !== targetValue;
      default: return false;
    }
  }
  
  // Débloquer un badge
  unlockAchievement(achievement) {
    // Ajouter aux badges obtenus avec la date
    const earnedAchievement = {
      ...achievement,
      earnedDate: new Date().toISOString(),
      earnedYear: state.year
    };
    
    this.earnedAchievements.push(earnedAchievement);
    
    // Appliquer la récompense
    this.applyReward(achievement);
    
    // Sauvegarder l'état
    this.saveSystemState();
    
    // Notifier le joueur (sera implémenté dans l'interface)
    console.log(`Badge débloqué: ${achievement.title}`);
    
    // Enregistrer dans le tracker de parcours comme événement important
    if (climatePathTracker) {
      climatePathTracker.recordCriticalEvent({
        id: `achievement-${achievement.id}`,
        name: `Badge obtenu: ${achievement.title}`,
        description: achievement.description,
        year: state.year,
        type: "milestone",
        impact: "positive"
      });
    }
    
    return earnedAchievement;
  }
  
  // Appliquer la récompense d'un badge
  applyReward(achievement) {
    if (!achievement.reward) return;
    
    // Appliquer différents types de récompenses
    if (achievement.reward.budgetBonus) {
      // Ajouter un bonus permanent au budget
      // Dans une implémentation complète, cela modifierait un multiplicateur
      state.budget += achievement.reward.budgetBonus;
    }
    
    if (achievement.reward.actionBonus) {
      // Améliorer l'efficacité d'un type d'action
      // Serait implémenté dans une version plus complète
      console.log(`Bonus appliqué pour les actions de type: ${achievement.reward.actionBonus}`);
    }
    
    if (achievement.reward.unlockActions) {
      // Débloquer de nouvelles actions
      // Serait implémenté dans une version plus complète
      console.log(`Nouvelles actions débloquées: ${achievement.reward.unlockActions.join(', ')}`);
    }
    
    // D'autres types de récompenses seraient gérés ici
  }
  
  // Obtenir les badges par catégorie
  getAchievementsByCategory(category = null) {
    if (!category) {
      return this.earnedAchievements;
    }
    
    return this.earnedAchievements.filter(achievement => 
      achievement.category === category
    );
  }
  
  // Obtenir le pourcentage de progression vers un badge spécifique
  getAchievementProgress(achievementId) {
    // Vérifier si le badge est déjà obtenu
    if (this.earnedAchievements.some(a => a.id === achievementId)) {
      return 100;
    }
    
    // Trouver le badge dans la liste complète
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    // Calculer la progression pour chaque condition
    let totalProgress = 0;
    let conditionsCount = 0;
    
    for (const condition of achievement.conditions) {
      // Obtenir la valeur actuelle du paramètre
      let currentValue;
      
      if (this.trackedStats[condition.parameter] !== undefined) {
        currentValue = this.trackedStats[condition.parameter];
      } else if (state[condition.parameter] !== undefined) {
        currentValue = state[condition.parameter];
      } else {
        // Paramètre inconnu, pas de progression
        continue;
      }
      
      // Extraire l'opérateur et la valeur cible
      const match = condition.condition.match(/([<>=!]+)(.+)/);
      if (!match) continue;
      
      const operator = match[1];
      const targetValue = parseFloat(match[2]);
      
      // Calculer la progression selon le type de condition
      let conditionProgress = 0;
      
      switch (operator) {
        case ">=":
        case ">":
          // Plus la valeur est élevée, meilleure est la progression
          conditionProgress = Math.min(100, (currentValue / targetValue) * 100);
          break;
        case "<=":
        case "<":
          // Pour ces cas, il faudrait connaître la valeur de départ
          // Pour simplifier, on considère que 50% du chemin est fait si la valeur est au double de la cible
          if (currentValue <= targetValue) {
            conditionProgress = 100;
          } else {
            conditionProgress = Math.max(0, 100 - ((currentValue / targetValue - 1) * 100));
          }
          break;
        case "==":
        case "=":
          // Soit la condition est remplie (100%), soit elle ne l'est pas (0%)
          conditionProgress = currentValue === targetValue ? 100 : 0;
          break;
        case "!=":
          // Soit la condition est remplie (100%), soit elle ne l'est pas (0%)
          conditionProgress = currentValue !== targetValue ? 100 : 0;
          break;
      }
      
      totalProgress += conditionProgress;
      conditionsCount++;
    }
    
    // Calculer la progression moyenne
    return conditionsCount > 0 ? Math.round(totalProgress / conditionsCount) : 0;
  }
  
  // Obtenir des suggestions de badges à viser
  getSuggestedAchievements(count = 3) {
    // Identifier les badges non obtenus
    const unearnedAchievements = achievements.filter(achievement => 
      !this.earnedAchievements.some(a => a.id === achievement.id)
    );
    
    if (unearnedAchievements.length === 0) {
      return [];
    }
    
    // Calculer la progression pour chaque badge non obtenu
    const achievementsWithProgress = unearnedAchievements.map(achievement => ({
      ...achievement,
      progress: this.getAchievementProgress(achievement.id)
    }));
    
    // Trier par progression décroissante (privilégier ceux qui sont presque débloqués)
    achievementsWithProgress.sort((a, b) => b.progress - a.progress);
    
    // Retourner les N premiers
    return achievementsWithProgress.slice(0, count);
  }
  
  // Sauvegarder l'état du système
  saveSystemState() {
    this.systemState = {
      earnedAchievements: this.earnedAchievements,
      trackedStats: this.trackedStats
    };
    
    // Dans une implémentation complète, on sauvegarderait dans localStorage
    // localStorage.setItem('climaquest_achievements', JSON.stringify(this.systemState));
  }
  
  // Charger l'état du système
  loadSystemState() {
    // Dans une implémentation complète, on chargerait depuis localStorage
    // const savedState = JSON.parse(localStorage.getItem('climaquest_achievements'));
    
    const savedState = null; // Pour l'instant
    
    if (savedState) {
      this.earnedAchievements = savedState.earnedAchievements || [];
      this.trackedStats = savedState.trackedStats || {
        tech_investments: 0,
        co2_reduction: 0,
        renewable_actions: 0,
        diplomatic_choices: 0,
        international_events: 0,
        reputation: 50,
        education_actions: 0,
        public_awareness: 50,
        social_satisfaction: 70,
        investments: 0,
        roi: 0,
        co2_emissions: 2.0
      };
    }
  }
}

// Exporter une instance unique du système de badges
export const achievementSystem = new AchievementSystem();
