import { it, describe, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import "./domSetup.ts"; // must be imported before render/screen
import { render, screen, cleanup, within, waitFor, waitForOptions } from "@testing-library/react";

import { performFetch } from "../src/relayEnvironment.js";

const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})

const mockFetchOk = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(args) });
const mockFetch201 = (...args: any[]) => Promise.resolve({ ok: true, status: 201 });
const mockFetchError = (...args: any[]) => Promise.resolve({ ok: false });
const environment = { a: 123 };
const network = { b: 234 };
const store = { c: 345 };
const recordSource = { d: 456 };

const mockEnvironment = mock.fn(function () { console.log('QWWEQDQWDWERWEWERERWER');return environment; });
const EnvironmentMock = mock.fn(function Environment(config) {
  return environment;
});

const StoreMock = mock.fn(function Store(recordSource) {
  return store;
});

const RecordSourceMock = mock.fn(function RecordSource() {
  return recordSource;
});

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

const { buildEnvironment } = await import("../src/relayEnvironment.js");
describe("buildEnvironment", async () => {

  beforeEach(async () => {
    // Environment.mockImplementation(() => environment);
  });
  afterEach(() => {
    mockModule.restore();
  });
  it("returns environment", async () => {

    assert.deepStrictEqual(buildEnvironment(), environment);
    assert.strictEqual(EnvironmentMock.mock.callCount(),1, 'expected mockEnvironment called once')
    assert.strictEqual(StoreMock.mock.callCount(), 1, 'expected StoreMock called once');
    assert.strictEqual(RecordSourceMock.mock.callCount(), 1, 'expected RecordSourceMock called once');
    assert.strictEqual(NetworkCreateMock.mock.callCount(), 1, 'expected NetworkCreateMock called once');
  });
});