import { it, describe, mock, beforeEach, afterEach } from 'node:test';
import './domSetup.js'
import assert from 'node:assert';
import { store } from '../src/store.js';
import {
  addCustomerRequest,
  addCustomerSubmitting,
  addCustomerSuccessful,
  addCustomerFailed,
  addCustomerValidationFailed,
} from '../src/customerSlice.js';
import type { Customer } from '../src/types.js';
import { waitFor } from '@testing-library/react';

const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})


const mockFetchReturn = (returnedValue: any, response: {ok:boolean, status: number} = {ok:true, status: 201}, ) => {
  return (...args: any[]) => {
    // console.log('Mock fetch called with:', args);
    return Promise.resolve({ 
      ok: response.ok, 
      status: response.status,
      json: () => {
        // console.log('Mock json() called, returning:', returnedValue);
        return Promise.resolve(returnedValue);
      }
    });
  };
};

describe('Store dispatching', () => {
  it('dispatches addCustomerSubmitting action', async () => {
    store.dispatch(addCustomerSubmitting());
    const state = store.getState();
    assert.strictEqual(state.customer.status, 'SUBMITTING');
  })
  it('dispatches addCustomerSuccessful action', () => {
    const customer: Customer = { firstName: 'John', lastName: 'Doe' };
    store.dispatch(addCustomerSuccessful({ customer }));
    const state = store.getState();
    assert.strictEqual(state.customer.status, 'SUCCESSFUL');
    assert.strictEqual(state.customer.firstName, customer.firstName, 'expected customer first name');
  });

  it('dispatches addCustomerFailed action', () => {
    store.dispatch(addCustomerFailed());
    const state = store.getState();
    assert.strictEqual(state.customer.status, 'FAILED');
    assert.strictEqual(state.customer.error, true);
  });

  it('dispatches addCustomerValidationFailed action', () => {
    const validationErrors = { firstName: 'Required' };
    store.dispatch(addCustomerValidationFailed({ validationErrors }));
    const state = store.getState();
    assert.strictEqual(state.customer.status, 'VALIDATION_FAILED');
    assert.deepStrictEqual(state.customer.validationErrors, validationErrors);
  });

  it('mock dispatches addCustomerValidationFailed', ()=>{
    const validationErrors = { firstName: 'Required' };
    const mockDispatch = mock.method(store, 'dispatch', (arg: any)=>{})
    mockDispatch(addCustomerValidationFailed({ validationErrors }));
    assert.strictEqual(mockDispatch.mock.callCount(), 1, 'mockDispatch should be called 1 time')
    const actual = mockDispatch.mock.calls[0].arguments[0]
    assert.strictEqual(actual.type, addCustomerValidationFailed({ validationErrors }).type,'expected customer/addCustomerValidationFailed')
    mockDispatch.mock.restore()
  })
});

describe('addCustomerSaga with mockFetch', ()=>{
    const inputCustomer = { firstName: "Ashley" };
    const outputCustomer = { id:456 };
  it('dispatches addCustomerRequest action', async () => {
    const mockFetch = mock.method(globalThis,'fetch',mockFetchReturn(outputCustomer))
    store.dispatch(addCustomerRequest({}));
    
    await waitFor(()=>{
      assert.strictEqual(mockFetch.mock.callCount(), 1)
      assert.strictEqual(mockFetch.mock.calls[0].arguments[0], '/customers', 'expected fetch to be called with /customers')
    })
    mockFetch.mock.restore()
  });
  it("calls fetch with correct configuration", async () =>{
    const mockFetch = mock.method(globalThis,'fetch',mockFetchReturn(outputCustomer))
    store.dispatch(addCustomerRequest(inputCustomer));
    
    await waitFor(()=>{
      assert.strictEqual(mockFetch.mock.callCount(), 1)
      assert.strictEqual(mockFetch.mock.calls[0].arguments[0], '/customers', 'expected fetch to be called with /customers')

      const actual = JSON.stringify(mockFetch.mock.calls[0].arguments[1])
      assert.match(actual, /"method":"POST"/, 'expected method POST')
      assert.match(actual, /"credentials":"same-origin"/, 'expected credentials same-origin')
      assert.match(actual, /"Content-Type":"application\/json"/, 'expected Content-Type:"application/json"')
      assert.match(actual, /\\"firstName\\":\\"Ashley\\"/, 'expected Body')
    })
    const result = await (mockFetch.mock.calls[0].result)
    const json = result?.ok ? await result!.json() : {}
    assert.deepStrictEqual(json, outputCustomer, 'expected Customer object { id:456 }')
    mockFetch.mock.restore()
    const state = store.getState();
    await waitFor(()=>{assert.strictEqual(state.customer.status, 'SUCCESSFUL', 'it dispatches addCustomerSuccessful on success')})
  })
  it('dispatches addCustomerFailed if fetch fails', async () => {
    const mockFetch = mock.method(globalThis, 'fetch', () => Promise.resolve({ ok: false }));
    store.dispatch(addCustomerRequest(inputCustomer));
    await waitFor(()=>{assert.strictEqual(mockFetch.mock.callCount(), 1)})
    mockFetch.mock.restore()
    const state = store.getState();
    await waitFor(()=>{assert.strictEqual(state.customer.status, 'FAILED', 'expected dispatched addCustomerFailed on failure')})
  })
  it('dispatches addCustomerValidationFailed ', async () => {
    const errors = {field: "field",description: "error text"};
    const mockFetch = mock.method(globalThis,'fetch',mockFetchReturn(errors, {ok:false, status: 422}))
    store.dispatch(addCustomerRequest(inputCustomer));
    await waitFor(()=>{assert.strictEqual(mockFetch.mock.callCount(), 1)})
    const result = await (mockFetch.mock.calls[0].result)
    const json = result?.ok===false ? await result!.json() : {}
    const expected = { field: 'field', description: 'error text' }
    assert.deepStrictEqual(json, expected, "expected validation error object { field: 'field', description: 'error text' }")
    mockFetch.mock.restore()
    const state = store.getState();
    await waitFor(()=>{assert.strictEqual(state.customer.status, 'VALIDATION_FAILED', 'expected dispatched addCustomerValidationFailed')})
  })
})