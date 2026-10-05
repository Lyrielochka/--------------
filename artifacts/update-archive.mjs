import fs from 'node:fs';
const p='src/Experience.jsx';let s=fs.readFileSync(p,'utf8');
s=s.replaceAll("['forest','landscape'].includes(item.visual)",'Boolean(item.image)');
s=s.replaceAll("item.visual==='forest'?'/assets/partisans-night.webp':'/assets/bagration-hero.webp'",'item.image');
fs.writeFileSync(p,s);
