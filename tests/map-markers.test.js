import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {windBearings,markerProperties,windImage} from '../js/map-markers.js';
import {sitePoints} from '../js/common.js';
import {boot} from './browser-harness.js';
const data=JSON.parse(fs.readFileSync(new URL('../daten/startplaetze.json',import.meta.url)));

test('wind sectors preserve compass ranges, German notation and disjoint directions',()=>{
 assert.deepEqual(windBearings('SE–SW'),[135,180,225]);
 assert.deepEqual(windBearings('O–SO (DHV; nur nach Schulfreigabe)'),[90,135]);
 assert.deepEqual(windBearings('NW–NE'),[0,45,315]);
 assert.deepEqual(windBearings('N,S'),[0,180]);
 assert.deepEqual(windBearings('N (nur schwach; NW nicht pauschal freigegeben)'),[0]);
 assert.deepEqual(windBearings('N (Burnair); sauberer Nordwind nötig'),[0]);
 for(const text of ['',null,'Nicht verifiziert; N/W ungeeignet (Burnair)','N,unbekannt','W–E'])assert.deepEqual(windBearings(text),[]);
});

test('canonical difficulty is independent of priority and unresolved sectors get no fan',()=>{
 const points=data.sites.flatMap(sitePoints);
 const props=id=>markerProperties(points.find(p=>p.id===id),data.comparison_issues);
 assert.equal(props('1-0').difficulty,'Mittel'); // A priority does not imply easy.
 assert.equal(props('2-0').difficulty,'Leicht');
 assert.equal(props('13-0').difficulty,'Schwer');
 assert.deepEqual(props('13-0').directions,[0],'excluded NW must not become a fan');
 assert.equal(props('22-0').windKnown,false,'unresolved Tannmatt Ost sector');
 assert.equal(props('28-0').windKnown,false,'rejected Orvin N/W is not a favourable sector');
 assert.deepEqual(props('29-0').directions,[0],'operating-status uncertainty does not invent another wind');
 assert.deepEqual(props('10-0'),props('10-1'),'variants retain the existing grouped wind/difficulty values');
 assert.equal(markerProperties({site:{schwierigkeit_kanonisch:'unrecognised'}}).difficulty,'Unbekannt');
});

test('fan pixels point toward wind origin and leave disjoint gaps',()=>{
 const sample=(image,x,y)=>image.data[(y*image.width+x)*4+3];
 const north=windImage([0]);
 assert(sample(north,80,30)>0);assert.equal(sample(north,80,130),0);
 assert.equal(sample(north,30,80),0);assert.equal(sample(north,80,80),0);
 const split=windImage([0,180]);assert(sample(split,80,30)>0);assert(sample(split,80,130)>0);assert.equal(sample(split,130,80),0);
});

test('style restoration repairs fan images and selection halo while filters keep variants',async()=>{
 const app=await boot();app.completeStyle();
 const fan=app.map.getLayer('launch-wind');
 assert.equal(fan.layout['icon-rotation-alignment'],'map');
 assert.equal(app.map.layers.size,6);assert(app.map.images.size>0);
 const initialImages=app.map.images.size;
 for(const style of app.styles){style.dispatch('click');app.completeStyle();assert.equal(app.map.images.size,initialImages);assert.equal(app.map.layers.size,6);}
 const removed=app.map.images.keys().next().value;app.map.images.delete(removed);app.map.layers.delete('launch-wind');app.completeStyle();assert(app.map.hasImage(removed));assert(app.map.getLayer('launch-wind'));
 app.element('search').value='Schwengimatt';app.element('search').dispatch('input');app.element('site-list').children[0].dispatch('click');
 app.element('detail-content').children.find(e=>e.dataset.pointId==='10-1').dispatch('click');
 app.styles[1].dispatch('click');app.completeStyle();
 const features=app.map.getSource('launches').data.features;
 assert.equal(features.length,2);assert.equal(features.find(f=>f.properties.selected).properties.pointId,'10-1');
 assert(features.every(f=>f.properties.difficulty==='Mittel'&&f.properties.windKnown));
});
