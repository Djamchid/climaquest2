import {state, actions, applyAction, nextTurn, activeInvestments, resetGame, previousState} from './engine.js';
import {TIPPING_POINTS} from '../data/climate-model.js';

const yearEl = document.getElementById('year');
const budgetEl = document.getElementById('budget');
const tempEl = document.getElementById('temp');
const co2El  = document.getElementById('co2');
const seaEl  = document.getElementById('sea');
const mapCanvas = document.getElementById('map');
const ctx = mapCanvas.getContext('2d');

const actionsDiv = document.getElementById('actions');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const investmentsDiv = document.getElementById('investments');
const noInvestmentsEl = document.getElementById('no-investments');
const categoryTabsDiv = document.getElementById('categoryTabs');
const eventNotification = document.getElementById('eventNotification');
const eventDescription = document.getElementById('eventDescription');

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

export function setupUI(){
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
    
    // Create action buttons
    actions.forEach(a => {
      const btn = document.createElement('button');
      const categoryClass = a.category ? a.category.toLowerCase() : '';
      
      // Créer le contenu du bouton avec coût et catégorie
      btn.innerHTML = `
        <span>${a.name}</span>
        <span class="action-cost">${a.cost} budget</span>
      `;
      
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
      const result = nextTurn();
      
      // Afficher notification d'événement
      showEventNotification(result.event.description);
      
      // Si des points de bascule ont été atteints, les afficher également
      if (result.tippingPoints) {
        result.tippingPoints.forEach(tp => {
          showTippingPointNotification(tp.description);
        });
      }
      
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

function showEventNotification(text) {
  // Mettre à jour le texte de la notification
  eventDescription.textContent = text;
  
  // Afficher la notification
  eventNotification.style.display = 'block';
  
  // Masquer la notification après 5 secondes
  setTimeout(() => {
    eventNotification.style.display = 'none';
  }, 5000);
}

// Nouvelle fonction pour afficher une notification de point de bascule
function showTippingPointNotification(text) {
  // Créer une nouvelle notification (puisque l'événement occupe déjà la première)
  const tippingNotification = document.createElement('div');
  tippingNotification.className = 'event-notification tipping-point-notification';
  tippingNotification.style.top = '100px'; // Positionner sous la notification d'événement
  tippingNotification.style.backgroundColor = '#e91e63'; // Couleur différente pour les alertes
  
  const title = document.createElement('h3');
  title.textContent = 'POINT DE BASCULE ATTEINT';
  
  const description = document.createElement('p');
  description.textContent = text;
  
  tippingNotification.appendChild(title);
  tippingNotification.appendChild(description);
  
  document.body.appendChild(tippingNotification);
  
  // Masquer la notification après 8 secondes (plus longue que les événements normaux)
  setTimeout(() => {
    tippingNotification.remove();
  }, 8000);
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
  return {
    co2: state.co2 > previousState.co2 ? 'up' : (state.co2 < previousState.co2 ? 'down' : 'stable'),
    temp: state.temp > previousState.temp ? 'up' : (state.temp < previousState.temp ? 'down' : 'stable'),
    sea: state.sea > previousState.sea ? 'up' : (state.sea < previousState.sea ? 'down' : 'stable')
  };
}

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
    
    // Draw ocean gradient
    const waterGrad = ctx.createLinearGradient(0, mapCanvas.height/2, 0, mapCanvas.height);
    waterGrad.addColorStop(0, '#1a8cff');
    waterGrad.addColorStop(1, '#005cb3');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, mapCanvas.height/2, mapCanvas.width, mapCanvas.height/2);
    
    // Ajout de visualisation de CO2 dans l'atmosphère
    drawCO2Particles(t);
    
    // Draw land with more interesting shape
    ctx.beginPath();
    ctx.moveTo(50, mapCanvas.height/2);
    
    // Add some randomized hills and terrain
    let prevX = 50;
    const landY = mapCanvas.height/2;
    const hills = [];
    
    // Generate some "hills"
    for (let x = 100; x < mapCanvas.width - 100; x += 100) {
      const height = Math.random() * 50 + 30;
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
    
    // Complete the land shape
    ctx.lineTo(mapCanvas.width, mapCanvas.height);
    ctx.lineTo(0, mapCanvas.height);
    ctx.closePath();
    
    // Create a land gradient (greener for low temperatures, browner for high)
    const landGrad = ctx.createLinearGradient(0, landY - 80, 0, mapCanvas.height);
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
    
    // Ajouter visualisation des tendances
    drawTrendIndicators();
    
    console.log("Carte rendue avec succès");
  } catch (error) {
    console.error("Erreur lors du rendu de la carte:", error);
  }
}

// Fonction pour dessiner des particules de CO2 dans l'atmosphère
function drawCO2Particles(temperatureLevel) {
  const numParticles = Math.floor((state.co2 - 300) / 5); // 1 particule pour chaque 5 ppm au-dessus de 300
  
  if (numParticles <= 0) return;
  
  ctx.fillStyle = `rgba(100, 100, 100, ${Math.min(0.6, temperatureLevel * 0.3 + 0.1)})`;
  
  for (let i = 0; i < numParticles; i++) {
    const x = Math.random() * mapCanvas.width;
    const y = Math.random() * (mapCanvas.height / 3); // Limiter à la partie supérieure
    const size = Math.random() * 2 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Fonction pour dessiner les indicateurs de tendance
function drawTrendIndicators() {
  const trends = getTrends();
  const iconSize = 24;
  const padding = 10;
  
  // Position en haut à droite de la carte
  let startX = mapCanvas.width - iconSize - padding;
  let startY = padding;
  
  // Dessiner l'indicateur de tendance CO2
  drawTrendIcon(startX, startY, trends.co2, 'CO₂');
  
  // Dessiner l'indicateur de tendance température
  startY += iconSize + padding;
  drawTrendIcon(startX, startY, trends.temp, 'Temp');
  
  // Dessiner l'indicateur de tendance niveau de la mer
  startY += iconSize + padding;
  drawTrendIcon(startX, startY, trends.sea, 'Mer');
}

function drawTrendIcon(x, y, trend, label) {
  // Dessiner le fond du badge
  ctx.fillStyle = trend === 'up' ? 'rgba(255, 99, 71, 0.7)' : 
                 (trend === 'down' ? 'rgba(50, 205, 50, 0.7)' : 'rgba(200, 200, 200, 0.7)');
  
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Dessiner la flèche
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  if (trend === 'up') {
    // Flèche vers le haut
    ctx.moveTo(x, y + 6);
    ctx.lineTo(x, y - 6);
    ctx.moveTo(x - 4, y - 2);
    ctx.lineTo(x, y - 6);
    ctx.lineTo(x + 4, y - 2);
  } else if (trend === 'down') {
    // Flèche vers le bas
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x, y + 6);
    ctx.moveTo(x - 4, y + 2);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x + 4, y + 2);
  } else {
    // Ligne horizontale pour stable
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
  }
  
  ctx.stroke();
  
  // Ajouter étiquette
  ctx.fillStyle = 'white';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + 24);
}

function updateHUD(){
  try {
    console.log("Mise à jour du HUD avec l'état:", JSON.stringify(state));
    yearEl.textContent = `Année: ${state.year}`;
    budgetEl.textContent = `Budget: ${state.budget}`;
    
    // Mise à jour avec indicateurs de tendance
    const trends = getTrends();
    
    // Température avec tendance
    tempEl.textContent = `ΔT: ${state.temp.toFixed(2)}°C`;
    addTrendIndicator(tempEl, trends.temp);
    
    // CO2 avec tendance
    co2El.textContent = `CO₂: ${state.co2.toFixed(0)} ppm`;
    addTrendIndicator(co2El, trends.co2);
    
    // Niveau de la mer avec tendance
    seaEl.textContent = `Niveau mer: ${state.sea.toFixed(2)} m`;
    addTrendIndicator(seaEl, trends.sea);
    
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

// Fonction pour ajouter un indicateur de tendance à un élément HUD
function addTrendIndicator(element, trend) {
  // Supprimer d'abord l'ancien indicateur s'il existe
  const oldIndicator = element.querySelector('.trend-indicator');
  if (oldIndicator) {
    oldIndicator.remove();
  }
  
  // Créer l'indicateur de tendance
  const indicator = document.createElement('span');
  indicator.className = 'trend-indicator';
  
  // Définir l'apparence selon la tendance
  if (trend === 'up') {
    indicator.textContent = '↑';
    indicator.style.color = '#ff6b6b'; // Rouge pour la hausse (mauvais)
  } else if (trend === 'down') {
    indicator.textContent = '↓';
    indicator.style.color = '#4cd137'; // Vert pour la baisse (bon)
  } else {
    indicator.textContent = '→';
    indicator.style.color = '#ffb800'; // Jaune pour stable
  }
  
  // Ajouter l'indicateur à l'élément
  element.appendChild(indicator);
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
  
  // Changer la couleur de fond du HUD selon l'intensité des problèmes climatiques
  const severity = (
    (state.temp > 2.0 ? 2 : (state.temp > 1.5 ? 1 : 0)) + 
    (state.co2 > 450 ? 2 : (state.co2 > 420 ? 1 : 0)) + 
    (state.sea > 0.5 ? 2 : (state.sea > 0.2 ? 1 : 0))
  ) / 6; // Normaliser entre 0 et 1
  
  // Gradient de couleur du fond HUD selon sévérité
  hud.style.background = `linear-gradient(90deg, 
    var(--primary-dark), 
    ${severity > 0.6 ? 'var(--danger)' : (severity > 0.3 ? 'var(--warning)' : 'var(--primary)')}
  )`;
}
