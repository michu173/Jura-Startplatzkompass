import test from 'node:test';
import assert from 'node:assert/strict';
import {boot} from './browser-harness.js';
const points=app=>app.map.getSource('launches').data.features;

test('startup and repeated style swaps restore all points and layers without idle',async()=>{
 const app=await boot();assert(app.element('fit').disabled);app.completeStyle();
 assert.equal(points(app).length,30);assert.equal(app.map.layers.size,4);assert(!app.element('fit').disabled);
 for(const style of ['positron','swisstopo','liberty','positron','liberty']){
  app.styles.find(b=>b.dataset.style===style).dispatch('click');
  assert.equal(app.map.swaps.at(-1).options.diff,false);assert(app.element('fit').disabled);
  app.completeStyle();assert.equal(points(app).length,30);assert.equal(app.map.layers.size,4);assert(!app.element('fit').disabled);
 }
 assert.equal(app.map.camera.filter(x=>x[0]==='fit').length,1,'style swaps preserve camera instead of refitting');
});

test('filters, selected marker and both Schwengimatt positions survive swaps',async()=>{
 const app=await boot();app.completeStyle();
 app.element('search').value='Schwengimatt';app.element('search').dispatch('input');assert.equal(points(app).length,2);
 app.element('site-list').children[0].dispatch('click');
 assert(app.element('detail-content').innerHTML.includes('Schwengimatt oben'));
 app.element('detail-content').children.find(e=>e.dataset.pointId==='10-1').dispatch('click');
 assert.equal(points(app).find(f=>f.properties.selected).properties.pointId,'10-1');
 app.styles[1].dispatch('click');app.completeStyle();
 assert.equal(points(app).length,2);assert.equal(points(app).find(f=>f.properties.selected).properties.pointId,'10-1');
 app.element('detail-close').dispatch('click');assert(!points(app).some(f=>f.properties.selected));
 assert.equal(app.element('detail').getAttribute('aria-hidden'),'true');
});

test('same weather state yields suitable-only results; reset restores shared defaults',async()=>{
 const app=await boot({search:'?weather=Starkwind%20%2F%20Gewitter'});app.completeStyle();
 assert.equal(points(app).length,0);assert(app.element('onlySuitable').checked);
 app.element('onlySuitable').checked=false;app.element('onlySuitable').dispatch('input');assert.equal(points(app).length,30);
 app.element('reset').dispatch('click');assert(app.element('onlySuitable').checked);assert.equal(points(app).length,30);
 app.priorities.find(e=>e.dataset.priority==='A').dispatch('click');assert.equal(points(app).length,4);
 assert(app.location.search.includes('priority=A'));
});

test('failed style can be retried; late tile errors do not cover a usable map',async()=>{
 const app=await boot();app.map.emit('error',{error:new Error('style failed')});
 assert(!app.element('map-error').classList.contains('hidden'));
 app.styles[0].dispatch('click');assert.equal(app.map.swaps.length,1,'same-style retry remains available before ready');app.completeStyle();
 app.map.emit('error',{error:new Error('one tile failed')});assert(app.element('map-error').classList.contains('hidden'));assert(app.element('map-status').textContent.includes('Kartendaten fehlen'));
 app.styles[1].dispatch('click');app.tick(20000);assert(!app.element('map-error').classList.contains('hidden'));
 app.completeStyle();assert(app.element('map-error').classList.contains('hidden'));assert(!app.element('fit').disabled);
});

test('rapid swaps and missing layers cannot cause invalid map queries',async()=>{
 const app=await boot();app.completeStyle();app.styles[1].dispatch('click');app.styles[2].dispatch('click');
 assert.doesNotThrow(()=>app.map.emit('click',{point:{}}));app.completeStyle();assert.equal(points(app).length,30);
 app.map.layers.delete('unclustered');assert.doesNotThrow(()=>app.map.emit('mousemove',{point:{}}));assert.doesNotThrow(()=>app.map.emit('click',{point:{}}));
 app.completeStyle();assert.equal(app.map.layers.size,4);
});

test('old cluster expansion is ignored after a style swap',async()=>{
 const app=await boot();app.completeStyle();let resolve;
 app.map.getSource('launches').getClusterExpansionZoom=()=>new Promise(r=>{resolve=r;});
 app.map.hits={'cluster-outer':[{properties:{cluster_id:3},geometry:{coordinates:[7,47]}}]};
 app.map.emit('click',{point:{}});app.styles[1].dispatch('click');app.completeStyle();resolve(13);await Promise.resolve();await Promise.resolve();
 assert.equal(app.map.camera.filter(x=>x[0]==='ease').length,0);
});

test('mobile details trap focus, switch variants and restore focus on close',async()=>{
 const app=await boot({mobile:true});app.completeStyle();
 const row=app.element('site-list').children[0];row.focus();row.dispatch('click');
 assert.equal(app.element('detail').getAttribute('role'),'dialog');assert.equal(app.element('detail').getAttribute('aria-modal'),'true');assert(app.backgrounds.every(e=>e.inert));
 assert.equal(app.document.activeElement,app.element('detail-close'));
 let prevented=false;app.document.dispatch('keydown',{key:'Tab',preventDefault(){prevented=true;}});
 assert(prevented);assert.equal(app.document.activeElement,app.element('back'));
 app.document.dispatch('keydown',{key:'Escape',preventDefault(){}});
 assert(app.backgrounds.every(e=>!e.inert));assert.equal(app.document.activeElement,row);
});

test('missing library or WebGL preserves details and does not request location',async()=>{
 for(const options of [{constructorError:true},{missingLibrary:true}]){
  const app=await boot(options);assert(!app.map);assert(app.element('locate').disabled);app.element('locate').dispatch('click');assert.equal(app.geoRequests,0);
  assert(app.styles.every(b=>b.disabled));assert(!app.element('map-error').classList.contains('hidden'));
  app.element('site-list').children[0].dispatch('click');assert.equal(app.element('detail').getAttribute('aria-hidden'),'false');
 }
});

test('failed JSON leaves map tools disabled and displays a data error',async()=>{
 const app=await boot({dataError:true});assert(!app.map);assert(app.element('site-list').innerHTML.includes('HTTP 503'));assert(app.element('fit').disabled);assert(app.styles.every(b=>b.disabled));
});

test('launch-source errors are not mistaken for harmless basemap tile errors',async()=>{
 const app=await boot();app.completeStyle();app.map.emit('error',{sourceId:'launches',error:new Error('worker failure')});assert(!app.element('map-error').classList.contains('hidden'));assert(app.element('fit').disabled);
 app.styles[0].dispatch('click');app.completeStyle();assert.equal(points(app).length,30);assert(!app.element('fit').disabled);
});
