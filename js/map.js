import {loadData,esc,el,matchWeatherChoices,sortAndFilter,prio,suit,suitClass,detailHTML,sitePoints,renderError,labelAltitude,DEFAULT_FILTERS,filtersFromSearch,writeFilters} from './common.js?v=20261021-1';
const styles={
 liberty:'https://tiles.openfreemap.org/styles/liberty',
 positron:'https://tiles.openfreemap.org/styles/positron',
 swisstopo:{version:8, name:'SwissTopo', glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf', sources:{swisstopo:{type:'raster',tiles:['https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg'],tileSize:256,attribution:'© swisstopo'}},layers:[{id:'swisstopo-basemap',type:'raster',source:'swisstopo'}]}
};
const colors={'A':'#157b56','B':'#c59a42','C':'#d77a3e','D':'#697c84'};
const state=filtersFromSearch(window.location.search);
let db=null,map=null,allPoints=[],visible=[],selected=null,locationMarker=null,style='liberty',mapReady=false;
const prefersLessMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
let geojson={type:'FeatureCollection',features:[]};
let loadTimer=null,initialViewFitted=false,lastFocus=null;
const mobile=window.matchMedia('(max-width:700px)');
const warn=el('map-error');
function controlsReady(ready){for(const id of ['zoom-in','zoom-out','fit','locate'])el(id).disabled=!ready;}
function showError(s){clearTimeout(loadTimer);el('map-status').textContent='';warn.classList.remove('hidden');if(s)warn.querySelector('p').textContent=s;}
function beginMapLoad(){mapReady=false;controlsReady(false);warn.classList.add('hidden');el('map-status').textContent='Karte wird geladen …';clearTimeout(loadTimer);loadTimer=setTimeout(()=>showError('Die Karte lädt zu lange. Wähle einen anderen Kartenstil oder lade die Seite erneut. Die Startplatzliste bleibt verfügbar.'),20000);}
const markerLayers=['cluster-outer','cluster-count','unclustered','unclustered-label'];
function markersReady(){return !!map&&markerLayers.every(id=>map.getLayer(id));}
function updateSelection(){el('site-list').querySelectorAll('[data-id]').forEach(b=>{const active=Number(b.dataset.id)===selected?.site.id;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});}
function detailMode(){
 const modal=!!selected&&mobile.matches;
 el('detail').setAttribute('role',modal?'dialog':'region');
 if(modal)el('detail').setAttribute('aria-modal','true');else el('detail').removeAttribute('aria-modal');
 document.querySelectorAll('.topbar,.map-toolbar,.map-pane,.side-head,.side-scroll,.footer-note').forEach(e=>{e.inert=modal;});
}
mobile.addEventListener('change',detailMode);
function pointsAsGeoJSON(rows){
 const ids=new Set(rows.map(r=>r.id));
 return {type:'FeatureCollection',features:allPoints.filter(pt=>ids.has(pt.site.id)).map(pt=>({type:'Feature',id:pt.id,geometry:{type:'Point',coordinates:[pt.lon,pt.lat]},properties:{siteId:pt.site.id,pointId:pt.id,name:pt.name,category:prio(pt.site),selected:selected?.id===pt.id?1:0}}))};
}
function addLayers(){
 if(!map||!map.getStyle?.())return;
 if(!map.getSource('launches'))map.addSource('launches',{type:'geojson',data:geojson,cluster:true,clusterMaxZoom:15,clusterRadius:37});
 const layers=[
  {id:'cluster-outer',type:'circle',source:'launches',filter:['has','point_count'],paint:{'circle-color':'#204a48','circle-opacity':.96,'circle-radius':['step',['get','point_count'],20,4,23,9,26],'circle-stroke-color':'#ffffff','circle-stroke-width':3,'circle-stroke-opacity':.98}},
  {id:'cluster-count',type:'symbol',source:'launches',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-font':['Open Sans Bold','Arial Unicode MS Bold'],'text-size':12,'text-allow-overlap':true},paint:{'text-color':'#ffffff'}},
  {id:'unclustered',type:'circle',source:'launches',filter:['!',['has','point_count']],paint:{'circle-radius':['interpolate',['linear'],['zoom'],8,11,11,14,15,17],'circle-color':['match',['get','category'],'A',colors.A,'B',colors.B,'C',colors.C,colors.D],'circle-stroke-width':['case',['==',['get','selected'],1],5,3],'circle-stroke-color':['case',['==',['get','selected'],1],'#123a37','#ffffff'],'circle-opacity':.98}},
  {id:'unclustered-label',type:'symbol',source:'launches',filter:['!',['has','point_count']],layout:{'text-field':['get','category'],'text-font':['Open Sans Bold','Arial Unicode MS Bold'],'text-size':['interpolate',['linear'],['zoom'],8,10,13,12],'text-allow-overlap':true,'text-ignore-placement':true},paint:{'text-color':'#ffffff'}}
 ];
 for(const layer of layers)if(!map.getLayer(layer.id))map.addLayer(layer);
}
function syncMap(){if(!db)return;geojson=pointsAsGeoJSON(visible);if(map&&map.getSource('launches'))map.getSource('launches').setData(geojson);}
function rowsHTML(rows){return rows.map(r=>`<button type="button" class="site-row ${selected?.site.id===r.id?'active':''}" data-id="${r.id}"><span class="priority p-${prio(r)}">${prio(r)}</span><span style="flex:1;min-width:0"><span class="row-title">${esc(r.Startplatz)}</span><span class="row-sub">${labelAltitude(r['Höhe m'])} · Startwind ${esc(r.Startwind)} · ${esc(r.loc_class)}</span>${state.weather?`<span class="row-weather"><span class="suit ${suitClass(suit(r,state.weather))}">${esc(suit(r,state.weather))}</span></span>`:''}</span><span class="row-arrow">›</span></button>`).join('');}
function updateList(){
 visible=sortAndFilter(db.sites,state);
 el('count').textContent=`${visible.length} / ${db.sites.length}`;
 el('site-list').innerHTML=visible.length?rowsHTML(visible):'<div class="empty" style="margin:10px">Keine passenden Startplätze. Filter ändern.</div>';
 el('site-list').querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>openSiteById(Number(b.dataset.id),true)));
 el('side-desc').textContent=state.weather?`Wetterlage: ${state.weather}. Startwind am Start gesondert prüfen.`:'Auf Startplätze tippen oder auf der Karte auswählen.';
 syncMap();
 if(selected&&!visible.some(r=>r.id===selected.site.id))closeDetail();
 el('priorities').querySelectorAll('button').forEach(b=>{const active=b.dataset.priority===state.priority;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 updateSelection();writeFilters(state);
}
function closeDetail(){if(!selected)return;selected=null;el('detail').classList.remove('visible');el('detail').setAttribute('aria-hidden','true');el('shade').classList.remove('visible');document.body.classList.remove('details-open');detailMode();syncMap();updateSelection();(lastFocus?.isConnected?lastFocus:el('search')).focus({preventScroll:true});}
function openPoint(pt,fly,variantFocus=false){
 if(!pt)return;if(!selected)lastFocus=document.activeElement===document.body?el('search'):document.activeElement;selected=pt;
 el('detail-content').innerHTML=detailHTML(pt.site,pt);
 el('detail').classList.add('visible');el('detail').setAttribute('aria-hidden','false');el('shade').classList.add('visible');document.body.classList.add('details-open');
 el('detail').querySelector('.detail-scroll').scrollTop=0;
 el('detail-content').querySelectorAll('[data-point-id]').forEach(b=>b.addEventListener('click',()=>openPoint(allPoints.find(p=>p.id===b.dataset.pointId),true,true)));
 detailMode();syncMap();updateSelection();
 const focus=variantFocus?el('detail-content').querySelector(`[data-point-id="${pt.id}"]`):el('detail-close');focus?.focus({preventScroll:true});
 if(mapReady&&map&&fly){let currentZoom=map.getZoom();const zoom=Math.max(currentZoom,12);map.flyTo({center:[pt.lon,pt.lat],zoom:Math.min(zoom,15),essential:true,duration:prefersLessMotion?0:950});}
}
function openSiteById(id,fly=false){const pt=allPoints.find(p=>p.site.id===id);openPoint(pt,fly);}
function applyFilters(){state.query=el('search').value;state.weather=el('weather').value;state.access=el('access').value;state.onlySuitable=el('onlySuitable').checked;updateList();}
function fitVisible(){if(!map||!mapReady)return;const points=allPoints.filter(p=>visible.some(r=>r.id===p.site.id));if(!points.length)return;const bbox=new maplibregl.LngLatBounds();points.forEach(p=>bbox.extend([p.lon,p.lat]));map.fitBounds(bbox,{padding:{top:75,bottom:68,left:55,right:55},maxZoom:12.9,duration:prefersLessMotion?0:920,essential:true});}
function mapClick(e){if(!mapReady||!markersReady())return;
 const clusters=map.queryRenderedFeatures(e.point,{layers:['cluster-outer']});
 if(clusters.length){const cluster=clusters[0];const source=map.getSource('launches');const stillCurrent=()=>mapReady&&map.getSource('launches')===source;if(source?.getClusterExpansionZoom){Promise.resolve(source.getClusterExpansionZoom(cluster.properties.cluster_id)).then(z=>{if(stillCurrent())map.easeTo({center:cluster.geometry.coordinates,zoom:Math.min(18,Math.max(map.getZoom()+1,z||map.getZoom()+1)),duration:prefersLessMotion?0:580});}).catch(()=>{if(stillCurrent())map.easeTo({center:cluster.geometry.coordinates,zoom:map.getZoom()+2});});}return;}
 const hits=map.queryRenderedFeatures(e.point,{layers:['unclustered']});
 if(hits.length){const id=hits[0].properties.pointId;const pt=allPoints.find(p=>p.id===id);openPoint(pt,false);}
}
function initialiseMap(){
 controlsReady(false);
 if(!window.maplibregl){showError('MapLibre konnte nicht geladen werden. Prüfe die Internetverbindung oder lade die Seite erneut. Die Startplatzliste bleibt verfügbar.');document.querySelectorAll('[data-style]').forEach(b=>b.disabled=true);return;}
 // MapLibre 5 has no supported() export; the constructor reports WebGL failures.
 try{
 beginMapLoad();
 map=new maplibregl.Map({container:'map',style:styles[style],center:[7.32,47.23],zoom:9.3,minZoom:6,maxZoom:19,attributionControl:false,dragRotate:false,pitchWithRotate:false,cooperativeGestures:false,renderWorldCopies:false,locale:{'NavigationControl.ZoomIn':'Hineinzoomen','NavigationControl.ZoomOut':'Herauszoomen'}});
 map.touchZoomRotate.disableRotation();
 map.on('style.load',()=>{
  try{addLayers();syncMap();if(!markersReady())throw new Error('Startplatzmarker konnten nicht erstellt werden.');mapReady=true;clearTimeout(loadTimer);warn.classList.add('hidden');el('map-status').textContent='';controlsReady(true);if(!initialViewFitted){fitVisible();initialViewFitted=true;}}
  catch(error){console.error(error);mapReady=false;controlsReady(false);showError('Startplatzmarker konnten nicht geladen werden. Wähle einen anderen Kartenstil oder lade die Seite erneut.');}
 });
 map.on('click',mapClick);
 map.on('mousemove',e=>{if(!mapReady||!markersReady())return;const hit=map.queryRenderedFeatures(e.point,{layers:['unclustered','cluster-outer']});map.getCanvas().style.cursor=hit.length?'pointer':'';});
 map.on('error',e=>{console.warn('MapLibre:',e.error||e);if(!mapReady||e.sourceId==='launches'){mapReady=false;controlsReady(false);showError('Kartenstil oder Startplatzmarker konnten nicht geladen werden. Wähle einen anderen Kartenstil oder lade die Seite erneut. Die Startplatzliste bleibt verfügbar.');}else el('map-status').textContent='Einige Kartendaten fehlen. Verbindung prüfen oder Kartenstil wechseln.';});
 }catch(err){console.error(err);map=null;showError('Die Karte konnte nicht gestartet werden. Prüfe WebGL und die Internetverbindung. Die Startplatzliste bleibt verfügbar.');document.querySelectorAll('[data-style]').forEach(b=>b.disabled=true);}
}
function setStyle(next){if(!styles[next]||(next===style&&mapReady))return;style=next;document.querySelectorAll('[data-style]').forEach(b=>{b.classList.toggle('active',b.dataset.style===style);b.setAttribute('aria-pressed',String(b.dataset.style===style));});if(!map)return;beginMapLoad();try{map.setStyle(styles[style],{diff:false});}catch(error){console.error(error);showError('Der Kartenstil konnte nicht gewechselt werden. Bitte erneut versuchen.');}}
for(const input of ['search','weather','access','onlySuitable'])el(input).addEventListener('input',applyFilters);
el('priorities').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.priority=b.dataset.priority;el('priorities').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));updateList();}));
el('reset').addEventListener('click',()=>{el('search').value='';el('weather').value='';el('access').value='';el('onlySuitable').checked=DEFAULT_FILTERS.onlySuitable;state.priority='';state.sort=DEFAULT_FILTERS.sort;applyFilters();fitVisible();});
for(const id of ['back','detail-close'])el(id).addEventListener('click',closeDetail);
el('shade').addEventListener('click',closeDetail);
document.addEventListener('keydown',e=>{if(!selected)return;if(e.key==='Escape'){e.preventDefault();closeDetail();}if(e.key==='Tab'&&mobile.matches){const items=[...el('detail').querySelectorAll('button:not(:disabled),a[href]')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
el('zoom-in').addEventListener('click',()=>map?.zoomIn({duration:prefersLessMotion?0:360}));
el('zoom-out').addEventListener('click',()=>map?.zoomOut({duration:prefersLessMotion?0:360}));
el('fit').addEventListener('click',fitVisible);
el('locate').addEventListener('click',()=>{if(!mapReady)return;if(!navigator.geolocation){alert('Standortfunktion nicht verfügbar.');return;}navigator.geolocation.getCurrentPosition(pos=>{if(!mapReady)return;const {latitude,longitude}=pos.coords;if(map){if(locationMarker)locationMarker.remove();const dot=document.createElement('div');dot.style.cssText='width:15px;height:15px;border:3px solid white;border-radius:50%;background:#2087c2;box-shadow:0 0 0 5px #2087c244,0 2px 8px #0005;';locationMarker=new maplibregl.Marker({element:dot}).setLngLat([longitude,latitude]).addTo(map);map.flyTo({center:[longitude,latitude],zoom:12,essential:true});}},err=>alert('Standort konnte nicht ermittelt werden: '+err.message),{enableHighAccuracy:false,timeout:10000});});
document.querySelectorAll('[data-style]').forEach(b=>b.addEventListener('click',()=>setStyle(b.dataset.style)));
controlsReady(false);
try{
 db=await loadData();allPoints=db.sites.flatMap(sitePoints);matchWeatherChoices(el('weather'),db.weatherkeys||[]);if(!db.weatherkeys.includes(state.weather))state.weather='';for(const [id,key] of Object.entries({search:'query',weather:'weather',access:'access'}))el(id).value=state[key];el('onlySuitable').checked=state.onlySuitable;document.querySelectorAll('[data-point-total]').forEach(e=>e.textContent=allPoints.length);updateList();
 // CDN failures, including failed fallback, must not block the rest of the website.
 if(!window.maplibregl){await new Promise(resolve=>{let i=0;const interval=setInterval(()=>{if(window.maplibregl||++i>=30){clearInterval(interval);resolve();}},100);});}
 initialiseMap();
}catch(e){console.error(e);renderError(el('site-list'),e.message);showError('Die Startplatzdaten konnten nicht geladen werden.');document.querySelectorAll('[data-style]').forEach(b=>b.disabled=true);}
