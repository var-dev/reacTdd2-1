import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { itMaintainsExistingState, itSetsStatus } from "../reducers/reducerGenerators.js";
import customerReducer, {
  addCustomerSubmitting,
  addCustomerSuccessful,
  addCustomerFailed,
  addCustomerValidationFailed,
} from "../../src/slices/customerSlice.js";

describe("customer slice", () => {
  it("should return the initial state", () => {
    assert.deepStrictEqual(customerReducer(undefined, { type: "" }), {});
  });
});

describe("addCustomerSubmitting action", () => {
  const action = addCustomerSubmitting();
  it("sets status to SUBMITTING", () => {
    assert.equal(customerReducer(undefined, action).status, 'SUBMITTING');
  });
  itMaintainsExistingState(customerReducer, action);
});

describe("addCustomerSuccessful action", () => {
  const customer = { id: 123 };
  const action = addCustomerSuccessful({ customer });
  it("sets status to SUCCESSFUL", () => {
    assert.equal(customerReducer(undefined, action).status, 'SUCCESSFUL');
  });
  it("sets customer", () => {
    assert.strictEqual(customerReducer(undefined, action).id, 123);
  });
  itMaintainsExistingState(customerReducer, action);
  itSetsStatus(customerReducer, action, "SUCCESSFUL");
});

describe("addCustomerFailed action", () => {
  const action = addCustomerFailed();
  it("sets status to FAILED", () => {
    assert.equal(customerReducer(undefined, action).status, 'FAILED');
    assert.equal(customerReducer(undefined, action).error, true);
  });
  itMaintainsExistingState(customerReducer, action);
});

describe("addCustomerValidationFailed action", () => {
  const validationErrors = { field: "error text" };
  const action = addCustomerValidationFailed({ validationErrors });
  it("sets status to VALIDATION_FAILED", () => {
    assert.equal(customerReducer(undefined, action).status, 'VALIDATION_FAILED');
    assert.equal(customerReducer(undefined, action).validationErrors, validationErrors);
  });
  itMaintainsExistingState(customerReducer, action);
});