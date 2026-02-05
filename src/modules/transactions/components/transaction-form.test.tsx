import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { TransactionForm } from './transaction-form'
import { renderWithProviders } from '@/test/utils'
import { mockCategories } from '@/test/mocks'
import userEvent from '@testing-library/user-event'

describe('TransactionForm', () => {
    const defaultProps = {
        onSubmit: vi.fn(),
        categories: mockCategories,
        isSubmitting: false,
        submitLabel: 'Create Transaction',
    }

    it('should render all form fields', () => {
        renderWithProviders(<TransactionForm {...defaultProps} />)

        expect(screen.getByLabelText(/Category/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Date/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Create Transaction/i })).toBeInTheDocument()
    })

    it('should show validation errors for empty fields', async () => {
        renderWithProviders(<TransactionForm {...defaultProps} />)

        fireEvent.click(screen.getByRole('button', { name: /Create Transaction/i }))

        expect(await screen.findByText(/Category is required/i)).toBeInTheDocument()
        expect(await screen.findByText(/Amount must be greater than 0/i)).toBeInTheDocument()
        expect(await screen.findByText(/Description is required/i)).toBeInTheDocument()
    })

    it('should call onSubmit with valid data', async () => {
        const user = userEvent.setup()
        renderWithProviders(<TransactionForm {...defaultProps} />)

        await user.selectOptions(screen.getByLabelText(/Category/i), mockCategories[0].id)
        await user.type(screen.getByLabelText(/Amount/i), '100')
        await user.type(screen.getByLabelText(/Description/i), 'Test Transaction')

        // Date is filled by default in the component with new Date().toISOString().split("T")[0]

        await user.click(screen.getByRole('button', { name: /Create Transaction/i }))

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(expect.objectContaining({
                categoryId: mockCategories[0].id,
                amount: 100,
                description: 'Test Transaction',
            }))
        })
    })

    it('should display API error message', () => {
        const error = new Error('API Error: 400')
        renderWithProviders(<TransactionForm {...defaultProps} error={error} />)

        expect(screen.getByText('API Error: 400')).toBeInTheDocument()
    })

    it('should disable submit button when isSubmitting is true', () => {
        renderWithProviders(<TransactionForm {...defaultProps} isSubmitting={true} />)

        const submitBtn = screen.getByRole('button')
        expect(submitBtn).toBeDisabled()
        expect(screen.getByText(/Saving.../i)).toBeInTheDocument()
    })
})
