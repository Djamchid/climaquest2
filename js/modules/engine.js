import {DEFAULT_STATE} from '../data/climate-model.js';
import actions from '../data/actions.js';
import events from '../data/events.js';
import {saveState, loadState} from './storage.js';

export let state = loadState() || structuredClone(DEFAULT_STATE);
export let yearIndex = 0;

export function applyAction(actionId){
  const action = actions.find(a=>a.id===actionId);
  if(!action || state.budget < action.cost) return false;
  state.budget -= action.cost;
  Object.entries(action.effects).forEach(([k,v])=>{
    state[k] += v;
  });
  return true;
}

function applyEvent(ev){
  Object.entries(ev.effects).forEach(([k,v])=>{
    state[k] += v;
  });
}

export function nextTurn(){
  // Random event every year
  const ev = events[yearIndex % events.length];
  applyEvent(ev);
  yearIndex++;

  // Budget replenishment
  state.budget = 10;
  state.year +=1;

  saveState(state);
  return ev;
}

export function initGame(){
  saveState(state);
}

export {actions};
