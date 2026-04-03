import { it, describe, beforeEach, afterEach, mock, after } from "node:test";
import assert from "node:assert/strict";

const originalFetch = globalThis.fetch;

afterEach(()=>{
  globalThis.fetch = originalFetch;
})

const mockFetchOk = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(args) });
const mockFetch201 = (...args: any[]) => Promise.resolve({ ok: true, status: 201 });
const mockFetchError = (...args: any[]) => Promise.resolve({ ok: false });
const environment = { a: 123 };
const network = { b: 234 };
const store = { c: 345 };
const recordSource = { d: 456 };

const EnvironmentMock = mock.fn(function Environment(config) {return environment;});
const StoreMock = mock.fn(function Store(recordSource) {return store;});
const RecordSourceMock = mock.fn(function RecordSource() {return recordSource;});
const NetworkCreateMock = mock.fn(() => network);

const mockModule = mock.module("relay-runtime", {
  namedExports: {
    Environment: EnvironmentMock,
    Network: {
      create: NetworkCreateMock
    },
    Store: StoreMock,
    RecordSource: RecordSourceMock,
  }
});

after(()=>{
  mockModule.restore();
})

describe('performFetch', async ()=>{
    const { performFetch } = await import("../src/relayEnvironment.js");
  it("sends HTTP request to POST /graphql", () => {
    const mockFetch = mock.method(globalThis, 'fetch', mockFetchOk);
    performFetch({},{});
    const count = mockFetch.mock.callCount()
    assert.strictEqual(count, 1, 'mockFetch callCount not 1');
    const actual = JSON.stringify(mockFetch.mock.calls[0].arguments);
    assert.match(actual, /POST/, `actual - expected\n${actual}\nPOST`)
    assert.match(actual, /credentials.+same-origin/, `expected credentials: "same-origin"`)
    assert.match(actual, /Content-Type.+application.json/, `expected: { "Content-Type": "application/json" }`)
    assert.match(actual, /body/, `expected body:...`)
    // assert.match(actual, /query/, `expected query:...`)
  })
  it("returns the request data", async () => {
    const mockFetch = mock.method(globalThis, 'fetch', mockFetchOk);
    performFetch({},{});
    const count = mockFetch.mock.callCount()
    assert.strictEqual(count, 1, 'mockFetch callCount not 1');
    const actual = mockFetch.mock.calls[0].result
    const {ok, json} = await actual as Response
    assert.strictEqual(ok, true, 'expected mockFetch result ok:true')
    const body = JSON.stringify(await json()) 
    assert.match(body, /body/, 'expected body in the response')
  })
  it("rejects when the request fails", async () => {
    const mockFetch = mock.method(globalThis, 'fetch', mockFetchError);
    performFetch({}, {}).catch((error: any) => assert.match(error.message, /500/))
    const count = mockFetch.mock.callCount()
    assert.strictEqual(count, 1, 'mockFetch callCount not 1');
  })
})

afterEach(() => {
  EnvironmentMock.mock.resetCalls()
  StoreMock.mock.resetCalls()
  RecordSourceMock.mock.resetCalls()
  NetworkCreateMock.mock.resetCalls()
});
describe("buildEnvironment", async () => {
  it("returns environment", async () => {
    const { buildEnvironment } = await import("../src/relayEnvironment.js");
    assert.deepStrictEqual(buildEnvironment(), environment);
    assert.strictEqual(EnvironmentMock.mock.callCount(),1, 'expected mockEnvironment called once')
    assert.strictEqual(StoreMock.mock.callCount(), 1, 'expected StoreMock called once');
    assert.strictEqual(RecordSourceMock.mock.callCount(), 1, 'expected RecordSourceMock called once');
    assert.strictEqual(NetworkCreateMock.mock.callCount(), 1, 'expected NetworkCreateMock called once');
  });
});
describe("getEnvironment", () => {
  it("constructs the object only once", async () => {
    const { getEnvironment } = await import("../src/relayEnvironment.js");
    getEnvironment();
    getEnvironment();
    assert.strictEqual(EnvironmentMock.mock.callCount(), 1, 'expected buildEnvironment() called once')
  });
});