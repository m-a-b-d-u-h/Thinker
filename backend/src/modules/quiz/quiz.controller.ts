import { Response, NextFunction } from "express";
import { QuizService } from "./quiz.service";
import type { AuthRequest } from "../../types";
import type { SubmitAnswerInput } from "./quiz.schema";

export namespace QuizController {
  export async function getQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const questions = await QuizService.getQuestions(slug);
      res.json(questions);
    } catch (err) {
      next(err);
    }
  }

  export async function submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const body = req.body as SubmitAnswerInput;
      const result = await QuizService.submit(req.user!.userId, slug, body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  export async function getAttempts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const attempts = await QuizService.getAttempts(req.user!.userId, slug);
      res.json(attempts);
    } catch (err) {
      next(err);
    }
  }
}
