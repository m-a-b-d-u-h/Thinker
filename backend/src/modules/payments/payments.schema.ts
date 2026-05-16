import { z } from "zod";

export const createCheckoutSchema = z.object({
  planType: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
