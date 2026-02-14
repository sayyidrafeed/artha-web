"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import type { User, Session } from "@/schemas/auth";
import { useRouter } from "next/navigation";

function getEnvVar(key: string): string | undefined {
  return process.env[key];
}

interface SessionData {
  session: Session;
  user: User;
}

function createMockSession(): SessionData {
  const OWNER_EMAIL = getEnvVar("NEXT_PUBLIC_OWNER_EMAIL") ?? "";
  const now = new Date();
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    session: {
      id: "dev-session-id",
      token: "dev-mock-token",
      userId: "dev-user-id",
      expiresAt: futureDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    user: {
      id: "dev-user-id",
      email: OWNER_EMAIL,
      name: "Developer",
      image: undefined,
      emailVerified: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  };
}

interface UseSessionResult {
  data: SessionData | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSession(): UseSessionResult {
  const DEV_BYPASS = getEnvVar("NEXT_PUBLIC_DEV_BYPASS_AUTH") === "true";

  const { data, error, isLoading } = useQuery<SessionData | null>({
    queryKey: queryKeys.auth.session,
    queryFn: async (): Promise<SessionData | null> => {
      if (DEV_BYPASS) {
        return createMockSession();
      }
      const response = await authClient.getSession();
      return response.data as SessionData | null;
    },
    retry: false,
    staleTime: DEV_BYPASS ? Infinity : 5 * 60 * 1000,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error ?? null,
  };
}

interface UseSignInResult {
  mutate: (provider: "github" | "google") => void;
  isPending: boolean;
  error: Error | null;
}

export function useSignIn(): UseSignInResult {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (provider: "github" | "google"): Promise<void> => {
      await authClient.signIn.social({
        provider,
        callbackURL: window.location.origin,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
  });

  return {
    mutate,
    isPending,
    error: error ?? null,
  };
}

interface UseSignOutResult {
  mutate: () => void;
  isPending: boolean;
  error: Error | null;
}

export function useSignOut(): UseSignOutResult {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (): Promise<void> => {
      await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      router.push("/login");
    },
  });

  return {
    mutate,
    isPending,
    error: error ?? null,
  };
}
