import { it, describe, mock } from 'node:test';
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
  it('dispatches addCustomerRequest action', async () => {
    const mockFetch = mock.method(globalThis,'fetch',(...params: any[])=>{})
    store.dispatch(addCustomerRequest({}));
    
    const state = store.getState();
    assert.strictEqual(state.customer.status, 'SUBMITTING');
    await waitFor(()=>{
      assert.strictEqual(mockFetch.mock.callCount(), 1)
      assert.strictEqual(mockFetch.mock.calls[0].arguments[0], '/customers', 'expected fetch to be called with /customers')
    })
  });
  it("calls fetch with correct configuration", async () =>{
    const mockFetch = mock.method(globalThis,'fetch',(...params: any[])=>{})
    const inputCustomer = { firstName: "Ashley" };
    store.dispatch(addCustomerRequest(inputCustomer));
    
    const state = store.getState();
    assert.strictEqual(state.customer.status, 'SUBMITTING');
    await waitFor(()=>{
      assert.strictEqual(mockFetch.mock.callCount(), 1)
      assert.strictEqual(mockFetch.mock.calls[0].arguments[0], '/customers', 'expected fetch to be called with /customers')

      const actual = JSON.stringify(mockFetch.mock.calls[0].arguments[1])
      assert.match(actual, /"method":"POST"/, 'expected method POST')
      assert.match(actual, /"credentials":"same-origin"/, 'expected credentials same-origin')
      assert.match(actual, /"Content-Type":"application\/json"/, 'expected Content-Type:"application/json"')
      assert.match(actual, /\\"firstName\\":\\"Ashley\\"/, 'expected Body')
    })
  })
})