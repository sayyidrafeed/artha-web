import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, ArrowLeft, Search, Filter } from "lucide-react"
import {
  Button,
  Input,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "../hooks/use-transactions"
import { useCategories } from "../hooks/use-categories"
import { TransactionList } from "../components/transaction-list"
import { TransactionForm } from "../components/transaction-form"
import { LogoutButton } from "@/modules/auth"
import { useSession } from "@/modules/auth/hooks/use-auth"
import type { Transaction, CreateTransactionInput } from "@/schemas/transaction"

export function TransactionsPage(): JSX.Element {
  const navigate = useNavigate()
  const { data: session } = useSession()

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  const { data: categories } = useCategories()
  const { data: transactionsData, isLoading } = useTransactions({
    page: 1,
    limit: 50,
  })

  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const filteredTransactions =
    transactionsData?.data.filter(
      (transaction) =>
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.categoryName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    ) ?? []

  const handleCreate = async (data: CreateTransactionInput): Promise<void> => {
    try {
      await createMutation.mutateAsync(data)
      setIsModalOpen(false)
    } catch (err) {
      console.error("Failed to create transaction:", err)
    }
  }

  const handleEdit = (transaction: Transaction): void => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleUpdate = async (data: CreateTransactionInput): Promise<void> => {
    if (editingTransaction) {
      try {
        await updateMutation.mutateAsync({ id: editingTransaction.id, data })
        setIsModalOpen(false)
        setEditingTransaction(null)
      } catch (err) {
        console.error("Failed to update transaction:", err)
      }
    }
  }

  const handleDelete = (id: string): void => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id)
    }
  }

  const goToDashboard = (): void => {
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goToDashboard}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Transactions</h1>
                <p className="text-xs text-muted-foreground">
                  Manage your transactions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session && (
                <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                  <span>{session.user.name}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{session.user.email}</span>
                </div>
              )}
              <LogoutButton variant="ghost" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">All Transactions</h2>
            <p className="text-muted-foreground">
              View and manage your financial transactions
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Transaction List */}
        <TransactionList
          transactions={filteredTransactions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {transactionsData?.meta && transactionsData.meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {transactionsData.meta.page} of{" "}
              {transactionsData.meta.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        )}
      </main>

      {/* Add/Edit Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={editingTransaction ? handleUpdate : handleCreate}
            categories={categories}
            defaultValues={
              editingTransaction
                ? {
                  categoryId: editingTransaction.categoryId,
                  amount: editingTransaction.amountCents / 100,
                  description: editingTransaction.description,
                  transactionDate: editingTransaction.transactionDate,
                }
                : undefined
            }
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            submitLabel={
              editingTransaction ? "Update Transaction" : "Create Transaction"
            }
            error={createMutation.error || updateMutation.error}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
