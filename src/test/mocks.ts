import type { Category } from '@/schemas/category'
import type { Transaction } from '@/schemas/transaction'

export const mockCategories: Category[] = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Salary',
        type: 'income',
        createdAt: '2026-02-05T00:00:00.000Z',
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Food & Dining',
        type: 'expense',
        createdAt: '2026-02-05T00:00:00.000Z',
    },
]

export const mockTransaction: Transaction = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
    categoryName: 'Salary',
    categoryType: 'income',
    amountCents: 100000,
    description: 'Monthly salary',
    transactionDate: '2026-02-01',
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
}

export const mockTransactionsResponse = {
    success: true,
    data: [mockTransaction],
    meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
    }
}
