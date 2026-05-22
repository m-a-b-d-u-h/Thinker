import { api } from "@/lib/api";
import type { Module, ModuleListItem, PaginatedResponse, CategoryWithCount } from "@/lib/types";

export const modulesApi = {
  list: (params?: { page?: string; limit?: string; category?: string; categories?: string; search?: string }) =>
    api.get<PaginatedResponse<ModuleListItem>>("/modules", params as Record<string, string>),

  getBySlug: (slug: string) =>
    api.get<Module>(`/modules/${slug}`),

  getDailyFree: () =>
    api.get<Module>("/modules/daily-free"),

  checkAccess: (slug: string) =>
    api.get<{ accessible: boolean; isDailyFree: boolean }>(`/modules/${slug}/access`),

  getCategories: () =>
    api.get<CategoryWithCount[]>("/modules/categories"),

  getRecommended: (slug: string) =>
    api.get<Module[]>(`/modules/${slug}/recommended`),
};