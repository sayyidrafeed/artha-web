import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { queryKeys } from "@/lib/query-keys"
import type { User, Session } from "@/schemas/auth"

interface SessionData {
  session: Session
  user: User
}

interface UseSessionResult {
  data: SessionData | null
  isLoading: boolean
  error: Error | null
}

export function useSession(): UseSessionResult {
  const { data, isLoading, error } = useQuery<SessionData | null>({
    queryKey: queryKeys.auth.session,
    queryFn: async (): Promise<SessionData | null> => {
      const response = await authClient.getSession()
      return response.data as SessionData | null
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  return {
    data: data ?? null,
    isLoading,
    error: error ?? null,
  }
}

interface UseSignInResult {
  mutate: (provider: "github" | "google") => void
  isPending: boolean
  error: Error | null
}

export function useSignIn(): UseSignInResult {
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (provider: "github" | "google"): Promise<void> => {
      await authClient.signIn.social({
        provider,
        callbackURL: window.location.origin,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session })
    },
  })

  return {
    mutate,
    isPending,
    error: error ?? null,
  }
}

interface UseSignOutResult {
  mutate: () => void
  isPending: boolean
  error: Error | null
}

export function useSignOut(): UseSignOutResult {
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (): Promise<void> => {
      await authClient.signOut()
    },
    onSuccess: () => {
      queryClient.clear()
      window.location.href = "/login"
    },
  })

  return {
    mutate,
    isPending,
    error: error ?? null,
  }
}
