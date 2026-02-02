import { ArrowUp, ArrowDown, Trash2, Edit } from "lucide-react"
import { Card, CardContent, Badge, Button } from "@/components/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/currency"
import type { Transaction } from "@/schemas/transaction"

export interface TransactionListProps {
  transactions?: Transaction[]
  isLoading?: boolean
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

export function TransactionList({
  transactions,
  isLoading,
  onEdit,
  onDelete,
}: TransactionListProps): JSX.Element {
  if (isLoading) {
    return <TransactionListSkeleton />
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No transactions found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export interface TransactionCardProps {
  transaction: Transaction
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: TransactionCardProps): JSX.Element {
  const isIncome = transaction.categoryType === "income"
  const icon = isIncome ? (
    <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
  ) : (
    <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
  )

  const amountColor = isIncome
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400"

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {icon}
            </div>
            <div>
              <div className="font-medium">{transaction.description}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{transaction.categoryName}</span>
                <span>•</span>
                <span>{formatDate(transaction.transactionDate)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-right`}>
              <div className={`font-semibold ${amountColor}`}>
                {isIncome ? "+" : "-"}
                {formatCurrency(transaction.amountCents)}
              </div>
              <Badge variant="outline" className="text-xs">
                {transaction.categoryType}
              </Badge>
            </div>
            {(onEdit || onDelete) && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                    aria-label="Edit transaction"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TransactionListSkeleton(): JSX.Element {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="mb-1 h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Skeleton className="mb-1 h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
