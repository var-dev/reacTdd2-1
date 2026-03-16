import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "assert/strict"
import "../domSetup.js"
import React, {useEffect, ReactElement} from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { put, takeLatest } from "redux-saga/effects";
import { configureStore, UnknownAction, Middleware } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { Provider, useDispatch } from "react-redux";

import { rootSaga } from "../../src/store.js";
import { addCustomerRequest, addCustomerSubmitting, addCustomerSuccessful } from "../../src/slices/customerSlice.js";
import customerReducer from "../../src/slices/customerSlice.js";


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
      <AutoDispatch action={addCustomerRequest()} />
    );
  it("sets current status to submitting", async () => {

    await waitFor(() => {
      assert.strictEqual(mockFetch.mock.callCount(), 1, 'expect fetch to be called once')
      assert.strictEqual(actionLog.length, 2, 'expect 2 actions');
      assert.deepStrictEqual(actionLog[0], addCustomerRequest(),'expect addCustomerRequest() action');
      assert.deepStrictEqual(actionLog[1], addCustomerSubmitting(),'expect addCustomerSubmitting() action');
      assert.deepStrictEqual(store.getState().customer.status, "SUBMITTING", 'expect SUBMITTING');
    });
  })
  it("sets current status to successful", async () => {
    const aCustomer = {customer: {id:123}}
    store.dispatch(addCustomerSuccessful(aCustomer))
    await waitFor(() => {
      assert.strictEqual(actionLog.length, 3, 'expect 3rd actions');
      assert.deepStrictEqual(actionLog[2], {type:'customer/addCustomerSuccessful', payload: {customer: {id:123}}},'expect addCustomerSuccessful() action');
      assert.deepStrictEqual(store.getState().customer.status, "SUCCESSFUL", 'expect SUCCESSFUL');
    });

  })
});

