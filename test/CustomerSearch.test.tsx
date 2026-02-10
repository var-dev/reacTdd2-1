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
const mockFetchOkFactory = (object: any) => (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(object) });

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
})