import { describe, it, beforeEach, afterEach, mock, after } from "node:test";
import assert from "assert/strict"
import "./domSetup.js"
import React, {useEffect, ReactElement} from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { configureStore, UnknownAction, Middleware } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { Provider, useDispatch } from "react-redux";
import type { GraphQLResult } from "aws-amplify/api";
import { getCustomerHistoryRequest, getCustomerHistoryRequesting, getCustomerHistorySuccessful, getCustomerHistoryFailed } from "../src/customerHistorySlice.js";
import { CustomerWithId, AppointmentApi } from "../src/types.js";
import customerHistoryReducer, { type CustomerHistory } from "../src/customerHistorySlice.js";

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
const customerHistory = {
  firstName: "Ashley",
  lastName: "Jones",
  phoneNumber: "123",
  appointments
};

const mockGraphql = mock.fn(() => new Promise(resolve =>{
  setTimeout(() => resolve({data: customerHistory }), 100)  
}))
const mockGraphqlErr = mock.fn(() => Promise.reject(new Error("failed")));
const mockModule = mock.module("../src/amplifyClient.js", {
  namedExports: {
    amplifyClient: { graphql: mockGraphql }
  }
});

const {rootSaga} = await import("../src/rootSaga.js")
const renderWithStore = (ui: ReactElement)=>{
  const actionLog: any[] = [];

  const actionLogger: Middleware = () => (next) => (action) => {
    actionLog.push(action);
    return next(action);
  };

  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      customerHistory: customerHistoryReducer
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

function AutoDispatch({ action }: { action: UnknownAction }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(action);
  }, [dispatch, action]);
  return null;
}

after(()=>{
  mockModule.restore();
})

describe("customerHistorySaga store dispatch", async () => {
    const { store, actionLog } = renderWithStore(
      <AutoDispatch action={getCustomerHistoryRequest(123)} />
    );
  it("sets current status to requesting", async () => {

    await waitFor(() => {
      assert.strictEqual(mockGraphql.mock.callCount(), 1, 'expect graphql to be called once')
      assert.ok(actionLog.length > 1, 'expect list of actions');
      assert.deepStrictEqual(actionLog[0], {payload: 123, type: 'customerHistory/getCustomerHistoryRequest'},'expect getCustomerHistoryRequest(123) action');
      assert.deepStrictEqual(actionLog[1], {payload: undefined, type: 'customerHistory/getCustomerHistoryRequesting'},'expect getCustomerHistoryRequesting() action');
    });
  })
  it("sets current status to successful", async () => {
    store.dispatch(getCustomerHistorySuccessful(customerHistory))
    await waitFor(() => {
      // assert.deepStrictEqual(actionLog[2], {type:'customer/addCustomerSuccessful', payload: {customer: {id:123}}},'expect addCustomerSuccessful() action');
      assert.deepStrictEqual(store.getState().customerHistory.status, "SUCCESSFUL", 'expect SUCCESSFUL');
    });

  })
});
describe('getCustomerHistory generator test', async ()=>{
  const {getCustomerHistorySaga, getCustomerHistoryWatcher} = await import('../src/customerHistorySaga.js')
  const initialAction = getCustomerHistoryRequest(123)
  const genW = getCustomerHistoryWatcher()
  const genS = getCustomerHistorySaga(initialAction)
  
  it('handles getCustomerHistoryWatcher generator yield', ()=>{
    const y = genW.next();
    assert.strictEqual((y.value as any).type, 'FORK', 'expect FORK for getCustomerHistoryRequest')
  })

  it('handles getCustomerHistorySaga generator first yield', ()=>{
    const y = genS.next();
    assert.strictEqual((y.value as any).type, 'PUT', 'expect PUT for getCustomerHistoryRequesting')
    assert.strictEqual((y.value as any).payload.action.type, 'customerHistory/getCustomerHistoryRequesting')
  })
  
  it('handles getCustomerHistorySaga generator 2 yield', async ()=>{
    const y = genS.next();
    assert.strictEqual((y.value as any).type, 'CALL', 'expect CALL fetchCustomerHistory')
    assert.strictEqual((y.value as any).payload.fn.name, 'fetchCustomerHistory', 'expect function fetchPost')
    assert.deepStrictEqual((y.value as any).payload.args, [123], 'expect fetchPost args ')
  })
  
  it('handles getCustomerHistorySaga generator 3 yield', ()=>{
    const mockResponse:GraphQLResult<{customer:CustomerHistory}> = {
      data: {customer: customerHistory}
    };
    const y = genS.next(mockResponse);
    assert.strictEqual((y.value as any).type, 'PUT', 'expect PUT for getCustomerHistorySuccessful')
    assert.strictEqual((y.value as any).payload.action.type, 'customerHistory/getCustomerHistorySuccessful', 'expect type getCustomerHistorySuccessful')
    assert.deepStrictEqual((y.value as any).payload.action.payload, customerHistory, 'expect  ')
  })
})

describe('getCustomerHistory generator error test', async ()=>{
  const {getCustomerHistorySaga, } = await import('../src/customerHistorySaga.js')
  const initialAction = getCustomerHistoryRequest(123)
  const genS = getCustomerHistorySaga(initialAction)

  it('returns getCustomerHistoryFailed', ()=>{
    const mockResponse = {
      errors: [{ message: "Test error" }]
    } as any;
    genS.next();
    genS.next();
    const y3 = genS.next(mockResponse);
    assert.strictEqual((y3.value as any).type, 'PUT', 'expect PUT for getCustomerHistoryFailed')
    assert.strictEqual((y3.value as any).payload.action.type, 'customerHistory/getCustomerHistoryFailed')
  })
})