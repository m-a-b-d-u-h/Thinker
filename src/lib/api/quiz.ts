import { api } from "@/lib/axios";
import type { QuizQuestion, QuizSubmitResponse, QuizAttempt } from "@/lib/types";

export const quizApi = {
  getQuestions: (slug: string) =>
    api.get<QuizQuestion[]>(`/quiz/${slug}/questions`).then(r => r.data),

  submit: (slug: string, body: { answers: number[] }) =>
    api.post<QuizSubmitResponse>(`/quiz/${slug}/submit`, body).then(r => r.data),

  getAttempts: (slug: string) =>
    api.get<QuizAttempt[]>(`/quiz/${slug}/attempts`).then(r => r.data),
};
