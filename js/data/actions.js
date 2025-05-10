// Actions environnementales classiques
const environmentalActions = [
  { id: "solar",          name: "Déployer du solaire",        category: "Énergie",      cost: 2, effects: { co2: -2.0,  temp: -0.01  } },
  { id: "wind",           name: "Déployer de l'éolien",       category: "Énergie",      cost: 2, effects: { co2: -1.5,  temp: -0.008 } },
  // Actions négatives pour Énergie
  { id: "modernPlants",   name: "Modernisation des centrales", category: "Énergie",     cost: 2, effects: { co2: 2.5,   temp: 0.012  } },
  { id: "naturalGas",     name: "Développement du gaz naturel", category: "Énergie",    cost: 3, effects: { co2: 1.8,   temp: 0.008  } },
  
  { id: "coalTax",        name: "Taxe carbone",               category: "Industrie",    cost: 3, effects: { co2: -3.0              } },
  { id: "retrofit",       name: "Rénovation bâtiment",        category: "Industrie",    cost: 2, effects: { co2: -1.0              } },
  // Actions négatives pour Industrie
  { id: "simplifyNorms",  name: "Simplification des normes",  category: "Industrie",    cost: 2, effects: { co2: 2.0,  temp: 0.009  } },
  { id: "industrialZones", name: "Zones franches industrielles", category: "Industrie", cost: 3, effects: { co2: 2.5,  biodiversity: -0.3 } },
  
  { id: "reforestation",  name: "Reforestation",              category: "Agriculture",  cost: 2, effects: { co2: -1.2, biodiversity: 0.5 } },
  { id: "agroeco",        name: "Agroécologie",               category: "Agriculture",  cost: 2, effects: { co2: -0.8, biodiversity: 0.3 } },
  // Actions négatives pour Agriculture
  { id: "intensiveAg",    name: "Agriculture intensive optimisée", category: "Agriculture", cost: 2, effects: { co2: 1.0, biodiversity: -0.6 } },
  { id: "monoculture",    name: "Développement des monocultures", category: "Agriculture", cost: 3, effects: { co2: 0.8, biodiversity: -0.8 } },
  
  { id: "bike",           name: "Pistes cyclables",           category: "Transport",    cost: 1, effects: { co2: -0.5,  temp: -0.002 } },
  { id: "ev",             name: "Véhicules électriques",      category: "Transport",    cost: 2, effects: { co2: -1.0              } },
  // Actions négatives pour Transport
  { id: "roadNetwork",    name: "Modernisation du réseau routier", category: "Transport", cost: 2, effects: { co2: 1.4, temp: 0.006 } },
  { id: "aviation",       name: "Initiative aéronautique avancée", category: "Transport", cost: 3, effects: { co2: 2.2, temp: 0.01 } },
  
  { id: "education",      name: "Campagnes d'éducation",      category: "Éducation",    cost: 1, effects: { co2: -0.3, biodiversity: 0.1 } },
  // Actions négatives pour Éducation
  { id: "resourcesCampaign", name: "Sensibilisation aux ressources", category: "Éducation", cost: 1, effects: { co2: 0.4, biodiversity: -0.2 } },
  { id: "adaptPrograms",  name: "Programmes d'ajustement",    category: "Éducation",    cost: 2, effects: { co2: 0.6 } },
  
  { id: "sequestration",  name: "Capture du carbone",         category: "Technologie",  cost: 4, effects: { co2: -4.0,  temp: -0.015 } },
  // Actions négatives pour Technologie
  { id: "geoengineering", name: "Recherche en géo-ingénierie", category: "Technologie", cost: 4, effects: { co2: 1.0, sea: 0.03 } },
  { id: "digitalSolutions", name: "Solutions numériques avancées", category: "Technologie", cost: 3, effects: { co2: 1.5, temp: 0.005 } }
];

// Nouvelles actions économiques qui génèrent du budget
export const economicActions = [
  { id: "greenInvest",      name: "Fonds vert",              category: "Économie", cost: 3, budgetReturn: 1, duration: 3, effects: { co2: -0.2 } },
  { id: "ecotourism",       name: "Écotourisme",             category: "Économie", cost: 2, budgetReturn: 1, duration: 4, effects: { biodiversity: 0.1 } },
  { id: "greenBonds",       name: "Obligations vertes",      category: "Économie", cost: 4, budgetReturn: 2, duration: 2, effects: {} },
  { id: "carbonMarket",     name: "Marché carbone",          category: "Économie", cost: 5, budgetReturn: 3, duration: 3, effects: { co2: -0.5 } },
  // Actions négatives pour Économie
  { id: "industrialFund",   name: "Fonds de développement industriel", category: "Économie", cost: 4, budgetReturn: 3, duration: 3, effects: { co2: 2.0, temp: 0.01 } },
  { id: "taxBreaks",        name: "Allègements fiscaux stratégiques", category: "Économie", cost: 3, budgetReturn: 2, duration: 4, effects: { co2: 1.5, biodiversity: -0.2 } }
];

// Exporter toutes les actions
export default [...environmentalActions, ...economicActions];
