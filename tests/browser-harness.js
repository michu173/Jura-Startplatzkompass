// Runs the real ES modules against small DOM/MapLibre API doubles, not WebGL.
// Rendering, native touch and CSS layout require separate browser acceptance.
import fs from 'node:fs';
import vm from 'node:vm';

class Element{
 constructor(id,document){this.id=id;this.document=document;this.dataset={};this.attrs={};this.events={};this.disabled=false;this.checked=false;this.value='';this.isConnected=true;this.children=[];this.classes=new Set();this.classList={add:(...names)=>names.forEach(n=>this.classes.add(n)),remove:(...names)=>names.forEach(n=>this.classes.delete(n)),contains:n=>this.classes.has(n),toggle:(name,on)=>{const active=on??!this.classes.has(name);if(active)this.classes.add(name);else this.classes.delete(name);return active;}};}
 set innerHTML(value){
  this.html=value;for(const e of this.children)e.isConnected=false;this.children=[];
  for(const [,attributes] of value.matchAll(/<button\b([^>]*)>/g)){
   const item=new Element('',this.document);
   for(const [,name,text] of attributes.matchAll(/([\w-]+)="([^"]*)"/g)){item.attrs[name]=text;if(name==='data-id')item.dataset.id=text;if(name==='data-point-id')item.dataset.pointId=text;}
   this.children.push(item);
  }
 }
 get innerHTML(){return this.html||'';}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 dispatch(name,event={}){if(name==='click'&&this.disabled)return;for(const fn of this.events[name]||[])fn(event);}
 focus(){this.document.activeElement=this;}
 setAttribute(name,value){this.attrs[name]=String(value);}
 getAttribute(name){return this.attrs[name]??null;}
 removeAttribute(name){delete this.attrs[name];}
 querySelectorAll(selector){if(selector==='button')return this.children;if(selector.includes('data-point-id'))return this.children.filter(e=>e.dataset.pointId);if(selector==='[data-id]')return this.children.filter(e=>e.dataset.id);if(selector.includes('button:not'))return this.document.focusables;return [];}
 querySelector(selector){if(selector==='p')return this.document.getElementById('error-message');if(selector==='.detail-scroll')return this.document.getElementById('detail-content');if(selector.startsWith('[data-point-id=')){const id=selector.match(/"([^"]+)"/)[1];return this.children.find(e=>e.dataset.pointId===id);}return null;}
}

export async function boot({mobile=false,constructorError=false,missingLibrary=false,search='',dataError=false}={}){
 const nodes=new Map(),events={},document={};
 document.getElementById=id=>{if(!nodes.has(id))nodes.set(id,new Element(id,document));return nodes.get(id);};
 document.body=new Element('body',document);document.activeElement=document.body;
 document.addEventListener=(name,fn)=>(events[name]??=[]).push(fn);
 document.dispatch=(name,event)=>{for(const fn of events[name]||[])fn(event);};
 const styleButtons=['liberty','positron','swisstopo'].map(style=>{const e=new Element(style,document);e.dataset.style=style;return e;});
 const priorities=['','A','B','C','D'].map(priority=>{const e=new Element(priority,document);e.dataset.priority=priority;return e;});
 document.getElementById('priorities').children=priorities;
 document.getElementById('map-error').classes.add('hidden');
 const backgrounds=['topbar','map-toolbar','map-pane','side-head','side-scroll','footer-note'].map(x=>new Element(x,document));
 document.focusables=[document.getElementById('back'),document.getElementById('detail-close')];
 document.querySelectorAll=selector=>selector==='[data-style]'?styleButtons:selector.startsWith('.topbar,')?backgrounds:[];
 document.createElement=()=>new Element('',document);
 // Dropdown options are not needed for event assertions; append still runs.
 Element.prototype.appendChild=function(item){this.children.push(item);};
 const media={matches:mobile,addEventListener(name,fn){this.listener=fn;}};
 const location={href:'https://example.test/karte.html'+search,search};
 const timers=new Map();let serial=0,instance,geoRequests=0;
 class MapDouble{
  constructor(options){if(constructorError)throw new Error('WebGL disabled');instance=this;this.options=options;this.events={};this.sources=new Map();this.layers=new Map();this.swaps=[];this.camera=[];this.images=new Map();this.touchZoomRotate={disableRotation(){}};}
  on(name,fn){(this.events[name]??=[]).push(fn);}
  emit(name,event={}){for(const fn of this.events[name]||[])fn(event);}
  getStyle(){return this.style||{};}
  getLayer(id){return this.layers.get(id);}
  getSource(id){return this.sources.get(id);}
  addSource(id,spec){if(this.sources.has(id))throw new Error('duplicate source');this.sources.set(id,{...spec,setData(data){this.data=data;}});}
  hasImage(id){return this.images.has(id);}
  addImage(id,data,options){if(this.images.has(id))throw new Error('duplicate image');this.images.set(id,{data,options});}
  addLayer(layer){if(this.layers.has(layer.id))throw new Error('duplicate layer');this.layers.set(layer.id,layer);}
  setStyle(style,options){this.swaps.push({style,options});this.style=style;this.sources.clear();this.layers.clear();this.images.clear();}
  getZoom(){return 10;}
  fitBounds(...args){this.camera.push(['fit',...args]);}
  flyTo(options){this.camera.push(['fly',options]);}
  easeTo(options){this.camera.push(['ease',options]);}
  queryRenderedFeatures(point,{layers}){for(const id of layers)if(!this.layers.has(id))throw new Error('queried absent layer');return this.hits?.[layers[0]]||[];}
  getCanvas(){return {style:{}};}
  zoomIn(){this.camera.push(['zoomIn']);}
  zoomOut(){this.camera.push(['zoomOut']);}
 }
 const library={Map:MapDouble,LngLatBounds:class{extend(){}},Marker:class{setLngLat(){return this;}addTo(){return this;}remove(){}}};
 const data=JSON.parse(fs.readFileSync(new URL('../daten/startplaetze.json',import.meta.url)));
 const window={location,history:{replaceState(a,b,url){location.href=url.href;location.search=url.search;}},matchMedia:query=>query.includes('700px')?media:{matches:false},maplibregl:missingLibrary?undefined:library};
 const context=vm.createContext({window,document,navigator:{geolocation:{getCurrentPosition(){geoRequests++;}}},maplibregl:library,URL,URLSearchParams,AbortController,fetch:async()=>({ok:!dataError,status:dataError?503:200,json:async()=>data}),console:{error(){},warn(){}},setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),setInterval(fn){const id=++serial;queueMicrotask(()=>{for(let i=0;i<30;i++)fn();});return id;},clearInterval(){},alert(){}});
 const common=new vm.SourceTextModule(fs.readFileSync(new URL('../js/common.js',import.meta.url),'utf8'),{context,initializeImportMeta(meta){meta.url=new URL('../js/common.js',import.meta.url).href;}});
 const windModule=new vm.SourceTextModule(fs.readFileSync(new URL('../js/launch-wind.js',import.meta.url),'utf8'),{context});
 const markerModule=new vm.SourceTextModule(fs.readFileSync(new URL('../js/map-markers.js',import.meta.url),'utf8'),{context});
 const app=new vm.SourceTextModule(fs.readFileSync(new URL('../js/map.js',import.meta.url),'utf8'),{context});
 await app.link(specifier=>specifier.includes('map-markers.js')?markerModule:specifier.includes('launch-wind.js')?windModule:common);await app.evaluate();
 return {map:instance,document,element:id=>document.getElementById(id),styles:styleButtons,priorities,backgrounds,media,data,location,get geoRequests(){return geoRequests;},completeStyle(){instance.emit('style.load');},tick(ms){for(const [id,timer] of [...timers])if(timer.ms<=ms){timers.delete(id);timer.fn();}}};
}
