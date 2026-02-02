import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Calendar, ArrowLeft, ArrowRight } from "lucide-react"
import { Button, Card } from "@/components/ui"
import {
  useDashboardSummary,
  useDashboardByCategory,
} from "../hooks/use-dashboard"
import { SummaryCards } from "../components/summary-cards"
import { CategoryBreakdown } from "../components/category-breakdown"
import { LogoutButton } from "@/modules/auth"
import { useSession } from "@/modules/auth/hooks/use-auth"

export function DashboardPage(): JSX.Element {
  const navigate = useNavigate()
  const { data: session } = useSession()

  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear(),
  )
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1,
  )

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(
    selectedYear,
    selectedMonth,
  )
  const { data: byCategory, isLoading: categoryLoading } =
    useDashboardByCategory(selectedYear, selectedMonth)

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const navigateMonth = (direction: "prev" | "next"): void => {
    if (direction === "prev") {
      if (selectedMonth === 1) {
        setSelectedYear(selectedYear - 1)
        setSelectedMonth(12)
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedYear(selectedYear + 1)
        setSelectedMonth(1)
      } else {
        setSelectedMonth(selectedMonth + 1)
      }
    }
  }

  const goToTransactions = (): void => {
    navigate("/transactions")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Artha</h1>
                <p className="text-xs text-muted-foreground">
                  Personal Finance Tracker
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of your financial activity
            </p>
          </div>
          <Button onClick={goToTransactions}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Date Filter */}
        <div className="mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                aria-label="Previous month"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {months[selectedMonth - 1]} {selectedYear}
                </h3>
                <button
                  onClick={() => {
                    setSelectedYear(currentDate.getFullYear())
                    setSelectedMonth(currentDate.getMonth() + 1)
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Go to current month
                </button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                aria-label="Next month"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards data={summary} isLoading={summaryLoading} />
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Category Breakdown</h3>
          <CategoryBreakdown data={byCategory} isLoading={categoryLoading} />
        </div>
      </main>
    </div>
  )
}
