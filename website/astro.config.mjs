import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightImageZoom from 'starlight-image-zoom';
import starlightLlmsTxt from 'starlight-llms-txt';
import sidebar from './src/sidebar.json' with { type: 'json' };

export default defineConfig({
  site: 'https://docs.flylogs.com',
  integrations: [
    starlight({
      title: 'Flylogs Docs',
      description:
        'User manual (FCOM) and API reference for Flylogs, the operations platform for flight schools, aero clubs and aircraft operators.',
      logo: { light: './src/assets/logo-dark.svg', dark: './src/assets/logo.svg', replacesTitle: true },
      favicon: '/favicon.svg',
      // News / Contact / Log in replace the social icons (no GitHub link, no "Edit page" link).
      components: {
        SocialIcons: './src/components/HeaderLinks.astro',
        // Renders ```mermaid diagrams (Starlight shows them as code otherwise).
        // Also hosts the image-zoom dialog and the click-to-load YouTube players.
        MarkdownContent: './src/components/MarkdownContent.astro',
        // "For: Managers" / "Premium and above" badges from page frontmatter.
        PageTitle: './src/components/PageTitle.astro',
      },
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      plugins: [
        // Click a screenshot to see it full size.
        starlightImageZoom(),
        // /llms.txt, /llms-full.txt and /llms-small.txt for AI assistants.
        starlightLlmsTxt({
          projectName: 'Flylogs',
          details: [
            'Flylogs is a web and mobile platform for flight schools, aero clubs and aircraft operators: pilot logbooks and flight records, aircraft and maintenance, schedules and dispatch, training courses, billing, documents and a safety management system (SMS).',
            '',
            '- The user manual is called the FCOM. The API section documents the REST API for integrators.',
            '- Some features need a paid plan. Plans from lowest to highest: Free, Club Essentials, Premium, Unlimited. Pages say which plan a feature needs when it is not available on every plan.',
            '- What users can see depends on their account type (company administrator and other managers, chief pilot, flight instructor, pilot, student, mechanic, auditor).',
            '- The app runs at https://neo.flylogs.com; pricing is at https://flylogs.com/pricing.',
          ].join('\n'),
          customSets: [
            { label: 'User manual', description: 'How to set up and use Flylogs', paths: ['!api/**'] },
            { label: 'API reference', description: 'Flylogs REST API for developers', paths: ['api/**'] },
          ],
          promote: ['index*', 'first-steps/**'],
          demote: ['whats-new/**'],
        }),
      ],
      head: [
        { tag: 'link', attrs: { rel: 'alternate', type: 'application/rss+xml', title: "Flylogs — What's new", href: '/whats-new/rss.xml' } },
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
