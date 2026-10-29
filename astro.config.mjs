import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tapandbuild.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
