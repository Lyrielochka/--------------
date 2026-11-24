import fs from 'node:fs';
import assert from 'node:assert/strict';
import {xy} from '../src/bagrationMapData.js';
const regions=[['vitebsk',59506],['mogilev',59162],['grodno',59275],['brest',59189]];
const edge=(a,b)=>[a.join(','),b.join(',')].sort().join('|');
for(const [slug,id] of regions){
 const raw=JSON.parse(fs.readFileSync(`artifacts/sources/${slug}-region-osm.json`));
 const rel=raw.elements.find(e=>e.type==='relation'&&e.id===id),nodes=new Map(raw.elements.filter(e=>e.type==='node').map(e=>[e.id,[e.lon,e.lat]])),ways=new Map(raw.elements.filter(e=>e.type==='way').map(e=>[e.id,e.nodes]));
 const expected=new Set();for(const m of rel.members.filter(m=>m.type==='way'&&['outer','inner'].includes(m.role))){const ids=ways.get(m.ref);for(let i=1;i<ids.length;i++)expected.add(edge(nodes.get(ids[i-1]),nodes.get(ids[i])))}
 const f=JSON.parse(fs.readFileSync(`public/data/${slug}-region.geojson`));
 assert.equal(f.properties.relation,id);assert.equal(f.properties.version,rel.version);assert.equal(f.properties.license,'ODbL-1.0');
 const actual=new Set();for(const poly of f.geometry.coordinates)for(const ring of poly){assert.deepEqual(ring[0],ring.at(-1));for(let i=1;i<ring.length;i++)actual.add(edge(ring[i-1],ring[i]));}
 assert.deepEqual(actual,expected,`${slug}: all source edges preserved exactly`);
 const shape=await import(`../src/${slug}RegionShape.js`);
 const path=f.geometry.coordinates.flatMap(p=>p.map(r=>r.map((c,i)=>{const p=xy(...c);return `${i?'L':'M'}${p.x.toFixed(3)} ${p.y.toFixed(3)}`}).join(' ')+'Z')).join(' ');
 assert.equal(shape[slug+'RegionPath'],path);
 const registry=JSON.parse(fs.readFileSync(`src/${slug}BattleEvents.json`));assert.equal(registry.boundary.relation,id);assert.ok(!registry.coordinates.includes('2005'));assert.deepEqual(registry,JSON.parse(fs.readFileSync(`public/data/${slug}-battle-events.json`)));
 console.log(`${slug}: PASS · ${actual.size} exact OSM edges, closed rings, projection, metadata, export`);
}
