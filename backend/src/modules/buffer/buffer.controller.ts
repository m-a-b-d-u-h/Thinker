import { Response, NextFunction } from "express";
import { BufferService } from "./buffer.service";
import type { AuthRequest } from "../../types";

export namespace BufferController {
  export async function getOrganizations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orgs = await BufferService.getOrganizations();
      res.json(orgs);
    } catch (err) {
      next(err);
    }
  }

  export async function getChannels(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.query as { organizationId: string };
      if (!organizationId) {
        res.status(400).json({ error: { message: "organizationId is required" } });
        return;
      }
      const channels = await BufferService.getChannels(organizationId);
      res.json(channels);
    } catch (err) {
      next(err);
    }
  }

  export async function getPosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId, first, after } = req.query as {
        organizationId: string;
        first?: string;
        after?: string;
      };
      if (!organizationId) {
        res.status(400).json({ error: { message: "organizationId is required" } });
        return;
      }
      const posts = await BufferService.getPosts(organizationId, Number(first) || 20, after);
      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  export async function createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { channelId, text, scheduledAt, mediaUrls } = req.body;
      if (!channelId || !text) {
        res.status(400).json({ error: { message: "channelId and text are required" } });
        return;
      }
      const result = await BufferService.createPost({ channelId, text, scheduledAt, mediaUrls });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  export async function broadcast(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId, text, scheduledAt, mediaUrls } = req.body;
      if (!organizationId || !text) {
        res.status(400).json({ error: { message: "organizationId and text are required" } });
        return;
      }
      const results = await BufferService.broadcast({ organizationId, text, scheduledAt, mediaUrls });
      res.status(201).json(results);
    } catch (err) {
      next(err);
    }
  }
}
