import { after, afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from 'node:assert/strict';
import "./domSetup"; // must be imported before render/screen
import React, { ReactElement} from "react";
import { MemoryRouter } from "react-router";
import { render, screen, cleanup, within, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Customer, AppointmentApi } from "../src/types.js";

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
const sendCustomer = ({ next }: {next: any}) => {
  setTimeout(() => {
    next({ customer });
  }, 100);
  return { unsubscribe: mockUnsubscribe };
};
const mockFetchQuery = mock.fn(()=>({subscribe: sendCustomer}))
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
  it("calls fetchQuery", async () => {
    const {CustomerHistory} = await import('../src/CustomerHistory.js')
    render(<CustomerHistory id={123}/>)
    await waitFor(async ()=>{
      const count = mockFetchQuery.mock.callCount();
      assert.strictEqual(count, 1, 'expect fetchQuery called')
      const actual = mockFetchQuery.mock.calls[count-1].arguments
      assert.deepEqual(actual, [environment, 'GraphQL', {id:123}])
    })
  });
  it("unsubscribes when id changes", async () => {
    const {CustomerHistory} = await import('../src/CustomerHistory.js')
    const {rerender} = render(<CustomerHistory id={123}/>)
    // await waitFor(async ()=>{rerender(<CustomerHistory id={456}/>)})
    await waitFor(async ()=>{
      const count = mockUnsubscribe.mock.callCount();
      assert.strictEqual(count, 1, 'expect unsubscribe called on element unmounting')
    })
  });
  it("renders the first name and last name together in a h2", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistory.js')
    render(<CustomerHistory id={123} />);
    const elementH2 = await screen.findByText<HTMLHeadingElement>(/ashley jones/i)
    const elementP = await screen.findByText<HTMLParagraphElement>(/123/i)
    const elementH3 = await screen.findByText<HTMLHeadingElement>(/booked appointments/i)
    assert.strictEqual(elementH2.tagName, 'H2', 'expect to find the customer\'s full name <H2></H2>')
    assert.strictEqual(elementP.tagName, 'P', 'expect to find the customer\'s phone number <P></P>')
    assert.strictEqual(elementH3.tagName, 'H3', 'expect to find the appointments header <H3></H3>')
  });
  it("renders a table with four column headings", async ()=>{
    const { CustomerHistory } = await import('../src/CustomerHistory.js')
    render(<CustomerHistory id={123} />);
    const columnHeadings = await screen.findAllByRole('columnheader');
    const headings = Array.from(columnHeadings, (element)=> element.textContent)
    assert.deepEqual(headings, ['When','Stylist','Service','Notes'], 'expect to find four column headings')
  })
  it("renders the start time of each appointment in the correct format", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistory.js')
    render (<CustomerHistory id={123} />);
    const element = await screen.findAllByText<HTMLTableCellElement>(/Feb 16 2019/i)
    const actual = Array.from(element, (el)=> el.textContent)
  //   "Sat Feb 16 2019 09:00",
  //   "Sat Feb 16 2019 10:00",
    assert.deepEqual(actual, ["Sat Feb 16 2019 09:00", "Sat Feb 16 2019 10:00"],'expect two dates')
  });
  it("renders the stylist", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistory.js')
    render (<CustomerHistory id={123} />);
    const element = await screen.findAllByText<HTMLTableCellElement>(/\bJo\b|Stevie/i)
    const actual = Array.from(element, (el)=> el.textContent)
    assert.deepEqual(actual, ["Jo", "Stevie"],'expect two stylists')
  });
  it("renders the service", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistory.js')
    render (<CustomerHistory id={123} />);
    const element = await screen.findAllByText<HTMLTableCellElement>(/Cut/i)
    const actual = Array.from(element, (el)=> el.textContent)
    assert.deepEqual(actual, ["Cut", "Cut & color"],'expect two services')
  });
  it("renders the note", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistory.js')
    render (<CustomerHistory id={123} />);
    const element = await screen.findAllByText<HTMLTableCellElement>(/\bnote\b/i)
    const actual = Array.from(element, (el)=> el.textContent)
    assert.deepEqual(actual, ["Note one", "Note two"],'expect two notes')
  });
  it("displays a loading message", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistory.js')
    render (<CustomerHistory id={123} />);
    const element = await screen.findAllByText<HTMLElement>(/Loading/i)
    const [actual] = Array.from(element, (el)=> el.textContent)
    assert.strictEqual(actual, 'Loading', 'expect to find a loading message')
  });
});