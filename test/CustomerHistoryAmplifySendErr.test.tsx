import { after, afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from 'node:assert/strict';
import "./domSetup"; // must be imported before render/screen
import React from 'react'
import { MemoryRouter } from "react-router";
import { render, screen, cleanup, within, waitFor, act, waitForElementToBeRemoved } from "@testing-library/react";

const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})

const mockGraphql = mock.fn(() => Promise.reject(new Error("failed")));
const mockModule = mock.module("../src/amplifyClient.js", {
  namedExports: {
    amplifyClient: { graphql: mockGraphql }
  }
});

after(()=>{
  mockModule.restore();
})

describe("CustomerHistory", () => {
  afterEach(() => {
    mockGraphql.mock.resetCalls();
  });

  it("displays an error message", async () => {
    const { CustomerHistoryRoute } = await import('../src/CustomerHistoryRoute.js')
    render (
      <MemoryRouter initialEntries={["/?customer=123"]}>
        <CustomerHistoryRoute />
      </MemoryRouter>);
    await waitForElementToBeRemoved( ()=>screen.getByText(/Loading/i))
    const element = await screen.findAllByText<HTMLElement>(/Sorry/i)
    const [actual] = Array.from(element, (el)=> el.textContent)
    assert.strictEqual(actual, 'Sorry, an error occurred while pulling data from the server.', 'expect error fetch message')
  });
});
