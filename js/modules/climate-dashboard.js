// Tableau de bord du parcours climatique
import { state } from './engine.js';
import { climatePathTracker } from './progress-tracking.js';
import { achievementSystem } from './achievements.js';

// Éléments DOM pour le tableau de bord
let dashboardContainer;
let currentDashboardTab = 'overview';

// Initialiser le tableau de bord climatique
export function setupClimateDashboard() {
  // Créer le tableau de bord s'il n'existe pas
  if (!document.getElementById('climate-dashboard')) {
    createDashboard();
  }
  
  // Récupérer les références aux éléments DOM
  dashboardContainer = document.getElementById('climate-dashboard');
  
  // Ajouter les écouteurs d'événements pour les onglets
  const dashboardTabs = document.querySelectorAll('.dashboard-tab');
  
  dashboardTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Mettre à jour l'onglet actif
      dashboardTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Mettre à jour le contenu en fonction de l'onglet sélectionné
      currentDashboardTab = tab.dataset.tab;
      renderDashboardContent();
    });
  });
  
  // Initialiser le contenu du tableau de bord
  renderDashboardContent();
  
  console.log("Tableau de bord climatique initialisé");
}

// Créer la structure du tableau de bord
function createDashboard() {
  const dashboardHTML = `
    <div id="climate-dashboard">
      <div class="dashboard-header">
        <h2 class="dashboard-title">Tableau de Bord Climatique</h2>
        <div class="dashboard-year-range">2025 - ${state.year}</div>
      </div>
      <div class="dashboard-tabs">
        <div class="dashboard-tab active" data-tab="overview">Vue d'ensemble</div>
        <div class="dashboard-tab" data-tab="timeline">Chronologie</div>
        <div class="dashboard-tab" data-tab="scenarios">Scénarios</div>
        <div class="dashboard-tab" data-tab="achievements">Réalisations</div>
      </div>
      <div id="dashboard-content" class="dashboard-content">
        <!-- Le contenu sera ajouté ici dynamiquement -->
      </div>
    </div>
  `;
  
  // Trouver un emplacement approprié dans le DOM
  const container = document.querySelector('.container');
  
  // Insérer après le panneau des missions
  const missionsPanel = document.getElementById('missions-panel');
  if (missionsPanel && container) {
    const dashboardElement = document.createElement('div');
    dashboardElement.innerHTML = dashboardHTML;
    container.insertBefore(dashboardElement.firstElementChild, missionsPanel.nextSibling);
  } else {
    // Fallback: ajouter à la fin du conteneur
    container.innerHTML += dashboardHTML;
  }
}

// Mettre à jour le tableau de bord après chaque tour
export function updateDashboard() {
  // Mettre à jour l'année affichée
  const yearRangeElement = document.querySelector('.dashboard-year-range');
  if (yearRangeElement) {
    yearRangeElement.textContent = `2025 - ${state.year}`;
  }
  
  // Prendre un snapshot de l'état climatique actuel
  climatePathTracker.generatePathSnapshot(`Année ${state.year}`);
  
  // Mettre à jour le contenu en fonction de l'onglet actif
  renderDashboardContent();
}

// Rendre le contenu du tableau de bord en fonction de l'onglet actif
function renderDashboardContent() {
  const dashboardContent = document.getElementById('dashboard-content');
  if (!dashboardContent) return;
  
  // Vider le contenu
  dashboardContent.innerHTML = '';
  
  // Rendre le contenu en fonction de l'onglet actif
  switch (currentDashboardTab) {
    case 'overview':
      renderOverviewTab(dashboardContent);
      break;
    case 'timeline':
      renderTimelineTab(dashboardContent);
      break;
    case 'scenarios':
      renderScenariosTab(dashboardContent);
      break;
    case 'achievements':
      renderAchievementsTab(dashboardContent);
      break;
    default:
      renderOverviewTab(dashboardContent);
  }
}

// Rendre l'onglet Vue d'ensemble
function renderOverviewTab(container) {
  // Récupérer le résumé du parcours climatique
  const summary = climatePathTracker.getPathSummary();
  
  // Calculer le score global
  const { globalScore } = getGlobalClimateScore();
  
  // Créer les cartes de score
  container.innerHTML = `
    <div class="climate-score-cards">
      <!-- Score global -->
      <div class="climate-score-card global-score-card">
        <div class="score-card-title">Score Climatique Global</div>
        <div class="global-score-value" style="color: ${getScoreColor(globalScore)}">${globalScore}</div>
        <div class="global-score-circle" style="background-color: ${getScoreColor(globalScore, 0.1)}"></div>
        <div class="global-score-level ${getScoreClass(globalScore)}">${getScoreLevelText(globalScore)}</div>
      </div>
      
      <!-- CO2 -->
      <div class="climate-score-card">
        <div class="score-card-title">CO₂ Atmosphérique</div>
        <div class="score-card-value" style="color: var(--chart-co2)">${state.co2.toFixed(0)} ppm</div>
        <div class="score-card-change ${summary.changes.co2Change > 0 ? 'negative' : 'positive'}">
          <span class="score-card-change-icon">${summary.changes.co2Change > 0 ? '↑' : '↓'}</span>
          ${Math.abs(summary.changes.co2Change).toFixed(1)} ppm depuis 2025
        </div>
        <div class="score-card-trend" id="co2-mini-chart"></div>
      </div>
      
      <!-- Température -->
      <div class="climate-score-card">
        <div class="score-card-title">Température</div>
        <div class="score-card-value" style="color: var(--chart-temp)">+${state.temp.toFixed(1)}°C</div>
        <div class="score-card-change ${summary.changes.tempChange > 0 ? 'negative' : 'positive'}">
          <span class="score-card-change-icon">${summary.changes.tempChange > 0 ? '↑' : '↓'}</span>
          ${Math.abs(summary.changes.tempChange).toFixed(2)}°C depuis 2025
        </div>
        <div class="score-card-trend" id="temp-mini-chart"></div>
      </div>
      
      <!-- Niveau de la mer -->
      <div class="climate-score-card">
        <div class="score-card-title">Niveau de la mer</div>
        <div class="score-card-value" style="color: var(--chart-sea)">+${state.sea.toFixed(2)} m</div>
        <div class="score-card-change ${summary.changes.seaChange > 0 ? 'negative' : 'positive'}">
          <span class="score-card-change-icon">${summary.changes.seaChange > 0 ? '↑' : '↓'}</span>
          ${Math.abs(summary.changes.seaChange).toFixed(2)} m depuis 2025
        </div>
        <div class="score-card-trend" id="sea-mini-chart"></div>
      </div>
      
      <!-- Biodiversité -->
      <div class="climate-score-card">
        <div class="score-card-title">Biodiversité</div>
        <div class="score-card-value" style="color: var(--chart-biodiversity)">${state.biodiversity.toFixed(1)}</div>
        <div class="score-card-change ${summary.changes.biodiversityChange > 0 ? 'positive' : 'negative'}">
          <span class="score-card-change-icon">${summary.changes.biodiversityChange > 0 ? '↑' : '↓'}</span>
          ${Math.abs(summary.changes.biodiversityChange).toFixed(1)} points depuis 2025
        </div>
        <div class="score-card-trend" id="biodiversity-mini-chart"></div>
      </div>
    </div>
    
    <!-- Graphiques d'évolution -->
    <div class="climate-chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Évolution des Indicateurs Climatiques</h3>
        <div class="chart-controls">
          <button class="chart-control active" data-metric="all">Tous</button>
          <button class="chart-control" data-metric="co2">CO₂</button>
          <button class="chart-control" data-metric="temp">Température</button>
          <button class="chart-control" data-metric="sea">Niveau mer</button>
          <button class="chart-control" data-metric="biodiversity">Biodiversité</button>
        </div>
      </div>
      <div class="climate-chart" id="climate-evolution-chart"></div>
      <div class="chart-legend">
        <div class="legend-item"><span class="legend-color legend-co2"></span> CO₂ (ppm)</div>
        <div class="legend-item"><span class="legend-color legend-temp"></span> Température (°C)</div>
        <div class="legend-item"><span class="legend-color legend-sea"></span> Niveau mer (m)</div>
        <div class="legend-item"><span class="legend-color legend-biodiversity"></span> Biodiversité</div>
      </div>
    </div>
    
    <!-- Comparaison avec scénarios -->
    <div class="climate-chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Projection vs Scénarios de Référence</h3>
        <div class="chart-controls">
          <button class="chart-control active" data-scenario="optimal">Optimal</button>
          <button class="chart-control" data-scenario="business">Status Quo</button>
          <button class="chart-control" data-scenario="disaster">Catastrophique</button>
        </div>
      </div>
      <div class="climate-chart" id="scenarios-comparison-chart"></div>
      <div class="chart-legend">
        <div class="legend-item"><span class="legend-color legend-current"></span> Votre parcours</div>
        <div class="legend-item"><span class="legend-color legend-optimal"></span> Scénario optimal</div>
        <div class="legend-item"><span class="legend-color legend-business"></span> Scénario status quo</div>
        <div class="legend-item"><span class="legend-color legend-disaster"></span> Scénario catastrophique</div>
      </div>
    </div>
    
    <!-- Points de bascule -->
    <div class="climate-chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Points de Bascule Climatiques</h3>
      </div>
      <div id="tipping-points-container">
        <!-- Liste des points de bascule -->
        <ul class="tipping-points-list">
          <li class="tipping-point-item ${state.tippingPoints.greenland ? 'triggered' : ''}">
            <div class="tipping-point-header">
              <h4>Fonte du Groenland</h4>
              <div class="tipping-point-status">${state.tippingPoints.greenland ? 'Déclenché' : 'Non déclenché'}</div>
            </div>
            <div class="tipping-point-threshold">Seuil: +2.0°C | Actuel: +${state.temp.toFixed(1)}°C</div>
            <div class="tipping-point-progress">
              <div class="tipping-point-bar" style="width: ${Math.min(100, (state.temp / 2.0) * 100)}%"></div>
            </div>
          </li>
          
          <li class="tipping-point-item ${state.tippingPoints.westAntarctica ? 'triggered' : ''}">
            <div class="tipping-point-header">
              <h4>Instabilité de l'Antarctique Ouest</h4>
              <div class="tipping-point-status">${state.tippingPoints.westAntarctica ? 'Déclenché' : 'Non déclenché'}</div>
            </div>
            <div class="tipping-point-threshold">Seuil: +2.5°C | Actuel: +${state.temp.toFixed(1)}°C</div>
            <div class="tipping-point-progress">
              <div class="tipping-point-bar" style="width: ${Math.min(100, (state.temp / 2.5) * 100)}%"></div>
            </div>
          </li>
          
          <li class="tipping-point-item ${state.tippingPoints.amazon ? 'triggered' : ''}">
            <div class="tipping-point-header">
              <h4>Dépérissement de l'Amazonie</h4>
              <div class="tipping-point-status">${state.tippingPoints.amazon ? 'Déclenché' : 'Non déclenché'}</div>
            </div>
            <div class="tipping-point-threshold">Seuil: +3.0°C | Actuel: +${state.temp.toFixed(1)}°C</div>
            <div class="tipping-point-progress">
              <div class="tipping-point-bar" style="width: ${Math.min(100, (state.temp / 3.0) * 100)}%"></div>
            </div>
          </li>
          
          <li class="tipping-point-item ${state.tippingPoints.permafrost ? 'triggered' : ''}">
            <div class="tipping-point-header">
              <h4>Dégel du Permafrost</h4>
              <div class="tipping-point-status">${state.tippingPoints.permafrost ? 'Déclenché' : 'Non déclenché'}</div>
            </div>
            <div class="tipping-point-threshold">Seuil: +1.5°C | Actuel: +${state.temp.toFixed(1)}°C</div>
            <div class="tipping-point-progress">
              <div class="tipping-point-bar" style="width: ${Math.min(100, (state.temp / 1.5) * 100)}%"></div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `;
  
  // Ajouter des écouteurs d'événements après l'insertion du HTML
  setTimeout(() => {
    // Écouteurs pour les contrôles de graphique
    const chartControls = document.querySelectorAll('.chart-control');
    
    chartControls.forEach(control => {
      control.addEventListener('click', (e) => {
        // Trouver tous les contrôles dans le même groupe
        const parentControls = e.target.parentElement.querySelectorAll('.chart-control');
        
        // Désactiver tous les contrôles dans ce groupe
        parentControls.forEach(c => c.classList.remove('active'));
        
        // Activer le contrôle cliqué
        e.target.classList.add('active');
        
        // Mettre à jour le graphique en fonction du contrôle
        if (e.target.dataset.metric) {
          updateEvolutionChart(e.target.dataset.metric);
        } else if (e.target.dataset.scenario) {
          updateScenariosChart(e.target.dataset.scenario);
        }
      });
    });
    
    // Initialiser les graphiques
    initializeCharts();
  }, 0);
}

// Rendre l'onglet Chronologie
function renderTimelineTab(container) {
  // Récupérer les décisions et événements clés
  const keyDecisions = climatePathTracker.keyDecisions;
  const criticalEvents = climatePathTracker.criticalEvents;
  
  // Combiner et trier par date
  const allEvents = [...keyDecisions, ...criticalEvents].sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
  
  // Générer la chronologie
  let timelineHTML = `
    <div class="climate-timeline">
      <div class="timeline-line"></div>
  `;
  
  if (allEvents.length === 0) {
    timelineHTML += `
      <div style="text-align: center; padding: 2rem; color: var(--medium);">
        Aucun événement significatif enregistré pour le moment.
      </div>
    `;
  } else {
    allEvents.forEach(event => {
      // Déterminer le type d'événement
      let eventType, eventTypeLabel;
      
      if (event.type) {
        // Événement critique
        eventType = event.type;
        switch (event.type) {
          case 'tipping-point':
            eventTypeLabel = 'Point de bascule';
            break;
          case 'disaster':
            eventTypeLabel = 'Catastrophe';
            break;
          case 'milestone':
            eventTypeLabel = 'Jalon';
            break;
          default:
            eventTypeLabel = 'Événement';
        }
      } else {
        // Décision
        eventType = event.type || 'action';
        switch (eventType) {
          case 'action':
            eventTypeLabel = 'Action';
            break;
          case 'event-choice':
            eventTypeLabel = 'Choix narratif';
            break;
          default:
            eventTypeLabel = 'Décision';
        }
      }
      
      // Générer les effets
      let effectsHTML = '';
      
      if (event.effects) {
        effectsHTML = '<div class="timeline-card-effects">';
        
        Object.entries(event.effects).forEach(([key, value]) => {
          const isPositive = (key === 'co2' && value < 0) || 
                           (key === 'biodiversity' && value > 0) || 
                           (key === 'temp' && value < 0) || 
                           (key === 'sea' && value < 0) ||
                           (key === 'budget' && value > 0);
          
          let icon, label;
          switch (key) {
            case 'co2':
              icon = 'CO₂';
              label = 'CO₂';
              break;
            case 'temp':
              icon = '🌡️';
              label = 'Temp';
              break;
            case 'sea':
              icon = '🌊';
              label = 'Mer';
              break;
            case 'biodiversity':
              icon = '🌿';
              label = 'Bio';
              break;
            case 'budget':
              icon = '💰';
              label = 'Budget';
              break;
            default:
              icon = '📊';
              label = key;
          }
          
          effectsHTML += `
            <div class="timeline-effect">
              <div class="timeline-effect-icon ${key}-icon">${icon}</div>
              <div class="timeline-effect-label">${label}:</div>
              <div class="timeline-effect-value ${isPositive ? 'positive' : 'negative'}">${value > 0 ? '+' : ''}${value}</div>
            </div>
          `;
        });
        
        effectsHTML += '</div>';
      }
      
      timelineHTML += `
        <div class="timeline-event timeline-${eventType}">
          <div class="timeline-dot"></div>
          <div class="timeline-year">${event.year}</div>
          <div class="timeline-card">
            <div class="timeline-card-header">
              <h3 class="timeline-card-title">${event.name || event.description}</h3>
              <div class="timeline-card-type ${eventType}">${eventTypeLabel}</div>
            </div>
            <div class="timeline-card-description">${event.description || ''}</div>
            ${effectsHTML}
          </div>
        </div>
      `;
    });
  }
  
  timelineHTML += `</div>`;
  
  // Ajouter la chronologie au conteneur
  container.innerHTML = timelineHTML;
}

// Rendre l'onglet Scénarios
function renderScenariosTab(container) {
  // Obtenir les comparaisons de scénarios
  const optimalComparison = climatePathTracker.compareWithReferencePath('optimal');
  const businessComparison = climatePathTracker.compareWithReferencePath('business-as-usual');
  const catastrophicComparison = climatePathTracker.compareWithReferencePath('catastrophic');
  
  // Construire l'interface des scénarios
  container.innerHTML = `
    <div class="scenarios-comparison">
      <div class="scenario-header">
        <h3>Comparaison des Scénarios en ${optimalComparison.referenceValues.targetYear}</h3>
        <div class="scenario-description">
          Comparez votre parcours climatique actuel avec différents scénarios de référence et voyez où mènent vos décisions.
        </div>
      </div>
      
      <div class="scenario-cards">
        <!-- Parcours actuel -->
        <div class="scenario-card current">
          <div class="scenario-card-header">
            <div class="scenario-card-title">Votre Parcours</div>
            <div class="scenario-card-score ${getScoreClass(optimalComparison.globalScore)}">${optimalComparison.globalScore}/100</div>
          </div>
          <ul class="scenario-metrics">
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon co2-icon">C</div>
                CO₂
              </div>
              <div class="scenario-metric-value">${optimalComparison.projectedValues.co2.toFixed(0)} ppm</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon temp-icon">T</div>
                Température
              </div>
              <div class="scenario-metric-value">+${optimalComparison.projectedValues.temp.toFixed(1)}°C</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon sea-icon">M</div>
                Niveau mer
              </div>
              <div class="scenario-metric-value">+${optimalComparison.projectedValues.sea.toFixed(2)} m</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon biodiversity-icon">B</div>
                Biodiversité
              </div>
              <div class="scenario-metric-value">${optimalComparison.projectedValues.biodiversity.toFixed(1)}</div>
            </li>
          </ul>
        </div>
        
        <!-- Scénario optimal -->
        <div class="scenario-card optimal">
          <div class="scenario-card-header">
            <div class="scenario-card-title">Scénario Optimal</div>
            <div class="scenario-card-score excellent">100/100</div>
          </div>
          <ul class="scenario-metrics">
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon co2-icon">C</div>
                CO₂
              </div>
              <div class="scenario-metric-value">${optimalComparison.referenceValues.co2.toFixed(0)} ppm</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon temp-icon">T</div>
                Température
              </div>
              <div class="scenario-metric-value">+${optimalComparison.referenceValues.temp.toFixed(1)}°C</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon sea-icon">M</div>
                Niveau mer
              </div>
              <div class="scenario-metric-value">+${optimalComparison.referenceValues.sea.toFixed(2)} m</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon biodiversity-icon">B</div>
                Biodiversité
              </div>
              <div class="scenario-metric-value">${optimalComparison.referenceValues.biodiversity.toFixed(1)}</div>
            </li>
          </ul>
        </div>
        
        <!-- Scénario business-as-usual -->
        <div class="scenario-card business">
          <div class="scenario-card-header">
            <div class="scenario-card-title">Status Quo</div>
            <div class="scenario-card-score poor">40/100</div>
          </div>
          <ul class="scenario-metrics">
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon co2-icon">C</div>
                CO₂
              </div>
              <div class="scenario-metric-value">${businessComparison.referenceValues.co2.toFixed(0)} ppm</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon temp-icon">T</div>
                Température
              </div>
              <div class="scenario-metric-value">+${businessComparison.referenceValues.temp.toFixed(1)}°C</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon sea-icon">M</div>
                Niveau mer
              </div>
              <div class="scenario-metric-value">+${businessComparison.referenceValues.sea.toFixed(2)} m</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon biodiversity-icon">B</div>
                Biodiversité
              </div>
              <div class="scenario-metric-value">${businessComparison.referenceValues.biodiversity.toFixed(1)}</div>
            </li>
          </ul>
        </div>
        
        <!-- Scénario catastrophique -->
        <div class="scenario-card disaster">
          <div class="scenario-card-header">
            <div class="scenario-card-title">Catastrophique</div>
            <div class="scenario-card-score critical">10/100</div>
          </div>
          <ul class="scenario-metrics">
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon co2-icon">C</div>
                CO₂
              </div>
              <div class="scenario-metric-value">${catastrophicComparison.referenceValues.co2.toFixed(0)} ppm</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon temp-icon">T</div>
                Température
              </div>
              <div class="scenario-metric-value">+${catastrophicComparison.referenceValues.temp.toFixed(1)}°C</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon sea-icon">M</div>
                Niveau mer
              </div>
              <div class="scenario-metric-value">+${catastrophicComparison.referenceValues.sea.toFixed(2)} m</div>
            </li>
            <li class="scenario-metric">
              <div class="scenario-metric-label">
                <div class="scenario-metric-icon biodiversity-icon">B</div>
                Biodiversité
              </div>
              <div class="scenario-metric-value">${catastrophicComparison.referenceValues.biodiversity.toFixed(1)}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="climate-chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Analyse d'Écart par Métrique</h3>
      </div>
      <div class="climate-chart" id="gap-analysis-chart"></div>
      <div class="chart-legend">
        <div class="legend-item"><span class="legend-color legend-co2"></span> CO₂ (ppm)</div>
        <div class="legend-item"><span class="legend-color legend-temp"></span> Température (°C)</div>
        <div class="legend-item"><span class="legend-color legend-sea"></span> Niveau mer (m)</div>
        <div class="legend-item"><span class="legend-color legend-biodiversity"></span> Biodiversité</div>
      </div>
    </div>
    
    <div class="climate-chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Recommandations</h3>
      </div>
      <div id="recommendations-container">
        <ul class="recommendations-list">
          ${generateRecommendations(optimalComparison).map(rec => `
            <li class="recommendation-item">
              <div class="recommendation-icon ${rec.type}-icon">${rec.icon}</div>
              <div class="recommendation-content">
                <h4 class="recommendation-title">${rec.title}</h4>
                <div class="recommendation-description">${rec.description}</div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  
  // Ajouter des écouteurs d'événements après l'insertion du HTML
  setTimeout(() => {
    // Initialiser les graphiques
    initializeGapAnalysisChart();
  }, 0);
}

// Rendre l'onglet Réalisations
function renderAchievementsTab(container) {
  // Récupérer les badges obtenus
  const earnedAchievements = achievementSystem.earnedAchievements;
  
  // Récupérer les suggestions de badges à viser
  const suggestedAchievements = achievementSystem.getSuggestedAchievements(3);
  
  // Construire l'interface des réalisations
  container.innerHTML = `
    <div class="climate-chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Trophées Débloqués</h3>
      </div>
      
      <div class="badges-grid">
        ${earnedAchievements.length === 0 ? `
          <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--medium);">
            Aucun trophée obtenu pour le moment. Continuez vos efforts !
          </div>
        ` : earnedAchievements.map(badge => `
          <div class="badge-card">
            <div class="badge-icon">🏆</div>
            <div class="badge-title">${badge.title}</div>
            <div class="badge-date">Obtenu en ${badge.earnedYear}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="climate-chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Prochains Objectifs</h3>
      </div>
      
      <div class="badges-grid">
        ${suggestedAchievements.map(badge => `
          <div class="badge-card locked">
            <div class="badge-icon">🏆</div>
            <div class="badge-title">${badge.title}</div>
            <div class="badge-date">Progression: ${badge.progress}%</div>
            <div class="badge-progress">
              <div class="badge-progress-bar" style="width: ${badge.progress}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Initialiser les graphiques du tableau de bord
function initializeCharts() {
  // Pour une version simplifiée, nous utiliserons des représentations basiques avec canvas
  // Dans une implémentation complète, on utiliserait une bibliothèque comme Chart.js

  // Graphique d'évolution des indicateurs
  const evolutionChartElement = document.getElementById('climate-evolution-chart');
  if (evolutionChartElement) {
    drawEvolutionChart(evolutionChartElement, 'all');
  }
  
  // Graphique de comparaison des scénarios
  const scenariosChartElement = document.getElementById('scenarios-comparison-chart');
  if (scenariosChartElement) {
    drawScenariosChart(scenariosChartElement, 'optimal');
  }
  
  // Mini-graphiques dans les cartes de score
  drawMiniCharts();
}

// Dessiner les mini-graphiques dans les cartes de score
function drawMiniCharts() {
  const metrics = ['co2', 'temp', 'sea', 'biodiversity'];
  
  metrics.forEach(metric => {
    const chartElement = document.getElementById(`${metric}-mini-chart`);
    if (chartElement) {
      // Dans une implémentation complète, on utiliserait une bibliothèque de graphiques
      // Ici, on utilise un élément div avec un dégradé de couleur pour simuler un graphique
      
      // Déterminer la tendance
      const trend = climatePathTracker.getCurrentTrends()[metric];
      
      let gradient;
      switch (trend) {
        case 'rising':
          if (metric === 'biodiversity') {
            gradient = 'linear-gradient(to right, #f5f5f5, var(--chart-biodiversity))';
          } else {
            gradient = 'linear-gradient(to right, #f5f5f5, var(--chart-' + metric + '))';
          }
          break;
        case 'falling':
          if (metric === 'biodiversity') {
            gradient = 'linear-gradient(to right, var(--chart-biodiversity), #f5f5f5)';
          } else {
            gradient = 'linear-gradient(to right, var(--chart-' + metric + '), #f5f5f5)';
          }
          break;
        default:
          gradient = 'linear-gradient(to right, #f5f5f5, #f5f5f5)';
      }
      
      chartElement.style.background = gradient;
    }
  });
}

// Dessiner le graphique d'évolution
function drawEvolutionChart(canvas, metricFilter) {
  // Cette fonction est simplifiée pour l'exemple
  // Dans une implémentation complète, on utiliserait une bibliothèque comme Chart.js
  
  // Simuler un graphique avec un dégradé de couleur
  canvas.style.background = 'linear-gradient(to bottom, #f9f9f9, #ffffff)';
  canvas.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100%; font-style: italic; color: var(--medium);">
      Graphique d'évolution des indicateurs (${metricFilter})
    </div>
  `;
}

// Dessiner le graphique de comparaison des scénarios
function drawScenariosChart(canvas, scenarioType) {
  // Cette fonction est simplifiée pour l'exemple
  // Dans une implémentation complète, on utiliserait une bibliothèque comme Chart.js
  
  // Simuler un graphique avec un dégradé de couleur
  canvas.style.background = 'linear-gradient(to bottom, #f9f9f9, #ffffff)';
  canvas.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100%; font-style: italic; color: var(--medium);">
      Comparaison avec le scénario ${scenarioType}
    </div>
  `;
}

// Initialiser le graphique d'analyse d'écart
function initializeGapAnalysisChart() {
  const gapChartElement = document.getElementById('gap-analysis-chart');
  if (gapChartElement) {
    // Simuler un graphique avec un dégradé de couleur
    gapChartElement.style.background = 'linear-gradient(to bottom, #f9f9f9, #ffffff)';
    gapChartElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100%; font-style: italic; color: var(--medium);">
        Analyse d'écart entre parcours actuel et scénario optimal
      </div>
    `;
  }
}

// Mettre à jour le graphique d'évolution en fonction du filtre
function updateEvolutionChart(metricFilter) {
  const chartElement = document.getElementById('climate-evolution-chart');
  if (chartElement) {
    drawEvolutionChart(chartElement, metricFilter);
  }
}

// Mettre à jour le graphique de scénarios en fonction du filtre
function updateScenariosChart(scenarioType) {
  const chartElement = document.getElementById('scenarios-comparison-chart');
  if (chartElement) {
    drawScenariosChart(chartElement, scenarioType);
  }
}

// Générer des recommandations basées sur la comparaison avec le scénario optimal
function generateRecommendations(comparison) {
  const recommendations = [];
  
  // Vérifier chaque métrique et générer des recommandations
  if (comparison.gaps.co2 > 20) {
    recommendations.push({
      type: 'co2',
      icon: 'CO₂',
      title: 'Réduire les émissions de CO₂',
      description: 'Investissez dans les énergies renouvelables et la capture de carbone pour réduire l\'écart de ' + 
                  Math.abs(comparison.gaps.co2).toFixed(0) + ' ppm avec le scénario optimal.'
    });
  }
  
  if (comparison.gaps.temp > 0.2) {
    recommendations.push({
      type: 'temp',
      icon: '🌡️',
      title: 'Limiter la hausse de température',
      description: 'Réduisez les émissions et développez des technologies de refroidissement pour contenir la hausse de température à ' + 
                  comparison.referenceValues.temp.toFixed(1) + '°C.'
    });
  }
  
  if (comparison.gaps.sea > 0.1) {
    recommendations.push({
      type: 'sea',
      icon: '🌊',
      title: 'Protéger contre la montée des eaux',
      description: 'Investissez dans des infrastructures côtières adaptatives et réduisez les émissions pour limiter la montée des eaux à ' + 
                  comparison.referenceValues.sea.toFixed(2) + ' m.'
    });
  }
  
  if (comparison.gaps.biodiversity < -0.5) {
    recommendations.push({
      type: 'biodiversity',
      icon: '🌿',
      title: 'Restaurer la biodiversité',
      description: 'Développez des zones protégées et des corridors écologiques pour atteindre un indice de biodiversité de ' + 
                  comparison.referenceValues.biodiversity.toFixed(1) + '.'
    });
  }
  
  // Si aucune recommandation spécifique n'a été générée, ajouter une recommandation générale
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'general',
      icon: '📊',
      title: 'Maintenir le cap',
      description: 'Vos politiques climatiques sont bien alignées avec le scénario optimal. Continuez vos efforts pour atteindre la neutralité carbone.'
    });
  }
  
  return recommendations;
}

// Calculer un score climatique global
function getGlobalClimateScore() {
  // Calculer un score pour chaque métrique
  const co2Score = calculateMetricScore('co2', state.co2, 350, 500);
  const tempScore = calculateMetricScore('temp', state.temp, 1.0, 3.0);
  const seaScore = calculateMetricScore('sea', state.sea, 0.0, 1.0);
  const biodiversityScore = calculateMetricScore('biodiversity', state.biodiversity, -1.0, 3.0);
  
  // Calculer la moyenne pondérée
  const weights = {
    co2: 0.3,
    temp: 0.35,
    sea: 0.15,
    biodiversity: 0.2
  };
  
  const globalScore = Math.round(
    weights.co2 * co2Score +
    weights.temp * tempScore +
    weights.sea * seaScore +
    weights.biodiversity * biodiversityScore
  );
  
  return {
    globalScore,
    metricScores: {
      co2: co2Score,
      temp: tempScore,
      sea: seaScore,
      biodiversity: biodiversityScore
    }
  };
}

// Calculer un score pour une métrique spécifique
function calculateMetricScore(metric, value, optimalValue, worstValue) {
  let normalizedScore;
  
  switch (metric) {
    case 'co2':
    case 'temp':
    case 'sea':
      // Pour ces métriques, une valeur plus basse est meilleure
      normalizedScore = 100 - Math.min(100, Math.max(0, 
        100 * (value - optimalValue) / (worstValue - optimalValue)
      ));
      break;
    
    case 'biodiversity':
      // Pour la biodiversité, une valeur plus élevée est meilleure
      normalizedScore = Math.min(100, Math.max(0, 
        100 * (value - worstValue) / (optimalValue - worstValue)
      ));
      break;
    
    default:
      normalizedScore = 50; // Valeur par défaut
  }
  
  return Math.round(normalizedScore);
}

// Obtenir la couleur correspondant à un score
function getScoreColor(score, alpha = 1) {
  const a = alpha.toString();
  
  if (score >= 80) {
    return `rgba(76, 175, 80, ${a})`;  // Excellent: vert
  } else if (score >= 60) {
    return `rgba(139, 195, 74, ${a})`;  // Bon: vert clair
  } else if (score >= 40) {
    return `rgba(255, 193, 7, ${a})`;   // Moyen: jaune
  } else if (score >= 20) {
    return `rgba(255, 87, 34, ${a})`;   // Faible: orange
  } else {
    return `rgba(244, 67, 54, ${a})`;   // Critique: rouge
  }
}

// Obtenir la classe CSS correspondant à un score
function getScoreClass(score) {
  if (score >= 80) {
    return 'score-excellent';
  } else if (score >= 60) {
    return 'score-good';
  } else if (score >= 40) {
    return 'score-average';
  } else if (score >= 20) {
    return 'score-poor';
  } else {
    return 'score-critical';
  }
}

// Obtenir le texte du niveau correspondant à un score
function getScoreLevelText(score) {
  if (score >= 80) {
    return 'Excellent';
  } else if (score >= 60) {
    return 'Bon';
  } else if (score >= 40) {
    return 'Moyen';
  } else if (score >= 20) {
    return 'Faible';
  } else {
    return 'Critique';
  }
}
