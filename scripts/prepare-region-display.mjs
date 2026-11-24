import fs from 'node:fs';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import {xy} from '../src/bagrationMapData.js';
const W=1402,H=1122,N=W*H;
const {data,info}=await sharp('public/assets/belarus-base.lossless.webp').raw().toBuffer({resolveWithObject:true});assert.equal(info.width,W);assert.equal(info.height,H);
const initial=new Uint8Array(N),mask=new Uint8Array(N);
for(let i=0;i<N;i++){const k=i*info.channels;initial[i]=data[k]>30&&data[k+1]>48?1:0;}
// Reject thin grid lines outside the land while keeping the painted coastline.
for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)n+=initial[i+dy*W+dx];mask[i]=n>=5?1:0;}
const queue=new Int32Array(N),visited=new Uint8Array(N);let largest=[];
for(let i=0;i<N;i++){if(!mask[i]||visited[i])continue;let head=0,tail=0;queue[tail++]=i;visited[i]=1;while(head<tail){const p=queue[head++],x=p%W;for(const q of [x?p-1:-1,x<W-1?p+1:-1,p-W,p+W])if(q>=0&&q<N&&mask[q]&&!visited[q]){visited[q]=1;queue[tail++]=q}}if(tail>largest.length)largest=Array.from(queue.subarray(0,tail));}
mask.fill(0);for(const p of largest)mask[p]=1;
// Fill rivers and other interior holes; only the country's outer silhouette is traced.
visited.fill(0);let head=0,tail=1;queue[0]=0;visited[0]=1;while(head<tail){const p=queue[head++],x=p%W;for(const q of [x?p-1:-1,x<W-1?p+1:-1,p-W,p+W])if(q>=0&&q<N&&!mask[q]&&!visited[q]){visited[q]=1;queue[tail++]=q}}for(let i=0;i<N;i++)mask[i]=visited[i]?0:1;
const regions=['vitebsk','mogilev','grodno','brest','minsk','gomel'];
const old=JSON.parse(fs.readFileSync('artifacts/sources/belarus-adm1-geoboundaries.json'));
const pathFor=f=>{const ps=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;return ps.flatMap(p=>p.map(r=>r.map((c,i)=>{const p=xy(...c);return `${i?'L':'M'}${p.x} ${p.y}`}).join(' ')+'Z')).join(' ')};
const paths=regions.map((slug,i)=>{const f=slug==='gomel'?old.features.find(f=>f.properties.shapeISO==='BY-HO'):JSON.parse(fs.readFileSync(`public/data/${slug}-region.geojson`));return `<path fill="rgb(${(i+1)*32},0,0)" fill-rule="evenodd" d="${pathFor(f)}"/>`});
const raster=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${paths.join('')}</svg>`)).ensureAlpha().raw().toBuffer();
const labels=new Uint8Array(N);head=0;tail=0;
for(let i=0;i<N;i++)if(mask[i]&&raster[i*4+3]>127){labels[i]=Math.round(raster[i*4]/32);queue[tail++]=i;}
while(head<tail){const p=queue[head++],x=p%W;for(const q of [x?p-1:-1,x<W-1?p+1:-1,p-W,p+W])if(q>=0&&q<N&&mask[q]&&!labels[q]){labels[q]=labels[p];queue[tail++]=q}}
// Remove isolated pixel fragments from antialiasing before tracing the visual regions.
for(let id=1;id<=6;id++){visited.fill(0);let main=[];for(let i=0;i<N;i++){if(labels[i]!==id||visited[i])continue;let h=0,t=1;queue[0]=i;visited[i]=1;while(h<t){const p=queue[h++],x=p%W;for(const q of [x?p-1:-1,x<W-1?p+1:-1,p-W,p+W])if(q>=0&&q<N&&labels[q]===id&&!visited[q]){visited[q]=1;queue[t++]=q}}if(t>main.length)main=Array.from(queue.subarray(0,t));}for(let i=0;i<N;i++)if(labels[i]===id)labels[i]=0;for(const p of main)labels[p]=id;}
head=0;tail=0;for(let i=0;i<N;i++)if(labels[i])queue[tail++]=i;
while(head<tail){const p=queue[head++],x=p%W;for(const q of [x?p-1:-1,x<W-1?p+1:-1,p-W,p+W])if(q>=0&&q<N&&mask[q]&&!labels[q]){labels[q]=labels[p];queue[tail++]=q}}
assert.ok(tail>650000&&tail<1100000,'Expected country-sized painted land area');
function simplify(points,tol=.85){
 if(points.length<3)return points;const [a,b]=[points[0],points.at(-1)];let at=0,max=0;const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
 for(let i=1;i<points.length-1;i++){const p=points[i],t=len?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len)):0,d=(p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2;if(d>max){max=d;at=i}}
 if(max<=tol*tol)return [a,b];return [...simplify(points.slice(0,at+1),tol).slice(0,-1),...simplify(points.slice(at),tol)];
}
function contours(id){const edges=new Map(),S=W+1;function add(a,b){if(!edges.has(a))edges.set(a,[]);edges.get(a).push(b)}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;if(labels[p]!==id)continue;const a=y*S+x;if(y===0||labels[p-W]!==id)add(a,a+1);if(x===W-1||labels[p+1]!==id)add(a+1,a+1+S);if(y===H-1||labels[p+W]!==id)add(a+1+S,a+S);if(x===0||labels[p-1]!==id)add(a+S,a);}
 const rings=[];while(edges.size){const start=edges.keys().next().value;let p=start,ring=[];do{ring.push([p%S,Math.floor(p/S)]);const next=edges.get(p);assert.ok(next,'Closed display contour');const q=next.pop();if(!next.length)edges.delete(p);p=q;}while(p!==start);ring.push(ring[0]);if(ring.length>8){const middle=Math.floor(ring.length/2);ring=[...simplify(ring.slice(0,middle+1)).slice(0,-1),...simplify(ring.slice(middle))];rings.push(ring)}}return rings;
}
const output={},report={source:'Illustrated belarus-base.lossless.webp silhouette; geographic regions used only as an initial partition',width:W,height:H,landPixels:tail,regions:{}};
for(const [i,slug] of regions.entries()){const rings=contours(i+1),ps=rings.flat();output[slug]={path:rings.map(r=>r.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ')+'Z').join(' '),bounds:{left:Math.min(...ps.map(p=>p[0])),right:Math.max(...ps.map(p=>p[0])),top:Math.min(...ps.map(p=>p[1])),bottom:Math.max(...ps.map(p=>p[1]))}};report.regions[slug]={rings:rings.length,vertices:ps.length};}
fs.writeFileSync('src/regionDisplayShapes.js','// Display-only outlines registered to the illustrated map, not geographic boundaries.\n// Regenerate: node scripts/prepare-region-display.mjs\nexport const regionDisplayShapes='+JSON.stringify(output)+';\n');
fs.writeFileSync('artifacts/region-display-alignment.json',JSON.stringify(report,null,2));

console.log(JSON.stringify(report));
