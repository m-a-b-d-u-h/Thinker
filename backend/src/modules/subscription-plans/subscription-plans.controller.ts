import { Request, Response, NextFunction } from "express";
import { SubscriptionPlansService } from "./subscription-plans.service";
import type { AuthRequest } from "../../types";
import type { CreatePlanInput, UpdatePlanInput } from "./subscription-plans.schema";

export namespace SubscriptionPlansController {
  export async function list(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await SubscriptionPlansService.list();
      res.json(plans);
    } catch (err) {
      next(err);
    }
  }

  export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const plan = await SubscriptionPlansService.getById(id);
      res.json(plan);
    } catch (err) {
      next(err);
    }
  }

  export async function create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body as CreatePlanInput;
      const plan = await SubscriptionPlansService.create(body);
      res.status(201).json(plan);
    } catch (err) {
      next(err);
    }
  }

  export async function update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const body = req.body as UpdatePlanInput;
      const plan = await SubscriptionPlansService.update(id, body);
      res.json(plan);
    } catch (err) {
      next(err);
    }
  }

  export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await SubscriptionPlansService.remove(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
