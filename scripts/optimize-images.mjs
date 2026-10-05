import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
async function walk(dir) { const out=[]; for(const entry of await readdir(dir,{withFileTypes:true})) { const file=path.join(dir,entry.name); if(entry.isDirectory()) out.push(...await walk(file)); else out.push(file); } return out; }
const files=(await walk('public')).filter(file=>file.endsWith('.png'));
files.push('фоновое изображение.png');
const report=[];
for(const source of files) {
 const output=source.replace(/\.png$/,'.lossless.webp');
 // Existing lossy WebP images remain untouched. New versions preserve visible pixels.
 const encoded=await sharp(source).webp({lossless:true,effort:4}).toBuffer();
 const original=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const decoded=await sharp(encoded).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(original.info.width!==decoded.info.width||original.info.height!==decoded.info.height) throw Error(`Dimensions changed: ${source}`);
 for(let i=0;i<original.data.length;i+=4) {
  if(original.data[i+3]!==decoded.data[i+3] || original.data[i+3] && (original.data[i]!==decoded.data[i]||original.data[i+1]!==decoded.data[i+1]||original.data[i+2]!==decoded.data[i+2])) throw Error(`Pixels changed: ${source}`);
 }
 await writeFile(output,encoded);
 report.push({source:source.replaceAll('\\','/'),output:output.replaceAll('\\','/'),before:(await stat(source)).size,after:encoded.length,width:original.info.width,height:original.info.height});
 console.log(`${report.length}/${files.length} ${path.basename(source)}: ${Math.round(encoded.length/1024)} KB`);
}
await mkdir('artifacts',{recursive:true});
await writeFile('artifacts/image-optimization.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({images:report.length,before:report.reduce((n,r)=>n+r.before,0),after:report.reduce((n,r)=>n+r.after,0)}));
