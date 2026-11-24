import fs from 'node:fs/promises';
const url='https://fonts.googleapis.com/css2?family=Manrope:wght@300..700&family=Oswald:wght@300..600&display=swap';
const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
if(!response.ok)throw Error('Font CSS '+response.status);
let css=await response.text();
await fs.mkdir('public/assets/fonts',{recursive:true});
const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))];
for(const [index,url] of urls.entries()){
 const r=await fetch(url);if(!r.ok)throw Error('Font '+r.status);
 const name='font-'+index+(url.includes('.woff2')?'.woff2':'.ttf');
 const bytes=Buffer.from(await r.arrayBuffer());await fs.writeFile('public/assets/fonts/'+name,bytes);
 css=css.replaceAll(url,'/assets/fonts/'+name);
 console.log(name,bytes.length);
}
await fs.writeFile('src/fonts.css',css);
for(const family of ['Manrope','Oswald']){
 const r=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/'+family.toLowerCase()+'/OFL.txt');
 if(!r.ok)throw Error('Font license '+r.status);
 await fs.writeFile('public/assets/fonts/'+family+'-OFL.txt',await r.text());
}
let styles=await fs.readFile('src/styles.css','utf8');styles=styles.replace(/^@import url\([^\n]+\);/,"@import './fonts.css';");await fs.writeFile('src/styles.css',styles);

