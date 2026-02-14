"use client";

import { ProtectedRoute } from "@/components/protected-route";

export default function ProtectedLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
