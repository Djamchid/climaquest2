// Actions environnementales classiques
const environmentalActions = [
  { id: "solar",          name: "Déployer du solaire",        category: "Énergie",      cost: 2, effects: { co2: -2.0,  temp: -0.01  } },
  { id: "wind",           name: "Déployer de l'éolien",       category: "Énergie",      cost: 2, effects: { co2: -1.5,  temp: -0.008 } },
  { id: "coalTax",        name: "Taxe carbone",               category: "Industrie",    cost: 3, effects: { co2: -3.0              } },
  { id: "retrofit",       name: "Rénovation bâtiment",        category: "Industrie",    cost: 2, effects: { co2: -1.0              } },
  { id: "reforestation",  name: "Reforestation",              category: "Agriculture",  cost: 2, effects: { co2: -1.2, biodiversity: 0.5 } },
  { id: "agroeco",        name: "Agroécologie",               category: "Agriculture",  cost: 2, effects: { co2: -0.8, biodiversity: 0.3 } },
  { id: "bike",           name: "Pistes cyclables",           category: "Transport",    cost: 1, effects: { co2: -0.5,  temp: -0.002 } },
  { id: "ev",             name: "Véhicules électriques",      category: "Transport",    cost: 2, effects: { co2: -1.0              } },
  { id: "education",      name: "Campagnes d'éducation",      category: "Éducation",    cost: 1, effects: { co2: -0.3, biodiversity: 0.1 } },
  { id: "sequestration",  name: "Capture du carbone",         category: "Technologie",  cost: 4, effects: { co2: -4.0,  temp: -0.015 } }
];

// Nouvelles actions économiques qui génèrent du budget
export const economicActions = [
  { id: "greenInvest",      name: "Fonds vert",              category: "Économie", cost: 3, budgetReturn: 1, duration: 3, effects: { co2: -0.2 } },
  { id: "ecotourism",       name: "Écotourisme",             category: "Économie", cost: 2, budgetReturn: 1, duration: 4, effects: { biodiversity: 0.1 } },
  { id: "greenBonds",       name: "Obligations vertes",      category: "Économie", cost: 4, budgetReturn: 2, duration: 2, effects: {} },
  { id: "carbonMarket",     name: "Marché carbone",          category: "Économie", cost: 5, budgetReturn: 3, duration: 3, effects: { co2: -0.5 } }
];

// Exporter toutes les actions
export default [...environmentalActions, ...economicActions];
