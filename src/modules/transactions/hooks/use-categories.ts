import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { Category } from "@/schemas/category"

interface CategoriesResponse {
    data: Category[]
}

export function useCategories() {
    const { data, isLoading, error } = useQuery<CategoriesResponse>({
        queryKey: queryKeys.categories.all,
        queryFn: async () => api.get<CategoriesResponse>("/categories"),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    return {
        data: data?.data ?? [],
        isLoading,
        error: error as Error | null,
    }
}
