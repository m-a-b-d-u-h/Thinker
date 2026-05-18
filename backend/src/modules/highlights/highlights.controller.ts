import { Response, NextFunction } from "express";
import { HighlightsService } from "./highlights.service";
import type { AuthRequest } from "../../types";
import type { CreateHighlightInput, UpdateHighlightInput } from "./highlights.schema";

export namespace HighlightsController {
  export async function list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const moduleSlug = req.query.moduleSlug as string | undefined;
      const highlights = await HighlightsService.list(req.user!.userId, moduleSlug);
      res.json(highlights);
    } catch (err) {
      next(err);
    }
  }

  export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const highlight = await HighlightsService.getById(req.user!.userId, id);
      res.json(highlight);
    } catch (err) {
      next(err);
    }
  }

  export async function create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body as CreateHighlightInput;
      const highlight = await HighlightsService.create(req.user!.userId, body);
      res.status(201).json(highlight);
    } catch (err) {
      next(err);
    }
  }

  export async function update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const body = req.body as UpdateHighlightInput;
      const highlight = await HighlightsService.update(req.user!.userId, id, body);
      res.json(highlight);
    } catch (err) {
      next(err);
    }
  }

  export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await HighlightsService.remove(req.user!.userId, id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
