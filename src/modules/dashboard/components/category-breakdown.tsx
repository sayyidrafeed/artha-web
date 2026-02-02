import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/currency"
import type {
  DashboardByCategory,
  CategoryAggregation,
} from "@/schemas/dashboard"

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
]

export interface CategoryBreakdownProps {
  data?: DashboardByCategory
  isLoading?: boolean
}

export function CategoryBreakdown({
  data,
  isLoading,
}: CategoryBreakdownProps): JSX.Element {
  if (isLoading) {
    return <CategoryBreakdownSkeleton />
  }

  if (!data) {
    return <div className="text-muted-foreground">No data available</div>
  }

  const hasIncome = data.income.length > 0
  const hasExpense = data.expense.length > 0

  if (!hasIncome && !hasExpense) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No transactions recorded for this period.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {hasIncome && (
        <CategorySection
          title="Income by Category"
          type="income"
          categories={data.income}
        />
      )}
      {hasExpense && (
        <CategorySection
          title="Expenses by Category"
          type="expense"
          categories={data.expense}
        />
      )}
    </div>
  )
}

export interface CategorySectionProps {
  title: string
  type: "income" | "expense"
  categories: CategoryAggregation[]
}

function CategorySection({
  title,
  categories,
}: CategorySectionProps): JSX.Element {
  const total = categories.reduce((sum, cat) => sum + cat.totalCents, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((cat, index) => (
            <CategoryItem
              key={cat.categoryId}
              name={cat.categoryName}
              amount={cat.totalCents}
              count={cat.transactionCount}
              percentage={(cat.totalCents / total) * 100}
              color={COLORS[index % COLORS.length]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export interface CategoryItemProps {
  name: string
  amount: number
  count: number
  percentage: number
  color: string
}

function CategoryItem({
  name,
  amount,
  count,
  percentage,
  color,
}: CategoryItemProps): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">
              {count} transaction{count !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium">{formatCurrency(amount)}</div>
          <Badge variant="outline" className="text-xs">
            {percentage.toFixed(1)}%
          </Badge>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export function CategoryBreakdownSkeleton(): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-1 h-3 w-16" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="mt-1 h-4 w-10" />
                    </div>
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
