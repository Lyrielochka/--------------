import { defineConfig } from 'vite';
import { cp, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Keep source PNGs for editing, but publish only their optimized replacements.
export default defineConfig({
  server:{proxy:{'/api/murvik':'http://127.0.0.1:4173'}},
  build: { copyPublicDir: false },
  plugins: [{
    name: 'publish-optimized-assets',
    apply: 'build',
    async writeBundle(options) {
      const publicRoot = path.resolve('public');
      await cp(publicRoot, options.dir, {
        recursive: true,
        filter: async source => {
          if ((await stat(source)).isDirectory()) return true;
          if (['murvik-original.png','murvik-blink-original.png'].includes(path.basename(source))) return false;
          if (source.endsWith('.png') && existsSync(source.replace(/\.png$/, '.lossless.webp'))) return false;
          if (source.endsWith('.json') && !source.startsWith(path.join(publicRoot, 'data') + path.sep)) return false;
          // These backgrounds already use separately prepared WebP versions.
          if (['bagration-hero.lossless.webp', 'partisans-night.lossless.webp', 'minsk-encirclement.lossless.webp'].includes(path.basename(source))) return false;
          return true;
        },
      });
    },
  }],
});
