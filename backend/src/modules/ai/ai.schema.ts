import { z } from "zod";

export const generateSchema = z.object({
  mode: z.enum(["content", "questions", "graph"]),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
});

export const autoGenerateSchema = z.object({
  category: z.string().optional(),
});

export const scheduleSchema = z.object({
  expression: z.string().min(1),
  category: z.string().optional(),
});

export type GenerateInput = z.infer<typeof generateSchema>;
export type AutoGenerateInput = z.infer<typeof autoGenerateSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
