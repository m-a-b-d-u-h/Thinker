import { api } from "@/lib/api";
import type { Highlight } from "@/lib/types";

export const highlightsApi = {
  list: (moduleSlug?: string) => {
    const params = moduleSlug ? { moduleSlug } : undefined;
    return api.get<Highlight[]>("/highlights", params as Record<string, string>);
  },

  getById: (id: string) =>
    api.get<Highlight>(`/highlights/${id}`),

  create: (body: { text: string; note: string; moduleSlug: string }) =>
    api.post<Highlight>("/highlights", body),

  update: (id: string, body: { text?: string; note?: string }) =>
    api.put<Highlight>(`/highlights/${id}`, body),

  remove: (id: string) =>
    api.delete<{ deleted: boolean }>(`/highlights/${id}`),
};
