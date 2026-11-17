// RSS feed of What's new posts: https://docs.flylogs.com/whats-new/rss.xml
// Publication date = first commit of the post's source file (set by scripts/prepare.mjs).
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = (await getCollection('docs', ({ id }) => id.startsWith('whats-new/')))
    .filter((p) => p.data.published)
    .sort((a, b) => b.data.published!.getTime() - a.data.published!.getTime());

  return rss({
    title: "Flylogs — What's new",
    description: 'New features and changes in Flylogs, with links to the documentation.',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.published,
      link: `/${p.id}/`,
    })),
    customData: '<language>en</language>',
  });
}
