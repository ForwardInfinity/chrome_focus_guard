import { defineConfig } from 'vite';
import webExtension from '@samrum/vite-plugin-web-extension';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const manifest = JSON.parse(
  fs.readFileSync(resolve(__dirname, 'public', 'manifest.json'), 'utf-8')
);

export default defineConfig({
  plugins: [
    webExtension({ manifest }),
    viteStaticCopy({
      targets: [{ src: 'public/manifest.json', dest: '.' }]
    })
  ]
});
