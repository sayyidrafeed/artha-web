import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCategories } from './use-categories'
import { api } from '@/lib/api'
import { createTestQueryClient } from '@/test/utils'
import { QueryClientProvider } from '@tanstack/react-query'
import { mockCategories } from '@/test/mocks'
import React from 'react'

vi.mock('@/lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}))

describe('useCategories', () => {
    let queryClient: any

    beforeEach(() => {
        queryClient = createTestQueryClient()
        vi.clearAllMocks()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
  )

it('should fetch and return categories', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockCategories })

    const { result } = renderHook(() => useCategories(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toEqual(mockCategories)
    expect(api.get).toHaveBeenCalledWith('/categories')
})

it('should return empty array and error on failure', async () => {
    const error = new Error('Fetch failed')
    vi.mocked(api.get).mockRejectedValueOnce(error)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(error)
})
})
