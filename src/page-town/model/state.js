// ===== Model：状態の永続化（localStorage） =====
window.State = (function(){
const { emptyLayout, N } = window.Sim;

const STORE = 'untouchable-town-v2';

function freshState(){
  return { layout: emptyLayout(), day: 1, seed: (Math.random()*2**31)|0, action: null, window: [], cleared: false, log: [], lastRes: null };
}

function isValid(v){
  return !!v
    && Array.isArray(v.layout) && v.layout.length === N*N
    && typeof v.day === 'number' && typeof v.seed === 'number'
    && Array.isArray(v.window) && Array.isArray(v.log);
}

function loadState(){
  try{
    const v = localStorage.getItem(STORE);
    if (!v) return null;
    const parsed = JSON.parse(v);
    return isValid(parsed) ? parsed : null;
  }catch(e){ return null; }
}

function saveState(appState){
  try{ localStorage.setItem(STORE, JSON.stringify(appState)); }catch(e){}
}

return { STORE, freshState, loadState, saveState };
})();
