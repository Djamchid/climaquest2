export default [
  { id: "solar",          name: "Déployer du solaire",        category: "Énergie",      cost: 2, effects: { co2: -2.0,  temp: -0.01  } },
  { id: "wind",           name: "Déployer de l'éolien",       category: "Énergie",      cost: 2, effects: { co2: -1.5,  temp: -0.008 } },
  { id: "coalTax",        name: "Taxe carbone",               category: "Industrie",    cost: 3, effects: { co2: -3.0              } },
  { id: "retrofit",       name: "Rénovation bâtiment",        category: "Industrie",    cost: 2, effects: { co2: -1.0              } },
  { id: "reforestation",  name: "Reforestation",              category: "Agriculture",  cost: 2, effects: { co2: -1.2, biodiversity: 0.5 } },
  { id: "agroeco",        name: "Agroécologie",               category: "Agriculture",  cost: 2, effects: { co2: -0.8, biodiversity: 0.3 } },
  { id: "bike",           name: "Pistes cyclables",           category: "Transport",    cost: 1, effects: { co2: -0.5,  temp
