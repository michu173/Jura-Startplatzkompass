import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LAUNCH_WIND_DIRECTIONS,matchesLaunchWind} from '../js/launch-wind.js';
const data=JSON.parse(fs.readFileSync(new URL('../daten/startplaetze.json',import.meta.url)));

test('launch-wind filtering follows canonical sectors independently of general weather',()=>{
 const expected={N:[8,9,10,11,13,16,18,25,26,29],NE:[8,9,10,18],E:[4,15,27],SE:[1,2,3,4,5,6,7,12,14,15,17,19,23,27],S:[1,2,3,4,5,6,7,12,14,15,17,19,20,23,24],SW:[2,6,7,15,17,23,24],W:[],NW:[8,9,10,11,16,21,25,26]};
 for(const direction of LAUNCH_WIND_DIRECTIONS)assert.deepEqual(data.sites.filter(s=>matchesLaunchWind(s,direction,data.comparison_issues)).map(s=>s.id),expected[direction],direction);
 assert.equal(data.sites.filter(s=>matchesLaunchWind(s,'',data.comparison_issues)).length,29);
});

test('wind filtering never treats excluded, unresolved or invalid directions as favourable',()=>{
 const site=id=>data.sites.find(s=>s.id===id);
 assert.equal(matchesLaunchWind(site(13),'NW',data.comparison_issues),false);
 assert.equal(matchesLaunchWind(site(22),'E',data.comparison_issues),false);
 for(const d of ['N','W'])assert.equal(matchesLaunchWind(site(28),d,data.comparison_issues),false);
 assert.equal(matchesLaunchWind(site(29),'N',data.comparison_issues),true,'wind direction does not resolve operating permissions');
 assert.equal(matchesLaunchWind(site(1),'rocket',data.comparison_issues),false);
 assert.equal(matchesLaunchWind({Startwind:'unknown'},'N'),false);
});

test('shared filters compose launch wind with weather, priority, access and search',async()=>{
 const {sortAndFilter}=await import('../js/common.js');
 const memberships={N:[8,9,10,11,13,16,18,25,26,29],NE:[8,9,10,18],E:[4,15,27],SE:[1,2,3,4,5,6,7,12,14,15,17,19,23,27],S:[1,2,3,4,5,6,7,12,14,15,17,19,20,23,24],SW:[2,6,7,15,17,23,24],W:[],NW:[8,9,10,11,16,21,25,26]};
 for(const launchWind of LAUNCH_WIND_DIRECTIONS)for(const weather of ['',...data.weatherkeys])for(const priority of ['','A','B','C','D'])for(const access of ['','Bergbahn','Bus','Auto/Hike'])for(const onlySuitable of [false,true]){
  const state={launchWind,weather,priority,access,onlySuitable};
  const expected=data.sites.filter(s=>memberships[launchWind].includes(s.id)&&(!priority||s.category===priority)&&(!access||s.loc_class===access)&&(!weather||!onlySuitable||['Günstig','Prüfen'].includes(s.weather[weather])));
  assert.deepEqual(new Set(sortAndFilter(data.sites,state,data.comparison_issues).map(s=>s.id)),new Set(expected.map(s=>s.id)));
 }
 assert.equal(sortAndFilter(data.sites,{launchWind:'N',query:'Schwengimatt'},data.comparison_issues)[0].id,10);
});

test('wind URL state validates choices and survives navigation/history throttling',async()=>{
 const {filtersFromSearch,writeFilters}=await import('../js/common.js');
 assert.equal(filtersFromSearch('?wind=NE').launchWind,'NE');
 for(const value of ['NO','rocket','N%2CS'])assert.equal(filtersFromSearch('?wind='+value).launchWind,'');
 const previousWindow=globalThis.window,previousDocument=globalThis.document;
 const link={getAttribute:()=> './karte.html'};
 globalThis.window={location:{href:'https://example.test/index.html?wind=S'},history:{replaceState(){throw new Error('throttled');}}};
 globalThis.document={querySelectorAll:()=>[link]};
 try{const state=filtersFromSearch('?wind=N&weather=Bise&priority=B');writeFilters(state);assert.deepEqual(filtersFromSearch(new URL(link.href).search),state);state.launchWind='';writeFilters(state);assert.equal(new URL(link.href).searchParams.has('wind'),false);}
 finally{globalThis.window=previousWindow;globalThis.document=previousDocument;}
});

test('map wind controls update point membership, retain variants and reset defaults',async()=>{
 const {boot}=await import('./browser-harness.js');
 const app=await boot({search:'?wind=N'});app.completeStyle();
 const points=()=>app.map.getSource('launches').data.features;
 assert.equal(app.element('launchWind').value,'N');assert.equal(points().length,11);
 assert.deepEqual([...new Set(points().map(f=>f.properties.siteId))].sort((a,b)=>a-b),[8,9,10,11,13,16,18,25,26,29]);
 app.element('launchWind').value='E';app.element('launchWind').dispatch('input');assert.equal(points().length,3);assert(app.location.search.includes('wind=E'));
 app.styles[1].dispatch('click');app.completeStyle();assert.equal(points().length,3);
 app.element('launchWind').value='W';app.element('launchWind').dispatch('input');assert.equal(points().length,0);
 app.element('reset').dispatch('click');assert.equal(app.element('launchWind').value,'');assert.equal(points().length,30);assert.equal(new URLSearchParams(app.location.search).has('wind'),false);
});
