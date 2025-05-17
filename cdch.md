# Cahier des Charges Fonctionnel : ClimaQuest - Architecte de l'Avenir

## 1. Présentation du Projet

### 1.1 Contexte
Le jeu ClimaFutur actuel propose une simulation climatique mais manque d'éléments ludiques engageants et d'objectifs clairs. Cette refonte vise à transformer l'expérience en une aventure captivante où l'apprentissage des enjeux climatiques se fait à travers une narration riche et des mécaniques de jeu motivantes.

### 1.2 Objectifs Pédagogiques
- Comprendre les interactions entre les décisions humaines et le climat
- Appréhender la complexité des choix environnementaux et leurs conséquences
- Découvrir différentes stratégies d'adaptation et d'atténuation face au changement climatique
- Sensibiliser aux points de bascule climatiques

## 2. Concept : ClimaQuest - Architecte de l'Avenir

### 2.1 Univers Narratif
Le joueur incarne un "Architecte de l'Avenir", un leader visionnaire chargé de guider une région à travers les défis climatiques du 21ème siècle. Placé aux commandes d'un "Conseil Climatique", il devra relever des missions concrètes face à des crises environnementales, tout en équilibrant les besoins économiques, sociaux et écologiques.

### 2.2 Structure de Progression
- **Système de niveaux** : 5 ères climatiques à traverser (2025-2035, 2035-2045, etc. jusqu'à 2075)
- **Objectifs multi-dimensionnels** pour chaque ère avec des défis spécifiques
- **Tableau de bord visuel** montrant le parcours climatique et les décisions prises
- **Système de badges/trophées** récompensant différentes stratégies (Innovateur Technologique, Diplomate Climatique, etc.)

## 3. Fonctionnalités Principales

### 3.1 Système de Missions et Objectifs
```javascript
const missions = [
  {
    id: "stability-2035",
    title: "Stabilité 2035",
    description: "Limiter la hausse de température à 1.5°C d'ici 2035",
    objectives: [
      { id: "temp-under-15", description: "Maintenir la température sous 1.5°C", parameter: "temp", target: "<=1.5" },
      { id: "budget-minimum", description: "Conserver au moins 15 points de budget", parameter: "budget", target: ">=15" },
      { id: "biodiversity-up", description: "Améliorer la biodiversité de 0.5 point", parameter: "biodiversity", target: ">=0.5" }
    ],
    reward: { type: "unlock", content: "clean-energy-pack" }
  },
  // Autres missions organisées par ère climatique
]
```

### 3.2 Tableau de Bord du Parcours Climatique
- Visualisation interactive de la progression du joueur
- Chronologie des décisions prises avec indicateurs d'impact
- Comparaison entre différents scénarios (chemin actuel vs trajectoires alternatives)
- Points de décision cruciaux mis en évidence

### 3.3 Événements Narratifs et Crises
- Événements scénarisés plutôt qu'aléatoires
- Crises climatiques avec choix multiples et conséquences à long terme
- Personnages récurrents (conseillers, opposants, alliés) offrant des perspectives diverses
- Situations de dilemme moral mettant en lumière les compromis nécessaires

### 3.4 Système de Récompenses Multidimensionnel
```javascript
const achievements = [
  {
    id: "green-innovator",
    title: "Innovateur Vert",
    icon: "tech_badge.svg",
    conditions: [
      { parameter: "tech_investments", condition: ">=10" },
      { parameter: "co2_reduction", condition: ">=15" }
    ],
    reward: { budgetBonus: 2, description: "Attractivité accrue pour les investissements technologiques" }
  },
  // Autres badges/trophées
]
```

### 3.5 Mécaniques de Feedback Visuel
- Animations dynamiques de l'état du monde réagissant aux décisions
- Transformations visuelles des paysages selon l'évolution climatique
- Notifications "points de bascule" avec effets visuels dramatiques
- Mini-cinématiques pour les événements majeurs

## 4. Interface Utilisateur Améliorée

### 4.1 Écran Principal Immersif
- Vue de la région en 3D simplifiée avec zones urbaines, naturelles et côtières
- Cycles jour/nuit et saisons pour immerger le joueur
- Indicateurs climatiques intégrés organiquement dans l'interface
- Personnages animés réagissant aux changements (citoyens, animaux, etc.)

### 4.2 Chambre du Conseil Climatique
- Interface centrale pour prendre des décisions
- Conseillers thématiques (Économie, Environnement, Social, Technologie)
- Rapports interactifs avec visualisations des données climatiques
- Système de messagerie pour les alertes et conseils

### 4.3 Atlas du Climat Mondial
- Carte interactive montrant l'impact global des décisions locales
- Statistiques comparatives avec d'autres régions
- Événements mondiaux affectant les conditions locales
- Objectifs de collaboration internationale

## 5. Spécifications Techniques

### 5.1 Architecture de Fichiers
```
/climaquest
  /index.html                  # Point d'entrée
  /css
    /main.css                  # Styles principaux
    /interface.css             # Styles d'interface
    /animations.css            # Animations et transitions
    /world-view.css            # Styles pour la vue mondiale
  /js
    /main.js                   # Point d'entrée JavaScript
    /modules
      /engine.js               # Cœur de simulation
      /interface.js            # Gestion de l'interface
      /missions.js             # Système de missions
      /progress-tracking.js    # Suivi de progression
      /narrative-events.js     # Événements scénarisés
      /achievements.js         # Système de récompenses
      /visualization.js        # Visualisations graphiques
    /data
      /climate-model.js        # Modèle climatique
      /actions.js              # Actions disponibles
      /events.js               # Événements narratifs
      /dialogue.js             # Dialogues des personnages
  /assets
    /images                    # Graphismes et icônes
    /animations                # Animations
    /sounds                    # Effets sonores et musique
```

### 5.2 Systèmes Clés à Développer

#### 5.2.1 Système de Mission et Progrès
```javascript
class MissionSystem {
  // Gère les objectifs, leur validation et les récompenses
  constructor() {
    this.currentMissions = [];
    this.completedMissions = [];
    this.activeEra = "2025-2035";
  }
  
  checkObjectiveStatus(objective, state) {
    // Vérifie si un objectif est atteint selon l'état du jeu
  }
  
  unlockNewMissions() {
    // Débloque de nouvelles missions selon la progression
  }
  
  awardBadge(badgeId) {
    // Attribue un badge/trophée au joueur
  }
}
```

#### 5.2.2 Système de Suivi du Parcours Climatique
```javascript
class ClimatePathTracker {
  constructor() {
    this.keyDecisions = [];
    this.pathSnapshots = [];
    this.criticalEvents = [];
  }
  
  recordDecision(decision, impact) {
    // Enregistre une décision importante et son impact
  }
  
  generatePathSnapshot() {
    // Crée un instantané de l'état climatique actuel
  }
  
  compareWithOptimalPath() {
    // Compare le parcours actuel avec un scénario optimal
  }
}
```

#### 5.2.3 Système d'Événements Narratifs
```javascript
class NarrativeSystem {
  constructor() {
    this.characters = {};
    this.pendingEvents = [];
    this.storyArcs = {};
  }
  
  queueEvent(eventId, trigger) {
    // Prépare un événement basé sur des déclencheurs
  }
  
  presentEventToUser(event) {
    // Affiche l'événement avec narration et choix
  }
  
  processPastDecisions(decision) {
    // Adapte les événements futurs selon les choix passés
  }
}
```

## 6. Maquettes d'Interface

### 6.1 Écran Principal de la Région
- Vue isométrique avec bâtiments, végétation et côtes
- Effets visuels représentant la pollution, les événements climatiques
- Zones interactives pour accéder aux différentes interfaces
- Indicateurs climatiques intégrés de façon harmonieuse

### 6.2 Tableau de Bord du Parcours Climatique
- Chronologie interactive avec les années et décisions majeures
- Graphiques dynamiques montrant l'évolution des indicateurs
- Points de bifurcation marquant les choix alternatifs possibles
- Badges et trophées débloqués affichés avec fierté

### 6.3 Interface de Prise de Décision
- Présentation des actions classées par catégorie avec icônes distinctives
- Système de filtrage avancé par impact, coût, durée
- Visualisation immédiate de l'impact projeté de chaque action
- Conseils des personnages selon leur domaine d'expertise

## 7. Expérience Utilisateur Améliorée

### 7.1 Onboarding et Tutoriel
- Introduction narrative présentant le contexte et les enjeux
- Tutoriel intégré à la narration avec un mentor guidant les premiers pas
- Objectifs progressifs pour familiariser avec les mécaniques
- Récompenses précoces pour motiver l'engagement

### 7.2 Feedback et Récompenses
- Animations visuelles lors de l'atteinte d'objectifs
- Messages de félicitation des personnages
- Déverrouillage de capacités spéciales et nouvelles actions
- Visualisations des améliorations climatiques

### 7.3 Aspects Sociaux
- Partage des résultats et stratégies sur les réseaux sociaux
- Comparaison anonymisée avec d'autres joueurs
- Défis communautaires avec objectifs collectifs
- Leaderboards thématiques (Meilleur Innovateur, Meilleur Diplomate, etc.)

## 8. Développement et Priorités

### 8.1 MVP (Produit Minimum Viable)
1. Système de simulation de base amélioré
2. Implémentation de 3 missions avec objectifs clairs
3. Tableau de bord du parcours climatique simplifié
4. 10 événements narratifs significatifs
5. Interface utilisateur repensée avec feedback visuel de base

### 8.2 Fonctionnalités pour V2
1. Système complet de personnages conseillers
2. Visualisations avancées des données climatiques
3. Plus de 30 événements narratifs avec arborescences
4. Scénarios alternatifs débloquables
5. Système social de partage et comparaison

### 8.3 Contraintes Techniques
- Déploiement statique (GitHub Pages)
- Stockage local uniquement (localStorage)
- Vanilla JS + HTML/CSS
- Taille des éléments adaptée pour les seniors
- Interface en français uniquement pour l'instant

## 9. Considérations Spécifiques d'Accessibilité

### 9.1 Accessibilité Visuelle
- Contraste élevé entre les éléments
- Tailles de police ajustables
- Icônes larges et distinctives
- Codes couleur doublés par des symboles

### 9.2 Accessibilité Cognitive
- Langage clair et concis
- Tutoriels progressifs
- Options pour ralentir le rythme du jeu
- Possibilité de consulter l'historique des décisions

## 10. Objectifs de Déploiement

### 10.1 Structure de Dépôt Initiale
- Dépôt GitHub avec README détaillé
- Structure de dossiers et fichiers de base
- Scripts de build et déploiement
- Documentation des composants principaux

### 10.2 Planning de Développement
- Phase 1: Architecture et moteur de jeu (4 semaines)
- Phase 2: Interface utilisateur et visualisations (3 semaines)
- Phase 3: Système de missions et narration (3 semaines)
- Phase 4: Tests utilisateurs et ajustements (2 semaines)

Ce cahier des charges transforme ClimaFutur en ClimaQuest, une expérience gamifiée où l'apprentissage des enjeux climatiques devient une aventure captivante avec des objectifs clairs, une narration engageante et une visualisation du parcours du joueur.
