import { afterEach, beforeEach, describe, it, mock} from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup.ts"; // must be imported before render/screen
import * as React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { Customer } from "../src/types.js";


const today = new Date(2018, 11, 1);
const originalFetch = globalThis.fetch;
const mockFetchOk = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(args) });
const mockFetchError = (...args: any[]) => Promise.resolve({ ok: false });

beforeEach( async () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})

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
    firstName: "ASDF",
    lastName: "BNM",
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
  Array.from("0123456789", (_, id) => ({ id })
  );
const anotherTenCustomers: any[] =
  Array.from("ABCDEFGHIJ", id => ({ id }));

const mockFetchOkFactory = (...customersVariadic: Customer[][]) => {
  let mutableCopy = [...customersVariadic]
  return (...args: string[]) => {
    let currentPageCustomers: Customer[] = mutableCopy.shift() as Customer[]
    return Promise.resolve({ ok: true, json: () => Promise.resolve(currentPageCustomers) })
}};

const mockFetchCustomers = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve([])});

describe('CustomerSearchRoute', ()=>{
  it('renders CustomerSearch initially and retrieves customers', async ()=>{
    const mockFetch = mock.method(globalThis, 'fetch', mockFetchOkFactory(twoCustomers))
    const {CustomerSearchRoute} = await import('../src/CustomerSearchRoute.tsx')
    render(
      <MemoryRouter initialEntries={["/searchCustomers?searchTerm=qwe&limit=11&lastRowIds=123,654"]}>
        <CustomerSearchRoute renderCustomerActions={()=><></>} navigate={()=>{}}/>
      </MemoryRouter>
    );
    await waitFor(()=>{screen.getByLabelText('customer search table')})
    const count = mockFetch.mock.callCount()
    assert.strictEqual(count, 1, 'globalFetch mock not called 1 time')
    assert.strictEqual(screen.getByText('BNM').tagName, 'TD')
  })
})