import { Environment, Network, RecordSource, Store } from "relay-runtime";

const verifyStatusOk = (result:Response) => {
  if (!result.ok) {
    return Promise.reject(new Error("500"));
  } else {
    return result;
  }
};
export const performFetch = (operation: any, variables: any) =>
  globalThis
    .fetch("/graphql", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: operation.text,
        variables,
      }),
    })
    .then(verifyStatusOk)
    .then((result) => result!.json());

export const buildEnvironment = () => new Environment({
  network: Network.create(performFetch),
  store: new Store(new RecordSource())
});
