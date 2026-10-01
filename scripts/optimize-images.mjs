import sharp from 'sharp';
import { stat } from 'node:fs/promises';
for (const name of ['bagration-hero','partisans-night']) {
  const source=`public/assets/${name}.png`;
  const output=`public/assets/${name}.webp`;
  await sharp(source).webp({quality:84,effort:6}).toFile(output);
  const [before,after]=await Promise.all([stat(source),stat(output)]);
  console.log(`${name}: ${Math.round(before.size/1024)} KB → ${Math.round(after.size/1024)} KB`);
}
