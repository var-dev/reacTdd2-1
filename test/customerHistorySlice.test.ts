import { describe, it } from "node:test";
import assert from "node:assert/strict";

import customerHistoryReducer, {
  getCustomerHistoryRequest,
  getCustomerHistoryRequesting,
  getCustomerHistorySuccessful,
  getCustomerHistoryFailed,
  type CustomerHistory,
  type CustomerHistoryState,
} from "../src/customerHistorySlice.js";

describe("customerHistory slice", () => {
  it("should return the initial state", () => {
    assert.deepStrictEqual(customerHistoryReducer(undefined, { type: "" }), {});
  });
});

describe("getCustomerHistoryRequest action", () => {
  const action = getCustomerHistoryRequest(123);
  it("triggers saga and supplies id", () => {
    assert.deepStrictEqual(action.payload, 123);
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
