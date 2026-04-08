import { Environment, Network, RecordSource, Store } from "relay-runtime";
import type { FetchFunction } from "relay-runtime";


const verifyStatusOk = (result:Response) => {
  if (!result.ok) {
    return Promise.reject(new Error("500"));
  } else {
    return result;
  }
};
export const performFetch: FetchFunction = (request, variables) =>
  globalThis
    .fetch("/graphql", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: request.text,
        variables,
      }),
    })
    .then(verifyStatusOk)
    .then((result) => result!.json());
    
export const RelayEnvironment = new Environment({
  network: Network.create(performFetch),
  store: new Store(new RecordSource())
});

let environment = null as unknown as Environment
export const buildEnvironment = () => new Environment({
  network: Network.create(performFetch),
  store: new Store(new RecordSource())
});

export const getEnvironment = () => environment ? environment : environment = buildEnvironment()
