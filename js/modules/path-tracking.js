// Système de suivi du parcours climatique pour ClimaQuest
import { state } from './engine.js';
import { narrativeSystem } from './narrative-events.js';

// Classe pour gérer le suivi du parcours climatique
class ClimatePathTracker {
  constructor() {
    this.keyDecisions = [];
    this.pathSnapshots = [];
    this.criticalEvents = [];
    this.metrics = {
      co2Trend: [],
      tempTrend: [],
      seaTrend: [],
      biodiversityTrend: [],
      budgetTrend: []
    };
    
    // État du système à sauvegarder
    this.systemState = {
      keyDecisions: this.keyDecisions,
      pathSnapshots: this.pathSnapshots,
      criticalEvents: this.criticalEvents,
      metrics: this.metrics
    };
  }
  
  // Initialiser le système au démarrage du jeu
  initialize() {
    // Charger l'état sauvegardé si disponible
    this.loadSystemState();
    
    // Créer un snapshot initial si aucun n'existe
    if (this.pathSnapshots.length === 0) {
      this.generatePathSnapshot("État initial");
    }
    
    console.log("Système de suivi du parcours climatique initialisé");
  }
  
  // Enregistrer une décision importante et son impact
  recordDecision(decision) {
    // Format attendu pour une décision :
    // {
    //   id: "decision-id",
    //   type: "action" | "event-choice",
    //   name: "Nom de la décision",
    //   description: "Description de la décision",
    //   year: 2025,
    //   effects: { co2: -2.0, temp: -0.01, ... },
    //   context: {} // Informations supplémentaires optionnelles
    // }
    
    // Ajouter la décision à l'historique
    this.keyDecisions.push({
      ...decision,
      timestamp: new Date().toISOString() // Pour le tri chronologique
    });
    
    // Limiter le nombre de décisions stockées (pour performances)
    if (this.keyDecisions.length > 100) {
      this.keyDecisions = this.keyDecisions.slice(-100);
    }
    
    // Vérifier si c'est une décision suffisamment importante pour créer un snapshot
    if (this.isSignificantDecision(decision)) {
      this.generatePathSnapshot(`Après: ${decision.name}`);
    }
    
    // Sauvegarder l'état
    this.saveSystemState();
  }
  
  // Déterminer si une décision est suffisamment importante pour créer un snapshot
  isSignificantDecision(decision) {
    // Une décision est considérée comme significative si elle a un impact important
    // sur au moins un paramètre climatique
    if (!decision.effects) return false;
    
    // Seuils d'importance pour chaque paramètre
    const thresholds = {
      co2: 2.0,
      temp: 0.05,
      sea: 0.1,
      biodiversity: 0.5,
      budget: 5
    };
    
    // Vérifier chaque effet par rapport à son seuil
    for (const [param, value] of Object.entries(decision.effects)) {
      if (thresholds[param] && Math.abs(value) >= thresholds[param]) {
        return true;
      }
    }
    
    // Par défaut, considérer que les choix d'événements narratifs sont significatifs
    return decision.type === "event-choice";
  }
  
  // Créer un instantané de l'état climatique actuel
  generatePathSnapshot(label = "") {
    const snapshot = {
      year: state.year,
      co2: state.co2,
      temp: state.temp,
      sea: state.sea,
      biodiversity: state.biodiversity,
      budget: state.budget,
      tippingPoints: { ...state.tippingPoints },
      label: label || `Année ${state.year}`,
      timestamp: new Date().toISOString()
    };
    
    this.pathSnapshots.push(snapshot);
    
    // Mettre à jour les métriques de tendance
    this.updateMetricsTrends();
    
    // Limiter le nombre de snapshots (pour performances)
    if (this.pathSnapshots.length > 50) {
      this.pathSnapshots = this.pathSnapshots.slice(-50);
    }
    
    // Sauvegarder l'état
    this.saveSystemState();
    
    return snapshot;
  }
  
  // Mettre à jour les tendances des métriques
  updateMetricsTrends() {
    // Ajouter les valeurs actuelles aux tendances
    this.metrics.co2Trend.push({ year: state.year, value: state.co2 });
    this.metrics.tempTrend.push({ year: state.year, value: state.temp });
    this.metrics.seaTrend.push({ year: state.year, value: state.sea });
    this.metrics.biodiversityTrend.push({ year: state.year, value: state.biodiversity });
    this.metrics.budgetTrend.push({ year: state.year, value: state.budget });
    
    // Limiter la taille des tableaux de tendances (pour performances)
    const maxTrendLength = 50;
    if (this.metrics.co2Trend.length > maxTrendLength) {
      this.metrics.co2Trend = this.metrics.co2Trend.slice(-maxTrendLength);
      this.metrics.tempTrend = this.metrics.tempTrend.slice(-maxTrendLength);
      this.metrics.seaTrend = this.metrics.seaTrend.slice(-maxTrendLength);
      this.metrics.biodiversityTrend = this.metrics.biodiversityTrend.slice(-maxTrendLength);
      this.metrics.budgetTrend = this.metrics.budgetTrend.slice(-maxTrendLength);
    }
  }
  
  // Enregistrer un événement climatique critique (point de bascule, catastrophe, etc.)
  recordCriticalEvent(event) {
    // Format attendu pour un événement critique :
    // {
    //   id: "critical-event-id",
    //   name: "Nom de l'événement",
    //   description: "Description de l'événement",
    //   year: 2025,
    //   type: "tipping-point" | "disaster" | "milestone",
    //   impact: "negative" | "positive" | "neutral",
    //   effects: { co2: 5.0, temp: 0.2, ... } // Effets directs de l'événement
    // }
    
    this.criticalEvents.push({
      ...event,
      timestamp: new Date().toISOString()
    });
    
    // Toujours créer un snapshot pour les événements critiques
    this.generatePathSnapshot(`${event.name}`);
    
    // Sauvegarder l'état
    this.saveSystemState();
  }
  
  // Obtenir un résumé du parcours climatique pour affichage
  getPathSummary() {
    // Calculer les changements depuis le début
    const firstSnapshot = this.pathSnapshots[0] || {
      year: state.year,
      co2: state.co2,
      temp: state.temp,
      sea: state.sea,
      biodiversity: state.biodiversity
    };
    
    const currentState = {
      year: state.year,
      co2: state.co2,
      temp: state.temp,
      sea: state.sea,
      biodiversity: state.biodiversity
    };
    
    // Calculer les différences
    const changes = {
      yearsPassed: currentState.year - firstSnapshot.year,
      co2Change: currentState.co2 - firstSnapshot.co2,
      tempChange: currentState.temp - firstSnapshot.temp,
      seaChange: currentState.sea - firstSnapshot.sea,
      biodiversityChange: currentState.biodiversity - firstSnapshot.biodiversity
    };
    
    // Analyser les décisions clés
    const decisions = {
      total: this.keyDecisions.length,
      byType: this.keyDecisions.reduce((acc, decision) => {
        acc[decision.type] = (acc[decision.type] || 0) + 1;
        return acc;
      }, {})
    };
    
    // Identifier les événements critiques
    const criticalEventsCount = {
      total: this.criticalEvents.length,
      tippingPoints: this.criticalEvents.filter(e => e.type === "tipping-point").length,
      disasters: this.criticalEvents.filter(e => e.type === "disaster").length,
      milestones: this.criticalEvents.filter(e => e.type === "milestone").length
    };
    
    // Construire et retourner le résumé
    return {
      startYear: firstSnapshot.year,
      currentYear: currentState.year,
      changes,
      decisions,
      criticalEvents: criticalEventsCount,
      currentTrends: this.getCurrentTrends(),
      // Ajouter d'autres métriques pertinentes ici
    };
  }
  
  // Calculer les tendances actuelles
  getCurrentTrends() {
    // Calculer les tendances sur les 5 dernières années ou moins
    const trends = {};
    
    // Fonction pour calculer la tendance d'une métrique
    const calculateTrend = (trendData) => {
      if (trendData.length < 2) return "stable";
      
      const recent = trendData.slice(-5); // Prendre les 5 derniers points de données
      
      if (recent.length < 2) return "stable";
      
      // Calculer une tendance linéaire simple
      const first = recent[0];
      const last = recent[recent.length - 1];
      
      const change = last.value - first.value;
      
      // Déterminer la direction de la tendance
      if (Math.abs(change) < 0.01) return "stable";
      return change > 0 ? "rising" : "falling";
    };
    
    // Calculer les tendances pour chaque métrique
    trends.co2 = calculateTrend(this.metrics.co2Trend);
    trends.temp = calculateTrend(this.metrics.tempTrend);
    trends.sea = calculateTrend(this.metrics.seaTrend);
    trends.biodiversity = calculateTrend(this.metrics.biodiversityTrend);
    trends.budget = calculateTrend(this.metrics.budgetTrend);
    
    return trends;
  }
  
  // Comparer le parcours actuel avec un scénario de référence
  compareWithReferencePath(referenceType = "optimal") {
    // Dans une version plus avancée, on comparerait avec différents scénarios prédéfinis
    // Pour l'instant, on crée des métriques simplifiées
    
    let referenceValues;
    
    // Définir des valeurs de référence selon le type souhaité
    switch (referenceType) {
      case "optimal":
        // Scénario idéal (objectifs de l'Accord de Paris)
        referenceValues = {
          targetYear: 2050,
          co2: 350, // ppm
          temp: 1.5, // °C
          sea: 0.5, // m
          biodiversity: 2.0 // indice positif
        };
        break;
      case "business-as-usual":
        // Scénario sans actions majeures
        referenceValues = {
          targetYear: 2050,
          co2: 500, // ppm
          temp: 2.5, // °C
          sea: 1.0, // m
          biodiversity: -1.0 // indice négatif
        };
        break;
      case "catastrophic":
        // Scénario catastrophe
        referenceValues = {
          targetYear: 2050,
          co2: 600, // ppm
          temp: 3.5, // °C
          sea: 1.5, // m
          biodiversity: -3.0 // indice très négatif
        };
        break;
      default:
        referenceValues = {
          targetYear: 2050,
          co2: 350,
          temp: 1.5,
          sea: 0.5,
          biodiversity: 2.0
        };
    }
    
    // Extrapoler les valeurs actuelles jusqu'à l'année de référence
    const yearsToTarget = referenceValues.targetYear - state.year;
    
    // Calculer les taux de changement annuels moyens basés sur l'historique
    const trends = this.calculateAnnualChanges();
    
    // Projeter les valeurs futures basées sur les tendances actuelles
    const projectedValues = {
      targetYear: referenceValues.targetYear,
      co2: state.co2 + (trends.co2 * yearsToTarget),
      temp: state.temp + (trends.temp * yearsToTarget),
      sea: state.sea + (trends.sea * yearsToTarget),
      biodiversity: state.biodiversity + (trends.biodiversity * yearsToTarget)
    };
    
    // Calculer les écarts par rapport au scénario de référence
    const gaps = {
      co2: projectedValues.co2 - referenceValues.co2,
      temp: projectedValues.temp - referenceValues.temp,
      sea: projectedValues.sea - referenceValues.sea,
      biodiversity: projectedValues.biodiversity - referenceValues.biodiversity
    };
    
    // Calculer un score global de 0 à 100
    const normalizeScore = (value, target, worst) => {
      // Plus c'est proche de la cible, meilleur est le score
      // La valeur "pire" représente un score de 0
      const raw = Math.max(0, 1 - Math.abs(value - target) / Math.abs(worst - target));
      return Math.round(raw * 100);
    };
    
    // Définir les valeurs "pires" pour chaque métrique
    const worstCase = {
      co2: 700, // ppm
      temp: 4.0, // °C
      sea: 2.0, // m
      biodiversity: -5.0 // indice très négatif
    };
    
    // Calculer les scores pour chaque métrique
    const scores = {
      co2: normalizeScore(projectedValues.co2, referenceValues.co2, worstCase.co2),
      temp: normalizeScore(projectedValues.temp, referenceValues.temp, worstCase.temp),
      sea: normalizeScore(projectedValues.sea, referenceValues.sea, worstCase.sea),
      biodiversity: normalizeScore(projectedValues.biodiversity, referenceValues.biodiversity, worstCase.biodiversity)
    };
    
    // Score global (moyenne pondérée)
    const weights = { co2: 0.25, temp: 0.3, sea: 0.2, biodiversity: 0.25 };
    const globalScore = Math.round(
      weights.co2 * scores.co2 +
      weights.temp * scores.temp +
      weights.sea * scores.sea +
      weights.biodiversity * scores.biodiversity
    );
    
    // Retourner la comparaison complète
    return {
      referenceType,
      referenceValues,
      projectedValues,
      gaps,
      scores,
      globalScore
    };
  }
  
  // Calculer les taux de changement annuels moyens
  calculateAnnualChanges() {
    // Utiliser les données des 10 dernières années ou moins
    const getRecentRate = (trendData) => {
      if (trendData.length < 2) return 0;
      
      const recent = trendData.slice(-10); // Jusqu'à 10 points de données les plus récents
      
      if (recent.length < 2) return 0;
      
      const first = recent[0];
      const last = recent[recent.length - 1];
      
      const yearsDiff = last.year - first.year;
      if (yearsDiff === 0) return 0;
      
      return (last.value - first.value) / yearsDiff;
    };
    
    return {
      co2: getRecentRate(this.metrics.co2Trend),
      temp: getRecentRate(this.metrics.tempTrend),
      sea: getRecentRate(this.metrics.seaTrend),
      biodiversity: getRecentRate(this.metrics.biodiversityTrend)
    };
  }
  
  // Générer des données pour un graphique d'évolution climatique
  generateChartData(metric = "temp", includeProjection = true) {
    // Vérifier que la métrique existe
    if (!this.metrics[`${metric}Trend`]) {
      return null;
    }
    
    // Récupérer les données historiques
    const historicalData = this.metrics[`${metric}Trend`].map(data => ({
      year: data.year,
      value: data.value,
      type: "historical"
    }));
    
    // Si une projection est demandée
    if (includeProjection) {
      const projectionYears = 25; // Projeter sur 25 ans
      const trends = this.calculateAnnualChanges();
      const annualChange = trends[metric] || 0;
      
      // Dernière année des données historiques
      const lastData = historicalData[historicalData.length - 1];
      if (!lastData) return historicalData;
      
      const projectionData = [];
      
      // Générer des points de données pour la projection
      for (let i = 1; i <= projectionYears; i++) {
        projectionData.push({
          year: lastData.year + i,
          value: lastData.value + (annualChange * i),
          type: "projection"
        });
      }
      
      // Combiner données historiques et projections
      return [...historicalData, ...projectionData];
    }
    
    return historicalData;
  }
  
  // Sauvegarder l'état du système
  saveSystemState() {
    this.systemState = {
      keyDecisions: this.keyDecisions,
      pathSnapshots: this.pathSnapshots,
      criticalEvents: this.criticalEvents,
      metrics: this.metrics
    };
    
    // Dans une implémentation complète, on sauvegarderait dans localStorage
    // localStorage.setItem('climaquest_path_tracker', JSON.stringify(this.systemState));
  }
  
  // Charger l'état du système
  loadSystemState() {
    // Dans une implémentation complète, on chargerait depuis localStorage
    // const savedState = JSON.parse(localStorage.getItem('climaquest_path_tracker'));
    
    const savedState = null; // Pour l'instant
    
    if (savedState) {
      this.keyDecisions = savedState.keyDecisions || [];
      this.pathSnapshots = savedState.pathSnapshots || [];
      this.criticalEvents = savedState.criticalEvents || [];
      this.metrics = savedState.metrics || {
        co2Trend: [],
        tempTrend: [],
        seaTrend: [],
        biodiversityTrend: [],
        budgetTrend: []
      };
    }
  }
}

// Exporter une instance unique du tracker de parcours climatique
export const climatePathTracker = new ClimatePathTracker();
