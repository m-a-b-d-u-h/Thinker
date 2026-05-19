import { api } from "@/lib/api";
import type { ActionPlan, MatrixRow } from "@/lib/types";

export const actionsApi = {
  list: () =>
    api.get<ActionPlan[]>("/actions"),

  getByModule: (moduleId: string) =>
    api.get<ActionPlan | null>(`/actions/module/${moduleId}`),

  getById: (id: string) =>
    api.get<ActionPlan>(`/actions/${id}`),

  create: (body: { moduleSlug: string; title: string; content: MatrixRow[] }) =>
    api.post<ActionPlan>("/actions", body),

  update: (id: string, body: { title?: string; content?: MatrixRow[]; completed?: boolean }) =>
    api.patch<ActionPlan>(`/actions/${id}`, body),

  remove: (id: string) =>
    api.delete<{ deleted: boolean }>(`/actions/${id}`),
};
