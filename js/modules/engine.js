import {DEFAULT_STATE} from '../data/climate-model.js';
import actions from '../data/actions.js';
import events from '../data/events.js';
import {saveState, loadState} from './storage.js';

// Remplacer structuredClone par JSON parse/stringify
export let state = loadState() || JSON.parse(JSON.stringify(DEFAULT_STATE));
export let yearIndex = 0;

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

  // Budget replenishment
  state.budget = 10;
  state.year +=1;

  saveState(state);
  console.log("État sauvegardé:", JSON.stringify(state));
  return ev;
}

export function initGame(){
  console.log("Initialisation du jeu avec l'état:", JSON.stringify(state));
  saveState(state);
}

export {actions};
