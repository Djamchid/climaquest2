// Nouveau fichier à placer dans js/data/missions.js

// Module fallback pour les missions
// Ce fichier sert de source alternative quand js/modules/missions.js n'est pas accessible

// Définition des ères climatiques
export const CLIMATE_ERAS = [
  { id: "era-2025-2035", name: "Éveil climatique", yearStart: 2025, yearEnd: 2035 },
  { id: "era-2035-2045", name: "Transition énergétique", yearStart: 2035, yearEnd: 2045 },
  { id: "era-2045-2055", name: "Adaptation critique", yearStart: 2045, yearEnd: 2055 },
  { id: "era-2055-2065", name: "Résilience mondiale", yearStart: 2055, yearEnd: 2065 },
  { id: "era-2065-2075", name: "Héritage durable", yearStart: 2065, yearEnd: 2075 }
];

// Définition des missions (copie exacte de celles définies dans js/modules/missions.js)
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
  }
];

// Classe simplifiée pour les missions (pour éviter les erreurs d'importation)
export const missionSystem = {
  currentMissions: [],
  completedMissions: [],
  unlockedMissions: ["stability-2035", "sea-level-control"],
  initialize: function() {
    console.log("Système de missions fallback initialisé");
    return this;
  },
  checkMissionObjectives: function(missionId) {
    return { completed: false, progress: 0 };
  }
};

// Indiquer que ce module a été chargé
console.log("Module fallback de missions chargé avec succès");

// Rendre les missions disponibles globalement
window.missions = missions;
window.CLIMATE_ERAS = CLIMATE_ERAS;
