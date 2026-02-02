import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/currency"
import type { MonthlySummary } from "@/schemas/dashboard"

export interface SummaryCardsProps {
  data?: MonthlySummary
  isLoading?: boolean
}

export function SummaryCards({
  data,
  isLoading,
}: SummaryCardsProps): JSX.Element {
  if (isLoading) {
    return <SummaryCardsSkeleton />
  }

  if (!data) {
    return <div className="text-muted-foreground">No data available</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <IncomeCard amount={data.incomeCents} />
      <ExpenseCard amount={data.expenseCents} />
      <BalanceCard amount={data.balanceCents} />
    </div>
  )
}

export interface SummaryCardProps {
  title: string
  amount: number
  icon: React.ReactNode
  variant: "income" | "expense" | "balance"
}

function SummaryCard({
  title,
  amount,
  icon,
  variant,
}: SummaryCardProps): JSX.Element {
  const variantStyles = {
    income: "text-green-600 dark:text-green-400",
    expense: "text-red-600 dark:text-red-400",
    balance: "text-blue-600 dark:text-blue-400",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={variantStyles[variant]}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variantStyles[variant]}`}>
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  )
}

export interface IncomeCardProps {
  amount: number
}

export function IncomeCard({ amount }: IncomeCardProps): JSX.Element {
  return (
    <SummaryCard
      title="Total Income"
      amount={amount}
      icon={<TrendingUp className="h-4 w-4" />}
      variant="income"
    />
  )
}

export interface ExpenseCardProps {
  amount: number
}

export function ExpenseCard({ amount }: ExpenseCardProps): JSX.Element {
  return (
    <SummaryCard
      title="Total Expenses"
      amount={amount}
      icon={<TrendingDown className="h-4 w-4" />}
      variant="expense"
    />
  )
}

export interface BalanceCardProps {
  amount: number
}

export function BalanceCard({ amount }: BalanceCardProps): JSX.Element {
  const isPositive = amount >= 0
  return (
    <SummaryCard
      title="Net Balance"
      amount={Math.abs(amount)}
      icon={<Wallet className="h-4 w-4" />}
      variant={isPositive ? "income" : "expense"}
    />
  )
}

export function SummaryCardsSkeleton(): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
