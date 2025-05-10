import {DEFAULT_STATE} from '../data/climate-model.js';
import actions from '../data/actions.js';
import events from '../data/events.js';
import {saveState, loadState} from './storage.js';

// Remplacer structuredClone par JSON parse/stringify
export let state = loadState() || JSON.parse(JSON.stringify(DEFAULT_STATE));
export let yearIndex = 0;
export let activeInvestments = []; // Pour suivre les investissements actifs
export let previousState = {}; // Pour le suivi des tendances

// Sécuriser l'état pour s'assurer qu'il contient tous les champs nécessaires
function ensureStateFields() {
  // Vérifier si le state a toutes les propriétés nécessaires
  // et les ajouter si elles n'existent pas
  if (!state.tippingPoints) {
    state.tippingPoints = {
      greenland: false,
      westAntarctica: false,
      amazon: false,
      permafrost: false
    };
  }
  
  if (!state.biodiversity && state.biodiversity !== 0) {
    state.biodiversity = 0;
  }
  
  // Considérer le CO2 comme un facteur de température si ce n'est pas explicite
  if (state.temp === undefined && state.co2) {
    state.temp = ((state.co2 - 280) * 0.008);
  }
  
  // S'assurer que le niveau de la mer est défini
  if (state.sea === undefined) {
    state.sea = 0;
  }
}

export function applyAction(actionId){
  console.log(`Application de l'action ${actionId}`);
  const action = actions.find(a=>a.id===actionId);
  if(!action) {
    console.error(`Action ${actionId} non trouvée`);
    return false;
  }
  if(state.budget < action.cost) {
    console.log(`Budget insuffisant. Actuel: ${state.budget}, Requis: ${action.cost}`);
    return false;
  }
  
  // Sauvegarder l'état précédent pour le suivi des tendances
  previousState = JSON.parse(JSON.stringify(state));
  
  state.budget -= action.cost;
  
  // Si c'est un investissement avec retour budgétaire
  if(action.budgetReturn && action.duration) {
    activeInvestments.push({
      id: action.id,
      name: action.name,
      return: action.budgetReturn,
      remainingYears: action.duration
    });
    console.log(`Nouvel investissement ajouté: ${action.name}`);
  }
  
  Object.entries(action.effects).forEach(([k,v])=>{
    if(state[k] !== undefined) {
      state[k] += v;
    } else {
      console.warn(`Propriété ${k} non trouvée dans l'état`);
    }
  });
  
  console.log("État après action:", JSON.stringify(state));
  return true;
}

function applyEvent(ev){
  console.log(`Application de l'événement: ${ev.description}`);
  // Sauvegarder l'état précédent pour le suivi des tendances
  previousState = JSON.parse(JSON.stringify(state));
  
  Object.entries(ev.effects).forEach(([k,v])=>{
    if(state[k] !== undefined) {
      state[k] += v;
    } else {
      console.warn(`Propriété ${k} non trouvée dans l'état`);
    }
  });
}

// Calcule l'effet du CO2 sur la température
function calculateTemperatureEffect() {
  // Formule simplifiée basée sur la sensibilité climatique
  // Une augmentation de 100ppm de CO₂ entraîne environ +0.8°C
  const baselineCO2 = 280; // Niveau préindustriel en ppm
  const climateSensitivity = 0.008; // °C par ppm de CO₂
  
  // Calcul de l'effet de température basé sur le niveau actuel de CO₂
  const tempEffect = (state.co2 - baselineCO2) * climateSensitivity;
  
  // Ajout d'une inertie (la température ne change pas instantanément)
  const inertiaFactor = 0.1; // 10% de l'effet total par an
  
  // Appliquer l'effet avec inertie
  state.temp = state.temp + (tempEffect - state.temp) * inertiaFactor;
  console.log(`Température calculée: ${state.temp.toFixed(2)}°C`);
}

// Calcule l'impact de la température sur le niveau de la mer
function calculateSeaLevelEffect() {
  // Valeur simplifiée : chaque degré d'augmentation contribue à la montée des eaux
  const seaLevelSensitivity = 0.02; // Par an et par degré
  
  // La montée des eaux est proportionnelle à la température
  if (state.temp > 0) {
    const seaLevelEffect = state.temp * seaLevelSensitivity;
    state.sea += seaLevelEffect;
    console.log(`Montée des eaux: +${seaLevelEffect.toFixed(4)} m`);
  }
}

// Applique les boucles de rétroaction climatique
function applyFeedbackLoops() {
  // Fonte du permafrost libérant du méthane (accélère le réchauffement)
  if (state.temp > 1.5) {
    const permafrostEffect = Math.max(0, (state.temp - 1.5) * 0.4);
    state.co2 += permafrostEffect;
    console.log(`Effet permafrost: +${permafrostEffect.toFixed(2)} CO₂`);
  }
  
  // Perte d'albédo due à la fonte des glaces (accélère le réchauffement)
  if (state.temp > 1.0) {
    const albedoEffect = Math.max(0, (state.temp - 1.0) * 0.01);
    state.temp += albedoEffect;
    console.log(`Effet albédo: +${albedoEffect.toFixed(4)} °C`);
  }
  
  // Effet de la biodiversité sur la capture du carbone
  if (state.biodiversity > 0) {
    const biodiversityEffect = state.biodiversity * 0.2;
    state.co2 -= biodiversityEffect;
    console.log(`Effet biodiversité: -${biodiversityEffect.toFixed(2)} CO₂`);
  }
}

// Vérifie les points de bascule climatiques
function checkTippingPoints() {
  // Point de bascule : fonte irréversible du Groenland
  if (state.temp > 2.0 && !state.tippingPoints.greenland) {
    state.tippingPoints.greenland = true;
    state.sea += 0.05; // Effet immédiat
    console.log("POINT DE BASCULE: La fonte du Groenland s'accélère");
  }
  
  // Point de bascule : instabilité de l'Antarctique Ouest
  if (state.temp > 2.5 && !state.tippingPoints.westAntarctica) {
    state.tippingPoints.westAntarctica = true;
    state.sea += 0.08;
    console.log("POINT DE BASCULE: L'Antarctique Ouest commence à s'effondrer");
  }
  
  // Point de bascule : dépérissement de l'Amazonie
  if (state.temp > 3.0 && !state.tippingPoints.amazon) {
    state.tippingPoints.amazon = true;
    state.co2 += 5.0;
    state.biodiversity -= 1.0;
    console.log("POINT DE BASCULE: La forêt amazonienne commence à se transformer en savane");
  }
}

// Augmentation naturelle des émissions
function naturalEmissionsIncrease() {
  // Augmentation naturelle des émissions (0.2% par an)
  const emissionsGrowthRate = 0.002;
  const baseEmissions = 2.0; // ppm par an
  
  // La croissance des émissions devient exponentielle sans action
  const yearsSinceStart = state.year - 2025;
  const emissionsIncrease = baseEmissions * Math.pow(1 + emissionsGrowthRate, yearsSinceStart);
  
  state.co2 += emissionsIncrease;
  console.log(`Émissions naturelles: +${emissionsIncrease.toFixed(2)} CO₂`);
}

export function nextTurn(){
  console.log("Passage au tour suivant");
  
  // S'assurer que toutes les propriétés existent
  ensureStateFields();
  
  // Sauvegarder l'état précédent pour le suivi des tendances
  previousState = JSON.parse(JSON.stringify(state));
  
  // Simulation des émissions naturelles
  naturalEmissionsIncrease();
  
  // Application des modèles climatiques
  calculateTemperatureEffect();
  calculateSeaLevelEffect();
  applyFeedbackLoops();
  
  // Vérification des points de bascule
  checkTippingPoints();
  
  // Random event every year
  const ev = events[yearIndex % events.length];
  applyEvent(ev);
  yearIndex++;

  // Budget replenishment - base amount
  state.budget = 10;
  
  // Bonus budget basé sur les métriques environnementales
  // Bonus pour faible CO2
  if(state.co2 < 400) {
    state.budget += 2;
    console.log("Bonus de budget pour faible CO2: +2");
  }
  
  // Bonus pour biodiversité
  if(state.biodiversity > 1) {
    state.budget += 1;
    console.log("Bonus de budget pour biodiversité: +1");
  }
  
  // Retours sur investissements actifs
  let investmentReturns = 0;
  activeInvestments = activeInvestments.filter(inv => {
    if(inv.remainingYears > 0) {
      investmentReturns += inv.return;
      inv.remainingYears--;
      console.log(`Retour sur ${inv.name}: +${inv.return} (${inv.remainingYears} années restantes)`);
      return true; // Garder cet investissement
    }
    console.log(`Investissement ${inv.name} terminé`);
    return false; // Retirer cet investissement
  });
  
  state.budget += investmentReturns;
  console.log(`Total des retours sur investissement: +${investmentReturns}`);

  state.year +=1;

  saveState(state);
  console.log("État sauvegardé:", JSON.stringify(state));
  
  // Retourner simplement l'événement pour compatibilité avec le code existant
  return ev;
}

export function resetGame() {
  console.log("Réinitialisation du jeu");
  
  // Obtenir l'année actuelle
  const currentYear = new Date().getFullYear();
  
  // Créer un nouvel état à partir de DEFAULT_STATE
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  
  // Mettre à jour l'année si nécessaire
  if (currentYear > 2025) {
    state.year = currentYear;
  }
  
  // Réinitialiser les autres variables
  yearIndex = 0;
  activeInvestments = [];
  previousState = JSON.parse(JSON.stringify(state));
  
  // Sauvegarder le nouvel état
  saveState(state);
  console.log("Jeu réinitialisé à l'état:", JSON.stringify(state));
  
  return true;
}

export function initGame(){
  console.log("Initialisation du jeu avec l'état:", JSON.stringify(state));
  
  // S'assurer que toutes les propriétés sont définies
  ensureStateFields();
  
  // Initialiser previousState
  previousState = JSON.parse(JSON.stringify(state));
  
  saveState(state);
}

export {actions};
