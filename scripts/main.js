
import { neighborhoods } from './data.js';
import { loadProgress, saveProgress } from './storage.js';
import { createButton, snackbar } from './ui.js';

const nav=document.getElementById('nav'),app=document.getElementById('app');
let progress=loadProgress();
renderNav();
function renderNav(){nav.innerHTML='';Object.keys(neighborhoods).forEach(k=>{const b=document.createElement('button');b.textContent=neighborhoods[k].label;b.onclick=()=>loadNeighborhood(k);nav.appendChild(b);});}
function loadNeighborhood(k){app.innerHTML='';const nb=neighborhoods[k];Object.keys(nb.pairs).forEach(p=>{const s=document.createElement('section');s.className='card';s.innerHTML='<h2>Paire '+p+'</h2>';nb.pairs[p].minimalPairs.forEach(mp=>{s.appendChild(createButton(mp,()=>{snackbar('Bravo ! '+mp);mark(k,p,mp);}));});app.appendChild(s);});}
function mark(n,p,mp){progress[n]=progress[n]||{};progress[n][p]=progress[n][p]||[];if(!progress[n][p].includes(mp)){progress[n][p].push(mp);saveProgress(progress);}}
