import { api } from "@/lib/api";
import type { Module, ModuleListItem, PaginatedResponse } from "@/lib/types";

export const modulesApi = {
  list: (params?: { page?: string; limit?: string; category?: string; search?: string }) =>
    api.get<PaginatedResponse<ModuleListItem>>("/modules", params as Record<string, string>),

  getBySlug: (slug: string) =>
    api.get<Module>(`/modules/${slug}`),

  getCategories: () =>
    api.get<string[]>("/modules/categories"),

  getRecommended: (slug: string) =>
    api.get<Module[]>(`/modules/${slug}/recommended`),
};
