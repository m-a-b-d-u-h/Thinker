import { api } from "@/lib/api";
import type { QuizQuestion, QuizSubmitResponse, QuizAttempt } from "@/lib/types";

export const quizApi = {
  getQuestions: (slug: string) =>
    api.get<QuizQuestion[]>(`/quiz/${slug}/questions`),

  submit: (slug: string, body: { answers: number[] }) =>
    api.post<QuizSubmitResponse>(`/quiz/${slug}/submit`, body),

  getAttempts: (slug: string) =>
    api.get<QuizAttempt[]>(`/quiz/${slug}/attempts`),
};
