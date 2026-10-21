import sharp from 'sharp';
import {stat} from 'node:fs/promises';
const source='artifacts/hero-cover-redraw.png',output='public/assets/hero-cover.webp';
await sharp(source).webp({quality:92,effort:6}).toFile(output);
console.log(`Hero: ${(await stat(source)).size} -> ${(await stat(output)).size} bytes; original dimensions retained`);
