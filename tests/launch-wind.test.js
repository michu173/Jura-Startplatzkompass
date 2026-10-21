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
