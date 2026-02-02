import { Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "@/components/protected-route"
import { LoginPage } from "@/modules/auth"
import { DashboardPage } from "@/modules/dashboard"
import { TransactionsPage } from "@/modules/transactions"

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
