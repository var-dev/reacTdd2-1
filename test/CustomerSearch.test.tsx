import { afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from 'node:assert/strict';

import "./domSetup"; // must be imported before render/screen
import React from "react";
import { render, screen, cleanup, within, waitFor, waitForElementToBeRemoved, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Customer } from "../src/types.js";
import {CustomerSearch} from '../src/CustomerSearch.js'

const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})
const testProps = {
}
const mockFetchOk = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(args) });
const mockFetchOkFactory = (...customersVariadic: Customer[][]) => {
  let mutableCopy = [...customersVariadic]
  return (...args: any[]) => {
    const currentPageCustomers: Customer[] = mutableCopy.shift() as Customer[]
    return Promise.resolve({ ok: true, json: () => Promise.resolve(currentPageCustomers) })
}};

const oneCustomer: Customer[] = [
  {
    id: 1,
    firstName: "A",
    lastName: "B",
    phoneNumber: "1"
  },
];
const twoCustomers = [
  {
    id: 1,
    firstName: "A",
    lastName: "B",
    phoneNumber: "1"
  },
  {
    id: 2,
    firstName: "C",
    lastName: "D",
    phoneNumber: "2"
  }
];
const tenCustomers: Customer[] =
  Array.from("0123456789", (id) => ({ id })
  );
const anotherTenCustomers: Customer[] =
  Array.from("ABCDEFGHIJ", id => ({ id }));

describe('CustomerSearch', async () => {
  it("renders a table with four headings", async () => {
    mock.method(global,'fetch', mockFetchOk)
    render (<CustomerSearch />);
    const table = await waitFor(()=>screen.getByLabelText<HTMLTableElement>(/customer search table/))
    const headings = within(table).getAllByRole("columnheader");
    const headingsArray = Array.from(headings).map((h) => h.textContent)
    const expected = [
      "First name",
      "Last name",
      "Phone number",
      "Actions",
    ]
    assert.deepEqual(headingsArray, expected, `Expected result is different from ${JSON.stringify(headingsArray)}`);
  });
  it("fetches all customer data when component mounts", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchOk)
    render(<CustomerSearch />);
    await waitFor(()=>screen.getByLabelText<HTMLTableElement>(/customer search table/))

    assert.ok(mockFetch.mock.callCount() === 1, `mockFetchOk is not called once, but ${mockFetch.mock.callCount()}`)
    const expected = ["/customers", {
      method: "GET",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" }
    }]
    const actual = [mockFetch.mock.calls[0].arguments[0], await mockFetch.mock.calls[0].arguments[1]]
    
    assert.deepStrictEqual(actual, expected, `Expected Fetch arguments different from ${JSON.stringify(actual)}`);
  });
  it("renders all customer data in a table row", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchOkFactory(twoCustomers))
    render(<CustomerSearch />);
    const table = await waitFor(()=>screen.getByLabelText<HTMLTableElement>(/customer search table/))
    const [theadRowGroup, tbodyRowGroup] = within(table).getAllByRole<HTMLTableRowElement>("rowgroup")
    const tableRows = within(tbodyRowGroup).getAllByRole('row');
    const tableCellsRow0 = within(tableRows[0]).getAllByRole('cell');
    const cellsRow0 = Array.from(tableCellsRow0).map((cell) => cell.textContent)
    const tableCellsRow1 = within(tableRows[1]).getAllByRole('cell');
    const cellsRow1 = Array.from(tableCellsRow1).map((cell) => cell.textContent)

    assert.deepStrictEqual(cellsRow0, ['A', 'B', '1', ''], `Row 0 should be ['A', 'B', '1', ''] but got: ${JSON.stringify(cellsRow0)}`)
    assert.deepStrictEqual(cellsRow1, ['C', 'D', '2', ''], `Row 1 should be ['C', 'D', '2', ''] but got: ${JSON.stringify(cellsRow1)}`)
  });
  it('has a Next button', async ()=>{
    mock.method(global,'fetch', mockFetchOkFactory(twoCustomers))
    render(<CustomerSearch />);
    const button = await waitFor(()=>screen.getByRole('button', {name: /next/i}))
    assert.ok(button.tagName === 'BUTTON', 'Next button not found')
  })
  it('requests next page of data when next button is clicked', async ()=>{
    const mockFetch = mock.method(global,'fetch', mockFetchOkFactory(tenCustomers))
    render(<CustomerSearch />);
    const button = await waitFor(()=>screen.getByRole('button', {name: /next/i}))
    await userEvent.click(button)
    const fetchCallsCounter = mockFetch.mock.callCount()

    assert.ok(fetchCallsCounter === 2, `Expected fetch to be called twice, but it was called ${fetchCallsCounter} times`)
    const actual = mockFetch.mock.calls[fetchCallsCounter-1].arguments[0]
    const expected = '/customers?after=9'
    
    assert.strictEqual(actual, expected, `Expected Fetch URL '/customers?after=9'`);
  })
  it("displays next page of data when Next button is clicked", async () => {
    const nextCustomer: Customer[] = [{ id: 99, firstName: "NextPageCustomerName"}];
    const mockFetch = mock.method(global,'fetch', mockFetchOkFactory(tenCustomers, nextCustomer))
    render(<CustomerSearch />);
    const button = await waitFor(()=>screen.getByRole('button', {name: /next/i}))

    assert.ok(mockFetch.mock.callCount() === 1, `Expected fetch to be called one time, but it was called ${mockFetch.mock.callCount()} times`)
    const actualResultOne = mockFetch.mock.calls[0].result
    assert.deepStrictEqual(await (await actualResultOne)?.json(),[
      { id: '0' }, { id: '1' },
      { id: '2' }, { id: '3' },
      { id: '4' }, { id: '5' },
      { id: '6' }, { id: '7' },
      { id: '8' }, { id: '9' }
    ], `Expected mockFetch returns first page of customers`)

    await userEvent.click(button)

    assert.ok(mockFetch.mock.callCount() === 2, `Expected fetch to be called twice, but it was called ${mockFetch.mock.callCount()} times`)
    const actualResultPage2 = mockFetch.mock.calls[1].result
    assert.deepStrictEqual(await (await actualResultPage2)?.json(),[ { id: 99, firstName: 'NextPageCustomerName' } ], `Expected mockFetch returns second page of customers`)

    const table = await waitFor(()=>screen.getByLabelText<HTMLTableElement>(/customer search table/))
    const next = within(table).getByText(/NextPageCustomerName/i)
    assert.ok(next.tagName==='TD', 'Next customer not found in the table')
  })
  it("has a previous button", async () => {
    mock.method(global,'fetch', mockFetchOkFactory(oneCustomer))
    render(<CustomerSearch />);
    const button = await waitFor(()=>screen.getByRole('button', {name: /previous/i}))

    assert.ok(button.tagName === 'BUTTON', 'Previous button not found')
  })
  it("moves back to first page when previous button is clicked", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchOkFactory(tenCustomers, anotherTenCustomers, oneCustomer))
    render(<CustomerSearch />);
    const buttonNext = await waitFor(()=>screen.getByRole('button', {name: /next/i}))
    const buttonPrev = await waitFor(()=>screen.getByRole('button', {name: /previous/i}))

    assert.ok(buttonNext.tagName === 'BUTTON', 'Next button not found')
    assert.ok(buttonPrev.tagName === 'BUTTON', 'Previous button not found')
    await userEvent.click(buttonNext)
    await userEvent.click(buttonNext)
    await userEvent.click(buttonPrev)

    assert.ok(mockFetch.mock.callCount() === 4, `Expected fetch to be called four times, but it was called ${mockFetch.mock.callCount()} times`)

    const actual1 = mockFetch.mock.calls[1].arguments[0]
    const expected1 = '/customers?after=9'
    assert.strictEqual(actual1, expected1, `Expected Fetch URL '/customers?after=9'`);
    
    const actual2 = mockFetch.mock.calls[2].arguments[0]
    const expected2 = '/customers?after=J'
    assert.strictEqual(actual2, expected2, `Expected Fetch URL '/customers?after=J'`);

    const actual3 = mockFetch.mock.calls[3].arguments[0]
    const expected3 = '/customers?after=9'
    assert.strictEqual(actual3, expected3, `Expected Fetch URL '/customers?after=9'`);
  })
})