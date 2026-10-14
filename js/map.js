import {loadData,esc,el,matchWeatherChoices,sortAndFilter,prio,suit,suitClass,detailHTML,sitePoints,renderError,labelAltitude} from './common.js';
const styles={
 liberty:'https://tiles.openfreemap.org/styles/liberty',
 positron:'https://tiles.openfreemap.org/styles/positron',
 swisstopo:{version:8, name:'SwissTopo', sources:{swisstopo:{type:'raster',tiles:['https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg'],tileSize:256,attribution:'© swisstopo'}},layers:[{id:'swisstopo-basemap',type:'raster',source:'swisstopo'}]}
};
const colors={'A':'#157b56','B':'#c59a42','C':'#d77a3e','D':'#697c84'};
const state={query:'',weather:'',priority:'',access:'',onlySuitable:false,sort:'priority'};
let db=null,map=null,allPoints=[],visible=[],selected=null,locationMarker=null,style='liberty',mapReady=false;
const prefersLessMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
let geojson={type:'FeatureCollection',features:[]};
const warn=el('map-error');
function showError(s){warn.classList.remove('hidden');if(s)warn.querySelector('p').textContent=s;}
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
}
function closeDetail(){selected=null;el('detail').classList.remove('visible');el('detail').setAttribute('aria-hidden','true');el('shade').classList.remove('visible');document.body.classList.remove('details-open');syncMap();}
function openPoint(pt,fly){
 if(!pt)return; selected=pt;
 el('detail-content').innerHTML=detailHTML(pt.site,pt);
 el('detail').classList.add('visible');el('detail').setAttribute('aria-hidden','false');el('shade').classList.add('visible');document.body.classList.add('details-open');
 el('detail').querySelector('.detail-scroll').scrollTop=0;
 syncMap();
 if(map&&fly){let currentZoom=map.getZoom();const zoom=Math.max(currentZoom,12);map.flyTo({center:[pt.lon,pt.lat],zoom:Math.min(zoom,15),essential:true,duration:prefersLessMotion?0:950});}
}
function openSiteById(id,fly=false){const pt=allPoints.find(p=>p.site.id===id);openPoint(pt,fly);}
function applyFilters(){state.query=el('search').value;state.weather=el('weather').value;state.access=el('access').value;state.onlySuitable=el('onlySuitable').checked;updateList();}
function fitVisible(){if(!map)return;const points=allPoints.filter(p=>visible.some(r=>r.id===p.site.id));if(!points.length)return;const bbox=new maplibregl.LngLatBounds();points.forEach(p=>bbox.extend([p.lon,p.lat]));map.fitBounds(bbox,{padding:{top:75,bottom:68,left:55,right:55},maxZoom:12.9,duration:prefersLessMotion?0:920,essential:true});}
function mapClick(e){if(!map||!mapReady)return;
 const clusters=map.queryRenderedFeatures(e.point,{layers:['cluster-outer']});
 if(clusters.length){const cluster=clusters[0];const source=map.getSource('launches');if(source?.getClusterExpansionZoom){Promise.resolve(source.getClusterExpansionZoom(cluster.properties.cluster_id)).then(z=>map.easeTo({center:cluster.geometry.coordinates,zoom:Math.min(18,Math.max(map.getZoom()+1,z||map.getZoom()+1)),duration:prefersLessMotion?0:580})).catch(()=>map.easeTo({center:cluster.geometry.coordinates,zoom:map.getZoom()+2}));}return;}
 const hits=map.queryRenderedFeatures(e.point,{layers:['unclustered']});
 if(hits.length){const id=hits[0].properties.pointId;const pt=allPoints.find(p=>p.id===id);openPoint(pt,false);}
}
function initialiseMap(){
 if(!window.maplibregl){showError('MapLibre konnte nicht geladen werden. Prüfe die Internetverbindung oder lade die Seite erneut. Die Startplatzliste bleibt verfügbar.');return;}
 // MapLibre 5 has no supported() export; the constructor reports WebGL failures.
 try{
 map=new maplibregl.Map({container:'map',style:styles[style],center:[7.32,47.23],zoom:9.3,minZoom:6,maxZoom:19,attributionControl:false,dragRotate:false,pitchWithRotate:false,cooperativeGestures:false,renderWorldCopies:false,locale:{'NavigationControl.ZoomIn':'Hineinzoomen','NavigationControl.ZoomOut':'Herauszoomen'}});
 map.touchZoomRotate.disableRotation();
 map.on('load',()=>{mapReady=true;addLayers();fitVisible();});
 map.on('style.load',()=>{warn.classList.add('hidden');addLayers();syncMap();mapReady=true;});
 map.on('click',mapClick);
 map.on('mousemove',e=>{if(!mapReady)return;const hit=map.queryRenderedFeatures(e.point,{layers:['unclustered','cluster-outer']});map.getCanvas().style.cursor=hit.length?'pointer':'';});
 map.on('error',e=>{console.warn('MapLibre:',e.error||e);if(!map.isStyleLoaded?.())showError('Der Kartenstil oder Vektorkacheln konnten nicht geladen werden. Die Startplatzliste bleibt verfügbar.');});
 }catch(err){console.error(err);showError('Fehler beim Start der Karte: '+err.message);}
}
function setStyle(next){if(!styles[next]||next===style)return;style=next;document.querySelectorAll('[data-style]').forEach(b=>b.classList.toggle('active',b.dataset.style===style));if(!map)return;mapReady=false;map.setStyle(styles[style],{diff:false});}
for(const input of ['search','weather','access','onlySuitable'])el(input).addEventListener('input',applyFilters);
el('priorities').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.priority=b.dataset.priority;el('priorities').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));updateList();}));
el('reset').addEventListener('click',()=>{el('search').value='';el('weather').value='';el('access').value='';el('onlySuitable').checked=false;state.priority='';el('priorities').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.priority===''));applyFilters();fitVisible();});
for(const id of ['back','detail-close'])el(id).addEventListener('click',closeDetail);
el('shade').addEventListener('click',closeDetail);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDetail();});
el('zoom-in').addEventListener('click',()=>map?.zoomIn({duration:prefersLessMotion?0:360}));
el('zoom-out').addEventListener('click',()=>map?.zoomOut({duration:prefersLessMotion?0:360}));
el('fit').addEventListener('click',fitVisible);
el('locate').addEventListener('click',()=>{if(!navigator.geolocation){alert('Standortfunktion nicht verfügbar.');return;}navigator.geolocation.getCurrentPosition(pos=>{const {latitude,longitude}=pos.coords;if(map){if(locationMarker)locationMarker.remove();const dot=document.createElement('div');dot.style.cssText='width:15px;height:15px;border:3px solid white;border-radius:50%;background:#2087c2;box-shadow:0 0 0 5px #2087c244,0 2px 8px #0005;';locationMarker=new maplibregl.Marker({element:dot}).setLngLat([longitude,latitude]).addTo(map);map.flyTo({center:[longitude,latitude],zoom:12,essential:true});}},err=>alert('Standort konnte nicht ermittelt werden: '+err.message),{enableHighAccuracy:false,timeout:10000});});
document.querySelectorAll('[data-style]').forEach(b=>b.addEventListener('click',()=>setStyle(b.dataset.style)));
try{
 db=await loadData();allPoints=db.sites.flatMap(sitePoints);matchWeatherChoices(el('weather'),db.weatherkeys||[]);updateList();
 // CDN failures, including failed fallback, must not block the rest of the website.
 if(!window.maplibregl){await new Promise(resolve=>{let i=0;const interval=setInterval(()=>{if(window.maplibregl||++i>=30){clearInterval(interval);resolve();}},100);});}
 initialiseMap();
}catch(e){console.error(e);renderError(el('site-list'),e.message);showError('Die Startplatzdaten konnten nicht geladen werden.');}
