// Modifications à apporter au fichier js/modules/interface.js

// Dans la fonction setupUI(), modifiez la création des boutons d'action comme suit:
// Remplacez la section "Create action buttons with icons" par:

// Create action buttons with icons and info buttons
actions.forEach(a => {
  const btn = document.createElement('button');
  const categoryClass = a.category ? a.category.toLowerCase() : '';
  
  // Obtenir l'icône pour cette action
  const actionIcon = getActionIcon(a.id);
  
  // Créer un conteneur pour le contenu du bouton (icône, nom, coût)
  const buttonContent = document.createElement('div');
  buttonContent.className = 'action-btn-content';
  buttonContent.innerHTML = `
    <div class="action-icon">${actionIcon}</div>
    <span class="action-name">${a.name}</span>
    <span class="action-cost">${a.cost} budget</span>
  `;
  
  // Créer le bouton d'info
  const infoBtn = document.createElement('div');
  infoBtn.className = 'action-info-btn';
  infoBtn.innerHTML = 'i';
  infoBtn.title = 'Voir les effets';
  
  // Empêcher la propagation du clic vers le bouton parent
  infoBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    showActionInfo(a);
  });
  
  // Ajouter les éléments au bouton
  btn.appendChild(buttonContent);
  btn.appendChild(infoBtn);
  
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

// Ajoutez cette fonction pour afficher les informations sur l'action
function showActionInfo(action) {
  console.log(`Affichage des infos pour l'action: ${action.name}`);
  
  // Créer ou récupérer le modal
  let infoModal = document.getElementById('action-info-modal');
  if (!infoModal) {
    infoModal = document.createElement('div');
    infoModal.id = 'action-info-modal';
    document.body.appendChild(infoModal);
    
    // Ajouter un gestionnaire de clic pour fermer le modal
    infoModal.addEventListener('click', function(e) {
      if (e.target === infoModal) {
        infoModal.style.display = 'none';
      }
    });
  }
  
  // Générer le contenu du modal
  let effectsHTML = '';
  
  // Parcourir les effets de l'action
  if (action.effects) {
    effectsHTML += '<ul class="effects-list">';
    
    Object.entries(action.effects).forEach(([key, value]) => {
      // Déterminer la classe CSS et l'icône en fonction du signe de la valeur
      const isPositive = value < 0 && (key === 'co2') || value > 0 && key === 'biodiversity' || value < 0 && key === 'temp' || value < 0 && key === 'sea';
      const effectClass = isPositive ? 'positive-effect' : 'negative-effect';
      
      // Formater la valeur avec signe + ou -
      const formattedValue = value > 0 ? `+${value}` : value;
      
      // Déterminer le libellé pour chaque métrique
      let metricLabel;
      switch(key) {
        case 'co2': metricLabel = 'CO₂ (ppm)'; break;
        case 'temp': metricLabel = 'Température (°C)'; break;
        case 'sea': metricLabel = 'Niveau de la mer (m)'; break;
        case 'biodiversity': metricLabel = 'Biodiversité'; break;
        default: metricLabel = key;
      }
      
      effectsHTML += `<li class="${effectClass}"><span class="effect-label">${metricLabel}:</span> <span class="effect-value">${formattedValue}</span></li>`;
    });
    
    effectsHTML += '</ul>';
  } else {
    effectsHTML = '<p>Aucun effet direct sur l\'environnement.</p>';
  }
  
  // Ajouter les informations sur le retour sur investissement si applicable
  let budgetReturnHTML = '';
  if (action.budgetReturn && action.duration) {
    budgetReturnHTML = `
      <div class="budget-return-info">
        <h4>Retour sur investissement</h4>
        <p>+${action.budgetReturn} budget par tour pendant ${action.duration} tours</p>
      </div>
    `;
  }
  
  // Définir le contenu du modal
  infoModal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h3>${action.name}</h3>
      
      <div class="action-details">
        <div class="action-category">
          <strong>Catégorie:</strong> ${action.category}
        </div>
        <div class="action-cost-info">
          <strong>Coût:</strong> ${action.cost} budget
        </div>
      </div>
      
      <div class="effects-container">
        <h4>Effets sur l'environnement</h4>
        ${effectsHTML}
      </div>
      
      ${budgetReturnHTML}
    </div>
  `;
  
  // Ajouter un gestionnaire d'événements pour le bouton de fermeture
  const closeBtn = infoModal.querySelector('.close-modal');
  closeBtn.addEventListener('click', function() {
    infoModal.style.display = 'none';
  });
  
  // Afficher le modal
  infoModal.style.display = 'block';
}

// Ajouter un gestionnaire pour fermer le modal en appuyant sur Échap
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('action-info-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
});
