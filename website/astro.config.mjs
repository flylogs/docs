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
      // News / Contact / Log in replace the social icons (no GitHub link, no "Edit page" link).
      components: {
        SocialIcons: './src/components/HeaderLinks.astro',
        // Renders ```mermaid diagrams (Starlight shows them as code otherwise).
        MarkdownContent: './src/components/MarkdownContent.astro',
      },
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      head: [
        // Plausible (self-hosted), same instance as flylogs.com and neo.flylogs.com
        {
          tag: 'script',
          attrs: {
            defer: true,
            'data-domain': 'docs.flylogs.com',
            src: 'https://radar.flylogs.com/js/script.hash.outbound-links.js',
          },
        },
        {
          tag: 'script',
          content:
            'window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }',
        },
      ],
      sidebar,
    }),
  ],
});
