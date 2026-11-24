import fs from 'node:fs';
import assert from 'node:assert/strict';
import {xy} from '../src/bagrationMapData.js';

// Use every member of the current OSM administrative relation; do not smooth the border.
export function prepareOsmRegion(slug,relationId,name){
 const raw=JSON.parse(fs.readFileSync(`artifacts/sources/${slug}-region-osm.json`));
 const relation=raw.elements.find(e=>e.type==='relation'&&e.id===relationId);
 assert.equal(relation.tags.admin_level,'4');assert.equal(relation.tags['name:ru'],name);
 const nodes=new Map(raw.elements.filter(e=>e.type==='node').map(e=>[e.id,[e.lon,e.lat]]));
 const ways=new Map(raw.elements.filter(e=>e.type==='way').map(e=>[e.id,e.nodes]));
 function rings(role){
  const remaining=new Map(relation.members.filter(m=>m.type==='way'&&m.role===role).map(m=>{assert.ok(ways.has(m.ref));return [m.ref,[...ways.get(m.ref)]]}));
  const result=[];
  while(remaining.size){const [id,first]=remaining.entries().next().value;remaining.delete(id);const ring=[...first];
   while(ring[0]!==ring.at(-1)){
    const match=[...remaining].find(([,ids])=>ids[0]===ring.at(-1)||ids.at(-1)===ring.at(-1));assert.ok(match,`${slug}: unclosed ${role} ring`);
    const [id,ids]=match;remaining.delete(id);if(ids.at(-1)===ring.at(-1))ids.reverse();ring.push(...ids.slice(1));
   }
   result.push(ring.map(id=>{assert.ok(nodes.has(id));return nodes.get(id)}));
  }
  return result;
 }
 const contains=(ring,[x,y])=>{let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [a,b]=ring[i],[c,d]=ring[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside}return inside};
 const outer=rings('outer'),inner=rings('inner');assert.ok(outer.length);
 const polygons=outer.map(r=>[r,...inner.filter(h=>contains(r,h[0]))]);
 assert.equal(polygons.reduce((n,p)=>n+p.length-1,0),inner.length);
 const feature={type:'Feature',properties:{name,source:'OpenStreetMap contributors',relation:relationId,version:relation.version,osmTimestamp:relation.timestamp,downloaded:'2026-11-04',license:'ODbL-1.0',url:`https://www.openstreetmap.org/relation/${relationId}`},geometry:{type:'MultiPolygon',coordinates:polygons}};
 fs.writeFileSync(`public/data/${slug}-region.geojson`,JSON.stringify(feature));
 const points=outer.flat().map(c=>xy(...c));
 const bounds={left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};
 const path=polygons.flatMap(p=>p.map(r=>r.map((c,i)=>{const p=xy(...c);return `${i?'L':'M'}${p.x.toFixed(3)} ${p.y.toFixed(3)}`}).join(' ')+'Z')).join(' ');
 fs.writeFileSync(`src/${slug}RegionShape.js`,`// Generated from OSM relation ${relationId}; OpenStreetMap contributors, ODbL-1.0.\nexport const ${slug}RegionBounds=${JSON.stringify(bounds)};\nexport const ${slug}RegionPath=${JSON.stringify(path)};\nexport const ${slug}RegionSource=${JSON.stringify(feature.properties)};\n`);
 return {points,feature};
}
