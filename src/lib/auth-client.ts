import { createAuthClient } from "better-auth/react";

function getBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin + "/api/auth";
  }
  return (
    (process.env.NEXT_PUBLIC_BETTER_AUTH_URL as string) ||
    (import.meta.env as unknown as { NEXT_PUBLIC_BETTER_AUTH_URL?: string })
      .NEXT_PUBLIC_BETTER_AUTH_URL ||
    ""
  );
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export type AuthClient = typeof authClient;
