const KEY = 'climafutur_save';

export function saveState(state){
  try {
    console.log("Sauvegarde de l'état:", JSON.stringify(state));
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'état:", error);
    return false;
  }
}

export function loadState(){
  try {
    const raw = localStorage.getItem(KEY);
    console.log("État chargé depuis le stockage:", raw);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Erreur lors du chargement de l'état:", error);
    return null;
  }
}
