import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		series: z.string().optional(),
		order: z.number().default(0),
		effects: z.boolean().optional(),
		ai: z.string().optional().default(""),
		comment: z.boolean().optional(),
		og_theme: z.enum(["light", "dark"]).optional().default("light"),
		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({
		comment: z.boolean().optional(),
	}),
});
export const collections: Record<string, ReturnType<typeof defineCollection<z.AnyZodObject>>> = {
	posts: postsCollection,
	spec: specCollection,
};
