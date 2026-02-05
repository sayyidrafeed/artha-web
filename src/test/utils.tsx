import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: Infinity,
            },
            mutations: {
                retry: false,
            },
        },
    })
}

export function renderWithProviders(
    ui: ReactElement,
    options?: {
        queryClient?: QueryClient
    }
) {
    const queryClient = options?.queryClient || createTestQueryClient()

    return {
        ...render(
            <QueryClientProvider client={queryClient}>
                {ui}
            </QueryClientProvider>
        ),
        queryClient,
    }
}
