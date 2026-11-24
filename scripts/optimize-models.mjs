import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup, prune, weld, simplify, draco, textureCompress} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

// Backups stay outside public/dist. Repeated runs use these originals.
const root='public/assets/tech', backup='outputs/model-originals', staging='outputs/model-optimized';
await fs.mkdir(backup,{recursive:true});
await fs.mkdir(staging,{recursive:true});
await fs.mkdir('artifacts',{recursive:true});
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.encoder':await draco3d.createEncoderModule(),
  'draco3d.decoder':await draco3d.createDecoderModule(),
});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const count=doc=>doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((s,p)=>s+(p.getAttribute('POSITION')?.getCount()||0),0),0);
let previous=[];
try{previous=JSON.parse(await fs.readFile('artifacts/model-optimization.json','utf8')).models}catch(e){if(e.code!=='ENOENT')throw e}
const report=[];
for(const name of (await fs.readdir(root)).filter(f=>f.endsWith('.glb')).sort()){
  const original=path.join(backup,name);
  try{await fs.copyFile(path.join(root,name),original,fs.constants.COPYFILE_EXCL)}catch(e){if(e.code!=='EEXIST')throw e}
  const input=await fs.readFile(original), doc=await io.read(original), beforeVertices=count(doc);
  const currentHash=hash(await fs.readFile(path.join(root,name)));
  if(currentHash!==hash(input)&&currentHash!==previous.find(m=>m.name===name)?.sha256Optimized){
    throw Error(`Model changed since backup: ${name}. Preserve the new original in a separate backup before optimizing.`);
  }
  const texturesBefore=doc.getRoot().listTextures().map(t=>({size:t.getSize(),bytes:t.getImage()?.byteLength}));
  await doc.transform(dedup(),prune(),weld());
  if(beforeVertices>300000)await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:0.4,error:0.0005,lockBorder:true}));
  await doc.transform(
    textureCompress({encoder:sharp,targetFormat:'webp',resize:[2048,2048],quality:90,effort:80,slots:/^(?!normalTexture).*$/}),
    textureCompress({encoder:sharp,targetFormat:'webp',resize:[2048,2048],lossless:true,effort:80,slots:/^normalTexture$/}),
    prune(),draco({encodeSpeed:5,decodeSpeed:7,quantizePosition:16,quantizeNormal:12,quantizeTexcoord:14})
  );
  const output=await io.writeBinary(doc);
  const decoded=await io.readBinary(output);
  if(!decoded.getRoot().listScenes().length||!count(decoded))throw Error('Empty model: '+name);
  if(output.length>=input.length)throw Error('No size improvement: '+name);
  await fs.writeFile(path.join(staging,name),output);
  report.push({name,before:input.length,after:output.length,beforeVertices,afterVertices:count(decoded),texturesBefore,sha256Original:hash(input),sha256Optimized:hash(output)});
  await fs.writeFile('artifacts/model-optimization-progress.json',JSON.stringify(report,null,2));
  console.log(`${name}: ${(input.length/1e6).toFixed(2)} -> ${(output.length/1e6).toFixed(2)} MB; ${beforeVertices} -> ${count(decoded)} vertices`);
}
await fs.mkdir('public/assets/draco',{recursive:true});
for(const file of ['draco_wasm_wrapper.js','draco_decoder.wasm','draco_decoder.js'])await fs.copyFile('node_modules/three/examples/jsm/libs/draco/gltf/'+file,'public/assets/draco/'+file);
for(const entry of report)await fs.copyFile(path.join(staging,entry.name),path.join(root,entry.name));
await fs.writeFile('artifacts/model-optimization.json',JSON.stringify({settings:{textureMax:2048,colorQuality:90,normalLossless:true,simplifyRatio:0.4,simplifyError:0.0005,lockBorder:true},models:report,before:report.reduce((s,m)=>s+m.before,0),after:report.reduce((s,m)=>s+m.after,0)},null,2));
