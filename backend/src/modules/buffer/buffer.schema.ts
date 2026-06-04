import { z } from "zod";

export const createPostSchema = z.object({
  channelId: z.string().min(1, "channelId is required"),
  text: z.string().min(1, "text is required"),
  scheduledAt: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

export const broadcastSchema = z.object({
  organizationId: z.string().min(1, "organizationId is required"),
  text: z.string().min(1, "text is required"),
  scheduledAt: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type BroadcastInput = z.infer<typeof broadcastSchema>;
