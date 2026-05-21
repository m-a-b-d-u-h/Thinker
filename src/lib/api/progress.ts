import { api } from "@/lib/api";
import type { UserProgress, ProgressStats } from "@/lib/types";

export interface ContinueLearningItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  content?: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  listeningProgress: number;
  readingProgress: number;
  completed: boolean;
  lastReadAt: number;
}

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
    api.get<ContinueLearningItem[]>("/progress/continue-learning"),

  getStats: () =>
    api.get<ProgressStats>("/progress/stats"),

  addCompletedNode: (slug: string, nodeId: string) =>
    api.post<{ id: string }>(`/progress/${slug}/completed-nodes`, { nodeId }),

  getCompletedNodes: (slug: string) =>
    api.get<string[]>([`/progress/${slug}/completed-nodes`].join("")),

  getStreak: () =>
    api.get<{ streak: number; showPopup: boolean }>("/progress/streak"),

  resetStreak: () =>
    api.post<{ streak: number }>("/progress/streak/reset"),
};
