import fs from 'node:fs';const p='src/Experience.jsx';let s=fs.readFileSync(p,'utf8');
s=s.replace(",[query,setQuery]=useState('')",'');
s=s.replace("&&c.title.toLowerCase().includes(query.toLowerCase())",'');
s=s.replace(/<label className="desk-search">.*?<\/label>/,'');
s=s.replace(/ style=\{\{'--sheet-angle':.*?\}\}/,'');
s=s.replace('initial={{opacity:0,y:35,rotate:-5}}','initial={{opacity:0,y:20}}');
s=s.replace(/<span className="desk-coordinate">.*?<\/span>/,'');
s=s.replace(/\{visible.length===0&&<p className="desk-empty">.*?<\/p>\}<div className="desk-note">.*?<\/div>/,'');
fs.writeFileSync(p,s);
