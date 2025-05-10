const KEY = 'climafutur_save';
export function saveState(state){
  localStorage.setItem(KEY, JSON.stringify(state));
}
export function loadState(){
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
