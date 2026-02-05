import { useForm } from "react-hook-form"
import { Button, Input, Label, Select, SelectOption } from "@/components/ui"
import type { CreateTransactionInput } from "@/schemas/transaction"
import type { Category } from "@/schemas/category"

export interface TransactionFormProps {
  onSubmit: (data: CreateTransactionInput) => void
  categories: Category[]
  defaultValues?: Partial<CreateTransactionInput>
  isSubmitting?: boolean
  submitLabel?: string
  error?: Error | null
}

export function TransactionForm({
  onSubmit,
  categories,
  defaultValues,
  isSubmitting = false,
  submitLabel = "Save Transaction",
  error = null,
}: TransactionFormProps): JSX.Element {
  const form = useForm<CreateTransactionInput>({
    defaultValues: {
      categoryId: "",
      amount: 0,
      description: "",
      transactionDate: new Date().toISOString().split("T")[0],
      ...defaultValues,
    },
  })

  const handleSubmit = (data: CreateTransactionInput): void => {
    onSubmit(data)
  }

  const handleSubmitForm = form.handleSubmit(handleSubmit)

  return (
    <form onSubmit={handleSubmitForm} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select
          id="categoryId"
          {...form.register("categoryId", { required: "Category is required" })}
          disabled={isSubmitting}
        >
          <SelectOption value="">Select a category</SelectOption>
          {categories.map((category) => (
            <SelectOption key={category.id} value={category.id}>
              {category.name} ({category.type})
            </SelectOption>
          ))}
        </Select>
        {form.formState.errors.categoryId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.categoryId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...form.register("amount", {
            required: "Amount is required",
            valueAsNumber: true,
            min: { value: 0.01, message: "Amount must be greater than 0" },
          })}
          disabled={isSubmitting}
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Enter transaction description"
          {...form.register("description", {
            required: "Description is required",
            minLength: { value: 1, message: "Description is required" },
            maxLength: {
              value: 500,
              message: "Description must be less than 500 characters",
            },
          })}
          disabled={isSubmitting}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionDate">Date</Label>
        <Input
          id="transactionDate"
          type="date"
          {...form.register("transactionDate", {
            required: "Date is required",
            pattern: {
              value: /^\d{4}-\d{2}-\d{2}$/,
              message: "Date must be in YYYY-MM-DD format",
            },
          })}
          disabled={isSubmitting}
        />
        {form.formState.errors.transactionDate && (
          <p className="text-sm text-destructive">
            {form.formState.errors.transactionDate.message}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error.message}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  )
}
