/** Shared data and presentation utilities. All displayed start-site facts come from ../daten/startplaetze.json. */
export const DATA_URL = new URL('../daten/startplaetze.json', import.meta.url);
export async function loadData(){
  const response = await fetch(DATA_URL, {cache:'no-cache'});
  if(!response.ok) throw new Error(`Startplatzdaten nicht verfügbar (HTTP ${response.status})`);
  const data=await response.json();
  if(!Array.isArray(data.sites)||data.sites.length===0) throw new Error('Ungültige Startplatzdaten');
  return data;
}
export const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const prio=(r)=>String(r.category||r.pr?.charAt(0)||'D').charAt(0).toUpperCase();
export const level={Günstig:0,Prüfen:1,Unpassend:2,Meiden:3};
export function suit(r,w){return w?(r.weather?.[w]??'Nicht bewertet'):'';}
export function suitClass(v){return v==='Günstig'?'good':v==='Prüfen'?'check':'bad';}
export function sortAndFilter(items,s){
 const q=(s.query||'').trim().toLocaleLowerCase('de-CH');
 const results=items.filter(r=>{
  if(s.priority && prio(r)!==s.priority)return false;
  if(s.access && r.loc_class!==s.access)return false;
  if(s.weather && s.onlySuitable && !['Günstig','Prüfen'].includes(suit(r,s.weather)))return false;
  if(s.xc && !(s.xc==='Sehr gut'?r.XC==='Sehr gut':String(r.XC).toLowerCase().includes('gut')))return false;
  if(q){const searchable=[r.Startplatz,r.Startwind,r['Ideal-Wetter'],r.aggregierte_beschreibung,r['Für dich'],r.loc_class].join(' ').toLocaleLowerCase('de-CH');if(!searchable.includes(q))return false;}
  return true;
 });
 results.sort((a,b)=>s.sort==='name'?a.Startplatz.localeCompare(b.Startplatz,'de-CH'):s.sort==='weather'&&s.weather?(level[suit(a,s.weather)]??4)-(level[suit(b,s.weather)]??4)||a.Prio-b.Prio:(Number(a.Prio)||99)-(Number(b.Prio)||99));
 return results;
}
export function sitePoints(r){
 const variants=Array.isArray(r.launch_variants)&&r.launch_variants.length?r.launch_variants:[{name:r.Startplatz,latitude:r.gps?.[0],longitude:r.gps?.[1],altitude_m:r['Höhe m']}];
 return variants.filter(v=>Number.isFinite(+v.latitude)&&Number.isFinite(+v.longitude)).map((v,i)=>({site:r,id:`${r.id}-${i}`,name:v.name||r.Startplatz,lat:+v.latitude,lon:+v.longitude,alt:v.altitude_m??r['Höhe m'],variant:i}));
}
export function labelAltitude(n){if(n===null||n===undefined||n==='')return 'Höhe unbekannt';return `${esc(n)} m`}
export function badge(r,w){const v=suit(r,w);return v?`<span class="suit ${suitClass(v)}">${esc(v)}</span>`:'';}
export function matchWeatherChoices(select,keys){keys.forEach(k=>{const opt=document.createElement('option');opt.value=k;opt.textContent=k;select.appendChild(opt);});}
export function detailHTML(r,pt=null,compact=false){
 const gps=pt?[pt.lat,pt.lon]:r.gps;
 const coordinates=Array.isArray(gps)?`${Number(gps[0]).toFixed(5)}, ${Number(gps[1]).toFixed(5)}`:'Nicht hinterlegt';
 const maps=Array.isArray(gps)?`https://www.google.com/maps?q=${encodeURIComponent(gps.join(','))}`:null;
 const sections=r.aggregation_abschnitte||{};
 const icons={'Start und Gelände':'⛰','Geeignete Bedingungen':'☀','Gefahren':'!','Regeln und Einschränkungen':'§','Landen':'↘','Anreise und Solo-Rückholung':'↔','Thermik / XC / Besonderheiten':'↗'};
 const highlighted=['Gefahren','Regeln und Einschränkungen'];
 const html=Object.entries(sections).map(([k,v])=>v?`<section class="detail-section ${highlighted.includes(k)?'important':''}"><div class="detail-heading"><span class="section-icon">${icons[k]||'·'}</span><h3>${esc(k)}</h3></div><p>${esc(v)}</p></section>`:'').join('');
 const variants=r.launch_variants?.length?`<div class="variant-note">Zwei getrennte Startpositionen: ${r.launch_variants.map(v=>`${esc(v.name)} (${labelAltitude(v.altitude_m)})`).join(' · ')}</div>`:'';
 const source=r['Quellenlink']&&/^https:\/\//.test(r['Quellenlink'])?`<a href="${esc(r['Quellenlink'])}" target="_blank" rel="noopener noreferrer">Club-/Ortsbriefing ↗</a>`:'';
 return `${compact ? '' : `<div class="site-detail-head"><span class="priority p-${prio(r)}">${prio(r)}</span><div><div class="eyebrow">${esc(r.loc_class||'Startplatz')} · ${esc(r['Für dich']||'')}</div><h2>${esc(pt?.name||r.Startplatz)}</h2><div class="site-subline">${labelAltitude(pt?.alt??r['Höhe m'])} ü. M. · Startwind <strong>${esc(r.Startwind||'unbekannt')}</strong> · ${esc(r.schwierigkeit_kanonisch||'unbekannt')}</div></div></div>`}
 <div class="meta-strip"><span>Thermik <strong>${esc(r.Thermik||'–')}</strong></span><span>XC <strong>${esc(r.XC||'–')}</strong></span><span>GPS <strong>${esc(coordinates)}</strong></span></div>
 ${variants}${html}<div class="detail-links">${source}${maps?`<a href="${esc(maps)}" target="_blank" rel="noopener noreferrer">Position in Google Maps ↗</a>`:''}</div>
 <p class="detail-disclaimer">Planungshilfe, keine Startfreigabe. Aktuelles Wetter, Luftraum, Betriebsregeln, Start und Landung vor jedem Flug prüfen. Stand der Datenerhebung: Oktober 2026.</p>`;
}
export function el(id){return document.getElementById(id)}
export function renderError(where,message){where.innerHTML=`<div class="load-error"><strong>Startplatzdaten konnten nicht geladen werden.</strong><p>${esc(message)}</p><p>Die Website muss über GitHub Pages oder einen lokalen Webserver geöffnet werden, nicht direkt per <code>file://</code>.</p></div>`}
