import { defineConfig } from 'vite';
import webExtension from '@samrum/vite-plugin-web-extension';

export default defineConfig({
  plugins: [webExtension()],
});
