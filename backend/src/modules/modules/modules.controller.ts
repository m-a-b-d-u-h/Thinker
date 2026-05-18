import { Request, Response, NextFunction } from "express";
import { ModulesService } from "./modules.service";

export namespace ModulesController {
  export async function list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, category, search } = req.query;
      const result = await ModulesService.list({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        category: category as string | undefined,
        search: search as string | undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  export async function getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const mod = await ModulesService.getBySlug(slug);
      res.json(mod);
    } catch (err) {
      next(err);
    }
  }

  export async function getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ModulesService.getCategories();
      res.json(categories);
    } catch (err) {
      next(err);
    }
  }

  export async function getRecommended(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const recommendations = await ModulesService.getRecommended(slug);
      res.json(recommendations);
    } catch (err) {
      next(err);
    }
  }
}
