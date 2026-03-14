import { it } from "node:test";
import assert from "node:assert/strict";

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