# Frontend Style Guide - Artha Web

## Overview

This style guide covers React and TypeScript coding standards specific to the Artha frontend built with React 19, Vite, Tailwind CSS, and TanStack Query.

## Table of Contents

1. [Project Structure](#project-structure)
2. [React Patterns](#react-patterns)
3. [TypeScript Standards](#typescript-standards)
4. [Component Patterns](#component-patterns)
5. [Hooks Patterns](#hooks-patterns)
6. [State Management](#state-management)
7. [Forms and Validation](#forms-and-validation)
8. [Styling with Tailwind](#styling-with-tailwind)
9. [Performance](#performance)
10. [Testing Patterns](#testing-patterns)

---

## Project Structure

### Directory Organization

```
frontend/src/
├── main.tsx              # Application entry point
├── App.tsx               # Root component
├── index.css             # Global styles
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── forms/           # Form-specific components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── lib/                  # Utility functions
│   ├── api.ts           # API client
│   ├── query-client.ts  # TanStack Query config
│   ├── query-keys.ts    # Query key definitions
│   ├── auth-client.ts   # Auth client
│   └── utils.ts         # General utilities
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   └── ...
├── schemas/              # Zod validation schemas
│   ├── auth.ts
│   ├── transaction.ts
│   └── ...
└── types/                # TypeScript types
    └── index.ts
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTransactions.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Schemas**: camelCase (e.g., `transactionSchema.ts`)
- **Types**: camelCase (e.g., `userTypes.ts`) or in `types.ts`

---

## React Patterns

### Component Declaration

```typescript
// ✅ Good - Function component with explicit return type
import type { FC } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-md font-medium',
        variant === 'primary' && 'bg-blue-600 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
};
```

### Props Interface Naming

```typescript
// ✅ Good - Props interface naming
interface UserCardProps {
  user: User;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

// For components with children
interface LayoutProps {
  children: React.ReactNode;
}
```

### Component Composition

```typescript
// ✅ Good - Component composition pattern
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function UserProfile({ user }: UserProfileProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <UserDetails user={user} />
        <UserActions userId={user.id} />
      </CardContent>
    </Card>
  );
}
```

### Conditional Rendering

```typescript
// ✅ Good - Conditional rendering patterns
function TransactionList({ transactions, isLoading }: TransactionListProps): JSX.Element {
  // Early return for loading
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Early return for empty state
  if (transactions.length === 0) {
    return <EmptyState message="No transactions yet" />;
  }
  
  // Main render
  return (
    <ul>
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </ul>
  );
}

// ✅ Good - Inline conditionals for simple cases
function UserBadge({ user, showEmail }: UserBadgeProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Avatar src={user.avatar} />
      <span>{user.name}</span>
      {showEmail && <span className="text-gray-500">{user.email}</span>}
    </div>
  );
}
```

---

## TypeScript Standards

### Type Imports

```typescript
// ✅ Good - Separate type imports
import type { User, Transaction } from '@/types';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

// ❌ Bad - Mixed imports
import { User, useQuery } from '@/imports'; // Don't mix types and values
```

### Generic Components

```typescript
// ✅ Good - Generic component with constraints
interface ListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor?: (item: T) => string;
}

export function List<T extends { id: string }>({
  items,
  renderItem,
  keyExtractor = (item) => item.id,
}: ListProps<T>): JSX.Element {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<List<User>
  items={users}
  renderItem={(user) => <UserCard user={user} />}
/>
```

### Event Handler Types

```typescript
// ✅ Good - Typed event handlers
import type { 
  FormEvent, 
  ChangeEvent, 
  MouseEvent,
  KeyboardEvent 
} from 'react';

function Form(): JSX.Element {
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Handle submit
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  };
  
  const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
    console.log('Clicked:', e.currentTarget);
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      submitForm();
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

---

## Component Patterns

### Presentational vs Container Components

```typescript
// ✅ Good - Presentational component (UI only)
interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: TransactionCardProps): JSX.Element {
  return (
    <Card>
      <div className="flex justify-between">
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-gray-500">
            {formatDate(transaction.date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onEdit(transaction.id)}>Edit</Button>
          <Button onClick={() => onDelete(transaction.id)} variant="danger">
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ✅ Good - Container component (logic only)
export function TransactionListContainer(): JSX.Element {
  const { data: transactions, isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  const navigate = useNavigate();
  
  const handleEdit = useCallback((id: string) => {
    navigate(`/transactions/${id}/edit`);
  }, [navigate]);
  
  const handleDelete = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <TransactionList
      transactions={transactions || []}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
```

### Compound Components

```typescript
// ✅ Good - Compound component pattern
import { createContext, useContext, type ReactNode } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>');
  }
  return context;
}

interface TabsProps {
  children: ReactNode;
  defaultTab: string;
}

export function Tabs({ children, defaultTab }: TabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children }: { children: ReactNode }): JSX.Element {
  return <div className="flex border-b">{children}</div>;
}

interface TabProps {
  value: string;
  children: ReactNode;
}

export function Tab({ value, children }: TabProps): JSX.Element {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        'px-4 py-2',
        isActive && 'border-b-2 border-blue-600 text-blue-600'
      )}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps): JSX.Element {
  const { activeTab } = useTabs();
  
  if (activeTab !== value) return null;
  
  return <div className="p-4">{children}</div>;
}

// Usage
<Tabs defaultTab="transactions">
  <TabList>
    <Tab value="transactions">Transactions</Tab>
    <Tab value="categories">Categories</Tab>
  </TabList>
  <TabPanel value="transactions">
    <TransactionList />
  </TabPanel>
  <TabPanel value="categories">
    <CategoryList />
  </TabPanel>
</Tabs>
```

### Render Props Pattern

```typescript
// ✅ Good - Render props for flexible composition
interface DataFetcherProps<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  children: (data: T, isLoading: boolean, error: Error | null) => React.ReactNode;
}

export function DataFetcher<T>({
  queryKey,
  queryFn,
  children,
}: DataFetcherProps<T>): JSX.Element {
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn,
  });
  
  return <>{children(data as T, isLoading, error)}</>;
}

// Usage
<DataFetcher
  queryKey={['user', userId]}
  queryFn={() => fetchUser(userId)}
>
  {(user, isLoading, error) => {
    if (isLoading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;
    return <UserProfile user={user} />;
  }}
</DataFetcher>
```

---

## Hooks Patterns

### Custom Hook Structure

```typescript
// ✅ Good - Custom hook structure
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UseTransactionsOptions {
  filters?: TransactionFilters;
  enabled?: boolean;
}

interface UseTransactionsReturn {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTransactions(
  options: UseTransactionsOptions = {}
): UseTransactionsReturn {
  const { filters = {}, enabled = true } = options;
  
  const {
    data: transactions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => fetchTransactions(filters),
    enabled,
  });
  
  return {
    transactions,
    isLoading,
    isError,
    error,
    refetch,
  };
}
```

### Async Hook Pattern

```typescript
// ✅ Good - Async operation hook
import { useState, useCallback } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: Parameters<typeof fn>) => Promise<T>;
  reset: () => void;
}

export function useAsync<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });
  
  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const data = await fn(...args);
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, isLoading: false, error: err });
        throw err;
      }
    },
    [fn]
  );
  
  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);
  
  return {
    ...state,
    execute,
    reset,
  };
}

// Usage
const { execute: uploadFile, isLoading } = useAsync(uploadFileApi);
```

### Debounced Hook

```typescript
// ✅ Good - Debounced search hook
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage
function SearchInput(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => searchApi(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });
  
  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

## State Management

### Query Key Organization

```typescript
// ✅ Good - Query key factory
// lib/query-keys.ts
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
    user: ['auth', 'user'] as const,
  },
  users: {
    all: ['users'] as const,
    byId: (id: string) => ['users', id] as const,
    profile: (id: string) => ['users', id, 'profile'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    byId: (id: string) => ['transactions', id] as const,
    list: (filters: TransactionFilters) => 
      ['transactions', 'list', filters] as const,
    summary: (period: DateRange) => 
      ['transactions', 'summary', period] as const,
  },
  categories: {
    all: ['categories'] as const,
    byId: (id: string) => ['categories', id] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    chart: (period: string) => ['dashboard', 'chart', period] as const,
  },
} as const;
```

### Optimistic Updates

```typescript
// ✅ Good - Optimistic update pattern
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransactionApi,
    onMutate: async (newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.transactions.all,
      });
      
      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData<Transaction[]>(
        queryKeys.transactions.all
      );
      
      // Optimistically update
      queryClient.setQueryData<Transaction[]>(
        queryKeys.transactions.all,
        (old) => [newTransaction, ...(old || [])]
      );
      
      // Return context for rollback
      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.transactions.all,
        context?.previousTransactions
      );
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
    },
  });
}
```

### Infinite Queries

```typescript
// ✅ Good - Infinite scroll pattern
export function useInfiniteTransactions(filters: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return fetchTransactions({ ...filters, page: pageParam });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < filters.limit) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}

// Usage in component
function TransactionList(): JSX.Element {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions({ limit: 20 });
  
  const transactions = data?.pages.flat() || [];
  
  return (
    <>
      <ul>
        {transactions.map((t) => (
          <TransactionItem key={t.id} transaction={t} />
        ))}
      </ul>
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </>
  );
}
```

---

## Forms and Validation

### Form Component Structure

```typescript
// ✅ Good - Complete form implementation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500),
  categoryId: z.string().uuid('Please select a category'),
  date: z.string().datetime(),
  type: z.enum(['income', 'expense']),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  initialData?: Partial<TransactionFormData>;
}

export function TransactionForm({
  onSubmit,
  initialData,
}: TransactionFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString(),
      ...initialData,
    },
  });
  
  const type = watch('type');
  
  const handleFormSubmit = async (data: TransactionFormData): Promise<void> => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error handled by parent
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium">
          Type
        </label>
        <select
          id="type"
          {...register('type')}
          className="mt-1 block w-full rounded-md border"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <input
          id="description"
          type="text"
          {...register('description')}
          className="mt-1 block w-full rounded-md border"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
      >
        {isSubmitting ? 'Saving...' : 'Save Transaction'}
      </button>
    </form>
  );
}
```

### Form Field Component

```typescript
// ✅ Good - Reusable form field
import { useId, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    
    return (
      <div className="space-y-1">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={cn(
            'block w-full rounded-md border px-3 py-2',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
```

---

## Styling with Tailwind

### Class Organization

```typescript
// ✅ Good - Organized Tailwind classes
function Button({
  variant = 'primary',
  size = 'md',
  children,
}: ButtonProps): JSX.Element {
  return (
    <button
      className={cn(
        // Layout
        'inline-flex items-center justify-center',
        // Spacing
        'gap-2',
        // Typography
        'font-medium',
        // Visuals
        'rounded-md',
        'transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        // Size variants
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        // Color variants
        variant === 'primary' && [
          'bg-blue-600 text-white',
          'hover:bg-blue-700',
          'focus:ring-blue-500',
        ],
        variant === 'secondary' && [
          'bg-gray-200 text-gray-900',
          'hover:bg-gray-300',
          'focus:ring-gray-500',
        ],
        variant === 'danger' && [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus:ring-red-500',
        ]
      )}
    >
      {children}
    </button>
  );
}
```

### Responsive Design

```typescript
// ✅ Good - Responsive patterns
function DashboardLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </aside>
      
      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Mobile navigation */}
      <MobileNav className="lg:hidden" />
    </div>
  );
}
```

### Dark Mode Support

```typescript
// ✅ Good - Dark mode classes
function Card({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      {children}
    </div>
  );
}
```

---

## Performance

### Memoization Patterns

```typescript
// ✅ Good - Proper memoization
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive calculations
function Dashboard({ transactions }: DashboardProps): JSX.Element {
  const stats = useMemo(() => {
    return transactions.reduce(
      (acc, t) => ({
        income: acc.income + (t.type === 'income' ? t.amount : 0),
        expense: acc.expense + (t.type === 'expense' ? t.amount : 0),
      }),
      { income: 0, expense: 0 }
    );
  }, [transactions]);
  
  return <StatsDisplay stats={stats} />;
}

// Memoize callbacks
function TransactionList({ onDelete }: TransactionListProps): JSX.Element {
  const deleteMutation = useDeleteTransaction();
  
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
      onDelete?.(id);
    },
    [deleteMutation, onDelete]
  );
  
  return (
    <ul>
      {transactions.map((t) => (
        <TransactionItem
          key={t.id}
          transaction={t}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

// Memoize component
export const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
}: ExpensiveComponentProps): JSX.Element {
  // Expensive rendering logic
  return <div>{/* ... */}</div>;
});
```

### Code Splitting

```typescript
// ✅ Good - Lazy loading
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App(): JSX.Element {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
```

---

## Testing Patterns

### Component Testing

```typescript
// ✅ Good - Component tests
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
  
  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="primary">Button</Button>);
    expect(screen.getByText('Button')).toHaveClass('bg-blue-600');
    
    rerender(<Button variant="secondary">Button</Button>);
    expect(screen.getByText('Button')).toHaveClass('bg-gray-200');
  });
});
```

### Hook Testing

```typescript
// ✅ Good - Hook tests
import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTransactions } from './useTransactions';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTransactions', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.isLoading).toBe(true);
  });
  
  it('returns transactions on success', async () => {
    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.transactions).toBeDefined();
  });
});
```

### Integration Testing

```typescript
// ✅ Good - Integration tests
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('Transaction Creation Flow', () => {
  it('allows user to create a transaction', async () => {
    render(<App />);
    
    // Navigate to create page
    await userEvent.click(screen.getByText('New Transaction'));
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Amount'), '100.50');
    await userEvent.type(screen.getByLabelText('Description'), 'Groceries');
    await userEvent.selectOptions(
      screen.getByLabelText('Category'),
      'Food'
    );
    
    // Submit
    await userEvent.click(screen.getByText('Save'));
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Transaction created')).toBeInTheDocument();
    });
  });
});
```
