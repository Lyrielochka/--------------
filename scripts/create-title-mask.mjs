import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import sharp from 'sharp';
const b=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await b.newPage();const css=readFileSync('src/fonts.css','utf8').replace(/url\(\/assets\/fonts\/([^\)]+)\)/g,(_,name)=>'url(data:font/woff2;base64,'+readFileSync('public/assets/fonts/'+name).toString('base64')+')');await p.addStyleTag({content:css});
 const mask=await p.evaluate(async()=>{
 await document.fonts.load('700 270px Oswald','«БАГРАТИОН»');
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 ctx.font='700 270px Oswald';ctx.letterSpacing='-6.75px';
 const m=ctx.measureText('«БАГРАТИОН»'),w=Math.ceil(m.actualBoundingBoxLeft+m.actualBoundingBoxRight+16),h=Math.ceil(270*1.12);
 canvas.width=w*3;canvas.height=h*3;ctx.scale(3,3);ctx.font='700 270px Oswald';ctx.letterSpacing='-6.75px';ctx.fillStyle='white';
 ctx.fillText('«БАГРАТИОН»',8+m.actualBoundingBoxLeft,(h-m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2+m.actualBoundingBoxAscent);
 return {data:canvas.toDataURL().split(',')[1],width:w,height:h};
 });
 await sharp(Buffer.from(mask.data,'base64')).trim().extend({top:18,bottom:18,left:24,right:24,background:{r:0,g:0,b:0,alpha:0}}).png().toFile('public/assets/bagration-title-mask.png');console.log(mask.width,mask.height);
}finally{await b.close()}
