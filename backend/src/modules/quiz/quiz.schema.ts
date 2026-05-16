import { z } from "zod";

export const submitAnswerSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedAnswer: z.number().int().min(0),
    })
  ),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
