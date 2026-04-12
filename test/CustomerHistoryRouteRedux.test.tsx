import { after, afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from 'node:assert/strict';
import "./domSetup"; // must be imported before render/screen
import React, { ReactElement} from "react";
import { MemoryRouter } from "react-router";
import { render, screen, cleanup, within, waitFor, act, waitForElementToBeRemoved } from "@testing-library/react";

import type { Customer, AppointmentApi } from "../src/types.js";
import { Provider } from "react-redux";

const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})

const date = new Date("February 16, 2019");
const appointments:AppointmentApi[] = [
  {
    startsAt: date.setHours(9, 0, 0, 0),
    stylist: "Jo",
    service: "Cut",
    notes: "Note one"
  },
  {
    startsAt: date.setHours(10, 0, 0, 0),
    stylist: "Stevie",
    service: "Cut & color",
    notes: "Note two"
  }
];
const customer = {
  firstName: "Ashley",
  lastName: "Jones",
  phoneNumber: "123",
  appointments
};

const mockGraphql = mock.fn(() => new Promise(resolve =>{
  setTimeout(() => resolve({data:{customer}}), 100)  
}))
const mockGraphqlErr = mock.fn(() => Promise.reject(new Error("failed")));
const mockModule = mock.module("../src/amplifyClient.js", {
  namedExports: {
    amplifyClient: { graphql: mockGraphql }
  }
});

after(()=>{
  mockModule.restore();
})

describe("CustomerHistoryRoute", () => {
  afterEach(()=>{
    mockGraphql.mock.resetCalls();
  })
  it("calls amplify.graphql", async () => {
    const {store} = await import('../src/store.js')
    const { CustomerHistoryRoute } = await import('../src/CustomerHistoryRouteRedux.js')
    render (
      <Provider store={store}>
        <MemoryRouter initialEntries={["/?customer=123"]}>
          <CustomerHistoryRoute />
        </MemoryRouter>)
      </Provider>);
    await waitFor(async ()=>{
      const count = mockGraphql.mock.callCount();
      assert.strictEqual(count, 1, 'expect graphql called')
      const actual = mockGraphql.mock.calls[count-1].arguments as any[]
      assert.deepEqual(actual[0].variables, { id: '123' })
    })
  });
  it("displays a loading message", async () => {
    const {store} = await import('../src/store.js')
    const { CustomerHistoryRoute } = await import('../src/CustomerHistoryRouteRedux.js')
    render (
      <Provider store={store}>
        <MemoryRouter initialEntries={["/?customer=123"]}>
          <CustomerHistoryRoute />
        </MemoryRouter>)
      </Provider>);
    const element = await screen.findAllByText<HTMLElement>(/Loading/i)
    const [actual] = Array.from(element, (el)=> el.textContent)
    assert.strictEqual(actual, 'Loading', 'expect to find a loading message')
  });
  it("renders CustomerHistoryRoute", async () => {
    const {store} = await import('../src/store.js')
    const { CustomerHistoryRoute } = await import('../src/CustomerHistoryRouteRedux.js')
    render (
      <Provider store={store}>
        <MemoryRouter initialEntries={["/?customer=1023"]}>
          <CustomerHistoryRoute />
        </MemoryRouter>)
      </Provider>);
    await waitFor(async ()=>{
      const count = mockGraphql.mock.callCount();
      assert.strictEqual(count, 1, 'expect graphql called')
      const actual = mockGraphql.mock.calls[count-1].arguments as any[]
      assert.deepEqual(actual[0].variables, { id: '1023' }, 'expect id 1023 passed to graphql')
      const result = await mockGraphql.mock.calls[count-1].result
      assert.deepEqual((result as any).data.customer, customer, 'expect graphql return customer')
    })
    await waitFor(()=>{
      const element = screen.queryAllByText<HTMLTableCellElement>(/\bnote\b/i)
      const actual2 = Array.from(element, (el)=> el.textContent)
      assert.deepEqual(actual2, ["Note one", "Note two"],'expect two notes')
    })
  });
  it("cancels the render on unmount", async () => {
    const {store} = await import('../src/store.js')
    const { CustomerHistoryRoute } = await import('../src/CustomerHistoryRouteRedux.js')
    const result = render (
      <Provider store={store}>
        <MemoryRouter initialEntries={["/?customer=1023"]}>
          <CustomerHistoryRoute />
        </MemoryRouter>)
      </Provider>);
    result.unmount()
    const element = await waitFor(()=>screen.queryByText<HTMLTableCellElement>(/\bnote\b/i))
    assert.strictEqual(element, null, 'expect render cancelled before data')
    await waitFor(async ()=>{
      const count = mockGraphql.mock.callCount();
      assert.strictEqual(count, 1, 'expect graphql called')
      const actual = mockGraphql.mock.calls[count-1].arguments as any[]
      assert.deepEqual(actual[0].variables, { id: '1023' }, 'expect id 1023 passed to graphql')
      const mockResult = await mockGraphql.mock.calls[count-1].result
      assert.deepEqual((mockResult as any).data.customer, customer, 'expect graphql return customer')
    })
  });
});