# Relay to AWS Amplify v6 Migration (CustomerHistory)

This is the migration pattern from:

- Relay: `fetchQuery(getEnvironment(), queryDoc, vars).subscribe(...)`

to:

- Amplify v6: `generateClient().graphql({ query, variables })`

## 1. Create an Amplify client wrapper

```ts
// src/amplifyClient.ts
import { generateClient } from "aws-amplify/api";

export const amplifyClient = generateClient();
```

Why: wrapping the client in its own module makes testing easier (you mock one local import).

## 2. Replace Relay imports in the component

Before:

```ts
import { fetchQuery } from "relay-runtime";
import { getEnvironment } from "./relayEnvironment.js";
```

After:

```ts
import { amplifyClient } from "./amplifyClient.js";
```

## 3. Replace subscription flow with async GraphQL call

Before (Relay):

```ts
const subscription = fetchQuery(env, queryDoc, { id }).subscribe({
  next: (data) => { ... },
  error: () => { ... }
});
return () => subscription.unsubscribe();
```

After (Amplify v6):

```ts
useEffect(() => {
  let isCancelled = false;

  const fetchCustomer = async () => {
    try {
      const response = await amplifyClient.graphql({
        query: customerHistoryQuery,
        variables: { id: String(id) }
      });

      if (isCancelled) return;
      if ("errors" in response && response.errors?.length) {
        setStatus("failed");
        return;
      }

      const data = ("data" in response ? response.data : null) as CustomerHistoryData | null;
      setCustomer(data?.customer ?? null);
      setStatus("loaded");
    } catch {
      if (!isCancelled) setStatus("failed");
    }
  };

  void fetchCustomer();
  return () => { isCancelled = true; };
}, [id]);
```

## 4. Update test mocking strategy

Mock local wrapper, not `aws-amplify/api` directly:

```ts
const mockGraphql = mock.fn(() => Promise.reject(new Error("failed")));
mock.module("../src/amplifyClient.js", {
  namedExports: {
    amplifyClient: { graphql: mockGraphql }
  }
});
```

Why: avoids package-resolution failures in test runtime before dependency install.

## 5. Install dependency

```bash
npm install aws-amplify
```

Your install previously failed due to network restrictions (`ENOTFOUND`), so run this when network access is available.
