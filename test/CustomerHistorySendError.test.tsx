import { after, afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from 'node:assert/strict';
import "./domSetup"; // must be imported before render/screen
import React from 'react'
import { render, screen, cleanup, within, waitFor, act, waitForElementToBeRemoved } from "@testing-library/react";

import type { AppointmentApi } from "../src/types.js";

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
const mockUnsubscribe = mock.fn();
const sendError = ({ error }: {error: any}) => {
  // error();
  setTimeout(() => {
    error();
  }, 100);
  return { unsubscribe: mockUnsubscribe };
};
const mockFetchQuery = mock.fn(()=>({subscribe: sendError}))
const environment = { a: 123 };
const network = { b: 234 };
const store = { c: 345 };
const recordSource = { d: 456 };

const EnvironmentMock = mock.fn(function Environment(config) {return environment;});
const StoreMock = mock.fn(function Store(recordSource) {return store;});
const RecordSourceMock = mock.fn(function RecordSource() {return recordSource;});
const NetworkCreateMock = mock.fn(() => network);

const { Network, Store, RecordSource,} = await import('relay-runtime')
const mockModule = mock.module("relay-runtime", {
  namedExports: {
    Environment: EnvironmentMock,
    Network,
    Store,
    RecordSource,
    fetchQuery: mockFetchQuery,
    graphql: ()=>'GraphQL',
  }
});

after(()=>{
  mockModule.restore();
})

describe("CustomerHistory", () => {
  afterEach(()=>{
    mockFetchQuery.mock.resetCalls();
  })
  it("displays an error message", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistory.js')
    render (<CustomerHistory id={123} />);
    await waitForElementToBeRemoved( ()=>screen.getByText(/Loading/i))
    const element = await screen.findAllByText<HTMLElement>(/Sorry/i)
    const [actual] = Array.from(element, (el)=> el.textContent)
    assert.strictEqual(actual, 'Sorry, an error occurred while pulling data from the server.', 'expect error fetch message')
  });
});