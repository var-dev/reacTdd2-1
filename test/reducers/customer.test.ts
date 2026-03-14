import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { itMaintainsExistingState, itSetsStatus } from "./reducerGenerators.js";
import { reducer } from "../../src/reducers/customer.js";

describe("customer reducer", () => {
  const action = { type: "" };
  it("should return the initial state", () => {
    assert.equal(reducer(undefined, action).error, false);
  });
});
describe("ADD_CUSTOMER_SUBMITTING action", () => {
  const action = { type: "ADD_CUSTOMER_SUBMITTING" };
  it("sets status to SUBMITTING", () => {
    assert.equal(reducer(undefined, action).status, 'SUBMITTING')
  });
  itMaintainsExistingState(reducer, action)
});
describe("ADD_CUSTOMER_SUCCESSFUL action", () => {
  const customer = { id: 123 };
  const action = { type: "ADD_CUSTOMER_SUCCESSFUL", customer };
  it("sets status to SUBMITTING", () => {
    assert.equal(reducer(undefined, action).status, 'SUCCESSFUL')
  });
  itMaintainsExistingState(reducer, action)
  itSetsStatus(reducer, action, "SUCCESSFUL")
});
describe("ADD_CUSTOMER_FAILED action", () => {
  const action = { type: "ADD_CUSTOMER_FAILED" };
  it("sets status to FAILED", () => {
    assert.equal(reducer(undefined, action).status, 'FAILED')
    assert.equal(reducer(undefined, action).error, true)
  });
  itMaintainsExistingState(reducer, action)
});
describe("ADD_CUSTOMER_VALIDATION_FAILED action", () => {
  const validationErrors = { field: "error text" };
  const action = {
    type: "ADD_CUSTOMER_VALIDATION_FAILED",
    validationErrors,
  };
  it("sets status to VALIDATION_FAILED", () => {
    assert.equal(reducer(undefined, action).status, 'VALIDATION_FAILED')
    assert.equal(reducer(undefined, action).validationErrors, validationErrors)
  })
  itMaintainsExistingState(reducer, action)
});

