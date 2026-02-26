import { afterEach, beforeEach, describe, it, mock} from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup.ts"; // must be imported before render/screen
import * as React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

beforeEach( async () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
})

const mockCustomerSearch = mock.fn((...props:any[])=>(<div data-testid="customerSearch"></div>))
const mModule = mock.module('../src/CustomerSearch/CustomerSearch.tsx',{
  namedExports:{
    CustomerSearch: mockCustomerSearch
  }
})
const {CustomerSearchRoute} = await import('../src/CustomerSearchRoute.js')
mModule.restore()

describe('CustomerSearchRoute', ()=>{
  it('renders mock without crashing', async ()=>{
    render(
      <MemoryRouter initialEntries={["/searchCustomers?searchTerm=qwe&limit=11&lastRowIds=123,654"]}>
        <CustomerSearchRoute renderCustomerActions={()=><></>} navigate={()=>{}}/>
      </MemoryRouter>
    );
    await waitFor(()=>{screen.getByTestId('customerSearch')})

    const count = mockCustomerSearch.mock.callCount()
    const actual = mockCustomerSearch.mock.calls[count-1].arguments[0]

    assert.strictEqual(typeof actual.renderCustomerActions, 'function', 'CustomerSearch renderCustomerActions not a function')
    assert.strictEqual(actual.searchTerm, 'qwe', 'CustomerSearch param searchTerm mismatch')
    assert.strictEqual(actual.limit, 11, 'CustomerSearch param limit mismatch')
    assert.deepStrictEqual(actual.lastRowIds, ['123','654'], 'CustomerSearch param lastRowIds mismatch')
  })
})