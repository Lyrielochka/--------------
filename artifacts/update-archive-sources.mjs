import fs from 'node:fs';const p='src/Experience.jsx';let s=fs.readFileSync(p,'utf8');
s=s.replace('ПОДПИСЬ ИЗ ПРЕДОСТАВЛЕННОЙ ПОДБОРКИ','{item.credit}');
s=s.replace('<dt>МЕСТО</dt><dd>{item.place}</dd>','<dt>МЕСТО</dt><dd>{item.place}</dd><dt>ИСТОЧНИК</dt><dd><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.credit} ↗</a></dd>');
s=s.replace('[-5,3,-2,5][i]','[-3,2,-2,3][i % 4]');
s=s.replace('ФОТОГРАФИИ В ПОДБОРКЕ','СНИМКОВ В ПОДБОРКЕ');
fs.writeFileSync(p,s);
