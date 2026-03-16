import { it, describe, mock } from 'node:test';
import assert from 'node:assert';
import { store } from '../src/store.js';
import {
  addCustomerSubmitting,
  addCustomerSuccessful,
  addCustomerFailed,
  addCustomerValidationFailed,
} from '../src/slices/customerSlice.js';
import type { Customer } from '../src/types.js';

describe.skip('Store dispatching', () => {
  it('dispatches addCustomerSubmitting action', () => {
    store.dispatch(addCustomerSubmitting());
    
    const state = store.getState();
    assert.strictEqual(state.customer.status, 'SUBMITTING');
  });

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