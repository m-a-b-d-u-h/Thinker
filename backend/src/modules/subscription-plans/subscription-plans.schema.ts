import { z } from "zod";

export const createPlanSchema = z.object({
  planType: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().min(0),
  features: z.array(z.string()).optional().default([]),
  sortOrder: z.number().int().optional().default(0),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
