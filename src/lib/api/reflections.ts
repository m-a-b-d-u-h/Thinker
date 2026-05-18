import { api } from "@/lib/api";
import type { Reflection } from "@/lib/types";

export const reflectionsApi = {
  list: () =>
    api.get<Reflection[]>("/reflections"),

  getById: (id: string) =>
    api.get<Reflection>(`/reflections/${id}`),

  create: (body: { title: string; content: string; moduleId: string }) =>
    api.post<Reflection>("/reflections", body),

  update: (id: string, body: { title?: string; content?: string }) =>
    api.put<Reflection>(`/reflections/${id}`, body),

  remove: (id: string) =>
    api.delete<{ deleted: boolean }>(`/reflections/${id}`),
};
