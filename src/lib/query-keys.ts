export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (filters: Record<string, unknown>): readonly string[] =>
      [...queryKeys.transactions.all, "list", JSON.stringify(filters)] as const,
    detail: (id: string): readonly string[] =>
      [...queryKeys.transactions.all, "detail", id] as const,
  },
  dashboard: {
    summary: (year: number, month?: number): readonly string[] =>
      [
        "dashboard",
        "summary",
        String(year),
        month ? String(month) : "all",
      ] as const,
    byCategory: (year: number, month?: number): readonly string[] =>
      [
        "dashboard",
        "byCategory",
        String(year),
        month ? String(month) : "all",
      ] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (): readonly string[] =>
      [...queryKeys.categories.all, "list"] as const,
  },
}
