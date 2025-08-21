---
{
  title: 'TypeScript',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## 1. Type Safety Issues

### 1.1 Dangerous Type Assertions

```typescript
// ❌ Issue: Type assertion bypasses all safety
function processApiResponse(data: unknown): User {
  return data as User; // No validation!
}

// ✅ Better: Proper type guards with runtime validation
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).email === 'string';
}

function processApiResponse(data: unknown): User | null {
  return isUser(data) ? data : null;
}
```

### 1.2 Non-Exhaustive Union Handling

```typescript
// ❌ Issue: Missing error case, no compile-time check
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

function getStateMessage(state: LoadingState): string {
  if (state === 'idle') return 'Ready';
  if (state === 'loading') return 'Loading...';
  if (state === 'success') return 'Complete';
  // Missing 'error' case
}

// ✅ Better: Exhaustive checking with never type
function getStateMessage(state: LoadingState): string {
  switch (state) {
    case 'idle': return 'Ready';
    case 'loading': return 'Loading...';
    case 'success': return 'Complete';
    case 'error': return 'Failed';
    default:
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled state: ${exhaustiveCheck}`);
  }
}
```

### 1.3 Weak Union Types Instead of Discriminated Unions

```typescript
// ❌ Issue: Ambiguous union makes error handling unclear
type ApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

// ✅ Better: Discriminated union enforces proper handling
type ApiResponse =
  | { success: true; data: any }
  | { success: false; error: string };

function handleResponse(response: ApiResponse) {
  if (response.success) {
    console.log(response.data); // TypeScript knows data exists
  } else {
    console.error(response.error); // TypeScript knows error exists
  }
}
```

### 1.4 Boolean Traps and Unclear Parameters

```typescript
// ❌ Issue: Unclear what boolean parameters mean
function createUser(name: string, email: string, active: boolean, admin: boolean) {

}

createUser('John', 'john@example.com', true, false); // Unclear intent

// ✅ Better: Explicit enums and options objects
enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

interface CreateUserOptions {
  name: string;
  email: string;
  isActive?: boolean;
  role?: UserRole;
}

function createUser(options: CreateUserOptions): User {
  return {
    ...options,
    isActive: options.isActive ?? true,
    role: options.role ?? UserRole.USER
  };
}

createUser({
  name: 'John',
  email: 'john@example.com',
  isActive: true,
  role: UserRole.USER
});
```

## 2. Logic and Intent

### 2.1 Function Name vs Implementation Mismatch

```typescript
// ❌ Issue: Function name promises total but only calculates tax
function calculateTotalWithTax(price: number, taxRate: number): number {
  return price * taxRate; // Only tax, not total!
}

// ✅ Better: Implementation matches promise
function calculateTotalWithTax(price: number, taxRate: number): number {
  const tax = price * taxRate;
  return price + tax;
}
```

### 2.2 Prefer Descriptive Names

```typescript
// ❌ Issue: Function name and variables do not describe intent
function calc(price: number, rate: number): number {
  return price + (price * rate); // calculate price of item with tax rate
}

// ✅ Better: Names are descriptive and remove need for comments
function calculateTotalWithTax(price: number, taxRate: number): number {
  const tax = price * taxRate;
  return price + tax;
}
```

### 2.3 Race Conditions in Async Code

```typescript
// ❌ Issue: Race condition in user input validation
class SearchComponent {
  async handleSearch(query: string) {
    setTimeout(() => this.performSearch(query), 300); // Debounce
    // Multiple rapid calls create race conditions
  }
}

// ✅ Better: Proper debouncing with cancellation
class SearchComponent {
  #searchTimeout?: Timeout;

  async handleSearch(query: string) {
    if (this.#searchTimeout) {
      clearTimeout(this.#searchTimeout);
    }
    this.#searchTimeout = setTimeout(() => this.performSearch(query), 300);
  }
}
```

### 2.4 Memory Leaks from Closures

```typescript
// ❌ Issue: Closure retains large objects unnecessarily
function createEventHandler(): (event: Event) => void {
  const largeDataArray = new Array(1000000).fill('data');

  return function handleEvent(event: Event) {
    console.log('Event handled:', event.type);
    // largeDataArray stays in memory due to closure scope
  };
}

// ✅ Better: Explicit cleanup to prevent memory leaks
function createEventHandler(): (event: Event) => void {
  let largeDataArray = new Array(1000000).fill('data');

  // Process the data if needed
  processLargeData(largeDataArray);

  // Clear reference to allow garbage collection
  largeDataArray = null;

  return function handleEvent(event: Event) {
    console.log('Event handled:', event.type);
  };
}
```

### 2.5 Sequential vs Parallel Operations

```typescript
// ❌ Issue: Sequential when parallel would be more efficient
async function fetchUserData(userId: string) {
  const profile = await fetchUserProfile(userId);
  const preferences = await fetchUserPreferences(userId);
  return { profile, preferences, notifications };
}

// ✅ Better: Parallel execution when operations are independent
async function fetchUserData(userId: string) {
  const [profile, preferences] = await Promise.all([
    fetchUserProfile(userId),
    fetchUserPreferences(userId)
  ]);
  return { profile, preferences };
}
```
