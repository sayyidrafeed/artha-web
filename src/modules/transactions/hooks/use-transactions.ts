import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type {
  Transaction,
  TransactionFilter,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/schemas/transaction"

interface TransactionsResponse {
  data: Transaction[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseTransactionsResult {
  data?: TransactionsResponse
  isLoading: boolean
  error: Error | null
}

export function useTransactions(
  filters: TransactionFilter,
): UseTransactionsResult {
  const { data, isLoading, error } = useQuery<TransactionsResponse>({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async () =>
      api.get<TransactionsResponse>("/transactions", filters),
    staleTime: 30 * 1000,
  })

  return {
    data,
    isLoading,
    error: error ?? null,
  }
}

interface UseCreateTransactionResult {
  mutate: (data: CreateTransactionInput) => void
  isPending: boolean
  error: Error | null
}

export function useCreateTransaction(): UseCreateTransactionResult {
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: CreateTransactionInput) =>
      api.post<Transaction>("/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })

  return {
    mutate,
    isPending,
    error: error ?? null,
  }
}

interface UseUpdateTransactionResult {
  mutate: (id: string, data: UpdateTransactionInput) => void
  isPending: boolean
  error: Error | null
}

export function useUpdateTransaction(): UseUpdateTransactionResult {
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateTransactionInput
    }) => api.put<Transaction>(`/transactions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })

  return {
    mutate: (id: string, data: UpdateTransactionInput) => mutate({ id, data }),
    isPending,
    error: error ?? null,
  }
}

interface UseDeleteTransactionResult {
  mutate: (id: string) => void
  isPending: boolean
  error: Error | null
}

export function useDeleteTransaction(): UseDeleteTransactionResult {
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (id: string) => api.delete<void>(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })

  return {
    mutate,
    isPending,
    error: error ?? null,
  }
}
