import fs from 'node:fs';
import assert from 'node:assert/strict';
import {filterEvents,clusterEvents} from '../src/minskAtlasModel.js';
const registry=JSON.parse(fs.readFileSync('src/grodnoBattleEvents.json'));
const region=JSON.parse(fs.readFileSync('public/data/grodno-region.geojson'));
const polygons=region.geometry.type==='Polygon'?[region.geometry.coordinates]:region.geometry.coordinates;
const names=new Map(fs.readFileSync('artifacts/sources/geonames-BY/BY.txt','utf8').trim().split('\n').map(l=>{const r=l.split('\t');return [+r[0],r]}));
function inside(r,[x,y]){let b=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [a,c]=r[i],[d,e]=r[j];if((c>y)!==(e>y)&&x<(d-a)*(y-c)/(e-c)+a)b=!b}return b}
const ids=new Set();for(const e of registry.events){assert.ok(!ids.has(e.id));ids.add(e.id);assert.ok(e.start<=e.end);assert.ok(registry.timeline.includes(e.start)&&registry.timeline.includes(e.end));assert.ok(e.sources.length&&e.sources.every(s=>registry.sources[s]?.url.startsWith('https://')));const n=names.get(e.geoNameId);assert.deepEqual(e.coordinates,[+n[5],+n[4]]);assert.ok(polygons.some(p=>inside(p[0],e.coordinates)&&!p.slice(1).some(h=>inside(h,e.coordinates))),`Outside boundary: ${e.id}`);assert.ok(e.note&&e.summary&&e.meaning)}
assert.equal(registry.events.length,37);assert.equal(new Set(registry.itinerary).size,12);assert.ok(registry.itinerary.every(id=>ids.has(id)));assert.deepEqual(registry,JSON.parse(fs.readFileSync('public/data/grodno-battle-events.json')));
assert.equal(filterEvents(registry.events,{query:'гродно'}).length,2);assert.equal(filterEvents(registry.events,{type:'crossing'}).length,2);assert.equal(filterEvents(registry.events,{day:'1944-07-16'}).length,3);assert.equal(filterEvents(registry.events,{query:'неизвестный пункт'}).length,0);
for(const scale of [.6,1.5,4])assert.deepEqual(clusterEvents(registry.events,scale).flatMap(g=>g.events.map(e=>e.id)).sort(),[...ids].sort());
console.log('GRODNO_DATA: PASS (37 records, sources, dates, gazetteer, boundary membership, filters, route, export)');
