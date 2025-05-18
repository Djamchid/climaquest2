// Système de visualisation améliorée pour ClimaQuest
import { state } from './engine.js';

// Classe pour gérer les visualisations et animations
class VisualizationSystem {
  constructor() {
    // Éléments graphiques
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    
    // Éléments du paysage
    this.landscape = {
      sky: {
        gradient: null,
        baseColors: {
          top: { r: 135, g: 206, b: 235 },
          bottom: { r: 200, g: 230, b: 255 }
        },
        warmedColors: {
          top: { r: 255, g: 100, b: 100 },
          bottom: { r: 255, g: 180, b: 150 }
        }
      },
      sea: {
        gradient: null,
        level: 0, // Sera calculé en fonction de state.sea
        baseLevel: 0, // Niveau de référence
        waveAmplitude: 2,
        waveFrequency: 0.1,
        waveSpeed: 0.5,
        baseColors: {
          top: { r: 26, g: 140, b: 255 },
          bottom: { r: 0, g: 92, b: 179 }
        }
      },
      land: {
        gradient: null,
        hills: [],
        baseColors: {
          top: { r: 34, g: 139, b: 34 },
          bottom: { r: 85, g: 107, b: 47 }
        },
        driedColors: {
          top: { r: 160, g: 120, b: 60 },
          bottom: { r: 139, g: 69, b: 19 }
        },
        forestLevel: 1, // 0 à 1, sera ajusté selon la biodiversité
        citySize: 0.4 // 0 à 1, grandeur relative des zones urbaines
      },
      clouds: {
        particles: [],
        count: 15,
        speed: 0.2,
        color: "rgba(255, 255, 255, 0.7)"
      },
      co2: {
        particles: [],
        count: 0, // Sera calculé en fonction de state.co2
        baseCount: 20, // Pour 400 ppm
        speed: 0.1,
        color: "rgba(100, 100, 100, 0.4)"
      },
      time: {
        day: true,
        sunrise: { r: 255, g: 200, b: 100 },
        day: { r: 135, g: 206, b: 235 },
        sunset: { r: 255, g: 100, b: 50 },
        night: { r: 25, g: 25, b: 60 },
        cycle: 0, // 0 à 1, position dans le cycle jour/nuit
        speed: 0.001 // Vitesse du cycle
      },
      animals: {
        types: [
          { name: "birds", count: 0, baseCount: 5, size: 3, speed: 1.5, color: "#333" },
          { name: "fish", count: 0, baseCount: 8, size: 4, speed: 0.8, color: "#39F" }
        ],
        instances: []
      },
      vegetation: {
        trees: [],
        baseCount: 12, // Nombre de base d'arbres
        count: 0, // Sera calculé en fonction de la biodiversité
        colors: {
          healthy: { r: 34, g: 139, b: 34 },
          stressed: { r: 160, g: 120, b: 60 }
        }
      },
      urbanArea: {
        buildings: [],
        baseCount: 8,
        count: 0, // Sera ajusté en fonction des émissions et de l'économie
        emissions: [] // Particules d'émission des bâtiments
      }
    };
    
    // État de l'animation
    this.animationFrame = null;
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    
    // Effets spéciaux
    this.effects = {
      heatwave: {
        active: false,
        intensity: 0,
        duration: 5000, // ms
        startTime: 0
      },
      flood: {
        active: false,
        intensity: 0,
        duration: 5000, // ms
        startTime: 0
      },
      drought: {
        active: false,
        intensity: 0,
        duration: 5000, // ms
        startTime: 0
      }
    };
  }
  
  // Initialiser le système de visualisation
  initialize(canvasId) {
    // Récupérer le canvas
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas avec l'ID "${canvasId}" non trouvé`);
      return false;
    }
    
    // Récupérer le contexte 2D
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      console.error("Impossible d'obtenir le contexte 2D du canvas");
      return false;
    }
    
    // Définir les dimensions
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Initialiser les éléments du paysage
    this.initLandscape();
    
    // Démarrer la boucle d'animation
    this.startAnimation();
    
    console.log("Système de visualisation initialisé");
    return true;
  }
  
  // Initialiser les éléments du paysage
  initLandscape() {
    // Niveau de base de la mer (mi-hauteur)
    this.landscape.sea.baseLevel = this.height / 2;
    
    // Générer les collines
    this.generateHills();
    
    // Initialiser les nuages
    this.generateClouds();
    
    // Initialiser les particules de CO2
    this.generateCO2Particles();
    
    // Initialiser les animaux
    this.generateAnimals();
    
    // Initialiser la végétation
    this.generateVegetation();
    
    // Initialiser les zones urbaines
    this.generateUrbanAreas();
  }
  
  // Générer les collines du paysage
  generateHills() {
    const hills = [];
    
    // Générer quelques "collines" avec hauteur aléatoire
    for (let x = 100; x < this.width - 100; x += 120) {
      const height = Math.random() * 40 + 25; // hauteur entre 25 et 65 pixels
      hills.push({ x, height });
    }
    
    // Trier les collines par coordonnée x
    hills.sort((a, b) => a.x - b.x);
    
    this.landscape.land.hills = hills;
  }
  
  // Générer les nuages
  generateClouds() {
    const clouds = [];
    
    for (let i = 0; i < this.landscape.clouds.count; i++) {
      clouds.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height / 3), // Nuages dans le tiers supérieur
        size: Math.random() * 40 + 20, // Taille entre 20 et 60
        speed: Math.random() * 0.3 + 0.1, // Vitesse entre 0.1 et 0.4
        opacity: Math.random() * 0.4 + 0.3 // Opacité entre 0.3 et 0.7
      });
    }
    
    this.landscape.clouds.particles = clouds;
  }
  
  // Générer les particules de CO2
  generateCO2Particles() {
    // Calculer le nombre de particules en fonction du niveau de CO2
    const co2Level = Math.max(0, state.co2 - 350); // 350 ppm comme base
    this.landscape.co2.count = Math.floor((co2Level / 50) * this.landscape.co2.baseCount);
    
    const particles = [];
    
    for (let i = 0; i < this.landscape.co2.count; i++) {
      particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 6 + 2, // Taille entre 2 et 8
        speed: Math.random() * 0.2 + 0.05, // Vitesse entre 0.05 et 0.25
        opacity: Math.random() * 0.3 + 0.1 // Opacité entre 0.1 et 0.4
      });
    }
    
    this.landscape.co2.particles = particles;
  }
  
  // Générer les animaux
  generateAnimals() {
    const animals = [];
    
    // Calculer le nombre d'animaux en fonction de la biodiversité
    const biodiversityFactor = Math.max(0, (state.biodiversity + 5) / 10); // De 0 à 1
    
    // Pour chaque type d'animal
    for (const type of this.landscape.animals.types) {
      const count = Math.floor(type.baseCount * biodiversityFactor);
      
      for (let i = 0; i < count; i++) {
        // Position initiale selon le type (oiseaux en haut, poissons en bas)
        let x, y;
        if (type.name === "birds") {
          x = Math.random() * this.width;
          y = Math.random() * (this.height / 3); // Oiseaux dans le ciel
        } else if (type.name === "fish") {
          x = Math.random() * this.width;
          y = this.landscape.sea.baseLevel + Math.random() * (this.height / 3); // Poissons dans l'eau
        } else {
          x = Math.random() * this.width;
          y = Math.random() * this.height;
        }
        
        animals.push({
          type: type.name,
          x,
          y,
          size: type.size,
          speed: type.speed * (Math.random() * 0.4 + 0.8), // Variation de vitesse
          color: type.color,
          direction: Math.random() * Math.PI * 2 // Direction aléatoire en radians
        });
      }
    }
    
    this.landscape.animals.instances = animals;
  }
  
  // Générer la végétation
  generateVegetation() {
    const trees = [];
    
    // Calculer le nombre d'arbres en fonction de la biodiversité
    const biodiversityFactor = Math.max(0, (state.biodiversity + 5) / 10); // De 0 à 1
    this.landscape.vegetation.count = Math.floor(this.landscape.vegetation.baseCount * biodiversityFactor);
    
    // Position des arbres sur les collines
    for (let i = 0; i < this.landscape.vegetation.count; i++) {
      // Choisir une position x aléatoire
      const x = Math.random() * this.width;
      
      // Trouver la hauteur de la terre à cette position
      const landY = this.getLandHeightAtPosition(x);
      
      // Ajouter l'arbre
      trees.push({
        x,
        y: landY - 15, // Positionner l'arbre sur la terre
        size: Math.random() * 10 + 15, // Taille entre 15 et 25
        health: Math.random() * 0.3 + 0.7 // Santé entre 0.7 et 1
      });
    }
    
    this.landscape.vegetation.trees = trees;
  }
  
  // Générer les zones urbaines
  generateUrbanAreas() {
    const buildings = [];
    
    // Calculer le nombre de bâtiments en fonction de l'économie (simplifié)
    const economyFactor = Math.min(1, state.budget / 20); // De 0 à 1
    this.landscape.urbanArea.count = Math.floor(this.landscape.urbanArea.baseCount * economyFactor);
    
    // Position des bâtiments sur les collines
    for (let i = 0; i < this.landscape.urbanArea.count; i++) {
      // Choisir une position x aléatoire (plus concentrée à gauche pour créer une "ville")
      const x = Math.random() * this.width * 0.7;
      
      // Trouver la hauteur de la terre à cette position
      const landY = this.getLandHeightAtPosition(x);
      
      // Ajouter le bâtiment
      buildings.push({
        x,
        y: landY - 30, // Positionner le bâtiment sur la terre
        width: Math.random() * 15 + 20, // Largeur entre 20 et 35
        height: Math.random() * 30 + 30, // Hauteur entre 30 et 60
        emissionRate: Math.random() * 0.5 + 0.2 // Taux d'émission entre 0.2 et 0.7
      });
    }
    
    this.landscape.urbanArea.buildings = buildings;
  }
  
  // Démarrer la boucle d'animation
  startAnimation() {
    this.lastFrameTime = performance.now();
    this.animate();
  }
  
  // Boucle d'animation principale
  animate(currentTime) {
    // Calculer le delta time pour des animations fluides
    this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // en secondes
    this.lastFrameTime = currentTime;
    
    // Limiter le delta time pour éviter les sauts d'animation
    if (this.deltaTime > 0.1) this.deltaTime = 0.1;
    
    // Mettre à jour l'état
    this.update();
    
    // Dessiner la scène
    this.render();
    
    // Continuer la boucle d'animation
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }
  
  // Mettre à jour tous les éléments animés
  update() {
    // Dans la méthode update de la classe VisualizationSystem, ajoutez au début :
    const currentTime = Date.now(); // Définition de currentTime
    
    // reste du code inchangé...  // Mettre à jour le cycle jour/nuit
    this.landscape.time.cycle += this.landscape.time.speed * this.deltaTime;
    if (this.landscape.time.cycle > 1) this.landscape.time.cycle -= 1;
    
    // Mettre à jour les nuages
    for (const cloud of this.landscape.clouds.particles) {
      cloud.x += cloud.speed * this.deltaTime * 60;
      
      // Réinitialiser la position si le nuage sort de l'écran
      if (cloud.x > this.width + cloud.size) {
        cloud.x = -cloud.size;
        cloud.y = Math.random() * (this.height / 3);
        cloud.size = Math.random() * 40 + 20;
        cloud.speed = Math.random() * 0.3 + 0.1;
        cloud.opacity = Math.random() * 0.4 + 0.3;
      }
    }
    
    // Mettre à jour les particules de CO2
    for (const particle of this.landscape.co2.particles) {
      particle.y -= particle.speed * this.deltaTime * 60;
      
      // Réinitialiser la position si la particule sort de l'écran
      if (particle.y < -particle.size) {
        particle.y = this.height + particle.size;
        particle.x = Math.random() * this.width;
        particle.size = Math.random() * 6 + 2;
        particle.speed = Math.random() * 0.2 + 0.05;
        particle.opacity = Math.random() * 0.3 + 0.1;
      }
    }
    
    // Mettre à jour les animaux
    for (const animal of this.landscape.animals.instances) {
      // Déplacer l'animal dans sa direction
      animal.x += Math.cos(animal.direction) * animal.speed * this.deltaTime * 60;
      animal.y += Math.sin(animal.direction) * animal.speed * this.deltaTime * 60;
      
      // Changer de direction aléatoirement
      if (Math.random() < 0.01) {
        animal.direction = Math.random() * Math.PI * 2;
      }
      
      // Garder l'animal dans les limites
      if (animal.x < 0) animal.x = 0;
      if (animal.x > this.width) animal.x = this.width;
      
      if (animal.type === "birds") {
        // Garder les oiseaux dans le ciel
        if (animal.y < 0) animal.y = 0;
        if (animal.y > this.landscape.sea.baseLevel - 20) animal.y = this.landscape.sea.baseLevel - 20;
      } else if (animal.type === "fish") {
        // Garder les poissons dans l'eau
        if (animal.y < this.landscape.sea.baseLevel + 10) animal.y = this.landscape.sea.baseLevel + 10;
        if (animal.y > this.height) animal.y = this.height;
      }
    }
    
    // Mettre à jour les effets spéciaux
    this.updateEffects(currentTime);
  }
  
  // Mettre à jour les effets spéciaux
  updateEffects(currentTime) {
    // Vérifier chaque effet actif
    for (const effectName in this.effects) {
      const effect = this.effects[effectName];
      
      if (effect.active) {
        // Calculer la progression de l'effet
        const elapsed = currentTime - effect.startTime;
        const progress = Math.min(1, elapsed / effect.duration);
        
        // Si l'effet est terminé, le désactiver
        if (progress >= 1) {
          effect.active = false;
          effect.intensity = 0;
        } else {
          // Sinon, mettre à jour l'intensité
          // Courbe d'intensité en cloche pour un effet naturel
          effect.intensity = Math.sin(progress * Math.PI) * effect.maxIntensity;
        }
      }
    }
  }
  
  // Dessiner la scène complète
  render() {
    // Effacer le canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Dessiner le ciel
    this.drawSky();
    
    // Dessiner la mer
    this.drawSea();
    
    // Dessiner la terre
    this.drawLand();
    
    // Dessiner les zones urbaines
    this.drawUrbanAreas();
    
    // Dessiner la végétation
    this.drawVegetation();
    
    // Dessiner les animaux
    this.drawAnimals();
    
    // Dessiner les nuages
    this.drawClouds();
    
    // Dessiner les particules de CO2
    this.drawCO2Particles();
    
    // Dessiner les effets spéciaux
    this.drawEffects();
  }
  
  // Dessiner le ciel avec dégradé
  drawSky() {
    // Créer un dégradé pour le ciel
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.landscape.sea.baseLevel);
    
    // Obtenir la couleur du ciel en fonction de la température
    const tempFactor = Math.min(1, Math.max(0, (state.temp - 1.0) / 3.0)); // De 0 à 1 pour temp de 1°C à 4°C
    
    // Interpoler entre les couleurs de base et réchauffées
    const topR = Math.floor(this.landscape.sky.baseColors.top.r + tempFactor * (this.landscape.sky.warmedColors.top.r - this.landscape.sky.baseColors.top.r));
    const topG = Math.floor(this.landscape.sky.baseColors.top.g + tempFactor * (this.landscape.sky.warmedColors.top.g - this.landscape.sky.baseColors.top.g));
    const topB = Math.floor(this.landscape.sky.baseColors.top.b + tempFactor * (this.landscape.sky.warmedColors.top.b - this.landscape.sky.baseColors.top.b));
    
    const bottomR = Math.floor(this.landscape.sky.baseColors.bottom.r + tempFactor * (this.landscape.sky.warmedColors.bottom.r - this.landscape.sky.baseColors.bottom.r));
    const bottomG = Math.floor(this.landscape.sky.baseColors.bottom.g + tempFactor * (this.landscape.sky.warmedColors.bottom.g - this.landscape.sky.baseColors.bottom.g));
    const bottomB = Math.floor(this.landscape.sky.baseColors.bottom.b + tempFactor * (this.landscape.sky.warmedColors.bottom.b - this.landscape.sky.baseColors.bottom.b));
    
    skyGradient.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`);
    skyGradient.addColorStop(1, `rgb(${bottomR}, ${bottomG}, ${bottomB})`);
    
    // Dessiner le ciel
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.width, this.landscape.sea.baseLevel);
  }
  
  // Dessiner la mer avec vagues
  drawSea() {
    // Calculer le niveau de la mer en fonction de state.sea
    const seaRise = state.sea * 50; // 50 pixels par mètre
    this.landscape.sea.level = this.landscape.sea.baseLevel - seaRise;
    
    // Créer un dégradé pour la mer
    const seaGradient = this.ctx.createLinearGradient(0, this.landscape.sea.level, 0, this.height);
    seaGradient.addColorStop(0, `rgb(${this.landscape.sea.baseColors.top.r}, ${this.landscape.sea.baseColors.top.g}, ${this.landscape.sea.baseColors.top.b})`);
    seaGradient.addColorStop(1, `rgb(${this.landscape.sea.baseColors.bottom.r}, ${this.landscape.sea.baseColors.bottom.g}, ${this.landscape.sea.baseColors.bottom.b})`);
    
    // Dessiner la mer
    this.ctx.fillStyle = seaGradient;
    this.ctx.beginPath();
    
    // Dessiner des vagues
    const waveTime = performance.now() / 1000; // Temps en secondes pour l'animation
    
    this.ctx.moveTo(0, this.landscape.sea.level);
    
    for (let x = 0; x <= this.width; x += 5) {
      // Calculer la hauteur de la vague à cette position
      const waveHeight = Math.sin(x * this.landscape.sea.waveFrequency + waveTime * this.landscape.sea.waveSpeed) * this.landscape.sea.waveAmplitude;
      this.ctx.lineTo(x, this.landscape.sea.level + waveHeight);
    }
    
    // Compléter le rectangle de la mer
    this.ctx.lineTo(this.width, this.height);
    this.ctx.lineTo(0, this.height);
    this.ctx.closePath();
    
    this.ctx.fill();
  }
  
  // Dessiner la terre avec collines
  drawLand() {
    // Créer un dégradé pour la terre
    const landGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    
    // Obtenir la couleur de la terre en fonction de la température et de la biodiversité
    const dryFactor = Math.min(1, Math.max(0, (state.temp - 1.0) / 2.0 - (state.biodiversity / 5))); // De 0 à 1
    
    // Interpoler entre les couleurs de base et séchées
    const topR = Math.floor(this.landscape.land.baseColors.top.r + dryFactor * (this.landscape.land.driedColors.top.r - this.landscape.land.baseColors.top.r));
    const topG = Math.floor(this.landscape.land.baseColors.top.g + dryFactor * (this.landscape.land.driedColors.top.g - this.landscape.land.baseColors.top.g));
    const topB = Math.floor(this.landscape.land.baseColors.top.b + dryFactor * (this.landscape.land.driedColors.top.b - this.landscape.land.baseColors.top.b));
    
    const bottomR = Math.floor(this.landscape.land.baseColors.bottom.r + dryFactor * (this.landscape.land.driedColors.bottom.r - this.landscape.land.baseColors.bottom.r));
    const bottomG = Math.floor(this.landscape.land.baseColors.bottom.g + dryFactor * (this.landscape.land.driedColors.bottom.g - this.landscape.land.baseColors.bottom.g));
    const bottomB = Math.floor(this.landscape.land.baseColors.bottom.b + dryFactor * (this.landscape.land.driedColors.bottom.b - this.landscape.land.baseColors.bottom.b));
    
    landGradient.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`);
    landGradient.addColorStop(1, `rgb(${bottomR}, ${bottomG}, ${bottomB})`);
    
    // Dessiner la terre avec collines
    this.ctx.fillStyle = landGradient;
    this.ctx.beginPath();
    
    // Commencer à gauche
    this.ctx.moveTo(0, this.landscape.sea.baseLevel);
    
    // Dessiner la première section
    if (this.landscape.land.hills.length > 0) {
      this.ctx.quadraticCurveTo(
        this.landscape.land.hills[0].x / 2,
        this.landscape.sea.baseLevel - this.landscape.land.hills[0].height / 3,
        this.landscape.land.hills[0].x,
        this.landscape.sea.baseLevel - this.landscape.land.hills[0].height
      );
    }
    
    // Dessiner les sections du milieu
    for (let i = 0; i < this.landscape.land.hills.length - 1; i++) {
      const cpX = (this.landscape.land.hills[i].x + this.landscape.land.hills[i + 1].x) / 2;
      const cpY = this.landscape.sea.baseLevel - Math.min(this.landscape.land.hills[i].height, this.landscape.land.hills[i + 1].height) * 0.8;
      
      this.ctx.quadraticCurveTo(
        cpX,
        cpY,
        this.landscape.land.hills[i + 1].x,
        this.landscape.sea.baseLevel - this.landscape.land.hills[i + 1].height
      );
    }
    
    // Dessiner la dernière section
    if (this.landscape.land.hills.length > 0) {
      const lastHill = this.landscape.land.hills[this.landscape.land.hills.length - 1];
      this.ctx.quadraticCurveTo(
        (lastHill.x + this.width) / 2,
        this.landscape.sea.baseLevel - lastHill.height / 3,
        this.width,
        this.landscape.sea.baseLevel
      );
    }
    
    // Compléter le rectangle de la terre
    this.ctx.lineTo(this.width, this.height);
    this.ctx.lineTo(0, this.height);
    this.ctx.closePath();
    
    this.ctx.fill();
  }
  
  // Dessiner les nuages
  drawClouds() {
    this.ctx.fillStyle = this.landscape.clouds.color;
    
    for (const cloud of this.landscape.clouds.particles) {
      this.ctx.globalAlpha = cloud.opacity;
      
      // Dessiner un nuage (plusieurs cercles groupés)
      this.ctx.beginPath();
      this.ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.size * 0.4, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.4, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.2, cloud.size * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1;
  }
  
  // Dessiner les particules de CO2
  drawCO2Particles() {
    this.ctx.fillStyle = this.landscape.co2.color;
    
    for (const particle of this.landscape.co2.particles) {
      this.ctx.globalAlpha = particle.opacity;
      
      // Dessiner une particule de CO2 (cercle)
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1;
  }
  
  // Dessiner les animaux
  drawAnimals() {
    for (const animal of this.landscape.animals.instances) {
      this.ctx.fillStyle = animal.color;
      
      if (animal.type === "birds") {
        // Dessiner un oiseau (forme en V simple)
        this.ctx.beginPath();
        this.ctx.moveTo(animal.x, animal.y);
        this.ctx.lineTo(animal.x - animal.size, animal.y - animal.size/2);
        this.ctx.lineTo(animal.x - animal.size/2, animal.y);
        this.ctx.lineTo(animal.x - animal.size, animal.y + animal.size/2);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (animal.type === "fish") {
        // Dessiner un poisson (forme ovale avec queue)
        this.ctx.beginPath();
        this.ctx.ellipse(animal.x, animal.y, animal.size, animal.size/2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Queue
        this.ctx.beginPath();
        this.ctx.moveTo(animal.x - animal.size, animal.y);
        this.ctx.lineTo(animal.x - animal.size*1.5, animal.y - animal.size/2);
        this.ctx.lineTo(animal.x - animal.size*1.5, animal.y + animal.size/2);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
  }
  
  // Dessiner la végétation
  drawVegetation() {
    for (const tree of this.landscape.vegetation.trees) {
      // Couleur de l'arbre basée sur sa santé
      const r = Math.floor(this.landscape.vegetation.colors.healthy.r + (1 - tree.health) * (this.landscape.vegetation.colors.stressed.r - this.landscape.vegetation.colors.healthy.r));
      const g = Math.floor(this.landscape.vegetation.colors.healthy.g + (1 - tree.health) * (this.landscape.vegetation.colors.stressed.g - this.landscape.vegetation.colors.healthy.g));
      const b = Math.floor(this.landscape.vegetation.colors.healthy.b + (1 - tree.health) * (this.landscape.vegetation.colors.stressed.b - this.landscape.vegetation.colors.healthy.b));
      
      // Tronc
      this.ctx.fillStyle = '#8B4513'; // Marron
      this.ctx.fillRect(tree.x - 2, tree.y, 4, tree.size);
      
      // Feuillage
      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.ctx.beginPath();
      this.ctx.arc(tree.x, tree.y - tree.size/2, tree.size/2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  // Dessiner les zones urbaines
  drawUrbanAreas() {
    for (const building of this.landscape.urbanArea.buildings) {
      // Dessiner le bâtiment
      this.ctx.fillStyle = '#AAA'; // Gris pour les bâtiments
      this.ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Fenêtres
      this.ctx.fillStyle = '#FFF7A6'; // Jaune clair pour les fenêtres
      const windowSize = 4;
      const windowSpacing = 10;
      
      for (let y = building.y + 10; y < building.y + building.height - windowSize; y += windowSpacing) {
        for (let x = building.x + 5; x < building.x + building.width - windowSize; x += windowSpacing) {
          this.ctx.fillRect(x, y, windowSize, windowSize);
        }
      }
      
      // Émissions de CO2 (si le niveau de CO2 est élevé)
      if (state.co2 > 400) {
        const emissionIntensity = (state.co2 - 400) / 200; // De 0 à 1 pour CO2 de 400 à 600
        
        if (Math.random() < emissionIntensity * building.emissionRate) {
          // Dessiner une "fumée" sortant de certains bâtiments
          this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
          this.ctx.beginPath();
          
          const chimneyX = building.x + building.width * 0.8;
          const chimneyY = building.y;
          
          // Forme de fumée aléatoire
          this.ctx.moveTo(chimneyX, chimneyY);
          this.ctx.bezierCurveTo(
            chimneyX + 5, chimneyY - 10,
            chimneyX + 10, chimneyY - 15,
            chimneyX + 5, chimneyY - 20
          );
          this.ctx.bezierCurveTo(
            chimneyX + 15, chimneyY - 25,
            chimneyX + 20, chimneyY - 20,
            chimneyX + 25, chimneyY - 30
          );
          this.ctx.bezierCurveTo(
            chimneyX + 30, chimneyY - 25,
            chimneyX + 25, chimneyY - 15,
            chimneyX + 30, chimneyY - 10
          );
          this.ctx.bezierCurveTo(
            chimneyX + 25, chimneyY - 5,
            chimneyX + 15, chimneyY,
            chimneyX, chimneyY
          );
          
          this.ctx.fill();
        }
      }
    }
  }
  
  // Dessiner les effets spéciaux
  drawEffects() {
    // Effet de vague de chaleur
    if (this.effects.heatwave.active) {
      // Créer un effet de distorsion
      this.ctx.globalAlpha = this.effects.heatwave.intensity * 0.2;
      this.ctx.fillStyle = 'rgba(255, 200, 50, 0.2)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalAlpha = 1;
    }
    
    // Effet d'inondation
    if (this.effects.flood.active) {
      // Augmenter temporairement le niveau de la mer
      const extraRise = this.effects.flood.intensity * 20; // Jusqu'à 20 pixels de plus
      
      this.ctx.fillStyle = 'rgba(26, 140, 255, 0.4)';
      this.ctx.fillRect(0, this.landscape.sea.level - extraRise, this.width, extraRise);
    }
    
    // Effet de sécheresse
    if (this.effects.drought.active) {
      // Ajouter un filtre orangé
      this.ctx.globalAlpha = this.effects.drought.intensity * 0.3;
      this.ctx.fillStyle = 'rgba(230, 180, 100, 0.3)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalAlpha = 1;
    }
  }
  
  // Déclencher un effet spécial
  triggerEffect(effectName, duration = 5000, intensity = 1.0) {
    if (this.effects[effectName]) {
      this.effects[effectName].active = true;
      this.effects[effectName].maxIntensity = intensity;
      this.effects[effectName].duration = duration;
      this.effects[effectName].startTime = performance.now();
    }
  }
  
  // Mettre à jour la visualisation en fonction de l'état
  updateVisualization() {
    // Recalculer les éléments qui dépendent de l'état
    
    // Recalculer les particules de CO2
    this.generateCO2Particles();
    
    // Recalculer les animaux
    this.generateAnimals();
    
    // Recalculer la végétation
    this.generateVegetation();
    
    // Recalculer les zones urbaines
    this.generateUrbanAreas();
  }
  
  // Fonction utilitaire pour calculer la hauteur du terrain à une position x
  getLandHeightAtPosition(x) {
    // Si aucune colline, utiliser le niveau de base de la mer
    if (this.landscape.land.hills.length === 0) {
      return this.landscape.sea.baseLevel;
    }
    
    // Si x est avant la première colline
    if (x < this.landscape.land.hills[0].x) {
      const h = this.landscape.land.hills[0].height;
      const xRatio = x / this.landscape.land.hills[0].x;
      return this.landscape.sea.baseLevel - (h * xRatio * xRatio);
    }
    
    // Si x est après la dernière colline
    if (x > this.landscape.land.hills[this.landscape.land.hills.length - 1].x) {
      const lastHill = this.landscape.land.hills[this.landscape.land.hills.length - 1];
      const h = lastHill.height;
      const xDist = x - lastHill.x;
      const xMaxDist = this.width - lastHill.x;
      const xRatio = xDist / xMaxDist;
      return this.landscape.sea.baseLevel - (h * (1 - xRatio * xRatio));
    }
    
    // Trouver les deux collines entre lesquelles x se trouve
    let leftHill = this.landscape.land.hills[0];
    let rightHill = this.landscape.land.hills[0];
    
    for (let i = 0; i < this.landscape.land.hills.length - 1; i++) {
      if (x >= this.landscape.land.hills[i].x && x <= this.landscape.land.hills[i + 1].x) {
        leftHill = this.landscape.land.hills[i];
        rightHill = this.landscape.land.hills[i + 1];
        break;
      }
    }
    
    // Interpoler entre les deux collines
    const xRatio = (x - leftHill.x) / (rightHill.x - leftHill.x);
    const height = leftHill.height + (rightHill.height - leftHill.height) * xRatio;
    
    // Ajouter une petite variation pour un terrain plus naturel
    const variation = Math.sin(x * 0.1) * 5;
    
    return this.landscape.sea.baseLevel - height + variation;
  }
}

// Exporter une instance unique du système de visualisation
export const visualizationSystem = new VisualizationSystem();
