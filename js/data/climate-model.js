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
  }
};
