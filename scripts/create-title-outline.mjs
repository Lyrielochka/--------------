import sharp from 'sharp';
const input='public/assets/bagration-title-mask.png';
const {data:source,info:{width,height}}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
// Expand the alpha silhouette, then subtract its interior for a fine outer edge.
const horizontal=new Uint8Array(width*height),rgba=Buffer.alloc(width*height*4),radius=6,outerCoverage=0.6;
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 let a=0;for(let dx=-radius;dx<=radius;dx++){const xx=x+dx;if(xx>=0&&xx<width)a=Math.max(a,source[(y*width+xx)*4+3]*(Math.abs(dx)===radius?outerCoverage:1));}
 horizontal[y*width+x]=a;
}
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 let a=0;for(let dy=-radius;dy<=radius;dy++){const yy=y+dy;if(yy>=0&&yy<height)a=Math.max(a,horizontal[yy*width+x]*(Math.abs(dy)===radius?outerCoverage:1));}
 const i=(y*width+x)*4;rgba[i]=255;rgba[i+1]=255;rgba[i+2]=255;rgba[i+3]=Math.max(0,a-source[i+3]);
}
await sharp(rgba,{raw:{width,height,channels:4}}).png().toFile('public/assets/bagration-title-outline.png');
