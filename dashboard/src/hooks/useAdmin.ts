import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [usersRes, modulesRes, paymentsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/modules?limit=100&admin=true"),
        api.get("/payments/history"),
      ]);
      return {
        users: usersRes.data,
        modules: modulesRes.data,
        payments: paymentsRes.data,
      };
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
  });
}

export function useModules() {
  return useQuery({
    queryKey: ["admin", "modules"],
    queryFn: async () => {
      const { data } = await api.get("/modules?limit=100&admin=true");
      return data.data || [];
    },
  });
}

export function useModule(slug: string) {
  return useQuery({
    queryKey: ["admin", "module", slug],
    queryFn: async () => {
      const { data } = await api.get(`/modules/${slug}?admin=true`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useTogglePremium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, isPremium }: { slug: string; isPremium: boolean }) => {
      const { data } = await api.patch(`/modules/${slug}`, { isPremium });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "modules"] }),
  });
}

export function useDeleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      await api.delete(`/modules/${slug}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "modules"] }),
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const { data } = await api.get("/payments/history");
      return data.data || [];
    },
  });
}

export function useQuizStats() {
  return useQuery({
    queryKey: ["admin", "quiz"],
    queryFn: async () => {
      const { data } = await api.get("/modules?limit=100&admin=true");
      return data.data || [];
    },
  });
}
