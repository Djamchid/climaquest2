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
  try {
    console.log("Configuration de l'interface...");
    console.log("Éléments DOM trouvés:", {
      yearEl, tempEl, co2El, seaEl, mapCanvas, actionsDiv, nextBtn
    });
    
    // Vérifier que tous les éléments sont trouvés
    if(!yearEl || !tempEl || !co2El || !seaEl || !mapCanvas || !actionsDiv || !nextBtn) {
      throw new Error("Certains éléments DOM n'ont pas été trouvés");
    }
    
    // Create action buttons
    actions.forEach(a=>{
      const btn=document.createElement('button');
      btn.textContent=`${a.name} (${a.cost})`;
      btn.className='action-btn';
      btn.dataset.actionId = a.id; // Ajouter l'ID comme attribut data
      btn.addEventListener('click', function() {
        console.log(`Action cliquée: ${a.name} (${a.id})`);
        if(applyAction(a.id)){
          updateHUD();
          renderMap();
          console.log("Action appliquée avec succès");
        } else {
          console.log("Action non appliquée (budget insuffisant?)");
        }
      });
      actionsDiv.appendChild(btn);
    });
    
    console.log(`${actions.length} boutons d'action créés`);

    nextBtn.addEventListener('click', function() {
      console.log("Passage au tour suivant");
      const ev = nextTurn();
      alert('Événement : '+ev.description);
      updateHUD();
      renderMap();
    });

    updateHUD();
    console.log("Interface configurée avec succès");
  } catch (error) {
    console.error("Erreur lors de la configuration de l'interface:", error);
    alert(`Erreur lors de la configuration: ${error.message}`);
  }
}

function lerp(a,b,t){return a+(b-a)*t;}

export function renderMap(){
  try {
    console.log("Rendu de la carte...");
    // Simple gradient map: blue to red according to temperature
    const maxTemp=4, minTemp=0;
    const t = Math.max(0, Math.min(1, (state.temp - minTemp)/(maxTemp - minTemp)));
    const r = Math.floor(lerp(0,255,t));
    const g = Math.floor(lerp(100,0,t));
    const b = Math.floor(lerp(150,0,t));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0,0,mapCanvas.width,mapCanvas.height);

    // Simple land mass
    ctx.fillStyle='#228B22';
    ctx.fillRect(100,100,600,200);
    
    // Niveau de la mer
    const seaLevel = 300 + state.sea * 50; // Représentation simple du niveau de la mer
    ctx.fillStyle='rgba(0,0,200,0.3)';
    ctx.fillRect(0, seaLevel, mapCanvas.width, mapCanvas.height - seaLevel);
    
    console.log("Carte rendue avec succès");
  } catch (error) {
    console.error("Erreur lors du rendu de la carte:", error);
  }
}

function updateHUD(){
  try {
    console.log("Mise à jour du HUD avec l'état:", JSON.stringify(state));
    yearEl.textContent = `Année: ${state.year}`;
    tempEl.textContent = `ΔT: ${state.temp.toFixed(2)}°C`;
    co2El.textContent  = `CO₂: ${state.co2.toFixed(0)} ppm`;
    seaEl.textContent  = `Niveau mer: ${state.sea.toFixed(2)} m`;
    
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
    
    console.log("HUD mis à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du HUD:", error);
  }
}
