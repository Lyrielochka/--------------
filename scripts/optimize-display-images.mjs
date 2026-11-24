import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
async function walk(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push(p)}return out}
const targets=(await walk('public/assets')).filter(p=>p.endsWith('.lossless.webp')&&(/[/\\](catalog|scale)[/\\]/.test(p)||p.endsWith('operation-atmosphere.lossless.webp')));
const replacements=[], report=[];
for(const source of targets){
 const before=(await fs.stat(source)).size;
 const original=sharp(source), meta=await original.metadata();
 const output=source.replace('.lossless.webp','.display.webp');
 const buffer=await original.resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:90,alphaQuality:100,effort:6}).toBuffer();
 if(buffer.length>=before)continue;
 await fs.writeFile(output,buffer);
 replacements.push([source.slice(6).replaceAll('\\','/'),output.slice(6).replaceAll('\\','/')]);
 report.push({source,output,before,after:buffer.length,width:meta.width,height:meta.height});
}
for(const file of [...await walk('src'),'index.html','public/preloader.js',...((await walk('public')).filter(p=>p.endsWith('.css')))]){
 if(!/\.(jsx?|css|html)$/.test(file))continue;
 const input=await fs.readFile(file,'utf8');let output=input;
 for(const [source,target] of replacements)output=output.replaceAll(source,target);
 if(output!==input)await fs.writeFile(file,output);
}
await fs.writeFile('artifacts/display-image-optimization.json',JSON.stringify(report,null,2));
console.log({count:report.length,before:report.reduce((s,r)=>s+r.before,0),after:report.reduce((s,r)=>s+r.after,0)});
