import { createAuthClient } from "better-auth/react";

function getBaseURL(): string {
  // Check for custom auth URL from environment variables first
  const envUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL as string | undefined;

  if (envUrl) {
    return envUrl;
  }

  // Fall back to default auth URL
  if (typeof window !== "undefined") {
    return window.location.origin + "/api/auth";
  }
  return "";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export type AuthClient = typeof authClient;
