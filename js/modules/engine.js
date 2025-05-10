import {DEFAULT_STATE} from '../data/climate-model.js';
import actions from '../data/actions.js';
import events from '../data/events.js';
import {saveState, loadState} from './storage.js';

// Remplacer structuredClone par JSON parse/stringify
export let state = loadState() || JSON.parse(JSON.stringify(DEFAULT_STATE));
export let yearIndex = 0;
export let activeInvestments = []; // Pour suivre les investissements actifs

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
  Object.entries(ev.effects).forEach(([k,v])=>{
    if(state[k] !== undefined) {
      state[k] += v;
    } else {
      console.warn(`Propriété ${k} non trouvée dans l'état`);
    }
  });
}

export function nextTurn(){
  console.log("Passage au tour suivant");
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
  return ev;
}

export function resetGame() {
  console.log("Réinitialisation du jeu");
  
  // Obtenir l'année actuelle
  const currentYear = new Date().getFullYear();
  
  // Créer un nouvel état à partir de DEFAULT_STATE, mais avec l'année actuelle
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  state.year = currentYear;
  
  // Réinitialiser les autres variables
  yearIndex = 0;
  activeInvestments = [];
  
  // Sauvegarder le nouvel état
  saveState(state);
  console.log("Jeu réinitialisé à l'état:", JSON.stringify(state));
  
  return true;
}

export function initGame(){
  console.log("Initialisation du jeu avec l'état:", JSON.stringify(state));
  saveState(state);
}

export {actions};
