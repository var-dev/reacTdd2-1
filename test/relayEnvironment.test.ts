import { it, describe, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import "./domSetup.ts"; // must be imported before render/screen
import { render, screen, cleanup, within, waitFor, waitForOptions } from "@testing-library/react";

import { performFetch } from "../src/relayEnvironment";

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


describe('performFetch', ()=>{
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
})