import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "assert/strict"
import "./domSetup.js"
import React, {useEffect, ReactElement} from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { configureStore, UnknownAction, Middleware } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { Provider, useDispatch } from "react-redux";

import { rootSaga } from "../src/rootSaga.js";
import { addCustomerRequest, addCustomerSubmitting, addCustomerSuccessful } from "../src/customerSlice.js";
import customerReducer from "../src/customerSlice.js";
import { addCustomer } from "../src/customerSaga.js";
import { CustomerWithId } from "../src/types.js";

function renderWithStore(ui: ReactElement) {
  const actionLog: any[] = [];

  const actionLogger: Middleware = () => (next) => (action) => {
    actionLog.push(action);
    return next(action);
  };

  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      customer: customerReducer
    },
    middleware: getDefault =>
      getDefault({
        thunk: false,
        immutableCheck: false,
        serializableCheck: false
      }).concat(actionLogger, sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);

  return {
    store,
    actionLog,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}


const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})

const mockFetchOk = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(args) });
const mockFetchError = (...args: any[]) => Promise.resolve({ ok: false });

function AutoDispatch({ action }: { action: UnknownAction }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(action);
  }, [dispatch, action]);
  return null;
}

describe("addCustomer", async () => {
    const mockFetch = mock.method(globalThis, 'fetch', mockFetchOk);
    const { store, actionLog } = renderWithStore(
      <AutoDispatch action={addCustomerRequest({})} />
    );
  it("sets current status to submitting", async () => {

    await waitFor(() => {
      assert.strictEqual(mockFetch.mock.callCount(), 1, 'expect fetch to be called once')
      assert.ok(actionLog.length > 1, 'expect list of actions');
      assert.deepStrictEqual(actionLog[0], addCustomerRequest({}),'expect addCustomerRequest() action');
      assert.deepStrictEqual(actionLog[1], addCustomerSubmitting(),'expect addCustomerSubmitting() action');
    });
  })
  it("sets current status to successful", async () => {
    const aCustomer = {customer: {id:123}}
    store.dispatch(addCustomerSuccessful(aCustomer))
    await waitFor(() => {
      // assert.deepStrictEqual(actionLog[2], {type:'customer/addCustomerSuccessful', payload: {customer: {id:123}}},'expect addCustomerSuccessful() action');
      assert.deepStrictEqual(store.getState().customer.status, "SUCCESSFUL", 'expect SUCCESSFUL');
    });

  })
});
describe('addCustomer generator test', ()=>{
  const mockFetch = mock.method(globalThis, 'fetch', mockFetchOk);
  const customer = {id: 123, firstName: 'John',};
  const gen = addCustomer({payload: customer})
  
  it('handles addCustomer generator first yield', ()=>{
    const y = gen.next();
    assert.strictEqual((y.value as any).type, 'PUT', 'expect PUT')
    assert.strictEqual((y.value as any).payload.action.type, 'customer/addCustomerSubmitting', 'expect customer/addCustomerSubmitting')
    assert.strictEqual((y.value as any).payload.action.payload, undefined, 'expect action.payload undefined')
  })
  
  it('handles addCustomer generator 2 yield', ()=>{
    const y = gen.next();
    assert.strictEqual((y.value as any).type, 'CALL', 'expect CALL for fetchPost')
    assert.deepStrictEqual((y.value as any).payload.args, ['/customers',customer], 'expect fetchPost args ')
    assert.strictEqual((y.value as any).payload.fn.name, 'fetchPost', 'expect function fetchPost')
  })
  
  it('handles addCustomer generator 3 yield', ()=>{
    const mockResponse = {
      ok: true, 
      json: () => Promise.resolve(customer)
    };
    const y = gen.next(mockResponse as unknown as Response);
    assert.strictEqual((y.value as any).type, 'CALL', 'expect CALL for json()')
    assert.deepStrictEqual((y.value as any).payload.args, [], 'expect no args for json()')
    assert.deepStrictEqual((y.value as any).payload.context, mockResponse, 'expect context to be the response object')
  })
  
  it('handles addCustomer generator 4 yield - after json call', ()=>{
    const y = (gen as any).next(customer); 
    assert.strictEqual((y.value as any).type, 'PUT', 'expect PUT for addCustomerSuccessful')
    assert.strictEqual((y.value as any).payload.action.type, 'customer/addCustomerSuccessful', 'expect addCustomerSuccessful action')
    assert.deepStrictEqual((y.value as any).payload.action.payload.customer, customer, 'expect customer data in payload')
  })
})

