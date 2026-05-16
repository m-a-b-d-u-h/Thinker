import { z } from "zod";

export const createHighlightSchema = z.object({
  moduleSlug: z.string().min(1),
  text: z.string().min(1).max(1000),
  note: z.string().max(5000).optional(),
});

export const updateHighlightSchema = z.object({
  text: z.string().min(1).max(1000).optional(),
  note: z.string().max(5000).optional(),
});

export type CreateHighlightInput = z.infer<typeof createHighlightSchema>;
export type UpdateHighlightInput = z.infer<typeof updateHighlightSchema>;
