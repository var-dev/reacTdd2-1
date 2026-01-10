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


const itRendersAsATextBox = (
  label: string
  ) =>it("renders as a text box with label", () => {
    render(<CustomerForm customer={originalProps.customer}/>)
    const textBoxInputElement = screen.getByLabelText(label) as HTMLInputElement;

    assert.ok(textBoxInputElement instanceof HTMLInputElement, 'It should be instance of HTMLInputElement')
  });

const itIncludesTheExistingValue = (
  label: string,
  existing: string
  ) => it("includes the existing value", () => {
    render(<CustomerForm customer={originalProps.customer}/>)
    const textBoxInputElement = screen.getByLabelText(label) as HTMLInputElement;

    assert.strictEqual(textBoxInputElement.value, existing, `It should be ${existing}`)
  });

const itSavesExistingValueWhenSubmitted = (
  key: keyof Customer,
  value: string
  ) => it("saves existing value when submitted", async () => {
    const submitEvent = userEvent.setup();
    const mockOnSubmitHandler = mock.fn((customer: Customer)=>{});
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
    assert.strictEqual(mockOnSubmitHandler.mock.calls.length, 1, `mockOnSubmitHandler was called ${mockOnSubmitHandler.mock.calls.length} times instead of 1 time`);
    assert.strictEqual(mockOnSubmitHandler.mock.calls[0].arguments[0][key], value, `Object[${key}] value is not ${value}`);
  })

const itSavesNewValueWhenSubmitted = (
  label: string,
  key: keyof Customer,
  newValue: string
  ) => it("saves new value when submitted", async () => {
    const submitEvent = userEvent.setup();
    const mockOnSubmitHandler = mock.fn((customer: Customer)=>{});
    render(
      <CustomerForm 
        customer={originalProps.customer}
        onSubmit={mockOnSubmitHandler}
      />
    )
    const submitButton = screen.getByRole('button', { name: /Add/i })
    const textBoxInputElement = screen.getByLabelText(label) as HTMLInputElement;
    await userEvent.clear(textBoxInputElement);
    await userEvent.type(textBoxInputElement, newValue)
    await submitEvent.click(submitButton)

    assert.strictEqual(mockOnSubmitHandler.mock.calls.length, 1, `mockOnSubmitHandler was called ${mockOnSubmitHandler.mock.calls.length} times instead of 1 time`);
    assert.strictEqual(mockOnSubmitHandler.mock.calls[0].arguments[0][key], newValue, `Object[${key}] value is not ${newValue}`);
  })

describe("first name field", () => {
  itRendersAsATextBox('First Name');
  itIncludesTheExistingValue('First Name', 'Jane');
  itSavesExistingValueWhenSubmitted('firstName', 'Jane');
  itSavesNewValueWhenSubmitted('First Name', 'firstName', 'Jamie');
});

describe("last name field", () => {
  itRendersAsATextBox('Last Name');
  itIncludesTheExistingValue('Last Name', 'Doe');
  itSavesExistingValueWhenSubmitted('lastName', 'Doe');
  itSavesNewValueWhenSubmitted('Last Name', 'lastName', 'Doh');
});

describe("phone number field", () => {
  itRendersAsATextBox('Phone Number');
  itIncludesTheExistingValue('Phone Number', '555-1234');
  itSavesExistingValueWhenSubmitted('phoneNumber', '555-1234');
  itSavesNewValueWhenSubmitted('Phone Number', 'phoneNumber', '555-1239');
});