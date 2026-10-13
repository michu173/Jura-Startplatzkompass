import {loadData,esc,el,matchWeatherChoices,sortAndFilter,prio,badge,labelAltitude,detailHTML,renderError} from './common.js';
const state={query:'',weather:'',priority:'',access:'',onlySuitable:true,sort:'priority'};
let data;
function cardHTML(r){
 const abbrev=r.aggregation_abschnitte?.['Start und Gelände']||r['Startplatz / Schwierigkeit']||'';
 return `<details class="site-card" data-id="${r.id}"><summary><div class="card-row"><span class="priority p-${prio(r)}">${prio(r)}</span><div style="min-width:0;flex:1"><h3>${esc(r.Startplatz)}</h3><div class="sub">${labelAltitude(r['Höhe m'])} ü. M. · Startwind ${esc(r.Startwind)}</div></div>${badge(r,state.weather)}</div><p class="description">${esc(abbrev)}</p><div class="card-bottom"><div class="tagrow"><span class="small-tag">${esc(r.loc_class)}</span><span class="small-tag">XC · ${esc(r.XC)}</span></div><span class="card-expand">Details ansehen ↓</span></div></summary><div class="card-details">${detailHTML(r,null,true)}</div></details>`;
}
function render(){if(!data)return;
 const rows=sortAndFilter(data.sites,state);
 const previouslyOpen=new Set([...el('cards').querySelectorAll('.site-card[open]')].map(d=>d.dataset.id));
 el('cards').innerHTML=rows.length?rows.map(cardHTML).join(''):'<div class="empty">Keine passenden Startplätze. Versuche andere Filter.</div>';
 el('cards').querySelectorAll('.site-card').forEach(d=>{if(previouslyOpen.has(d.dataset.id))d.open=true;});
 el('count').textContent=`(${rows.length} / ${data.sites.length})`;
 const c=data.conditions?.[state.weather];el('weather-info').textContent=state.weather?(c?.[2]||'Standortabhängige Eignung; Wind am Start gesondert prüfen.'):'Eine Wetterlage auswählen, um die Startplätze zu bewerten.';
 el('expand').textContent=[...el('cards').querySelectorAll('.site-card')].every(d=>d.open)?'Alle schliessen':'Alle öffnen';
}
function onChange(){state.query=el('search').value;state.weather=el('weather').value;state.priority=el('priority').value;state.access=el('access').value;state.onlySuitable=el('onlySuitable').checked;state.sort=el('sort').value;render();}
for(const k of ['search','weather','priority','access','onlySuitable','sort'])el(k).addEventListener('input',onChange);
el('clear').addEventListener('click',()=>{for(const k of ['search','weather','priority','access'])el(k).value='';el('onlySuitable').checked=true;el('sort').value='priority';onChange();});
el('expand').addEventListener('click',()=>{const cards=[...document.querySelectorAll('.site-card')];const open=cards.some(d=>!d.open);cards.forEach(d=>d.open=open);el('expand').textContent=open?'Alle schliessen':'Alle öffnen';});
try{data=await loadData();matchWeatherChoices(el('weather'),data.weatherkeys||[]);render();}catch(e){console.error(e);renderError(el('cards'),e.message);}
