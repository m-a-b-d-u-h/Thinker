import { api } from "@/lib/axios";
import type { Highlight } from "@/lib/types";

export const highlightsApi = {
  list: (moduleSlug?: string) =>
    api.get<Highlight[]>("/highlights", { params: moduleSlug ? { moduleSlug } : undefined }).then(r => r.data),

  getById: (id: string) =>
    api.get<Highlight>(`/highlights/${id}`).then(r => r.data),

  create: (body: { text: string; note: string; moduleSlug: string }) =>
    api.post<Highlight>("/highlights", body).then(r => r.data),

  update: (id: string, body: { text?: string; note?: string }) =>
    api.put<Highlight>(`/highlights/${id}`, body).then(r => r.data),

  remove: (id: string) =>
    api.delete<{ deleted: boolean }>(`/highlights/${id}`).then(r => r.data),
};
