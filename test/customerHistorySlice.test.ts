import { describe, it } from "node:test";
import assert from "node:assert/strict";

import customerHistoryReducer, {
  getCustomerHistoryRequesting,
  getCustomerHistorySuccessful,
  getCustomerHistoryFailed,
  type CustomerHistory,
  type CustomerHistoryState,
} from "../src/customerHistorySlice.js";

export const itMaintainsExistingState = (reducer: Function, action: any) => {
  it("maintains existing state", () => {
    assert.equal(reducer({ customer: { id: 123 } }, action).customer.id, 123);
  });
};
export const itSetsStatus = (reducer: Function, action: any, value: string) => {
  it(`sets status to ${value}`, () => {
    assert.equal(reducer(undefined, action).status, value);
  });
}

describe("customerHistory slice", () => {
  it("should return the initial state", () => {
    assert.deepStrictEqual(customerHistoryReducer(undefined, { type: "" }), {});
  });
});

describe("getCustomerHistoryRequesting action", () => {
  const action = getCustomerHistoryRequesting();
  it("sets status to REQUESTING", () => {
    assert.equal(customerHistoryReducer(undefined, action).status, 'REQUESTING');
  });
});

describe("getCustomerHistorySuccessful action", () => {
  const customerHistory: CustomerHistory = { firstName: 'Ashley' };
  const action = getCustomerHistorySuccessful(customerHistory);
  it("sets status to SUCCESSFUL", () => {
    assert.deepStrictEqual(
      customerHistoryReducer(undefined, action),
      { firstName: 'Ashley', status: 'SUCCESSFUL', error: false }
    );
  });
});

describe("getCustomerHistoryFailed action", () => {
  const action = getCustomerHistoryFailed();
  it("sets status to FAILED", () => {
    assert.deepStrictEqual(
      customerHistoryReducer(undefined, action),
      { status: 'FAILED', error: true });
  });
});
