import {readFile,writeFile} from 'node:fs/promises';
let text=await readFile('src/ExplorerSections.jsx','utf8');
text=text.replace('useEffect, useMemo, useRef, useState','lazy, Suspense, useEffect, useMemo, useRef, useState');
text=text.replace("import TechnologyModals from './TechnologyModals.jsx';","const TechnologyModals = lazy(() => import('./TechnologyModals.jsx'));");
text=text.replace('<AnimatePresence>{category&&<TechnologyModals','<Suspense fallback={null}><AnimatePresence>{category&&<TechnologyModals');
text=text.replace('onClose={()=>setCategory(null)}/>}</AnimatePresence></section>','onClose={()=>setCategory(null)}/>}</AnimatePresence></Suspense></section>');
await writeFile('src/ExplorerSections.jsx',text);
for(const file of ['scripts/map-accuracy-check.mjs','scripts/fronts-redesign-check.mjs']) {
 let source=await readFile(file,'utf8');source=source.replace('/assets/belarus-base.png','/assets/belarus-base.lossless.webp').replace('.*\\.png$/','.*\\.lossless\\.webp$/');await writeFile(file,source);
}
