"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, Search, Filter } from "lucide-react";
import {
  Button,
  Input,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/modules/transactions/hooks/useTransactions";
import { useCategories } from "@/modules/transactions/hooks/use-categories";
import { TransactionList } from "@/modules/transactions/components/transaction-list";
import { TransactionForm } from "@/modules/transactions/components/transaction-form";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { useSession } from "@/modules/auth/hooks/useAuth";
import type { Transaction, CreateTransactionInput } from "@/schemas/transaction";

export default function TransactionsPage(): JSX.Element {
  const router = useRouter();
  const { data: session } = useSession();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deletingIdForConfirm, setDeletingIdForConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: categories, error: categoriesError } = useCategories();
  const {
    data: transactionsData,
    isLoading,
    error: transactionsError,
  } = useTransactions({
    page: currentPage,
    limit: 50,
  });

  const hasError = transactionsError || categoriesError;

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const filteredTransactions = useMemo(
    () =>
      transactionsData?.data.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ?? [],
    [transactionsData, searchTerm],
  );

  const editingDefaultValues = useMemo(
    () =>
      editingTransaction
        ? {
            categoryId: editingTransaction.categoryId,
            amount: editingTransaction.amountCents / 100,
            description: editingTransaction.description,
            transactionDate: editingTransaction.transactionDate,
          }
        : undefined,
    [editingTransaction],
  );

  const handleCreate = useCallback(
    async (data: CreateTransactionInput): Promise<void> => {
      await createMutation.mutateAsync(data);
      setIsModalOpen(false);
    },
    [createMutation],
  );

  const handleEdit = useCallback((transaction: Transaction): void => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }, []);

  const handleUpdate = useCallback(
    async (data: CreateTransactionInput): Promise<void> => {
      if (editingTransaction) {
        await updateMutation.mutateAsync({ id: editingTransaction.id, data });
        setIsModalOpen(false);
        setEditingTransaction(null);
      }
    },
    [editingTransaction, updateMutation],
  );

  const handleDelete = useCallback((id: string): void => {
    setDeletingIdForConfirm(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback((): void => {
    if (deletingIdForConfirm) {
      deleteMutation.mutate(deletingIdForConfirm);
      setShowDeleteConfirm(false);
      setDeletingIdForConfirm(null);
    }
  }, [deletingIdForConfirm, deleteMutation]);

  const handleCancelDelete = useCallback((): void => {
    setShowDeleteConfirm(false);
    setDeletingIdForConfirm(null);
  }, []);

  const handlePrevious = useCallback((): void => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNext = useCallback((): void => {
    if (transactionsData?.meta) {
      setCurrentPage((prev) => Math.min(transactionsData.meta.totalPages, prev + 1));
    }
  }, [transactionsData?.meta]);

  const goToDashboard = useCallback((): void => {
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goToDashboard}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Transactions</h1>
                <p className="text-xs text-muted-foreground">Manage your transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">All Transactions</h2>
            <p className="text-muted-foreground">View and manage your financial transactions</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

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

        {(hasError || deleteMutation.error) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {deleteMutation.error?.message || "Failed to load transactions. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        <TransactionList
          transactions={filteredTransactions}
          isLoading={isLoading}
          deletingId={deleteMutation.variables}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {transactionsData?.meta && transactionsData.meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={transactionsData.meta.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {transactionsData.meta.page} of {transactionsData.meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={transactionsData.meta.page >= transactionsData.meta.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </main>

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
            defaultValues={editingDefaultValues}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            submitLabel={editingTransaction ? "Update Transaction" : "Create Transaction"}
            error={createMutation.error || updateMutation.error}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent onClose={handleCancelDelete}>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
