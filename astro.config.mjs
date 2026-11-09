// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://alishbafatima12.github.io',
  base: '/teaching',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [preact(), sitemap()],
  build: { inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
});
