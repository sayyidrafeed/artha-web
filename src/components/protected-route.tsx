import { Navigate, useLocation } from "react-router-dom"
import { LoadingSpinner } from "@/components/ui"
import { useSession } from "@/modules/auth/hooks/use-auth"

export interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { data: session, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
