import {state, actions, applyAction, nextTurn, activeInvestments, resetGame, previousState} from './engine.js';
// Fonction pour obtenir l'icône SVG correspondant à chaque action
function getActionIcon(actionId) {
  // Définition des icônes par ID d'action
  const icons = {
    // Énergie
    "solar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FFC107"><path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 S11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0 s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"></path></svg>`,
    
    "wind": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#03A9F4"><path d="M14.5 17c0 1.65-1.35 3-3 3s-3-1.35-3-3h2c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1H2v-2h9.5c1.65 0 3 1.35 3 3zM19 6.5C19 4.57 17.43 3 15.5 3S12 4.57 12 6.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S16.33 8 15.5 8H2v2h13.5c1.93 0 3.5-1.57 3.5-3.5zm-.5 4.5H2v2h16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5v2c1.93 0 3.5-1.57 3.5-3.5S20.43 11 18.5 11z"></path></svg>`,
    
    "modernPlants": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#F44336"><path d="M8 3h8v18H3V8h5V3zm8 2H9v15h7V5zM4 9v11h3V9H4z M12 11h2v2h-2z M12 15h2v2h-2z M12 7h2v2h-2z"></path></svg>`,
    
    "naturalGas": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FF9800"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"></path></svg>`,
    
    // Industrie
    "coalTax": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#9C27B0"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg>`,
    
    "retrofit": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#9C27B0"><path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h6v-6h2v6h6v-8h3l-3-2.7zm-9 .7c0-1.1.9-2 2-2s2 .9 2 2h-4z"></path></svg>`,
    
    "simplifyNorms": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#9C27B0"><path d="M7 11h10v2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>`,
    
    "industrialZones": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#9C27B0"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"></path></svg>`,
    
    // Agriculture
    "reforestation": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#4CAF50"><path d="M17 12h2L12 3 5 12h2v4H4v2h16v-2h-3v-4zm-5-5.17l2.17 2.17H14v4h-2v-6.17zM10 13v-4h2v4h-2z"></path><path d="M17 12h2L12 3 5 12h2v4H4v2h16v-2h-3v-4zm-5-5.17l2.17 2.17H14v4h-2v-6.17zM10 13v-4h2v4h-2z"></path></svg>`,
    
    "agroeco": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#4CAF50"><path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z"></path></svg>`,
    
    "intensiveAg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#4CAF50"><path d="M19 3H5v2h14V3zm0 4H5v2h14V7zm0 4H5v2h14v-2zm0 4H5v2h14v-2z"></path></svg>`,
    
    "monoculture": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#4CAF50"><path d="M12 3.5c-4.68 0-8.5 3.82-8.5 8.5 0 .76.07 1.5.2 2.22L2.17 16l2.89 2.91 1.69-1.69c.73.17 1.5.28 2.25.28 4.68 0 8.5-3.82 8.5-8.5S16.68 3.5 12 3.5zM12 19l-6 3 3-6-3-6 6 3 6-3-3 6 3 6-6-3z"></path></svg>`,
    
    // Transport
    "bike": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#3F51B5"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10 2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"></path></svg>`,
    
    "ev": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#3F51B5"><path d="M18.58 5H15V3H9v2H5.43L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.42-7zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path><polygon points="7,12 15,12 15,15 7,15"></polygon></svg>`,
    
    "roadNetwork": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#3F51B5"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"></path></svg>`,
    
    "aviation": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#3F51B5"><path d="M22 16v-2l-8.5-5V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z"></path></svg>`,
    
    // Éducation
    "education": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#E91E63"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"></path></svg>`,
    
    "resourcesCampaign": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#E91E63"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"></path></svg>`,
    
    "adaptPrograms": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#E91E63"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path></svg>`,
    
    // Technologie
    "sequestration": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#00BCD4"><path d="M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.78 5.66-2.35S20 15.64 20 13.64 19.22 9.56 17.66 8zM6 14c.01-2 .62-3.27 1.76-4.4L12 5.27l4.24 4.38C17.38 10.77 17.99 12 18 14H6z"></path></svg>`,
    
    "geoengineering": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#00BCD4"><path d="M19.8 10.7L4.2 5l-.7 1.9L17.6 12H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5.5c0-.8-.5-1.6-1.2-1.8zM7 17H5v-2h2v2zm12 0H9v-2h10v2z"></path></svg>`,
    
    "digitalSolutions": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#00BCD4"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"></path></svg>`,
    
    // Économie
    "greenInvest": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FF9800"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"></path></svg>`,
    
    "ecotourism": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FF9800"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"></path></svg>`,
    
    "greenBonds": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FF9800"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"></path></svg>`,
    
    "carbonMarket": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FF9800"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg>`,
    
    "industrialFund": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FF9800"><path d="M15.5 4.5c0 2-2.5 3.5-2.5 5h-2c0-1.5-2.5-3-2.5-5C8.5 3.1 9.6 2 11 2s2.5 1.1 2.5 2.5zm-2.5 6h-2V22h2V10.5z"></path></svg>`,
    
    "taxBreaks": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FF9800"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"></path></svg>`
  };
  
  // Si l'ID n'est pas trouvé, renvoyer une icône par défaut basée sur la catégorie
  return icons[actionId] || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#757575"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>`;
}

const yearEl = document.getElementById('year');
const budgetEl = document.getElementById('budget');
const tempEl = document.getElementById('temp');
const co2El  = document.getElementById('co2');
const seaEl  = document.getElementById('sea');
const biodiversityEl = document.getElementById('biodiversity'); // Ajout de la référence pour la biodiversité
const mapCanvas = document.getElementById('map');
const ctx = mapCanvas.getContext('2d');

const actionsDiv = document.getElementById('actions');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const investmentsDiv = document.getElementById('investments');
const noInvestmentsEl = document.getElementById('no-investments');
const categoryTabsDiv = document.getElementById('categoryTabs');

// Définir les catégories et leurs couleurs pour les onglets
const categories = [
  { id: 'all', name: 'Toutes' },
  { id: 'Énergie', name: 'Énergie' },
  { id: 'Industrie', name: 'Industrie' },
  { id: 'Agriculture', name: 'Agriculture' },
  { id: 'Transport', name: 'Transport' },
  { id: 'Éducation', name: 'Éducation' },
  { id: 'Technologie', name: 'Technologie' },
  { id: 'Économie', name: 'Économie' }
];

let activeCategory = 'all';

// Modification de la fonction qui crée les boutons dans setupUI
export function setupUI() {
  try {
    console.log("Configuration de l'interface...");
    console.log("Éléments DOM trouvés:", {
      yearEl, budgetEl, tempEl, co2El, seaEl, mapCanvas, actionsDiv, investmentsDiv, nextBtn
    });
    
    // Vérifier que tous les éléments sont trouvés
    if(!yearEl || !budgetEl || !tempEl || !co2El || !seaEl || !mapCanvas || !actionsDiv || !investmentsDiv || !nextBtn) {
      throw new Error("Certains éléments DOM n'ont pas été trouvés");
    }
    
    // Créer les onglets de catégories
    categories.forEach(category => {
      const tab = document.createElement('div');
      tab.className = 'category-tab';
      tab.textContent = category.name;
      tab.dataset.category = category.id;
      
      if (category.id === activeCategory) {
        tab.classList.add('active');
      }
      
      tab.addEventListener('click', function() {
        // Supprimer la classe active de tous les onglets
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        // Ajouter la classe active à l'onglet cliqué
        tab.classList.add('active');
        // Mettre à jour la catégorie active
        activeCategory = category.id;
        // Filtrer les actions par catégorie
        filterActionsByCategory();
      });
      
      categoryTabsDiv.appendChild(tab);
    });
    
    // Create action buttons with icons and info buttons
    actions.forEach(a => {
      const btn = document.createElement('button');
      const categoryClass = a.category ? a.category.toLowerCase() : '';
      
      // Obtenir l'icône pour cette action
      const actionIcon = getActionIcon(a.id);
      
      // Créer un conteneur pour le contenu du bouton (icône, nom, coût)
      const buttonContent = document.createElement('div');
      buttonContent.className = 'action-btn-content';
      buttonContent.innerHTML = `
        <div class="action-icon">${actionIcon}</div>
        <span class="action-name">${a.name}</span>
        <span class="action-cost">${a.cost} budget</span>
      `;
      
      // Créer le bouton d'info
      const infoBtn = document.createElement('div');
      infoBtn.className = 'action-info-btn';
      infoBtn.innerHTML = 'i';
      infoBtn.title = 'Voir les effets';
      
      // Empêcher la propagation du clic vers le bouton parent
      infoBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showActionInfo(a);
      });
      
      // Ajouter les éléments au bouton
      btn.appendChild(buttonContent);
      btn.appendChild(infoBtn);
      
      btn.className = `action-btn ${categoryClass}`;
      btn.dataset.actionId = a.id;
      btn.dataset.category = a.category;
      
      btn.addEventListener('click', function() {
        console.log(`Action cliquée: ${a.name} (${a.id})`);
        if(applyAction(a.id)){
          updateHUD();
          updateInvestments();
          renderMap();
          console.log("Action appliquée avec succès");
        } else {
          console.log("Action non appliquée (budget insuffisant?)");
        }
      });
      
      actionsDiv.appendChild(btn);
    });
    
    // Filtrer initialement pour afficher toutes les actions
    filterActionsByCategory();
    
    console.log(`${actions.length} boutons d'action créés`);

    nextBtn.addEventListener('click', function() {
      console.log("Passage au tour suivant");
      const ev = nextTurn();
      showEventNotification(ev.description);
      updateHUD();
      updateInvestments();
      renderMap();
    });
    
    // Ajouter l'écouteur d'événement pour le bouton de réinitialisation
    resetBtn.addEventListener('click', function() {
      console.log("Réinitialisation de la simulation");
      if (confirm('Êtes-vous sûr de vouloir recommencer la simulation ? Tout votre progrès sera perdu.')) {
        resetGame();
        updateHUD();
        updateInvestments();
        renderMap();
      }
    });

    updateHUD();
    updateInvestments();
    console.log("Interface configurée avec succès");
  } catch (error) {
    console.error("Erreur lors de la configuration de l'interface:", error);
    alert(`Erreur lors de la configuration: ${error.message}`);
  }
}

// Fonction pour afficher les informations sur l'action
function showActionInfo(action) {
  console.log(`Affichage des infos pour l'action: ${action.name}`);
  
  // Créer ou récupérer le modal
  let infoModal = document.getElementById('action-info-modal');
  if (!infoModal) {
    infoModal = document.createElement('div');
    infoModal.id = 'action-info-modal';
    document.body.appendChild(infoModal);
    
    // Ajouter un gestionnaire de clic pour fermer le modal
    infoModal.addEventListener('click', function(e) {
      if (e.target === infoModal) {
        infoModal.style.display = 'none';
      }
    });
  }
  
  // Générer le contenu du modal
  let effectsHTML = '';
  
  // Parcourir les effets de l'action
  if (action.effects) {
    effectsHTML += '<ul class="effects-list">';
    
    Object.entries(action.effects).forEach(([key, value]) => {
      // Déterminer la classe CSS et l'icône en fonction du signe de la valeur
      const isPositive = value < 0 && (key === 'co2') || value > 0 && key === 'biodiversity' || value < 0 && key === 'temp' || value < 0 && key === 'sea';
      const effectClass = isPositive ? 'positive-effect' : 'negative-effect';
      
      // Formater la valeur avec signe + ou -
      const formattedValue = value > 0 ? `+${value}` : value;
      
      // Déterminer le libellé pour chaque métrique
      let metricLabel;
      switch(key) {
        case 'co2': metricLabel = 'CO₂ (ppm)'; break;
        case 'temp': metricLabel = 'Température (°C)'; break;
        case 'sea': metricLabel = 'Niveau de la mer (m)'; break;
        case 'biodiversity': metricLabel = 'Biodiversité'; break;
        default: metricLabel = key;
      }
      
      effectsHTML += `<li class="${effectClass}"><span class="effect-label">${metricLabel}:</span> <span class="effect-value">${formattedValue}</span></li>`;
    });
    
    effectsHTML += '</ul>';
  } else {
    effectsHTML = '<p>Aucun effet direct sur l\'environnement.</p>';
  }
  
  // Ajouter les informations sur le retour sur investissement si applicable
  let budgetReturnHTML = '';
  if (action.budgetReturn && action.duration) {
    budgetReturnHTML = `
      <div class="budget-return-info">
        <h4>Retour sur investissement</h4>
        <p>+${action.budgetReturn} budget par tour pendant ${action.duration} tours</p>
      </div>
    `;
  }
  
  // Définir le contenu du modal
  infoModal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h3>${action.name}</h3>
      
      <div class="action-details">
        <div class="action-category">
          <strong>Catégorie:</strong> ${action.category}
        </div>
        <div class="action-cost-info">
          <strong>Coût:</strong> ${action.cost} budget
        </div>
      </div>
      
      <div class="effects-container">
        <h4>Effets sur l'environnement</h4>
        ${effectsHTML}
      </div>
      
      ${budgetReturnHTML}
    </div>
  `;
  
  // Ajouter un gestionnaire d'événements pour le bouton de fermeture
  const closeBtn = infoModal.querySelector('.close-modal');
  closeBtn.addEventListener('click', function() {
    infoModal.style.display = 'none';
  });
  
  // Afficher le modal
  infoModal.style.display = 'block';
}

// Ajouter un gestionnaire pour fermer le modal en appuyant sur Échap
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('action-info-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
});

function showEventNotification(text) {
  // Vérifier que les éléments existent avant de les utiliser
  const eventDescription = document.getElementById('eventDescription');
  const eventNotification = document.getElementById('eventNotification');
  
  if (!eventDescription || !eventNotification) {
    console.error("Éléments d'événement non trouvés dans le DOM");
    return;
  }
  
  // Mettre à jour le texte de la notification
  eventDescription.textContent = text;
  
  // Afficher la notification
  eventNotification.style.display = 'block';
  
  // Masquer la notification après 5 secondes
  setTimeout(() => {
    eventNotification.style.display = 'none';
  }, 5000);
}

function filterActionsByCategory() {
  document.querySelectorAll('.action-btn').forEach(btn => {
    if (activeCategory === 'all' || btn.dataset.category === activeCategory) {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  });
}

function updateInvestments() {
  try {
    // Vider le contenu actuel sauf le message "aucun investissement"
    Array.from(investmentsDiv.children)
      .filter(el => el.id !== 'no-investments')
      .forEach(el => el.remove());
    
    // Afficher/masquer le message "aucun investissement"
    if(activeInvestments.length === 0) {
      noInvestmentsEl.style.display = 'block';
      return;
    } else {
      noInvestmentsEl.style.display = 'none';
    }
    
    // Ajouter chaque investissement actif
    activeInvestments.forEach(inv => {
      const div = document.createElement('div');
      div.className = 'investment-item';
      div.innerHTML = `<strong>${inv.name}</strong>: +${inv.return} budget/tour (${inv.remainingYears} tours restants)`;
      investmentsDiv.appendChild(div);
    });
    
    console.log("Panneau d'investissements mis à jour");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des investissements:", error);
  }
}

function lerp(a,b,t){return a+(b-a)*t;}

// Fonction pour récupérer les tendances des variables climatiques
function getTrends() {
  // Vérifier si previousState est disponible et contient les propriétés nécessaires
  if (!previousState || typeof previousState !== 'object') {
    return {
      co2: 'stable',
      temp: 'stable',
      sea: 'stable'
    };
  }

  return {
    co2: state.co2 > (previousState.co2 || state.co2) ? 'up' : 
         (state.co2 < (previousState.co2 || state.co2) ? 'down' : 'stable'),
    temp: state.temp > (previousState.temp || state.temp) ? 'up' : 
          (state.temp < (previousState.temp || state.temp) ? 'down' : 'stable'),
    sea: state.sea > (previousState.sea || state.sea) ? 'up' : 
         (state.sea < (previousState.sea || state.sea) ? 'down' : 'stable')
  };
}

// Modifications à apporter à la fonction renderMap() dans js/modules/interface.js

export function renderMap(){
  try {
    console.log("Rendu de la carte...");
    // Clear the canvas
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    
    // Draw sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, mapCanvas.height/2);
    
    // Adjust sky color based on temperature (bluer for cooler, redder for warmer)
    const maxTemp=4, minTemp=0;
    const t = Math.max(0, Math.min(1, (state.temp - minTemp)/(maxTemp - minTemp)));
    
    skyGrad.addColorStop(0, `rgb(${Math.floor(135 + 120*t)}, ${Math.floor(206 - 106*t)}, 235)`);
    skyGrad.addColorStop(1, `rgb(${Math.floor(200 + 55*t)}, ${Math.floor(230 - 130*t)}, 255)`);
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height/2);
    
    // Draw ocean gradient - avec hauteur réduite
    const waterGrad = ctx.createLinearGradient(0, mapCanvas.height/2, 0, mapCanvas.height);
    waterGrad.addColorStop(0, '#1a8cff');
    waterGrad.addColorStop(1, '#005cb3');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, mapCanvas.height/2, mapCanvas.width, mapCanvas.height/2);
    
    // Draw land with more interesting shape
    ctx.beginPath();
    ctx.moveTo(50, mapCanvas.height/2);
    
    // Add some randomized hills and terrain
    let prevX = 50;
    const landY = mapCanvas.height/2;
    const hills = [];
    
    // Generate some "hills" - nombre réduit pour s'adapter à la hauteur
    for (let x = 100; x < mapCanvas.width - 100; x += 120) {
      const height = Math.random() * 40 + 25; // Hauteur réduite des collines
      hills.push({x, height});
    }
    
    // Sort hills by x coordinate
    hills.sort((a, b) => a.x - b.x);
    
    // Draw the land with hills
    ctx.beginPath();
    ctx.moveTo(0, landY);
    
    // Draw the first segment
    if (hills.length > 0) {
      ctx.quadraticCurveTo(
        hills[0].x / 2, 
        landY - hills[0].height / 3,
        hills[0].x, 
        landY - hills[0].height
      );
    }
    
    // Draw middle segments
    for (let i = 0; i < hills.length - 1; i++) {
      const cpX = (hills[i].x + hills[i+1].x) / 2;
      const cpY = landY - Math.min(hills[i].height, hills[i+1].height) * 0.8;
      
      ctx.quadraticCurveTo(
        cpX,
        cpY,
        hills[i+1].x,
        landY - hills[i+1].height
      );
    }
    
    // Draw the last segment
    if (hills.length > 0) {
      const lastHill = hills[hills.length - 1];
      ctx.quadraticCurveTo(
        (lastHill.x + mapCanvas.width) / 2,
        landY - lastHill.height / 3,
        mapCanvas.width,
        landY
      );
    }
    
    // Complete the land shape - partie souterraine réduite
    ctx.lineTo(mapCanvas.width, mapCanvas.height * 0.8); // Réduction de la profondeur
    ctx.lineTo(0, mapCanvas.height * 0.8); // Réduction de la profondeur
    ctx.closePath();
    
    // Create a land gradient (greener for low temperatures, browner for high)
    const landGrad = ctx.createLinearGradient(0, landY - 80, 0, mapCanvas.height * 0.8);
    landGrad.addColorStop(0, `rgb(${Math.floor(34 + 100*t)}, ${Math.floor(139 - 50*t)}, 34)`);
    landGrad.addColorStop(1, `rgb(${Math.floor(85 + 80*t)}, ${Math.floor(107 - 40*t)}, 47)`);
    
    ctx.fillStyle = landGrad;
    ctx.fill();
    
    // Niveau de la mer - maintenant avec animation de vagues
    const seaLevel = mapCanvas.height/2 - state.sea * 50; // Représentation simple du niveau de la mer
    
    // Dessiner quelques vagues simples
    ctx.fillStyle = 'rgba(26, 140, 255, 0.4)';
    
    // Dessiner les lignes du niveau de la mer
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Dessiner une ligne ondulée pour représenter le niveau de la mer
    const now = Date.now() / 1000;
    ctx.beginPath();
    for (let x = 0; x < mapCanvas.width; x += 5) {
      const y = seaLevel + Math.sin(x / 30 + now) * 2;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    console.log("Carte rendue avec succès");
  } catch (error) {
    console.error("Erreur lors du rendu de la carte:", error);
  }
}
function updateHUD(){
  try {
    console.log("Mise à jour du HUD avec l'état:", JSON.stringify(state));
    yearEl.innerHTML = `Année: <strong>${state.year}</strong>`; // Mise à jour pour meilleure visibilité
    budgetEl.textContent = `Budget: ${state.budget}`;
    tempEl.textContent = `ΔT: ${state.temp.toFixed(2)}°C`;
    co2El.textContent  = `CO₂: ${state.co2.toFixed(0)} ppm`;
    seaEl.textContent  = `Niveau mer: ${state.sea.toFixed(2)} m`;
    
    // Ajout de l'affichage pour la biodiversité
    if (biodiversityEl) {
      biodiversityEl.textContent = `Biodiversité: ${state.biodiversity.toFixed(1)}`;
    }
    
    // Mettre à jour l'état des boutons en fonction du budget
    document.querySelectorAll('.action-btn').forEach(btn => {
      const actionId = btn.dataset.actionId;
      const action = actions.find(a => a.id === actionId);
      if (action) {
        btn.disabled = state.budget < action.cost;
        if (btn.disabled) {
          btn.title = "Budget insuffisant";
        } else {
          btn.title = "";
        }
      }
    });
    
    // Mettre à jour l'apparence du HUD en fonction des métriques climatiques
    updateHUDAppearance();
    
    console.log("HUD mis à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du HUD:", error);
  }
}

function updateHUDAppearance() {
  // Changer l'apparence du HUD en fonction de l'état climatique
  const hud = document.getElementById('hud');
  
  // Température
  if (state.temp > 2.0) {
    tempEl.style.color = '#ff6b6b'; // Rouge pour danger
    tempEl.style.fontWeight = 'bold';
  } else if (state.temp > 1.5) {
    tempEl.style.color = '#ffa502'; // Orange pour avertissement
  } else {
    tempEl.style.color = 'white'; // Normal
    tempEl.style.fontWeight = 'normal';
  }
  
  // CO2
  if (state.co2 > 450) {
    co2El.style.color = '#ff6b6b';
    co2El.style.fontWeight = 'bold';
  } else if (state.co2 > 420) {
    co2El.style.color = '#ffa502';
  } else {
    co2El.style.color = 'white';
    co2El.style.fontWeight = 'normal';
  }
  
  // Niveau de la mer
  if (state.sea > 0.5) {
    seaEl.style.color = '#ff6b6b';
    seaEl.style.fontWeight = 'bold';
  } else if (state.sea > 0.2) {
    seaEl.style.color = '#ffa502';
  } else {
    seaEl.style.color = 'white';
    seaEl.style.fontWeight = 'normal';
  }
  
  // Biodiversité
  if (biodiversityEl) {
    if (state.biodiversity < -0.5) {
      biodiversityEl.style.color = '#ff6b6b';
      biodiversityEl.style.fontWeight = 'bold';
    } else if (state.biodiversity < 0) {
      biodiversityEl.style.color = '#ffa502';
    } else {
      biodiversityEl.style.color = 'white';
      biodiversityEl.style.fontWeight = 'normal';
    }
  }
}
