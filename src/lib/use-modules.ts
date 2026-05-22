import { useEffect, useRef, useState, useCallback } from "react";
import { modulesApi } from "@/lib/api/modules";
import { progressApi, type ContinueLearningItem } from "@/lib/api/progress";
import type { ModuleListItem, CategoryWithCount } from "@/lib/types";

interface HistoryModule extends ModuleListItem {
  progress: {
    listeningProgress: number;
    readingProgress: number;
    completed: boolean;
    lastReadAt: number;
  };
}

interface ModulesState {
  modules: ModuleListItem[];
  categories: string[];
  historyModules: HistoryModule[];
  totalPages: number;
  total: number;
  loading: boolean;
  error: string | null;
}

export function useModules(page: number, category: string | null, search: string, categories?: string[] | null) {
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, ModuleListItem[]>>(new Map());

  const [state, setState] = useState<ModulesState>({
    modules: [],
    categories: [],
    historyModules: [],
    totalPages: 1,
    total: 0,
    loading: true,
    error: null,
  });

  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    modulesApi.getCategories()
      .then((cats) => { if (!cancelled) setCategoriesList(cats.map(c => c.name)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const fetchModules = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const cacheKey = `page=${page}&cat=${category}&search=${search}&cats=${categories?.join(",") || ""}`;
    const cached = cacheRef.current.get(cacheKey);

    if (cached) {
      setState((prev) => ({ ...prev, modules: cached, loading: false }));
      return;
    }

    try {
      const params: Record<string, string> = { page: String(page), limit: "6" };
      if (category) params.category = category;
      else if (categories && categories.length > 0) params.categories = categories.join(",");
      if (search) params.search = search;

      const res = await modulesApi.list(params);

      if (!controller.signal.aborted) {
        cacheRef.current.set(cacheKey, res.data);
        setState((prev) => ({
          ...prev,
          modules: res.data,
          totalPages: res.pagination.totalPages,
          total: res.pagination.total,
          loading: false,
        }));
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setState((prev) => ({
          ...prev,
          modules: [],
          loading: false,
          error: err instanceof Error ? err.message : "Failed to fetch",
        }));
      }
    }
  }, [page, category, search, categories]);

  useEffect(() => {
    fetchModules();
    return () => { abortRef.current?.abort(); };
  }, [fetchModules]);

  const fetchHistory = useCallback(async () => {
    try {
      const saved: ContinueLearningItem[] = await progressApi.getContinueLearning();
      if (saved.length === 0) return;

      const recent = saved.slice(0, 3);
      const historyModules: HistoryModule[] = recent.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        category: p.category,
        content: p.content || "",
        isPremium: p.isPremium,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        nodes: [],
        edges: [],
        progress: {
          listeningProgress: p.listeningProgress,
          readingProgress: p.readingProgress,
          completed: p.completed,
          lastReadAt: p.lastReadAt,
        },
      }));

      setState((prev) => ({ ...prev, historyModules }));
    } catch {
      // ignore
    }
  }, []);

  return { ...state, categories: categoriesList, fetchHistory };
}
