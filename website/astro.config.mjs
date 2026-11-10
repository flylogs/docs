import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sidebar from './src/sidebar.json' with { type: 'json' };

export default defineConfig({
  site: 'https://docs.flylogs.com',
  integrations: [
    starlight({
      title: 'Flylogs Docs',
      logo: { light: './src/assets/logo-dark.svg', dark: './src/assets/logo.svg', replacesTitle: true },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/flylogs/docs' }],
      editLink: { baseUrl: 'https://github.com/flylogs/docs/edit/master/' },
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      sidebar,
    }),
  ],
});
