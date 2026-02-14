"use client";

import { useRouter, usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/ui";
import { useSession } from "@/modules/auth/hooks/use-auth";
import { useEffect } from "react";

function getEnvVar(key: string): string | undefined {
  if (typeof window === "undefined") {
    return process.env[key];
  }
  return undefined;
}

const DEV_BYPASS = getEnvVar("NEXT_PUBLIC_DEV_BYPASS_AUTH") === "true";

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

const OWNER_EMAIL = getEnvVar("NEXT_PUBLIC_OWNER_EMAIL");

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { data: session, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isOwnerVerified = session?.user?.email
    ? session.user.email.toLowerCase() === OWNER_EMAIL?.toLowerCase()
    : false;

  useEffect(() => {
    if (!isLoading && !session) {
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, session, router, pathname]);

  // Show loading only while checking session, allow children to render and fetch in parallel
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isOwnerVerified) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            Owner access only. This account is not authorized to view this application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {DEV_BYPASS && (
        <div className="fixed left-0 top-0 z-50 w-full bg-amber-500 px-4 py-1 text-center text-sm font-medium text-amber-950">
          Development Mode - Auth Bypassed
        </div>
      )}
      {children}
    </>
  );
}
