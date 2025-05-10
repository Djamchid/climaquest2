import {state, actions, applyAction, nextTurn} from './engine.js';

const yearEl = document.getElementById('year');
const tempEl = document.getElementById('temp');
const co2El  = document.getElementById('co2');
const seaEl  = document.getElementById('sea');
const mapCanvas = document.getElementById('map');
const ctx = mapCanvas.getContext('2d');

const actionsDiv = document.getElementById('actions');
const nextBtn = document.getElementById('nextBtn');

export function setupUI(){
  // Create action buttons
  actions.forEach(a=>{
    const btn=document.createElement('button');
    btn.textContent=`${a.name} (${a.cost})`;
    btn.className='action-btn';
    btn.addEventListener('click', ()=>{
      if(applyAction(a.id)){
        updateHUD();
        renderMap();
      }
    });
    actionsDiv.appendChild(btn);
  });

  nextBtn.addEventListener('click', ()=>{
    const ev = nextTurn();
    alert('Événement : '+ev.description);
    updateHUD();
    renderMap();
  });

  updateHUD();
}

function lerp(a,b,t){return a+(b-a)*t;}

export function renderMap(){
  // Simple gradient map: blue to red according to temperature
  const maxTemp=4, minTemp=0;
  const t = (state.temp - minTemp)/(maxTemp - minTemp);
  const r = Math.floor(lerp(0,255,t));
  const g = Math.floor(lerp(100,0,t));
  const b = Math.floor(lerp(150,0,t));
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0,0,mapCanvas.width,mapCanvas.height);

  // Simple land mass
  ctx.fillStyle='#228B22';
  ctx.fillRect(100,100,600,200);
}

function updateHUD(){
  yearEl.textContent = `Année: ${state.year}`;
  tempEl.textContent = `ΔT: ${state.temp.toFixed(2)}°C`;
  co2El.textContent  = `CO₂: ${state.co2.toFixed(0)} ppm`;
  seaEl.textContent  = `Niveau mer: ${state.sea.toFixed(2)} m`;
}
