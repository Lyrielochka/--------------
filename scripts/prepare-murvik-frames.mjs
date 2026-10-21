import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
const source='artifacts/murvik-drawn-sheet.png';
const meta=await sharp(source).metadata();
await mkdir('public/assets/murvik-frames',{recursive:true});
const previews=[];
for(let i=0;i<16;i++){
 const col=i%4,row=Math.floor(i/4),left=Math.round(col*meta.width/4),top=Math.round(row*meta.height/4);
 const width=Math.round((col+1)*meta.width/4)-left,height=Math.round((row+1)*meta.height/4)-top;
 const frame=await sharp(source).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // Keep the character's connected alpha silhouette; discard isolated extraction specks.
 const {data,info}=frame,seen=new Uint8Array(info.width*info.height),groups=[];
 for(let p=0;p<seen.length;p++){
  if(seen[p]||data[p*4+3]<32)continue;
  const group=[],queue=[p];seen[p]=1;
  for(let q=0;q<queue.length;q++){
   const n=queue[q];group.push(n);
   for(const k of [n%info.width?n-1:-1,n%info.width<info.width-1?n+1:-1,n-info.width,n+info.width]){
    if(k<0||k>=seen.length||seen[k]||data[k*4+3]<32)continue;
    seen[k]=1;queue.push(k);
   }
  }
  groups.push(group);
 }
 groups.sort((a,b)=>b.length-a.length);
 const keep=new Uint8Array(seen.length);for(const p of groups[0]||[])keep[p]=1;
 for(let p=0;p<keep.length;p++)if(!keep[p])data[p*4+3]=0;
 const clean=await sharp(data,{raw:info}).trim({threshold:5}).png().toBuffer();
 const scaled=await sharp(clean).resize({height:610,width:407,fit:'inside'}).png().toBuffer({resolveWithObject:true});
 const out=await sharp({create:{width:427,height:640,channels:4,background:'#00000000'}})
  .composite([{input:scaled.data,left:Math.round((427-scaled.info.width)/2),top:628-scaled.info.height}]).webp({quality:92,alphaQuality:100}).toBuffer();
 await writeFile(`public/assets/murvik-frames/${String(i).padStart(2,'0')}.webp`,out);
 previews.push({input:await sharp(out).resize(213,320).png().toBuffer(),left:col*213,top:row*320});
}
await sharp({create:{width:852,height:1280,channels:4,background:'#203439'}}).composite(previews).png().toFile('artifacts/murvik-drawn-preview.png');
console.log('MURVIK_FRAMES: 16 aligned transparent frames, 427 × 640');
