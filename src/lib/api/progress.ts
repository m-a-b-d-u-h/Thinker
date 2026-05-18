import { api } from "@/lib/api";
import type { UserProgress, ProgressStats } from "@/lib/types";

export const progressApi = {
  getAll: () =>
    api.get<UserProgress[]>("/progress"),

  getBySlug: (slug: string) =>
    api.get<UserProgress | null>(`/progress/${slug}`),

  upsert: (slug: string, body: Partial<{
    listeningProgress: number;
    readingProgress: number;
    scrollPosition: number;
    currentCharIndex: number;
    audioRate: number;
    completed: boolean;
  }>) =>
    api.put<UserProgress>(`/progress/${slug}`, body),

  getContinueLearning: () =>
    api.get<UserProgress[]>("/progress/continue-learning"),

  getStats: () =>
    api.get<ProgressStats>("/progress/stats"),

  addCompletedNode: (slug: string, nodeId: string) =>
    api.post<{ id: string }>(`/progress/${slug}/completed-nodes`, { nodeId }),

  getCompletedNodes: (slug: string) =>
    api.get<string[]>([`/progress/${slug}/completed-nodes`].join("")),
};
