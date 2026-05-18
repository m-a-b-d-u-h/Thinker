import { api } from "@/lib/api";
import type { FavoriteItem } from "@/lib/types";

export const favoritesApi = {
  list: () =>
    api.get<FavoriteItem[]>("/favorites"),

  add: (slug: string) =>
    api.post<{ id: string }>(`/favorites/${slug}`),

  remove: (slug: string) =>
    api.delete<{ deleted: boolean }>(`/favorites/${slug}`),

  check: (slug: string) =>
    api.get<{ isFavorited: boolean }>(`/favorites/${slug}/check`),
};
