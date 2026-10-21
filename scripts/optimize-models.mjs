import fs from 'node:fs/promises';
import sharp from 'sharp';
const models=[['Т-34-85.glb','t-34-85.glb'],['ИС-2.glb','is-2.glb'],['bm-13_katyusha_hd.glb','bm-13.glb']];
for(const [source,target] of models){
 const input=await fs.readFile('3д-модели/'+source), jl=input.readUInt32LE(12), doc=JSON.parse(input.subarray(20,20+jl).toString()), bin=input.subarray(28+jl); const replacements=new Map();
 for(const image of doc.images||[]){const v=doc.bufferViews[image.bufferView]; const bytes=bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);const optimized=await sharp(bytes).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).png({compressionLevel:9,effort:10}).toBuffer();if(optimized.length<bytes.length)replacements.set(image.bufferView,optimized);}
 const chunks=[];let offset=0;
 for(const [index,v] of doc.bufferViews.entries()){const bytes=replacements.get(index)||bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);v.byteOffset=offset;v.byteLength=bytes.length;chunks.push(bytes);offset+=bytes.length;const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}}
 doc.buffers[0].byteLength=offset;let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const body=Buffer.concat(chunks),out=Buffer.alloc(28+json.length+body.length);out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(json.length,12);out.writeUInt32LE(0x4e4f534a,16);json.copy(out,20);out.writeUInt32LE(body.length,20+json.length);out.writeUInt32LE(0x004e4942,24+json.length);body.copy(out,28+json.length);await fs.writeFile('public/assets/tech/'+target,out);console.log(target,input.length,'->',out.length);
}
