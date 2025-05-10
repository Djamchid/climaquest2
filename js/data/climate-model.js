// Modèle climatique amélioré avec des paramètres supplémentaires
export const DEFAULT_STATE = {
  year: 2025,
  budget: 10,
  co2: 410,        // ppm (parties par million)
  temp: 1.1,       // +°C vs préindustriel
  sea: 0,          // mètres vs 2025
  biodiversity: 0,  // index simplifié (-5 à +5)
  
  // Nouveaux paramètres pour le modèle amélioré
  tippingPoints: {
    greenland: false,      // Point de bascule Groenland atteint
    westAntarctica: false, // Point de bascule Antarctique Ouest atteint
    amazon: false,         // Point de bascule forêt amazonienne atteint
    permafrost: false      // Point de bascule dégel du permafrost atteint
  },
  
  // Constantes du modèle climatique
  climateModel: {
    baselineCO2: 280,          // Niveau préindustriel en ppm
    climateSensitivity: 0.008, // °C par ppm de CO₂
    thermalInertia: 0.1,       // Facteur d'inertie thermique (0-1)
    seaLevelSensitivity: 0.02, // Montée des eaux par degré par an
    naturalEmissions: 2.0,     // Émissions naturelles de base en ppm/an
    emissionsGrowthRate: 0.002 // Taux de croissance annuel des émissions
  },
  
  // Historique pour le suivi des tendances
  history: {
    co2: [410],
    temp: [1.1],
    sea: [0]
  }
};

// Paramètres pour les points de bascule
export const TIPPING_POINTS = [
  {
    id: 'greenland',
    name: 'Fonte du Groenland',
    threshold: { type: 'temp', value: 2.0 },
    effects: { sea: 0.05 },
    description: 'La fonte du Groenland s'accélère irréversiblement'
  },
  {
    id: 'westAntarctica',
    name: 'Instabilité de l\'Antarctique Ouest',
    threshold: { type: 'temp', value: 2.5 },
    effects: { sea: 0.08 },
    description: 'L\'Antarctique Ouest commence à s\'effondrer'
  },
  {
    id: 'amazon',
    name: 'Dépérissement de l\'Amazonie',
    threshold: { type: 'temp', value: 3.0 },
    effects: { co2: 5.0, biodiversity: -1.0 },
    description: 'La forêt amazonienne commence à se transformer en savane'
  },
  {
    id: 'permafrost',
    name: 'Dégel du permafrost',
    threshold: { type: 'temp', value: 1.8 },
    effects: { co2: 3.0 },
    description: 'Le dégel du permafrost libère de grandes quantités de méthane'
  }
];

// Coefficients pour les boucles de rétroaction
export const FEEDBACK_LOOPS = {
  // Fonte des glaces (perte d'albédo)
  albedo: {
    threshold: 1.0,  // °C
    effect: 0.01     // °C par degré au-dessus du seuil par an
  },
  
  // Libération de méthane par le permafrost
  permafrost: {
    threshold: 1.5,  // °C
    effect: 0.4      // CO₂ équivalent par degré au-dessus du seuil par an
  },
  
  // Effet de la biodiversité sur la capture du carbone
  biodiversity: {
    effect: 0.2      // CO₂ capturé par point de biodiversité par an
  },
  
  // Saturation des puits de carbone océaniques
  oceanSaturation: {
    threshold: 450,  // ppm de CO₂
    effect: 0.1      // Réduction d'efficacité des puits par 10 ppm au-dessus du seuil
  }
};
