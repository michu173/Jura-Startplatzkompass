import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateData,validCoordinates,sitePoints,sortAndFilter,detailHTML,filtersFromSearch,loadData,writeFilters} from '../js/common.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const data=JSON.parse(fs.readFileSync(new URL('../daten/startplaetze.json',import.meta.url)));
const sections=['Start und Gelände','Geeignete Bedingungen','Gefahren','Regeln und Einschränkungen','Landen','Anreise und Solo-Rückholung','Thermik / XC / Besonderheiten'];

test('canonical dataset, IDs, source sections, weather and launch relationships',()=>{
 assert.equal(validateData(data),data);
 assert.equal(data.sites.length,data.displayed_site_groups);
 const points=data.sites.flatMap(sitePoints);
 assert.equal(points.length,data.individual_launch_positions);
 assert.equal(new Set(points.map(p=>p.id)).size,points.length);
 assert.equal(data.sites.length,29);assert.equal(points.length,30);
 for(const r of data.sites){
  assert.deepEqual(Object.keys(r.aggregation_abschnitte),sections);
  for(const text of Object.values(r.aggregation_abschnitte))assert.equal(typeof text,'string');
  for(const key of data.weatherkeys)assert(['Günstig','Prüfen','Unpassend','Meiden'].includes(r.weather[key]),r.Startplatz+': '+key);
  assert(['A','B','C','D'].includes(r.category));
  assert.equal(new URL(r.Quellenlink).protocol,'https:');
 }
 const variants=points.filter(p=>p.site.id===10);
 assert.deepEqual(variants.map(p=>[p.id,p.lat,p.lon,p.alt]),[['10-0',47.28883,7.67441,1097],['10-1',47.29128,7.67795,1044]]);
});

test('invalid coordinate and duplicate-ID data is rejected, not invented',()=>{
 for(const pair of [[null,''],[undefined,7],[NaN,7],[91,7],[47,181],['47','7']]){
  assert.equal(validCoordinates(pair),false);
  assert.deepEqual(sitePoints({id:1,gps:pair}),[]);
 }
 assert(validCoordinates([0,0]));
 const duplicate=structuredClone(data);duplicate.sites[1].id=duplicate.sites[0].id;
 assert.throws(()=>validateData(duplicate),/ID/);
 const bad=structuredClone(data);bad.sites[0].gps=[null,null];assert.throws(()=>validateData(bad),/Koordinaten/);
 const variants={id:8,launch_variants:[{latitude:null,longitude:null},{latitude:47,longitude:7}]};
 assert.equal(sitePoints(variants)[0].id,'8-1','variant identity must not shift when an invalid point is skipped');
});

test('all shared filter combinations agree with expected dataset membership',()=>{
 let combinations=0;
 for(const weather of ['',...data.weatherkeys])for(const priority of ['','A','B','C','D'])for(const access of ['','Bergbahn','Bus','Auto/Hike'])for(const onlySuitable of [false,true]){
  const actual=sortAndFilter(data.sites,{weather,priority,access,onlySuitable});
  const expected=data.sites.filter(r=>(!priority||r.category===priority)&&(!access||r.loc_class===access)&&(!weather||!onlySuitable||['Günstig','Prüfen'].includes(r.weather[weather])));
  assert.deepEqual(new Set(actual.map(r=>r.id)),new Set(expected.map(r=>r.id)));combinations++;
 }
 assert.equal(combinations,360);
 const names=sortAndFilter(data.sites,{sort:'name'}).map(r=>r.Startplatz);
 assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,'de-CH')));
 assert.equal(sortAndFilter(data.sites,{query:'   WEISSENSTEIN  '}).length,sortAndFilter(data.sites,{query:'weissenstein'}).length);
});

test('details include canonical difficulty, all seven sections and both variants',()=>{
 for(const site of data.sites)for(const compact of [false,true]){
  const html=detailHTML(site,null,compact);
  assert(html.includes('Schwierigkeit <strong>'+site.schwierigkeit_kanonisch));
  assert.equal((html.match(/class="detail-section /g)||[]).length,7);
 }
 const site=data.sites.find(r=>r.id===10),points=sitePoints(site);
 const html=detailHTML(site,points[1]);
 assert(html.includes('data-point-id="10-0"'));
 assert(html.includes('data-point-id="10-1" aria-pressed="true"'));
 const invalid=detailHTML({...site,gps:[null,null],launch_variants:undefined});
 assert(!invalid.includes('google.com/maps'));
 const hostile=detailHTML({...site,Startplatz:'<img src=x onerror=alert(1)>'});
 assert(!hostile.includes('<img'));
});

test('shared URL filters validate choices and preserve the suitable-only default',()=>{
 assert.equal(filtersFromSearch('').onlySuitable,true);
 const state=filtersFromSearch('?q=B%C3%BCtzen&priority=A&access=Bus&suitable=0&sort=name');
 assert.equal(state.query,'Bützen');assert.equal(state.priority,'A');assert.equal(state.access,'Bus');assert.equal(state.sort,'name');assert.equal(state.onlySuitable,false);
 const bad=filtersFromSearch('?priority=Z&access=rocket&sort=invalid');
 assert.equal(bad.priority,'');assert.equal(bad.access,'');assert.equal(bad.sort,'priority');
});

test('navigation keeps filter state even if browser history updates are throttled',()=>{
 const savedWindow=globalThis.window,savedDocument=globalThis.document;
 const anchor={getAttribute:()=> './karte.html'};
 globalThis.window={location:{href:'https://example.test/index.html'},history:{replaceState(){throw new Error('history throttled');}}};
 globalThis.document={querySelectorAll:()=>[anchor]};
 try{
  const state=filtersFromSearch('?q=B%C3%BCtzen&priority=A&suitable=0&sort=name');
  assert.doesNotThrow(()=>writeFilters(state));
  assert.deepEqual(filtersFromSearch(new URL(anchor.href).search),state);
 }finally{globalThis.window=savedWindow;globalThis.document=savedDocument;}
});

test('HTTP and malformed JSON errors propagate; loading validates before display',async()=>{
 const previous=globalThis.fetch;
 try{
  globalThis.fetch=async()=>({ok:false,status:404});await assert.rejects(loadData,/HTTP 404/);
  globalThis.fetch=async()=>({ok:true,json:async()=>({sites:[]})});await assert.rejects(loadData,/Ungültige/);
  globalThis.fetch=async()=>({ok:true,json:async()=>data});assert.equal(await loadData(),data);
 }finally{globalThis.fetch=previous;}
});

test('HTML and module references exist; map sizing regression stays protected',()=>{
 for(const file of ['index.html','karte.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const [,reference] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))assert(fs.existsSync(path.resolve(root,reference.split('?')[0])),reference);
 }
 for(const file of ['common.js','index.js','map.js']){
  const source=fs.readFileSync(path.join(root,'js',file),'utf8');
  for(const [,reference] of source.matchAll(/from\s+'(\.[^']+)'/g))assert(fs.existsSync(path.resolve(root,'js',reference.split('?')[0])),reference);
 }
 const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
 assert(css.includes('.map-pane > .map-canvas{position:absolute;inset:0}'));
 assert(!css.includes('.map-toolbar .toggle{display:none}'));
});
