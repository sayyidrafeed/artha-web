> ⚠️ **MANDATORY DIRECTIVE FOR AI ASSISTANTS**
> 
> **ALWAYS CHECK Context7 MCP server to get the latest documentation for libraries** before implementing any code changes. This includes but is not limited to: React, Better Auth, TanStack Query, Zod, React Hook Form, and any other dependencies.

---

# Artha Frontend - AI Assistant Guidelines

**Repository**: artha-web  
**Framework**: React 19.2.4 + Vite  
**Runtime**: Bun (development), Node.js (production)  
**Authentication**: Better Auth 1.4.18 (owner-only)  
**State Management**: TanStack Query 5.90.20

## Critical Constraints

### Owner-Only Access (NON-NEGOTIABLE)
- **NO REGISTRATION UI**: No registration page or form
- **OAuth Only**: Login page only has GitHub/Google buttons
- **Owner Verification**: Frontend should handle 403 errors gracefully
- **Single User**: No user management, roles, or multi-tenancy UI

### Security Requirements
- All API calls MUST include `withCredentials: true`
- All forms MUST use Zod validation
- Sensitive data MUST NOT be logged to console
- 401 errors MUST redirect to `/login`
- 403 errors MUST show "Owner access only" message

## Code Style Enforcement

### oxlint Rules (MANDATORY)
All code MUST pass oxlint with strict TypeScript and React rules:

```json
{
  "@typescript-eslint/explicit-function-return-type": ["error", {
    "allowExpressions": true,
    "allowTypedFunctionExpressions": true
  }],
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  "@typescript-eslint/strict-boolean-expressions": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/await-thenable": "error",
  "@typescript-eslint/prefer-nullish-coalescing": "error",
  "@typescript-eslint/prefer-optional-chain": "error",
  "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
  "react/prop-types": "off",
  "react/react-in-jsx-scope": "off",
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
  "no-console": ["warn", { "allow": ["error", "warn", "info"] }],
  "no-debugger": "error",
  "prefer-const": "error",
  "no-var": "error"
}
```

**Before committing, run:**
```bash
bun run lint
bun run lint:fix
```

### oxfmt Formatting (MANDATORY)
All code MUST be formatted with oxfmt:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Before committing, run:**
```bash
bun run format
```

## Project Structure

```
artha-web/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/            # Authentication
│   │   │   ├── components/
│   │   │   │   ├── login-button.tsx
│   │   │   │   └── logout-button.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-auth.ts
│   │   │   └── pages/
│   │   │       └── login.tsx
│   │   ├── dashboard/       # Dashboard
│   │   │   ├── components/
│   │   │   │   ├── summary-cards.tsx
│   │   │   │   └── category-breakdown.tsx
│   │   │   └── pages/
│   │   │       └── dashboard.tsx
│   │   └── transactions/    # Transactions
│   │       ├── components/
│   │       │   ├── transaction-list.tsx
│   │       │   └── transaction-form.tsx
│   │       └── pages/
│   │           └── transactions.tsx
│   ├── components/          # Shared UI components
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                 # Utilities
│   │   ├── api.ts          # API client
│   │   ├── auth-client.ts  # Better Auth client
│   │   ├── query-client.ts # TanStack Query config
│   │   ├── query-keys.ts   # Query key factory
│   │   ├── currency.ts     # Currency formatting
│   │   └── utils.ts        # General utilities
│   ├── schemas/            # Zod schemas
│   ├── App.tsx
│   └── main.tsx
├── .oxlintrc.json
├── .oxfmt.json
├── bun.lockb
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Module Boundaries

### Auth Module (`src/modules/auth/`)
**Responsibilities:**
- OAuth sign-in buttons
- Authentication hooks
- Protected route wrapper
- Login page

**Exports:**
- `LoginButton` - OAuth provider buttons
- `useSession` - Get current session
- `useSignIn` - Initiate OAuth sign-in
- `useSignOut` - Sign out
- `ProtectedRoute` - Route guard

**MUST NOT:**
- Handle business logic
- Call application API endpoints directly
- Store sensitive data in localStorage

### Dashboard Module (`src/modules/dashboard/`)
**Responsibilities:**
- Summary cards (income, expense, balance)
- Category breakdown charts
- Date filtering

**Files:**
- `components/summary-cards.tsx`
- `components/category-breakdown.tsx`
- `pages/dashboard.tsx`

### Transactions Module (`src/modules/transactions/`)
**Responsibilities:**
- Transaction list with pagination
- Transaction form (add/edit)
- Transaction filters

**Files:**
- `components/transaction-list.tsx`
- `components/transaction-form.tsx`
- `pages/transactions.tsx`

## Component Architecture

### Functional Components (MANDATORY)
All components MUST be functional components with explicit return types:

```typescript
// CORRECT
export function Button({ children, onClick }: ButtonProps): JSX.Element {
  return <button onClick={onClick}>{children}</button>;
}

// INCORRECT - Missing return type
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

### Props Interfaces
All components MUST have typed props:

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps): JSX.Element {
  // Implementation
}
```

### Custom Hooks Pattern
All hooks MUST have explicit return types:

```typescript
interface UseTransactionsResult {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
}

export function useTransactions(filters: TransactionFilter): UseTransactionsResult {
  // Implementation
}
```

## Import Patterns

### Absolute Imports (MANDATORY)
Use `@/` alias for all internal imports:

```typescript
// CORRECT
import { Button } from '@/components/ui/button';
import { useSession } from '@/modules/auth/hooks/use-auth';
import { api } from '@/lib/api';
import type { Transaction } from '@/schemas/transaction';

// INCORRECT
import { Button } from '../components/ui/button';
import { useSession } from '../modules/auth/hooks/use-auth';
```

### Type Imports (MANDATORY)
Use `type` keyword for type-only imports:

```typescript
// CORRECT
import type { Transaction } from '@/schemas/transaction';
import type { ReactNode } from 'react';

// INCORRECT
import { Transaction } from '@/schemas/transaction'; // if only using as type
```

### External vs Internal
```typescript
// External imports first
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Internal imports second
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
```

## State Management Patterns

### TanStack Query

#### Query Keys
Use the query key factory:

```typescript
import { queryKeys } from '@/lib/query-keys';

// CORRECT
const { data } = useQuery({
  queryKey: queryKeys.transactions.list(filters),
  queryFn: () => fetchTransactions(filters),
});

// INCORRECT - Hardcoded keys
const { data } = useQuery({
  queryKey: ['transactions', filters],
  queryFn: () => fetchTransactions(filters),
});
```

#### Mutations
Always invalidate related queries:

```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: createTransaction,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.transactions.all 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['dashboard'] 
    });
  },
});
```

### Local State
Use React hooks for local state:

```typescript
const [isOpen, setIsOpen] = useState<boolean>(false);
const [formData, setFormData] = useState<FormData>(initialData);
```

## API Integration Patterns

### API Client
Use the configured axios instance:

```typescript
import { api } from '@/lib/api';

// CORRECT
const transactions = await api.get('/transactions', { params: filters });

// INCORRECT - Don't use raw axios
import axios from 'axios';
const transactions = await axios.get('/transactions');
```

### Error Handling
Handle API errors consistently:

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: queryKeys.transactions.list(filters),
  queryFn: () => api.get('/transactions', { params: filters }),
});

if (error) {
  return <ErrorMessage error={error} />;
}
```

### Authentication
Session is handled via cookies automatically:

```typescript
// No need to manually set auth headers
// Cookies are sent automatically with withCredentials: true
const { data: session } = useSession();
```

## Form Handling

### React Hook Form + Zod
All forms MUST use react-hook-form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema, type CreateTransactionInput } from '@/schemas/transaction';

export function TransactionForm(): JSX.Element {
  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: CreateTransactionInput): Promise<void> => {
    await createTransaction(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Currency Formatting

### Display
Use the currency utilities:

```typescript
import { formatCurrency } from '@/lib/currency';

// CORRECT
const displayAmount = formatCurrency(2599); // "$25.99"

// INCORRECT - Manual formatting
const displayAmount = `$${(2599 / 100).toFixed(2)}`;
```

### Input
Convert dollars to cents for API:

```typescript
import { dollarsToCents } from '@/lib/currency';

const amount = dollarsToCents(25.99); // 2599
```

## Environment Variable Management

### Required Variables
```bash
VITE_API_URL=https://artha.sayyidrafee.com/api
VITE_BETTER_AUTH_URL=https://artha.sayyidrafee.com/api
VITE_OWNER_EMAIL=owner@sayyidrafee.com
```

### Access Pattern
```typescript
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}
```

### Type Safety
Add to `src/vite-env.d.ts`:

```typescript
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

## Deployment Constraints (Vercel)

### Build Configuration
Vercel automatically uses the build script:

```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

### Environment Variables
All `VITE_` prefixed variables MUST be set in Vercel dashboard.

### Output
Build output goes to `dist/` directory.

## Routing

### Route Structure
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/protected-route';
import { LoginPage } from '@/modules/auth/pages/login';
import { DashboardPage } from '@/modules/dashboard/pages/dashboard';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

### Protected Routes
All authenticated routes MUST use `ProtectedRoute`:

```typescript
export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { data: session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

## Testing Requirements

### Before Committing
1. Run `bun run check` (typecheck + lint + format)
2. Ensure no oxlint errors
3. Ensure all files are formatted with oxfmt
4. Test in browser manually

### CI/CD Checks
- oxlint MUST pass
- oxfmt check MUST pass
- TypeScript compilation MUST pass
- Build MUST succeed

## File Naming Conventions

- **Components**: PascalCase (e.g., `TransactionList.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTransactions.ts`)
- **Pages**: camelCase with `Page` suffix (e.g., `dashboard.tsx`)
- **Utilities**: camelCase (e.g., `currency.ts`)
- **Schemas**: camelCase (e.g., `transaction.ts`)
- **Styles**: kebab-case (e.g., `globals.css`)

## Prohibited Patterns

### NEVER DO:
1. Create a registration form or page
2. Store session tokens in localStorage
3. Use `any` type
4. Skip Zod validation on forms
5. Use relative imports (`../`)
6. Skip explicit return types
7. Use `console.log` in production code
8. Hardcode API URLs
9. Mutate query cache directly (use `queryClient.invalidateQueries`)
10. Use class components

## AI Assistant Checklist

Before generating any code:
- [ ] Is this for owner-only access?
- [ ] Are all inputs validated with Zod?
- [ ] Are explicit return types provided?
- [ ] Are type imports marked with `type`?
- [ ] Are absolute imports used (`@/`)?
- [ ] Does it follow the component pattern?
- [ ] Will it pass oxlint?
- [ ] Will it pass oxfmt?
- [ ] Are React hooks rules followed?
