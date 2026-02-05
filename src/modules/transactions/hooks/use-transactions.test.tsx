import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTransactions, useCreateTransaction } from './use-transactions'
import { api } from '@/lib/api'
import { createTestQueryClient } from '@/test/utils'
import { QueryClientProvider } from '@tanstack/react-query'
import { mockTransaction, mockTransactionsResponse } from '@/test/mocks'
import React from 'react'

vi.mock('@/lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}))

describe('transaction hooks', () => {
    let queryClient: any

    beforeEach(() => {
        queryClient = createTestQueryClient()
        vi.clearAllMocks()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
  )

describe('useTransactions', () => {
    it('should fetch transactions with filters', async () => {
        vi.mocked(api.get).mockResolvedValueOnce(mockTransactionsResponse)

        const filters = { page: 1, limit: 10 }
        const { result } = renderHook(() => useTransactions(filters), { wrapper })

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.data).toEqual(mockTransactionsResponse)
        expect(api.get).toHaveBeenCalledWith('/transactions', filters)
    })
})

describe('useCreateTransaction', () => {
    it('should create transaction and invalidate queries', async () => {
        const newTransaction = { ...mockTransaction, id: 'new-id' }
        vi.mocked(api.post).mockResolvedValueOnce(newTransaction)
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(() => useCreateTransaction(), { wrapper })

        const input = {
            categoryId: 'cat-1',
            amount: 100,
            description: 'test',
            transactionDate: '2026-02-05'
        }

        let data
        await React.act(async () => {
            data = await result.current.mutateAsync(input)
        })

        expect(data).toEqual(newTransaction)
        expect(api.post).toHaveBeenCalledWith('/transactions', input)
        expect(invalidateSpy).toHaveBeenCalled()
    })

    it('should handle creation error', async () => {
        const error = new Error('Creation failed')
        vi.mocked(api.post).mockRejectedValueOnce(error)

        const { result } = renderHook(() => useCreateTransaction(), { wrapper })

        await React.act(async () => {
            try {
                await result.current.mutateAsync({} as any)
            } catch (e) {
                // Expected
            }
        })

        expect(result.current.error).toBe(error)
    })
})
})
