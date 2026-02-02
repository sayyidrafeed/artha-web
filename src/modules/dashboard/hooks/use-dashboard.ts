import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { MonthlySummary, DashboardByCategory } from "@/schemas/dashboard"

interface UseDashboardSummaryResult {
  data?: MonthlySummary
  isLoading: boolean
  error: Error | null
}

export function useDashboardSummary(
  year: number,
  month?: number,
): UseDashboardSummaryResult {
  const { data, isLoading, error } = useQuery<MonthlySummary>({
    queryKey: queryKeys.dashboard.summary(year, month),
    queryFn: async () => {
      const params: Record<string, string | number> = { year }
      if (month !== undefined) {
        params.month = month
      }
      return api.get<MonthlySummary>("/dashboard/summary", { params })
    },
    staleTime: 60 * 1000,
  })

  return {
    data,
    isLoading,
    error: error ?? null,
  }
}

interface UseDashboardByCategoryResult {
  data?: DashboardByCategory
  isLoading: boolean
  error: Error | null
}

export function useDashboardByCategory(
  year: number,
  month?: number,
): UseDashboardByCategoryResult {
  const { data, isLoading, error } = useQuery<DashboardByCategory>({
    queryKey: queryKeys.dashboard.byCategory(year, month),
    queryFn: async () => {
      const params: Record<string, string | number> = { year }
      if (month !== undefined) {
        params.month = month
      }
      return api.get<DashboardByCategory>("/dashboard/by-category", { params })
    },
    staleTime: 60 * 1000,
  })

  return {
    data,
    isLoading,
    error: error ?? null,
  }
}
