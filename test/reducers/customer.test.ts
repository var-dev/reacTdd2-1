import { describe, it } from "node:test";
import assert from "node:assert/strict";

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
  it("maintains existing state", () => {
    assert.equal(reducer({customer:{id:123}}, action).customer.id, 123)
  });
});
describe("ADD_CUSTOMER_SUCCESSFUL action", () => {
  const customer = { id: 123 };
  const action = { type: "ADD_CUSTOMER_SUCCESSFUL", customer };
  it("sets status to SUBMITTING", () => {
    assert.equal(reducer(undefined, action).status, 'SUCCESSFUL')
  });
  it("maintains existing state", () => {
    assert.equal(reducer({customer:{id:123}}, action).customer.id, 123)
  });
  it("sets customer to provided customer", () => {
    assert.deepStrictEqual(reducer(undefined, action).customer, customer)
  })
});
describe("ADD_CUSTOMER_FAILED action", () => {
  const action = { type: "ADD_CUSTOMER_FAILED" };
  it("sets status to FAILED", () => {
    assert.equal(reducer(undefined, action).status, 'FAILED')
    assert.equal(reducer(undefined, action).error, true)
  });
  it("maintains existing state", () => {
    assert.equal(reducer({customer:{id:123}}, action).customer.id, 123)
  });
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
  it("maintains existing state", () => {
    assert.equal(reducer({customer:{id:123}}, action).customer.id, 123)
  });
});