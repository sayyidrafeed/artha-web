import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { Category } from "@/schemas/category";

interface UseCategoriesResult {
  data: Category[];
  isLoading: boolean;
  error: Error | null;
}

export function useCategories(): UseCategoriesResult {
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: queryKeys.categories.all,
    queryFn: async () => api.get<Category[]>("/categories"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
