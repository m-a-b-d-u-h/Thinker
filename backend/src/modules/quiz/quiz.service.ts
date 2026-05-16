import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors";
import type { SubmitAnswerInput } from "./quiz.schema";

export namespace QuizService {
  export async function getQuestions(slug: string) {
    const mod = await prisma.module.findUnique({
      where: { slug },
      include: {
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!mod) throw new NotFoundError("Module");
    return mod.questions;
  }

  export async function submit(userId: string, slug: string, input: SubmitAnswerInput) {
    const mod = await prisma.module.findUnique({
      where: { slug },
      include: { questions: true },
    });

    if (!mod) throw new NotFoundError("Module");
    if (mod.questions.length === 0) {
      throw new NotFoundError("Questions");
    }

    let score = 0;
    const results = input.answers.map((answer) => {
      const question = mod.questions.find((q) => q.id === answer.questionId);
      if (!question) return { questionId: answer.questionId, correct: false };

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) score++;

      return {
        questionId: answer.questionId,
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
      };
    });

    const totalQuestions = mod.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        moduleId: mod.id,
        score,
        totalQuestions,
        percentage,
      },
    });

    return {
      attemptId: attempt.id,
      score,
      totalQuestions,
      percentage,
      results,
    };
  }

  export async function getAttempts(userId: string, slug: string) {
    const mod = await prisma.module.findUnique({ where: { slug } });
    if (!mod) throw new NotFoundError("Module");

    return prisma.quizAttempt.findMany({
      where: { userId, moduleId: mod.id },
      orderBy: { completedAt: "desc" },
      take: 10,
    });
  }
}
