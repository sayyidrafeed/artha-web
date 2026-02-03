# Gemini Code Reviewer Configuration - Frontend

## Overview

Frontend-specific configuration for automated code reviews using Gemini Code Reviewer. This focuses on React 19, TypeScript, Tailwind CSS, and TanStack Query patterns.

## Tech Stack Context

- **Framework**: React 19.2.4
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.4
- **State Management**: TanStack Query 5.90.20
- **Forms**: React Hook Form 7.50.0
- **Validation**: Zod 4.3.6
- **Icons**: Lucide React 0.300.0
- **Utilities**: date-fns 3.0.0, clsx, tailwind-merge

## Frontend-Specific Review Triggers

### File Patterns
```yaml
include:
  - "frontend/**/*.ts"
  - "frontend/**/*.tsx"
  - "shared/**/*.ts"

exclude:
  - "frontend/node_modules/**"
  - "frontend/dist/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
```

## Frontend Review Rules

### React Components (CRITICAL)

#### Component Structure
Components must follow a consistent structure:

```typescript
// ✅ Good - Component structure
import { useState, useCallback } from 'react';
import type { FC } from 'react';

// Types
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

// Component
export const UserCard: FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Handlers
  const handleEdit = useCallback(() => {
    onEdit(user);
  }, [onEdit, user]);
  
  // Render
  return (
    <div className="rounded-lg border p-4">
      {/* Component JSX */}
    </div>
  );
};
```

#### Component Types
- Use `FC<Props>` for components with children
- Use explicit return type `JSX.Element` for simple components
- Always export props interface

```typescript
// ✅ Good - Component typing
// Simple component
export function Button({ children, onClick }: ButtonProps): JSX.Element {
  return <button onClick={onClick}>{children}</button>;
}

// Component with children
export const Card: FC<CardProps> = ({ children, className }) => {
  return <div className={cn('rounded-lg border', className)}>{children}</div>;
};
```

### React Hooks (CRITICAL)

#### Rules of Hooks
All hooks must follow React's Rules of Hooks:

```typescript
// ✅ Good - Hooks at top level
function useUserData(userId: string): UseQueryResult<User> {
  // All hooks at the top
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  
  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  useEffect(() => {
    if (query.isError) {
      setRetryCount((c) => c + 1);
    }
  }, [query.isError]);
  
  return query;
}

// ❌ Bad - Hooks in conditions or loops
function BadComponent({ userId }: { userId?: string }) {
  if (userId) {
    const query = useQuery({...}); // ❌ Hook in condition
  }
}
```

#### Hook Dependencies
All dependencies must be correctly specified:

```typescript
// ✅ Good - Correct dependencies
const handleSubmit = useCallback(async (data: FormData) => {
  await submitForm(data);
  onSuccess();
}, [onSuccess]);

useEffect(() => {
  loadData();
}, [loadData]); // All dependencies listed

// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchUser(userId);
}, []); // ❌ Missing userId dependency
```

#### Custom Hooks
Custom hooks must start with `use` prefix:

```typescript
// ✅ Good - Custom hook naming
export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

### TanStack Query (CRITICAL)

#### Query Keys
Query keys must be consistent and hierarchical:

```typescript
// ✅ Good - Query key patterns
// lib/query-keys.ts
export const queryKeys = {
  users: {
    all: ['users'] as const,
    byId: (id: string) => ['users', id] as const,
    list: (filters: UserFilters) => ['users', 'list', filters] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    byId: (id: string) => ['transactions', id] as const,
    list: (filters: TransactionFilters) => ['transactions', 'list', filters] as const,
    summary: (period: string) => ['transactions', 'summary', period] as const,
  },
} as const;

// Usage
const { data } = useQuery({
  queryKey: queryKeys.transactions.list(filters),
  queryFn: () => fetchTransactions(filters),
});
```

#### Mutation Patterns
Mutations must handle loading and error states:

```typescript
// ✅ Good - Mutation with proper handling
function CreateTransactionForm(): JSX.Element {
  const createTransaction = useCreateTransaction();
  
  const handleSubmit = async (data: CreateTransactionData) => {
    try {
      await createTransaction.mutateAsync(data);
      toast.success('Transaction created');
      resetForm();
    } catch (error) {
      toast.error('Failed to create transaction');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <button 
        type="submit" 
        disabled={createTransaction.isPending}
      >
        {createTransaction.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

#### Query Configuration
Queries should have appropriate configuration:

```typescript
// ✅ Good - Query configuration
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // Only run when userId exists
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### Forms and Validation (CRITICAL)

#### React Hook Form + Zod
Forms must use react-hook-form with Zod validation:

```typescript
// ✅ Good - Form with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm(): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('email')} type="email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        Login
      </button>
    </form>
  );
}
```

### Styling with Tailwind CSS (WARNING)

#### Class Organization
Tailwind classes should be organized consistently:

```typescript
// ✅ Good - Class organization
// Order: Layout -> Spacing -> Sizing -> Typography -> Visuals -> Interactivity
function Button({ children, variant = 'primary' }: ButtonProps): JSX.Element {
  return (
    <button
      className={cn(
        // Layout
        'inline-flex items-center justify-center',
        // Spacing
        'px-4 py-2',
        // Sizing
        'h-10',
        // Typography
        'text-sm font-medium',
        // Visuals
        'rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        // Variants
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      )}
    >
      {children}
    </button>
  );
}
```

#### Utility Functions
Use `cn()` utility for conditional classes:

```typescript
// ✅ Good - Using cn utility
import { cn } from '@/lib/utils';

function Card({ 
  children, 
  className,
  padding = 'normal' 
}: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-sm',
        padding === 'normal' && 'p-4',
        padding === 'large' && 'p-6',
        padding === 'none' && 'p-0',
        className
      )}
    >
      {children}
    </div>
  );
}
```

#### Avoiding Class Conflicts
Don't use arbitrary values when standard utilities exist:

```typescript
// ✅ Good - Use standard utilities
<div className="w-full max-w-md mx-auto">

// ❌ Bad - Arbitrary values
<div className="w-[100%] max-w-[448px] mx-auto">
```

### Performance (WARNING)

#### Memoization
Use memoization appropriately:

```typescript
// ✅ Good - Memoization patterns
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive calculations
const sortedTransactions = useMemo(() => {
  return [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}, [transactions]);

// Memoize callbacks passed to children
const handleDelete = useCallback((id: string) => {
  deleteTransaction(id);
}, [deleteTransaction]);

// Memoize component when props are stable
export const TransactionList = memo(function TransactionList({
  transactions,
  onDelete,
}: TransactionListProps) {
  return (
    <ul>
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} onDelete={onDelete} />
      ))}
    </ul>
  );
});
```

#### List Rendering
Always use proper keys when rendering lists:

```typescript
// ✅ Good - List keys
<ul>
  {transactions.map((transaction) => (
    <TransactionItem 
      key={transaction.id} 
      transaction={transaction} 
    />
  ))}
</ul>

// ❌ Bad - Index as key (can cause issues)
<ul>
  {transactions.map((transaction, index) => (
    <TransactionItem key={index} transaction={transaction} />
  ))}
</ul>
```

### API Integration (WARNING)

#### API Client Setup
```typescript
// ✅ Good - API client configuration
// lib/api.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// API fetch wrapper
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
```

### Error Handling (WARNING)

#### Error Boundaries
Use error boundaries for component error handling:

```typescript
// ✅ Good - Error boundary
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Accessibility (WARNING)

#### A11y Requirements
Components must be accessible:

```typescript
// ✅ Good - Accessible components
function Button({ 
  children, 
  onClick,
  disabled,
  ariaLabel 
}: ButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className="..."
    >
      {children}
    </button>
  );
}

// ✅ Good - Form labels
function TextField({ 
  label, 
  name,
  error 
}: TextFieldProps): JSX.Element {
  const id = useId();
  const errorId = `${id}-error`;
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <span id={errorId} role="alert">{error}</span>}
    </div>
  );
}
```

## Frontend-Specific Review Output

When reviewing frontend code, focus on:

1. **Component correctness** - Proper React patterns, hook rules
2. **Type safety** - Proper TypeScript types, no any
3. **Performance** - Memoization, list keys, unnecessary re-renders
4. **State management** - Proper TanStack Query usage
5. **Forms** - Validation, error handling, accessibility
6. **Styling** - Tailwind best practices, responsive design
7. **Accessibility** - ARIA attributes, keyboard navigation
8. **Error handling** - Error boundaries, user-friendly messages

## Integration with Frontend CI/CD

Gemini reviews should check:
- All components have proper types
- All hooks follow Rules of Hooks
- All queries have proper keys and configuration
- All forms use Zod validation
- No inline styles (use Tailwind)
- Proper accessibility attributes
- No console.log in production code
