import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Who the page is for, shown as badges under the title (components/PageTitle.astro).
        audience: z
          .array(z.enum(['everyone', 'managers', 'instructors', 'pilots', 'students', 'mechanics', 'auditors', 'developers']))
          .optional(),
        // Lowest Flylogs plan that includes the feature. Omitted = every plan, including Free.
        plan: z.enum(['club', 'premium', 'unlimited', 'api']).optional(),
        // What's new posts: first commit date of the source file, for the RSS feed.
        published: z.coerce.date().optional(),
      }),
    }),
  }),
};
