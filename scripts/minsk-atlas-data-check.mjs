import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {filterEvents,clusterEvents,registry} from '../src/minskAtlasModel.js';
const region=JSON.parse(readFileSync('public/data/minsk-region.geojson'));
const names=new Map(readFileSync('artifacts/sources/geonames-BY/BY.txt','utf8').trim().split('\n').map(l=>{const r=l.split('\t');return [+r[0],r]}));
function contains(r,[x,y]){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [a,b]=r[i],[c,d]=r[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside}return inside}
const inRegion=p=>region.geometry.coordinates.some(poly=>contains(poly[0],p)&&!poly.slice(1).some(r=>contains(r,p)));
const ids=new Set();for(const event of registry.events){assert.ok(!ids.has(event.id));ids.add(event.id);assert.ok(event.start<=event.end);assert.ok(event.start>='1944-06-23'&&event.end<='1944-08-29');assert.ok(event.sources.length);assert.ok(event.summary&&event.meaning&&event.note);for(const source of event.sources)assert.ok(registry.sources[source]?.url.startsWith('https://'));const gazetteer=names.get(event.geoNameId);assert.deepEqual(event.coordinates,[Number(gazetteer[5]),Number(gazetteer[4])]);assert.ok(inRegion(event.coordinates)||event.district==='Минск',`Outside modern region: ${event.id}`)}
assert.equal(registry.events.length,76);assert.equal(new Set(registry.events.filter(e=>!['Минск','Жодино'].includes(e.district)).map(e=>e.district)).size,22);
assert.ok(registry.completeness.includes('не исчерпывает'));assert.equal(filterEvents(registry.events,{query:'несвиж',day:'1944-07-04'}).length,1);assert.equal(filterEvents(registry.events,{type:'air'}).length,2);assert.equal(filterEvents(registry.events,{query:'неизвестноеместо'}).length,0);
for(const scale of [.6,1.5,4]){const groups=clusterEvents(registry.events,scale);assert.deepEqual(groups.flatMap(g=>g.events.map(e=>e.id)).sort(),[...ids].sort());}
assert.equal(new Set(registry.itinerary).size,12);for(const id of registry.itinerary)assert.ok(ids.has(id));
console.log('MINSK_ATLAS_DATA: PASS · 76 source-linked records, 22 districts, dates inside operation, GeoNames coordinates, region membership, honest scope, filters and lossless clusters');
