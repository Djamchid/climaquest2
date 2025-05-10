import {DEFAULT_STATE, TIPPING_POINTS, FEEDBACK_LOOPS} from '../data/climate-model.js';
import actions from '../data/actions.js';
import events from '../data/events.js';
import {saveState, loadState} from './storage.js';

// Remplacer structuredClone par JSON parse/stringify
export let state = loadState() || JSON.parse(JSON.stringify(DEFAULT_STATE));
export let yearIndex = 0;
export let activeInvestments = []; // Pour suivre les investissements actifs
export let previousState = JSON.parse(JSON.stringify(state)); // Pour le suivi des tendances

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
  
  // Mettre à jour l'historique
  updateHistory();
  
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
  
  // Mettre à jour l'historique
  updateHistory();
}

// Nouvelle fonction pour calculer l'impact du CO₂ sur la température
function calculateTemperatureEffect() {
  const {baselineCO2, climateSensitivity, thermalInertia} = state.climateModel;
  
  // Calcul de l'effet de température basé sur le niveau actuel de CO₂
  const tempEffect = (state.co2 - baselineCO2) * climateSensitivity;
  
  // Calcul de la nouvelle température cible
  const targetTemp = tempEffect;
  
  console.log(`Température cible calculée: ${targetTemp.toFixed(2)}°C (température actuelle: ${state.temp.toFixed(2)}°C)`);
  
  // Application de l'inertie thermique
  state.temp = state.temp + (targetTemp - state.temp) * thermalInertia;
  console.log(`Nouvelle température après inertie: ${state.temp.toFixed(2)}°C`);
}

// Nouvelle fonction pour calculer l'impact de la température sur le niveau de la mer
function calculateSeaLevelEffect() {
  const {seaLevelSensitivity} = state.climateModel;
  
  // La montée des eaux est proportionnelle à l'excès de température
  if (state.temp > 0) {
    const seaLevelEffect = state.temp * seaLevelSensitivity;
    state.sea += seaLevelEffect;
    console.log(`Effet sur le niveau de la mer: +${seaLevelEffect.toFixed(4)} m`);
  }
}

// Nouvelle fonction pour appliquer les boucles de rétroaction
function applyFeedbackLoops() {
  // Fonte des glaces (perte d'albédo)
  if (state.temp > FEEDBACK_LOOPS.albedo.threshold) {
    const albedoEffect = Math.max(0, (state.temp - FEEDBACK_LOOPS.albedo.threshold) * FEEDBACK_LOOPS.albedo.effect);
    state.temp += albedoEffect;
    console.log(`Effet albédo (perte de réflectivité): +${albedoEffect.toFixed(4)}°C`);
  }
  
  // Libération de méthane par le permafrost
  if (state.temp > FEEDBACK_LOOPS.permafrost.threshold && !state.tippingPoints.permafrost) {
    const permafrostEffect = Math.max(0, (state.temp - FEEDBACK_LOOPS.permafrost.threshold) * FEEDBACK_LOOPS.permafrost.effect);
    state.co2 += permafrostEffect;
    console.log(`Effet permafrost (méthane): +${permafrostEffect.toFixed(2)} CO₂ équivalent`);
  }
  
  // Effet de la biodiversité sur la capture du carbone
  if (state.biodiversity > 0) {
    const biodiversityEffect = state.biodiversity * FEEDBACK_LOOPS.biodiversity.effect;
    state.co2 -= biodiversityEffect;
    console.log(`Effet biodiversité (capture de carbone): -${biodiversityEffect.toFixed(2)} CO₂`);
  }
  
  // Saturation des puits de carbone océaniques
  if (state.co2 > FEEDBACK_LOOPS.oceanSaturation.threshold) {
    const saturationFactor = Math.max(0, 1 - ((state.co2 - FEEDBACK_LOOPS.oceanSaturation.threshold) / 100) * FEEDBACK_LOOPS.oceanSaturation.effect);
    // Réduire l'efficacité des actions de réduction de CO₂
    console.log(`Saturation des puits de carbone: efficacité réduite à ${(saturationFactor * 100).toFixed(0)}%`);
  }
}

// Nouvelle fonction pour vérifier les points de bascule
function checkTippingPoints() {
  let tippingPointsTriggered = false;
  const triggeredPoints = [];
  
  TIPPING_POINTS.forEach(tp => {
    // Vérifier si le point de bascule est déjà activé
    if (state.tippingPoints[tp.id]) return;
    
    // Vérifier si le seuil est dépassé
    let thresholdExceeded = false;
    
    if (tp.threshold.type === 'temp' && state.temp > tp.threshold.value) {
      thresholdExceeded = true;
    } else if (tp.threshold.type === 'co2' && state.co2 > tp.threshold.value) {
      thresholdExceeded = true;
    } else if (tp.threshold.type === 'sea' && state.sea > tp.threshold.value) {
      thresholdExceeded = true;
    }
    
    if (thresholdExceeded) {
      // Activer le point de bascule
      state.tippingPoints[tp.id] = true;
      tippingPointsTriggered = true;
      triggeredPoints.push(tp);
      
      // Appliquer les effets
      Object.entries(tp.effects).forEach(([k, v]) => {
        if (state[k] !== undefined) {
          state[k] += v;
          console.log(`Point de bascule "${tp.name}" atteint: ${k} ${v > 0 ? '+' : ''}${v}`);
        }
      });
    }
  });
  
  return triggeredPoints.length > 0 ? triggeredPoints : false;
}

// Nouvelle fonction pour simuler l'augmentation naturelle des émissions
function naturalEmissionsIncrease() {
  const {naturalEmissions, emissionsGrowthRate} = state.climateModel;
  
  // La croissance des émissions devient exponentielle sans action
  const yearsSinceStart = state.year - 2025;
  const emissionsIncrease = naturalEmissions * Math.pow(1 + emissionsGrowthRate, yearsSinceStart);
  
  state.co2 += emissionsIncrease;
  console.log(`Augmentation naturelle des émissions: +${emissionsIncrease.toFixed(2)} CO₂`);
}

// Fonction pour mettre à jour l'historique des données
function updateHistory() {
  state.history.co2.push(state.co2);
  state.history.temp.push(state.temp);
  state.history.sea.push(state.sea);
  
  // Limiter la taille de l'historique pour des performances optimales
  const maxHistorySize = 20;
  if (state.history.co2.length > maxHistorySize) {
    state.history.co2 = state.history.co2.slice(-maxHistorySize);
    state.history.temp = state.history.temp.slice(-maxHistorySize);
    state.history.sea = state.history.sea.slice(-maxHistorySize);
  }
}

export function nextTurn(){
  console.log("Passage au tour suivant");
  
  // Sauvegarder l'état précédent pour le suivi des tendances
  previousState = JSON.parse(JSON.stringify(state));
  
  // Simulation des émissions naturelles
  naturalEmissionsIncrease();
  
  // Application des modèles climatiques
  calculateTemperatureEffect();
  calculateSeaLevelEffect();
  applyFeedbackLoops();
  
  // Vérification des points de bascule
  const triggeredTippingPoints = checkTippingPoints();
  
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
  
  // Mettre à jour l'historique
  updateHistory();

  saveState(state);
  console.log("État sauvegardé:", JSON.stringify(state));
  
  // Retourner à la fois l'événement et les points de bascule déclenchés
  return { 
    event: ev,
    tippingPoints: triggeredTippingPoints 
  };
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
  
  // Vérifier si l'état actuel a déjà les nouvelles propriétés, sinon les ajouter
  if (!state.tippingPoints) {
    state.tippingPoints = DEFAULT_STATE.tippingPoints;
  }
  
  if (!state.climateModel) {
    state.climateModel = DEFAULT_STATE.climateModel;
  }
  
  if (!state.history) {
    state.history = {
      co2: [state.co2],
      temp: [state.temp],
      sea: [state.sea]
    };
  }
  
  // Initialiser previousState
  previousState = JSON.parse(JSON.stringify(state));
  
  saveState(state);
}

export {actions, previousState};
