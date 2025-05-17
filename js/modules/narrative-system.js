// Système d'événements narratifs pour ClimaQuest
import { state, actions } from './engine.js';
import { saveState } from './storage.js';

// Personnages conseils du jeu
export const characters = {
  dr_chen: {
    id: "dr_chen",
    name: "Dr. Chen",
    title: "Scientifique Environnemental",
    speciality: "Environnement & Climat",
    avatar: "assets/images/characters/dr_chen.svg",
    color: "#4CAF50",
    introduction: "Mon rôle est de vous tenir informé des réalités scientifiques du changement climatique. Je base mes recommandations sur les données et la recherche."
  },
  
  ministre_dubois: {
    id: "ministre_dubois",
    name: "Ministre Dubois",
    title: "Ministre de l'Économie",
    speciality: "Économie & Finance",
    avatar: "assets/images/characters/ministre_dubois.svg",
    color: "#FF9800",
    introduction: "Je représente les intérêts économiques de notre région. Nous devons rester compétitifs tout en nous adaptant aux nouvelles réalités climatiques."
  },
  
  prof_moreau: {
    id: "prof_moreau",
    name: "Prof. Moreau",
    title: "Sociologue",
    speciality: "Impact Social",
    avatar: "assets/images/characters/prof_moreau.svg",
    color: "#9C27B0",
    introduction: "Je m'assure que nos politiques climatiques sont équitables et qu'elles prennent en compte tous les segments de la société, en particulier les plus vulnérables."
  },
  
  ingenieur_garcia: {
    id: "ingenieur_garcia",
    name: "Ingénieur Garcia",
    title: "Directeur de l'Innovation",
    speciality: "Technologie & Innovation",
    avatar: "assets/images/characters/ingenieur_garcia.svg",
    color: "#00BCD4",
    introduction: "Je recherche des solutions technologiques innovantes pour nous aider à atteindre nos objectifs climatiques sans sacrifier notre qualité de vie."
  }
};

// Définition des événements narratifs
export const narrativeEvents = [
  // Événements de l'ère "Éveil climatique" (2025-2035)
  {
    id: "coastal_flooding_crisis",
    title: "Crise des Inondations Côtières",
    description: "Une série d'inondations côtières sans précédent frappe notre région. Les prévisions indiquent que ces événements vont se multiplier dans les années à venir.",
    era: "era-2025-2035",
    trigger: { type: "year", value: 2027 },
    choices: [
      {
        id: "build_seawalls",
        text: "Construire des digues de protection",
        character: "ingenieur_garcia",
        advice: "Les digues sont une solution technique éprouvée, mais elles ne traitent que le symptôme, pas la cause.",
        effects: { budget: -5, sea: -0.02 },
        results: "Les digues ont été construites rapidement, offrant une protection immédiate aux communautés côtières. Cependant, cela représente un investissement important qui devra être maintenu."
      },
      {
        id: "coastal_retreat",
        text: "Planifier un retrait stratégique des zones à risque",
        character: "prof_moreau",
        advice: "Déplacer les populations des zones à risque est difficile socialement, mais c'est une solution durable sur le long terme.",
        effects: { budget: -2, biodiversity: 0.3 },
        results: "Le plan de retrait a été lancé, avec des réactions mitigées de la population. Les zones évacuées sont progressivement rendues à la nature, créant des zones tampons naturelles."
      },
      {
        id: "innovative_floating",
        text: "Investir dans des infrastructures flottantes adaptatives",
        character: "ingenieur_garcia",
        advice: "C'est une approche innovante qui pourrait transformer notre relation avec l'eau, mais nécessite un investissement significatif en R&D.",
        effects: { budget: -8, sea: -0.01, co2: -0.5 },
        results: "Les premiers quartiers flottants ont émergé, attirant l'attention mondiale. Cette approche avant-gardiste a stimulé l'innovation locale et a créé un nouveau secteur économique prometteur."
      }
    ],
    followUpEvents: {
      "build_seawalls": "seawall_maintenance_2030",
      "coastal_retreat": "coastal_biodiversity_boom",
      "innovative_floating": "floating_district_success"
    }
  },
  
  {
    id: "renewable_energy_opportunity",
    title: "Opportunité Énergétique Renouvelable",
    description: "Une entreprise internationale propose un partenariat pour développer un projet majeur d'énergie renouvelable dans notre région.",
    era: "era-2025-2035",
    trigger: { type: "year", value: 2028 },
    choices: [
      {
        id: "full_partnership",
        text: "Établir un partenariat complet avec partage des bénéfices",
        character: "ministre_dubois",
        advice: "Ce partenariat équilibré nous permettrait de partager les coûts et les bénéfices. Un bon compromis.",
        effects: { budget: -3, co2: -3.0, temp: -0.02 },
        results: "Le partenariat a été un succès, créant des emplois locaux tout en réduisant significativement nos émissions. Les revenus générés commencent à être réinvestis dans d'autres initiatives vertes."
      },
      {
        id: "subsidy_only",
        text: "Subventionner le projet mais garder le contrôle local",
        character: "prof_moreau",
        advice: "Garder le contrôle local garantit que le projet répondra à nos besoins spécifiques et impliquera notre communauté.",
        effects: { budget: -7, co2: -4.0, temp: -0.03 },
        results: "Le projet, entièrement sous contrôle local, a dépassé les attentes en termes de production d'énergie propre. La population s'est fortement impliquée, créant un fort sentiment de fierté communautaire."
      },
      {
        id: "decline_opportunity",
        text: "Décliner et investir dans des projets plus petits mais diversifiés",
        character: "dr_chen",
        advice: "Les petits projets diversifiés sont moins risqués et peuvent mieux s'adapter à nos besoins spécifiques.",
        effects: { budget: -4, co2: -2.0, biodiversity: 0.2 },
        results: "Le portefeuille de petits projets énergétiques s'est développé organiquement, s'adaptant aux besoins locaux. Cette approche a encouragé l'innovation et l'entrepreneuriat local dans le secteur des énergies propres."
      }
    ]
  },
  
  {
    id: "extreme_heatwave",
    title: "Vague de Chaleur Extrême",
    description: "Une vague de chaleur sans précédent frappe notre région, causant des problèmes de santé publique et endommageant les infrastructures. Les scientifiques confirment que de tels événements deviendront plus fréquents.",
    era: "era-2025-2035",
    trigger: { type: "temp", condition: ">1.3" },
    choices: [
      {
        id: "emergency_response",
        text: "Mettre en place un plan d'urgence climatique temporaire",
        character: "prof_moreau",
        advice: "Cette approche réactive est nécessaire pour protéger les plus vulnérables, mais ne résout pas le problème sous-jacent.",
        effects: { budget: -4, temp: 0 },
        results: "Le plan d'urgence a sauvé des vies, mais a révélé les lacunes de nos infrastructures face à ces nouvelles conditions climatiques. La population exige maintenant des solutions plus durables."
      },
      {
        id: "green_infrastructure",
        text: "Investir massivement dans les infrastructures vertes urbaines",
        character: "dr_chen",
        advice: "Les toits verts, les espaces verts et les systèmes de refroidissement naturel peuvent réduire l'effet d'îlot de chaleur urbain de manière significative.",
        effects: { budget: -6, temp: -0.05, biodiversity: 0.4 },
        results: "La transformation verte de nos espaces urbains a non seulement réduit la température locale, mais a aussi créé des espaces publics plus agréables, améliorant la qualité de vie et renforçant la cohésion sociale."
      },
      {
        id: "tech_solution",
        text: "Rechercher des solutions technologiques de refroidissement innovantes",
        character: "ingenieur_garcia",
        advice: "La technologie peut nous offrir des solutions innovantes, mais attention au risque de créer une dépendance énergétique accrue.",
        effects: { budget: -5, co2: 1.0, temp: -0.1 },
        results: "Les nouvelles technologies de refroidissement ont été déployées avec succès, mais leur consommation énergétique pose de nouveaux défis. Un programme d'optimisation énergétique est désormais nécessaire."
      }
    ]
  },
  
  // Événements de suivi et de la prochaine ère
  {
    id: "seawall_maintenance_2030",
    title: "Défis de Maintenance des Digues",
    description: "Les digues construites il y a quelques années nécessitent déjà une maintenance importante, et les prévisions de montée des eaux dépassent les estimations initiales.",
    era: "era-2025-2035",
    trigger: { type: "follow-up", delay: 3 }, // 3 ans après l'événement précédent
    choices: [
      {
        id: "upgrade_seawalls",
        text: "Renforcer et rehausser les digues existantes",
        character: "ingenieur_garcia",
        advice: "C'est une solution à court terme qui continuera d'augmenter en coût à mesure que le niveau de la mer monte.",
        effects: { budget: -7, sea: -0.03 },
        results: "Les digues améliorées tiennent bon pour l'instant, mais les experts s'inquiètent de la viabilité à long terme de cette approche face à l'accélération de la montée des eaux."
      },
      {
        id: "partial_retreat",
        text: "Combiner maintenance et retrait progressif",
        character: "prof_moreau",
        advice: "Cette approche hybride permet de protéger les zones critiques tout en commençant une transition plus durable.",
        effects: { budget: -4, sea: -0.01, biodiversity: 0.2 },
        results: "La stratégie hybride a été bien accueillie, offrant un équilibre entre protection immédiate et adaptation à long terme. Elle est désormais citée comme exemple d'approche pragmatique face au changement climatique."
      },
      {
        id: "natural_barriers",
        text: "Investir dans la restauration d'écosystèmes côtiers comme barrières naturelles",
        character: "dr_chen",
        advice: "Les mangroves, les récifs et les zones humides peuvent offrir une protection naturelle tout en améliorant la biodiversité.",
        effects: { budget: -5, sea: -0.02, biodiversity: 0.6, co2: -1.0 },
        results: "Les écosystèmes côtiers restaurés commencent à agir comme des barrières naturelles efficaces, tout en devenant des attractions touristiques et des zones de pêche productives, générant des bénéfices inattendus."
      }
    ]
  },
  
  // Événements pour l'ère "Transition énergétique" (2035-2045)
  {
    id: "energy_transition_crossroads",
    title: "Carrefour de la Transition Énergétique",
    description: "Notre infrastructure énergétique vieillissante doit être renouvelée. C'est l'occasion de redéfinir notre mix énergétique pour les décennies à venir.",
    era: "era-2035-2045",
    trigger: { type: "year", value: 2036 },
    choices: [
      {
        id: "all_renewable",
        text: "Viser 100% d'énergies renouvelables",
        character: "dr_chen",
        advice: "C'est l'option la plus ambitieuse sur le plan environnemental, mais elle nécessite un investissement initial considérable et une refonte du réseau.",
        effects: { budget: -10, co2: -6.0, temp: -0.1 },
        results: "La transition vers les énergies 100% renouvelables a été difficile mais transformative. Notre région est désormais citée comme un modèle mondial de la transition énergétique."
      },
      {
        id: "balanced_approach",
        text: "Adopter une approche équilibrée et progressive",
        character: "ministre_dubois",
        advice: "Cette voie intermédiaire permet de réduire les émissions tout en maintenant la stabilité économique et énergétique.",
        effects: { budget: -5, co2: -3.0, temp: -0.05 },
        results: "L'approche équilibrée a progressivement transformé notre système énergétique, minimisant les perturbations économiques tout en réduisant significativement notre empreinte carbone."
      },
      {
        id: "high_tech_nuclear",
        text: "Investir dans la nouvelle génération de nucléaire",
        character: "ingenieur_garcia",
        advice: "Les nouvelles technologies nucléaires offrent une production d'énergie stable et à faible émission, mais soulèvent des questions de perception publique.",
        effects: { budget: -8, co2: -5.0, temp: -0.08 },
        results: "Malgré une résistance initiale, notre programme nucléaire avancé a permis une réduction drastique des émissions tout en assurant une stabilité énergétique, gagnant progressivement l'acceptation du public."
      }
    ]
  }
];

// Classe pour gérer les événements narratifs
class NarrativeSystem {
  constructor() {
    this.pendingEvents = [];
    this.activeEvent = null;
    this.pastEvents = [];
    this.pastChoices = {};
    this.followUpQueue = [];
    
    // État du système à sauvegarder
    this.systemState = {
      pendingEvents: this.pendingEvents,
      pastEvents: this.pastEvents,
      pastChoices: this.pastChoices,
      followUpQueue: this.followUpQueue
    };
  }
  
  // Initialiser le système au démarrage du jeu
  initialize() {
    // Charger l'état sauvegardé si disponible
    this.loadSystemState();
    
    console.log("Système narratif initialisé");
  }
  
  // Vérifier les déclencheurs d'événements chaque tour
  checkEventTriggers() {
    // Vérifier si un événement est déjà actif
    if (this.activeEvent) return null;
    
    // Vérifier les événements de suivi en premier
    if (this.followUpQueue.length > 0) {
      const nextFollowUp = this.followUpQueue[0];
      
      // Vérifier si c'est le moment d'activer cet événement de suivi
      if (state.year >= nextFollowUp.triggerYear) {
        // Retirer de la file d'attente
        this.followUpQueue.shift();
        
        // Trouver l'événement correspondant
        const event = narrativeEvents.find(e => e.id === nextFollowUp.eventId);
        if (event) {
          return this.queueEvent(event);
        }
      }
    }
    
    // Vérifier les nouveaux événements basés sur l'année
    for (const event of narrativeEvents) {
      // Vérifier si cet événement a déjà été déclenché
      if (this.pastEvents.includes(event.id)) continue;
      
      // Vérifier si cet événement est en attente
      if (this.pendingEvents.some(e => e.id === event.id)) continue;
      
      // Vérifier le déclencheur
      if (event.trigger) {
        if (event.trigger.type === "year" && state.year === event.trigger.value) {
          return this.queueEvent(event);
        }
        else if (event.trigger.type === "temp") {
          // Extraire l'opérateur et la valeur
          const condition = event.trigger.condition;
          const match = condition.match(/([<>=!]+)(.+)/);
          
          if (match) {
            const operator = match[1];
            const targetValue = parseFloat(match[2]);
            
            let triggered = false;
            switch (operator) {
              case "<=": triggered = state.temp <= targetValue; break;
              case "<": triggered = state.temp < targetValue; break;
              case ">=": triggered = state.temp >= targetValue; break;
              case ">": triggered = state.temp > targetValue; break;
              case "==": 
              case "=": triggered = state.temp === targetValue; break;
              case "!=": triggered = state.temp !== targetValue; break;
            }
            
            if (triggered) {
              return this.queueEvent(event);
            }
          }
        }
        // D'autres types de déclencheurs pourraient être ajoutés ici
      }
    }
    
    return null;
  }
  
  // Ajouter un événement à la file d'attente
  queueEvent(event) {
    if (!event) return null;
    
    // Créer une copie pour ne pas modifier l'original
    const eventCopy = { ...event };
    
    // Ajouter à la file d'attente
    this.pendingEvents.push(eventCopy);
    
    // Sauvegarder l'état
    this.saveSystemState();
    
    console.log(`Événement mis en file d'attente: ${event.id}`);
    
    return eventCopy;
  }
  
  // Récupérer le prochain événement en attente
  getNextPendingEvent() {
    if (this.pendingEvents.length > 0) {
      this.activeEvent = this.pendingEvents.shift();
      return this.activeEvent;
    }
    return null;
  }
  
  // Traiter le choix de l'utilisateur pour un événement
  processChoice(choiceId) {
    if (!this.activeEvent) return false;
    
    // Trouver le choix sélectionné
    const choice = this.activeEvent.choices.find(c => c.id === choiceId);
    if (!choice) return false;
    
    // Enregistrer le choix
    this.pastChoices[this.activeEvent.id] = choiceId;
    this.pastEvents.push(this.activeEvent.id);
    
    // Appliquer les effets
    if (choice.effects) {
      Object.entries(choice.effects).forEach(([key, value]) => {
        if (state[key] !== undefined) {
          state[key] += value;
        }
      });
      
      // Sauvegarder l'état du jeu
      saveState(state);
    }
    
    // Vérifier s'il y a des événements de suivi
    if (this.activeEvent.followUpEvents && this.activeEvent.followUpEvents[choiceId]) {
      const followUpId = this.activeEvent.followUpEvents[choiceId];
      
      // Planifier l'événement de suivi
      const followUpEvent = narrativeEvents.find(e => e.id === followUpId);
      if (followUpEvent && followUpEvent.trigger && followUpEvent.trigger.type === "follow-up") {
        const triggerYear = state.year + (followUpEvent.trigger.delay || 1);
        
        this.followUpQueue.push({
          eventId: followUpId,
          triggerYear: triggerYear
        });
        
        console.log(`Événement de suivi planifié: ${followUpId} pour l'année ${triggerYear}`);
      }
    }
    
    // Réinitialiser l'événement actif
    this.activeEvent = null;
    
    // Sauvegarder l'état du système
    this.saveSystemState();
    
    return true;
  }
  
  // Obtenir les conseils des personnages pour un événement
  getCharacterAdvice(eventId) {
    const event = narrativeEvents.find(e => e.id === eventId);
    if (!event) return [];
    
    return event.choices.map(choice => {
      const character = characters[choice.character];
      
      return {
        choiceId: choice.id,
        choiceText: choice.text,
        characterId: choice.character,
        characterName: character ? character.name : "Inconnu",
        advice: choice.advice
      };
    });
  }
  
  // Sauvegarder l'état du système
  saveSystemState() {
    this.systemState = {
      pendingEvents: this.pendingEvents,
      pastEvents: this.pastEvents,
      pastChoices: this.pastChoices,
      followUpQueue: this.followUpQueue
    };
    
    // Dans une implémentation complète, on sauvegarderait dans localStorage
    // localStorage.setItem('climaquest_narrative', JSON.stringify(this.systemState));
  }
  
  // Charger l'état du système
  loadSystemState() {
    // Dans une implémentation complète, on chargerait depuis localStorage
    // const savedState = JSON.parse(localStorage.getItem('climaquest_narrative'));
    
    const savedState = null; // Pour l'instant
    
    if (savedState) {
      this.pendingEvents = savedState.pendingEvents || [];
      this.pastEvents = savedState.pastEvents || [];
      this.pastChoices = savedState.pastChoices || {};
      this.followUpQueue = savedState.followUpQueue || [];
    }
  }
}

// Exporter une instance unique du système narratif
export const narrativeSystem = new NarrativeSystem();
