import { Response, NextFunction } from "express";
import { ProgressService } from "./progress.service";
import type { AuthRequest } from "../../types";
import type { UpdateProgressInput, AddCompletedNodeInput } from "./progress.schema";

export namespace ProgressController {
  export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const progress = await ProgressService.getAll(req.user!.userId);
      res.json(progress);
    } catch (err) {
      next(err);
    }
  }

  export async function getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const progress = await ProgressService.getBySlug(req.user!.userId, slug);
      res.json(progress);
    } catch (err) {
      next(err);
    }
  }

  export async function upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const body = req.body as UpdateProgressInput;
      const progress = await ProgressService.upsert(req.user!.userId, slug, body);
      res.json(progress);
    } catch (err) {
      next(err);
    }
  }

  export async function getContinueLearning(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProgressService.getContinueLearning(req.user!.userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await ProgressService.getStats(req.user!.userId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  export async function addCompletedNode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const body = req.body as AddCompletedNodeInput;
      const result = await ProgressService.addCompletedNode(req.user!.userId, slug, body.nodeId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  export async function getCompletedNodes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const nodes = await ProgressService.getCompletedNodes(req.user!.userId, slug);
      res.json(nodes);
    } catch (err) {
      next(err);
    }
  }
}
