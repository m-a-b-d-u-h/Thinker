import { Router } from "express";
import { QuizController } from "./quiz.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { submitAnswerSchema } from "./quiz.schema";

const router = Router();

router.use(authenticate);

router.get("/:slug/questions", QuizController.getQuestions);
router.post("/:slug/submit", validate(submitAnswerSchema), QuizController.submit);
router.get("/:slug/attempts", QuizController.getAttempts);

export default router;
