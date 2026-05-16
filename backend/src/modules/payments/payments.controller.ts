import { Request, Response, NextFunction } from "express";
import { PaymentsService } from "./payments.service";
import type { AuthRequest } from "../../types";
import type { CreateCheckoutInput } from "./payments.schema";

export namespace PaymentsController {
  export async function createCheckoutSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body as CreateCheckoutInput;
      const result = await PaymentsService.createCheckoutSession(req.user!.userId, body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  export async function handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers["stripe-signature"] as string;
      if (!sig) {
        res.status(400).json({ error: "Missing stripe-signature header" });
        return;
      }
      const rawBody = (req as any).rawBody;
      const result = await PaymentsService.handleWebhook(rawBody, sig);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  export async function getSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await PaymentsService.getSubscription(req.user!.userId);
      res.json(subscription);
    } catch (err) {
      next(err);
    }
  }

  export async function getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await PaymentsService.getHistory(req.user!.userId);
      res.json(history);
    } catch (err) {
      next(err);
    }
  }
}
