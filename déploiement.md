# Guide de déploiement de ClimaQuest

Ce guide détaille les étapes pour déployer ClimaQuest, la version améliorée de ClimaFutur avec des fonctionnalités narratives et des objectifs clairs.

## Prérequis

- Serveur web basique (GitHub Pages, Netlify, Vercel ou serveur local)
- Connaissances de base en HTML, CSS et JavaScript
- Git pour la gestion des versions
- Éditeur de code (VS Code recommandé)

## Structure des fichiers

Assurez-vous que votre projet suit cette structure de fichiers :

```
/climaquest
  /index.html                  # Point d'entrée
  /css
    /main.css                  # Styles principaux (existant)
    /action-info.css           # Styles pour les infos d'action (existant)
    /tipping-points.css        # Styles pour les points de bascule (existant)
    /missions-narrative.css    # Styles pour missions et narration (nouveau)
    /climate-dashboard.css     # Styles pour le tableau de bord (nouveau)
    /additions.css             # Styles additionnels (nouveau)
  /js
    /main.js                   # Point d'entrée JavaScript (mis à jour)
    /data
      /actions.js              # Catalogue d'actions (existant)
      /events.js               # Événements aléatoires (existant)
      /climate-model.js        # Modèle climatique (existant)
    /modules
      /engine.js               # Moteur de jeu (mis à jour)
      /interface.js            # Interface utilisateur (existant)
      /storage.js              # Stockage local (existant)
      /missions.js             # Système de missions (nouveau)
      /narrative-events.js     # Système d'événements narratifs (nouveau)
      /progress-tracking.js    # Suivi du parcours climatique (nouveau)
      /achievements.js         # Système de badges (nouveau)
      /visualization.js        # Visualisation améliorée (nouveau)
      /missions-interface.js   # Interface des missions (nouveau)
      /climate-dashboard.js    # Tableau de bord climatique (nouveau)
  /assets
    /images                    # Images et icônes
    /characters                # Images des personnages conseillers
    /icons                     # Icônes pour badges et actions
```

## Étapes de déploiement

### 1. Préparation du projet

1. Créez un fork du dépôt ClimaFutur original ou clonez-le
2. Créez une nouvelle branche pour la transformation en ClimaQuest
```bash
git checkout -b climaquest-transformation
```

### 2. Mise à jour des fichiers existants

1. Remplacez le fichier `index.html` par la nouvelle version
2. Mettez à jour `js/main.js` avec la version améliorée
3. Remplacez `js/modules/engine.js` par la version mise à jour avec les nouvelles fonctionnalités

### 3. Ajout des nouveaux fichiers

Créez les nouveaux fichiers CSS :
- `css/missions-narrative.css`
- `css/climate-dashboard.css`
- `css/additions.css`

Créez les nouveaux modules JavaScript :
- `js/modules/missions.js`
- `js/modules/narrative-events.js`
- `js/modules/progress-tracking.js`
- `js/modules/achievements.js`
- `js/modules/visualization.js`
- `js/modules/missions-interface.js`
- `js/modules/climate-dashboard.js`

### 4. Déploiement sur GitHub Pages

1. Commitez vos modifications
```bash
git add .
git commit -m "Transform ClimaFutur into ClimaQuest with narrative elements and missions"
```

2. Poussez la branche vers votre dépôt
```bash
git push origin climaquest-transformation
```

3. Si vous utilisez GitHub Pages :
   - Allez dans les paramètres du dépôt
   - Descendez jusqu'à la section "GitHub Pages"
   - Sélectionnez la branche "climaquest-transformation" comme source
   - Cliquez sur "Save"

4. Votre site sera disponible à l'adresse `https://[votre-nom-utilisateur].github.io/[nom-du-repo]/`

### 5. Migration des données (facultatif)

Si vous avez des utilisateurs existants pour ClimaFutur, vous pouvez créer un script de migration pour convertir leurs sauvegardes localStorage :

```javascript
// migration.js - À placer sur la page d'accueil
function migrateData() {
  // Vérifier s'il existe des données anciennes
  const oldData = localStorage.getItem('climafutur_save');
  
  if (oldData) {
    try {
      const oldState = JSON.parse(oldData);
      
      // Créer un nouvel état compatible avec ClimaQuest
      const newState = {
        ...oldState,
        // Ajouter les champs manquants
        stats: {
          tech_investments: 0,
          renewable_actions: 0,
          diplomatic_choices: 0,
          education_actions: 0,
          social_satisfaction: 70,
          reputation: 50,
          public_awareness: 50
        }
      };
      
      // Sauvegarder dans la nouvelle clé si nécessaire
      localStorage.setItem('climaquest_save', JSON.stringify(newState));
      console.log("Migration des données réussie!");
      
      return true;
    } catch (error) {
      console.error("Erreur de migration:", error);
      return false;
    }
  }
  
  return false;
}

// Exécuter la migration au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  const migrated = migrateData();
  if (migrated) {
    alert("Vos données ont été migrées de ClimaFutur vers ClimaQuest!");
  }
});
```

## Personnalisation

### Ajout de nouveaux conseillers

Pour ajouter un nouveau conseiller, modifiez `js/modules/narrative-events.js` :

```javascript
// Ajouter un nouveau conseiller
export const characters = {
  // Conseillers existants...
  
  nouveau_conseiller: {
    id: "nouveau_conseiller",
    name: "Nom du Conseiller",
    title: "Titre du Conseiller",
    speciality: "Domaine d'expertise",
    avatar: "assets/images/characters/nouveau_conseiller.svg",
    color: "#HEX_COLOR",
    introduction: "Description du conseiller et de son rôle."
  }
};
```

### Ajout de nouvelles missions

Pour ajouter une nouvelle mission, modifiez `js/modules/missions.js` :

```javascript
// Ajouter une nouvelle mission
export const missions = [
  // Missions existantes...
  
  {
    id: "nouvelle-mission",
    eraId: "era-2025-2035", // ou une autre ère
    title: "Titre de la Mission",
    description: "Description détaillée de la mission",
    objectives: [
      { id: "objectif-1", description: "Description de l'objectif", parameter: "co2", target: "<=400" },
      { id: "objectif-2", description: "Description de l'objectif", parameter: "budget", target: ">=20" }
    ],
    reward: { type: "unlock", content: "nouvelle-action", description: "Description de la récompense" }
  }
];
```

### Ajout de nouveaux événements narratifs

Pour ajouter un nouvel événement narratif, modifiez `js/modules/narrative-events.js` :

```javascript
// Ajouter un nouvel événement
export const narrativeEvents = [
  // Événements existants...
  
  {
    id: "nouvel-evenement",
    title: "Titre de l'Événement",
    description: "Description détaillée de l'événement narratif et de ses enjeux.",
    era: "era-2025-2035", // ou une autre ère
    trigger: { type: "year", value: 2029 }, // ou un autre déclencheur
    choices: [
      {
        id: "choix-1",
        text: "Description du premier choix",
        character: "dr_chen", // ou un autre conseiller
        advice: "Conseil donné par le personnage",
        effects: { co2: -2.0, temp: -0.01 },
        results: "Description des résultats de ce choix"
      },
      {
        id: "choix-2",
        text: "Description du deuxième choix",
        character: "ministre_dubois", // ou un autre conseiller
        advice: "Conseil donné par le personnage",
        effects: { budget: -3, co2: -1.5 },
        results: "Description des résultats de ce choix"
      }
    ]
  }
];
```

## Résolution des problèmes courants

### Les styles ne s'appliquent pas

- Vérifiez que tous les fichiers CSS sont correctement liés dans `index.html`
- Assurez-vous que les chemins des fichiers sont corrects
- Vérifiez les erreurs de console dans l'inspecteur de votre navigateur

### Les modules JavaScript ne se chargent pas

- Vérifiez que tous les chemins d'importation sont corrects
- Assurez-vous que votre serveur web prend en charge les modules ES6
- Vérifiez que vous n'avez pas d'erreurs de syntaxe dans vos fichiers JS

### Les événements narratifs ne se déclenchent pas

- Vérifiez les conditions de déclenchement dans `narrative-events.js`
- Assurez-vous que `narrativeSystem.checkEventTriggers()` est correctement appelé dans `engine.js`
- Vérifiez que `narrativeSystem.initialize()` est appelé au démarrage du jeu

### Les missions ne progressent pas

- Vérifiez que les objectifs ont des paramètres valides correspondant à des propriétés dans l'état du jeu
- Assurez-vous que `missionSystem.updateMissions()` est correctement appelé après chaque tour
- Vérifiez que les conditions de réalisation des objectifs sont atteignables

## Améliorations futures

Voici quelques idées pour continuer à améliorer ClimaQuest :

1. **Système multijoueur collaboratif** : Permettre à plusieurs joueurs de gérer différentes régions interconnectées
2. **Intégration de données climatiques réelles** : Connecter le jeu à des API de données climatiques pour des scénarios basés sur des données réelles
3. **Mode campagne étendu** : Ajouter plusieurs régions avec des défis spécifiques et des chaînes de missions interconnectées
4. **Visualisations 3D** : Améliorer les représentations visuelles avec des scènes 3D interactives
5. **Exportation de rapports** : Permettre aux joueurs d'exporter leurs résultats sous forme de rapports détaillés pour un usage éducatif
6. **Audio et musique adaptative** : Ajouter des éléments sonores qui évoluent avec l'état du climat dans le jeu

## Conclusion

Ce guide vous a fourni toutes les étapes nécessaires pour déployer ClimaQuest, la version améliorée de ClimaFutur. Grâce aux systèmes de missions, d'événements narratifs et de suivi du parcours climatique, les joueurs peuvent désormais profiter d'une expérience bien plus immersive et éducative.

Si vous avez besoin d'aide supplémentaire ou si vous souhaitez contribuer au développement de ClimaQuest, n'hésitez pas à ouvrir une issue ou une pull request sur le dépôt GitHub.

Bonne chance dans votre rôle d'Architecte de l'Avenir !
