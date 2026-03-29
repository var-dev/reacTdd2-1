export const performFetch = (operation: any, variables: any) =>
  globalThis
    .fetch("/graphql", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: operation.text,
        variables,
      })})
    .then((result) => result!.json())
    .catch((error) => {throw error});
