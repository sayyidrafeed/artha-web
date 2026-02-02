> ⚠️ **MANDATORY DIRECTIVE FOR AI ASSISTANTS**
> 
> **ALWAYS CHECK Context7 MCP server to get the latest documentation for libraries** before implementing any code changes. This includes but is not limited to: React, Better Auth, TanStack Query, Zod, React Hook Form, and any other dependencies.

---

# Artha Frontend - Single Source of Truth

**Repository**: artha-web  
**Last Updated**: 2024-01-15  
**Version**: 1.0.0

## Domain Models

### User (Better Auth)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

**Constraints:**
- Only ONE user exists (owner-only system)
- Email MUST match `VITE_OWNER_EMAIL`
- Created via OAuth (GitHub or Google)

### Session (Better Auth)

```typescript
interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;  // ISO 8601
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

interface SessionData {
  session: Session;
  user: User;
}
```

**Constraints:**
- Session cookie: httpOnly, Secure, SameSite=Strict
- Expires in 7 days
- Single active session

### Transaction

```typescript
interface Transaction {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryType: 'income' | 'expense';
  amountCents: number;  // Positive integer
  description: string;
  transactionDate: string;  // YYYY-MM-DD
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

**Constraints:**
- `amountCents` is always positive (type determined by category)
- `transactionDate` format: YYYY-MM-DD
- No `userId` (owner-only system)

### Category

```typescript
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  createdAt: string;  // ISO 8601
}
```

**Constraints:**
- Name unique per type
- Cannot delete if transactions exist

### Dashboard Summary

```typescript
interface MonthlySummary {
  year: number;
  month?: number;
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
}
```

### Category Aggregation

```typescript
interface CategoryAggregation {
  categoryId: string;
  categoryName: string;
  type: 'income' | 'expense';
  totalCents: number;
  transactionCount: number;
}

interface DashboardByCategory {
  year: number;
  month?: number;
  income: CategoryAggregation[];
  expense: CategoryAggregation[];
}
```

## Authentication Flows

### Owner-Only Access Model

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Owner     │────▶│   Login     │────▶│   OAuth     │
│   (Human)   │◄────│   Page      │◄────│   Buttons   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                                │ Click GitHub/Google
                                                ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Artha     │◄────│   Better    │◄────│   OAuth     │
│   Dashboard │     │   Auth      │     │   Provider  │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │ Session cookie set
       ▼
┌─────────────┐
│  Protected  │
│   Routes    │
└─────────────┘
```

### Flow Steps

1. **Login Page**
   - Path: `/login`
   - Shows GitHub and Google OAuth buttons
   - No registration option
   - Message: "Owner access only"

2. **OAuth Sign-In**
   - Hook: `useSignIn()`
   - Calls `authClient.signIn.social({ provider })`
   - Redirects to OAuth provider

3. **Callback Handling**
   - Better Auth handles callback automatically
   - Sets session cookie
   - Redirects back to application

4. **Session Validation**
   - Hook: `useSession()`
   - Returns session data or null
   - TanStack Query caches for 5 minutes

5. **Protected Routes**
   - Component: `ProtectedRoute`
   - Checks session validity
   - Redirects to `/login` if no session

### No Registration Flow

**PROHIBITED UI:**
- No registration form
- No "Sign Up" link
- No email/password registration
- No invite system

**ALLOWED UI:**
- OAuth buttons only
- Login page with owner-only message

## Frontend State Management Patterns

### TanStack Query Configuration

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,    // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex: number): number =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount: number, error: Error): boolean => {
        if (error.message.includes('Network')) {
          return failureCount < 2;
        }
        return false;
      },
    },
  },
});
```

### Query Keys Factory

```typescript
// src/lib/query-keys.ts
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (filters: Record<string, unknown>): readonly string[] =>
      [...queryKeys.transactions.all, 'list', JSON.stringify(filters)] as const,
    detail: (id: string): readonly string[] =>
      [...queryKeys.transactions.all, 'detail', id] as const,
  },
  dashboard: {
    summary: (year: number, month?: number): readonly string[] =>
      ['dashboard', 'summary', String(year), month ? String(month) : 'all'] as const,
    byCategory: (year: number, month?: number): readonly string[] =>
      ['dashboard', 'byCategory', String(year), month ? String(month) : 'all'] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (): readonly string[] => [...queryKeys.categories.all, 'list'] as const,
  },
};
```

### Authentication Hooks

```typescript
// src/modules/auth/hooks/use-auth.ts

// Get current session
export function useSession() {
  return useQuery<SessionData | null>({
    queryKey: queryKeys.auth.session,
    queryFn: async (): Promise<SessionData | null> => {
      const { data } = await authClient.getSession();
      return data as SessionData | null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// Sign in with OAuth
export function useSignIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (provider: 'github' | 'google'): Promise<void> => {
      await authClient.signIn.social({ provider });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
  });
}

// Sign out
export function useSignOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });
}
```

### Data Fetching Hooks

```typescript
// Transactions
export function useTransactions(filters: TransactionFilter) {
  return useQuery<ApiResponse<TransactionsResponse>>({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async () => api.get('/transactions', { params: filters }),
    staleTime: 30 * 1000,
  });
}

// Dashboard
export function useDashboardSummary(year: number, month?: number) {
  return useQuery<ApiResponse<MonthlySummary>>({
    queryKey: queryKeys.dashboard.summary(year, month),
    queryFn: async () => api.get('/dashboard/summary', { params: { year, month } }),
    staleTime: 60 * 1000,
  });
}
```

### Mutation Patterns

```typescript
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => 
      api.post('/transactions', data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

## Component Architecture

### Component Hierarchy

```
App
├── Routes
│   ├── /login
│   │   └── LoginPage
│   │       └── LoginButton (GitHub, Google)
│   └── / (ProtectedRoute)
│       ├── DashboardPage
│       │   ├── SummaryCards
│       │   │   ├── IncomeCard
│       │   │   ├── ExpenseCard
│       │   │   └── BalanceCard
│       │   └── CategoryBreakdown
│       └── TransactionsPage
│           ├── TransactionFilters
│           ├── TransactionList
│           │   └── TransactionCard
│           └── TransactionForm
│               └── (Modal with form)
```

### Component Patterns

#### Page Components
```typescript
// src/modules/dashboard/pages/dashboard.tsx
export function DashboardPage(): JSX.Element {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const { data: summary } = useDashboardSummary(selectedYear, selectedMonth);
  const { data: byCategory } = useDashboardByCategory(selectedYear, selectedMonth);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <SummaryCards data={summary?.data} />
      <CategoryBreakdown data={byCategory?.data} />
    </div>
  );
}
```

#### Presentational Components
```typescript
// src/modules/dashboard/components/summary-cards.tsx
interface SummaryCardsProps {
  data?: MonthlySummary;
}

export function SummaryCards({ data }: SummaryCardsProps): JSX.Element {
  if (!data) return <SummaryCardsSkeleton />;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <IncomeCard amount={data.incomeCents} />
      <ExpenseCard amount={data.expenseCents} />
      <BalanceCard amount={data.balanceCents} />
    </div>
  );
}
```

#### Form Components
```typescript
// src/modules/transactions/components/transaction-form.tsx
interface TransactionFormProps {
  onSubmit: (data: CreateTransactionInput) => void;
  defaultValues?: Partial<CreateTransactionInput>;
}

export function TransactionForm({ 
  onSubmit, 
  defaultValues 
}: TransactionFormProps): JSX.Element {
  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      ...defaultValues,
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Protected Route Pattern

```typescript
// src/components/protected-route.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { data: session, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

## API Integration Patterns

### API Client Configuration

```typescript
// src/lib/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Required for session cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || 'An error occurred';
    const code = error.response?.data?.error?.code || 'UNKNOWN_ERROR';
    
    // Handle auth errors
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
    }
    
    return Promise.reject({ message, code, status: error.response?.status });
  }
);
```

### Better Auth Client

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL,
});

export type AuthClient = typeof authClient;
```

### API Response Types

```typescript
// src/schemas/common.ts
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

## Currency Handling

### Display Utilities

```typescript
// src/lib/currency.ts

export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}
```

### Usage in Components

```typescript
// Display
const displayAmount = formatCurrency(2599); // "$25.99"

// Form input conversion
const amountCents = dollarsToCents(25.99); // 2599
```

## Form Validation (Zod)

### Transaction Schemas

```typescript
// src/schemas/transaction.ts
import { z } from 'zod';

export const createTransactionSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
```

## Environment Variables

### Required
```bash
VITE_API_URL=https://artha.sayyidrafee.com/api
VITE_BETTER_AUTH_URL=https://artha.sayyidrafee.com/api
VITE_OWNER_EMAIL=owner@sayyidrafee.com
```

### Type Definitions
```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BETTER_AUTH_URL: string;
  readonly VITE_OWNER_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Routing Structure

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/login` | LoginPage | No |
| `/` | DashboardPage | Yes |
| `/transactions` | TransactionsPage | Yes |
| `/categories` | CategoriesPage | Yes |
| `/unauthorized` | UnauthorizedPage | No |

## File Locations

| Purpose | Path |
|---------|------|
| Auth client | `src/lib/auth-client.ts` |
| API client | `src/lib/api.ts` |
| Query client | `src/lib/query-client.ts` |
| Query keys | `src/lib/query-keys.ts` |
| Currency utils | `src/lib/currency.ts` |
| Auth hooks | `src/modules/auth/hooks/use-auth.ts` |
| Login button | `src/modules/auth/components/login-button.tsx` |
| Login page | `src/modules/auth/pages/login.tsx` |
| Protected route | `src/components/protected-route.tsx` |
| Transaction hooks | `src/modules/transactions/hooks/use-transactions.ts` |
| Transaction schemas | `src/schemas/transaction.ts` |
| Shared schemas | `src/schemas/*.ts` |

## Error Handling

### API Errors
```typescript
const { error } = useQuery({
  queryKey: queryKeys.transactions.list(filters),
  queryFn: () => api.get('/transactions', { params: filters }),
});

if (error) {
  return <ErrorMessage error={error} />;
}
```

### Form Errors
```typescript
const form = useForm<CreateTransactionInput>({
  resolver: zodResolver(createTransactionSchema),
});

// Errors available via form.formState.errors
```

## Default Categories

### Income
1. Salary
2. Freelance
3. Investment
4. Gift
5. Other Income

### Expense
1. Food & Dining
2. Transportation
3. Utilities
4. Entertainment
5. Healthcare
6. Shopping
7. Education
8. Housing
9. Other Expense
