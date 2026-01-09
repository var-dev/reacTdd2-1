import { afterEach, beforeEach, describe, it, mock } from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup"; // must be imported before render/screen
import * as React from "react";
import { act } from "react";

import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Customer } from "../src/appointmentsDayView";
import {CustomerForm, CustomerFormProps} from "../src/customerForm";

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
})
const originalProps: CustomerFormProps = {
  customer: { firstName: "Jane", lastName: "Doe", phoneNumber: "555-1234" }
}

describe('CustomerForm tests using render and screen', ()=>{
  it("types into firstName", async () => {
    const customer = originalProps.customer
    render(<CustomerForm customer={customer}/>)
    const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Jamie")
    assert.equal(firstNameInput.value, "Jamie", 'Name should be Jamie, not Jane');
  })
    it("checks preventDefault to be true", async () => {
      const submitEvent = userEvent.setup();
      const mockOnSubmitHandler = mock.fn(({firstName}: Customer)=>{});
      const mockEventListenerHandler = mock.fn((e: Event) => {})
      render(
        <CustomerForm 
          customer={originalProps.customer}
          onSubmit={mockOnSubmitHandler}
        />
      )
      const form = screen.getByRole("form", { name: /customer/i });
      form.addEventListener("submit", mockEventListenerHandler);
      const submitButton = screen.getByRole('button', { name: /Add/i })
      
      await submitEvent.click(submitButton)
  
      assert.strictEqual(mockEventListenerHandler.mock.calls.length, 1, `mockEventListenerHandler was called ${mockEventListenerHandler.mock.calls.length} times instead of 1 time`);;
      assert.strictEqual(mockEventListenerHandler.mock.calls[0].arguments[0].type, "submit", 'Event is not of Submit type');
      assert.strictEqual(mockEventListenerHandler.mock.calls[0].arguments[0].defaultPrevented, true, 'PreventDefault was not set correctly');
      assert.strictEqual(mockOnSubmitHandler.mock.calls.length, 1, `mockOnSubmitHandler was called ${mockOnSubmitHandler.mock.calls.length} times instead of 1 time`);;
    })
})