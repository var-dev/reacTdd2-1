import { afterEach, beforeEach, describe, it, mock } from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup"; // must be imported before render/screen
import * as React from "react";
import { act } from "react";

import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Customer } from "../src/appointmentsDayView";
import {CustomerForm, CustomerFormProps as testProps} from "../src/customerForm";

const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})
const testProps = {
  customer: { firstName: "Jane", lastName: "Doe", phoneNumber: "555-1234" },
  onSave: (customer: Customer)=>{}
}
const mockFetchOk = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(args) });
const mockFetchError = (...args: any[]) => Promise.resolve({ ok: false });

describe('CustomerForm tests using render and screen', ()=>{
  it("types into firstName", async () => {
    render(<CustomerForm {...testProps}/>)
    const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Jamie")
    assert.equal(firstNameInput.value, "Jamie", 'Name should be Jamie, not Jane');
  })
  it("checks preventDefault to be true", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchOk)
    const submitEvent = userEvent.setup();
    const mockEventListenerHandler = mock.fn((e: Event) => {})
    render(
      <CustomerForm 
        {...testProps}
      />
    )
    const form = screen.getByRole("form", { name: /customer/i });
    form.addEventListener("submit", mockEventListenerHandler);
    const submitButton = screen.getByRole('button', { name: /Add/i })
    
    await submitEvent.click(submitButton)

    assert.strictEqual(mockEventListenerHandler.mock.calls.length, 1, `mockEventListenerHandler was called ${mockEventListenerHandler.mock.calls.length} times instead of 1 time`);;
    assert.strictEqual(mockEventListenerHandler.mock.calls[0].arguments[0].type, "submit", 'Event is not of Submit type');
    assert.strictEqual(mockEventListenerHandler.mock.calls[0].arguments[0].defaultPrevented, true, 'PreventDefault was not set correctly');
    assert.strictEqual(mockFetch.mock.calls.length, 1, `mockFetch was called ${mockFetch.mock.calls.length} times instead of 1 time`);;
  })
  it("sends request to POST /customers when submitting the form", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchOk)
    const submitEvent = userEvent.setup();
    const mockOnSave = mock.fn((args:any)=>{})
    render(
      <CustomerForm
        {...testProps}
        onSave={mockOnSave}
      />);

    const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Jamie")
    const lastNameInput = screen.getByLabelText('Last Name') as HTMLInputElement;
    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, "Doh")
    const phoneNumberInput = screen.getByLabelText('Phone Number') as HTMLInputElement;
    await userEvent.clear(phoneNumberInput);
    await userEvent.type(phoneNumberInput, "555-1239")
    const submitButton = screen.getByRole('button', { name: /Add/i })
    await submitEvent.click(submitButton)
        
    const expectedRequest = ["/customers",{"method":"POST","credentials":"same-origin","headers":{"Content-Type":"application/json"},"body":"{\"firstName\":\"Jamie\",\"lastName\":\"Doh\",\"phoneNumber\":\"555-1239\"}"}]
    const expectedResponse = [expectedRequest]
    assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected fetch to be called once, but got ${mockFetch.mock.calls.length}`)
    assert.deepStrictEqual(
      mockFetch.mock.calls[0].arguments
      , expectedRequest
      , `Expected fetch to be called with ${JSON.stringify(expectedRequest)}, but got ${JSON.stringify(mockFetch.mock.calls[0].arguments)}`)

    assert.strictEqual(mockOnSave.mock.calls.length, 1, `Expected onSave to be called once, but got ${mockOnSave.mock.calls.length}`)
    assert.deepStrictEqual(
      mockOnSave.mock.calls[0].arguments
      , expectedResponse
      , `Expected fetch to return ${expectedResponse}, but got ${JSON.stringify( mockOnSave.mock.calls[0].arguments)}`)
    
  })
  it("does not notify onSave if the POST request returns an error", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchError)
    const submitEvent = userEvent.setup();
    const mockOnSave = mock.fn((args:any)=>{})
    render(
      <CustomerForm
        {...testProps}
        onSave={mockOnSave}
      />);
    const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "James")
    const lastNameInput = screen.getByLabelText('Last Name') as HTMLInputElement;
    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, "Duck")
    const phoneNumberInput = screen.getByLabelText('Phone Number') as HTMLInputElement;
    await userEvent.clear(phoneNumberInput);
    await userEvent.type(phoneNumberInput, "777-1239")
    const submitButton = screen.getByRole('button', { name: /Add/i })
    await submitEvent.click(submitButton)
  
    const expectedRequest = ["/customers",{"method":"POST","credentials":"same-origin","headers":{"Content-Type":"application/json"},"body":"{\"firstName\":\"James\",\"lastName\":\"Duck\",\"phoneNumber\":\"777-1239\"}"}]
    assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected fetch to be called once, but got ${mockFetch.mock.calls.length}`)
    assert.deepStrictEqual(
      mockFetch.mock.calls[0].arguments
      , expectedRequest
      , `Expected fetch to be called with ${JSON.stringify(expectedRequest)}, but got ${JSON.stringify(mockFetch.mock.calls[0].arguments)}`)

    assert.strictEqual(mockOnSave.mock.calls.length, 0, `Expected NO onSave calls, but got ${mockOnSave.mock.calls.length}`)
  })
  it("renders an alert space", async () => {
    render(<CustomerForm {...testProps} />);
    const alert = await screen.findByRole("alert", );
    
    assert.strictEqual(alert.tagName, 'P', `Expected tag name P, but got ${alert.tagName}`)
  });
  it("renders error message when fetch call fails", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchError)
    const submitEvent = userEvent.setup();
    render(<CustomerForm {...testProps} />);
    const alert = await screen.findByRole("alert", ) as HTMLParagraphElement;
    const submitButton = screen.getByRole('button', { name: /Add/i })
    
    await submitEvent.click(submitButton)
    
    assert.match(alert.textContent, /error occurred/i, `Expected /error occurred/i, but got ${alert.textContent}`)
  });
  it("initially has no error message", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchOk)
    const submitEvent = userEvent.setup();
    render(<CustomerForm {...testProps} />);
    const alert = await screen.findByRole("alert", ) as HTMLParagraphElement;
    const submitButton = screen.getByRole('button', { name: /Add/i })
    
    await submitEvent.click(submitButton)
    
    assert.strictEqual(alert.textContent, "", `Expected empty string, but got ${alert.textContent}`)
  });
})


const itRendersAsATextBox = (
  label: string
  ) =>it("renders as a text box with label", () => {
    render(<CustomerForm {...testProps}/>)
    const textBoxInputElement = screen.getByLabelText(label) as HTMLInputElement;

    assert.ok(textBoxInputElement instanceof HTMLInputElement, 'It should be instance of HTMLInputElement')
  });

const itIncludesTheExistingValue = (
  label: string,
  existing: string
  ) => it("includes the existing value", () => {
    render(<CustomerForm {...testProps}/>)
    const textBoxInputElement = screen.getByLabelText(label) as HTMLInputElement;

    assert.strictEqual(textBoxInputElement.value, existing, `It should be ${existing}`)
  });

const itSavesExistingValueWhenSubmitted = (
  matcher: RegExp
  ) => it("saves existing value when submitted", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchOk)
    const submitEvent = userEvent.setup();
    const mockEventListenerHandler = mock.fn((e: Event) => {})
    render(
      <CustomerForm 
        {...testProps}
      />
    )
    const form = screen.getByRole("form", { name: /customer/i });
    form.addEventListener("submit", mockEventListenerHandler);
    const submitButton = screen.getByRole('button', { name: /Add/i })
    
    await submitEvent.click(submitButton)

    assert.strictEqual(mockEventListenerHandler.mock.calls.length, 1, `mockEventListenerHandler was called ${mockEventListenerHandler.mock.calls.length} times instead of 1 time`);;
    assert.strictEqual(mockEventListenerHandler.mock.calls[0].arguments[0].type, "submit", 'Event is not of Submit type');
    assert.strictEqual(mockEventListenerHandler.mock.calls[0].arguments[0].defaultPrevented, true, 'PreventDefault was not set correctly');
    assert.strictEqual(mockFetch.mock.calls.length, 1, `globalThis.fetch was called ${mockFetch.mock.calls.length} times instead of 1 time`);
    assert.match(mockFetch.mock.calls[0].arguments[1].body, matcher, `Request body is ${JSON.stringify(mockFetch.mock.calls[0].arguments[1].body)} has no match ${String(matcher)}`);
  })

const itSavesNewValueWhenSubmitted = (
  label: string,
  newValue: string,
  matcher: RegExp
  ) => it("saves new value when submitted", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchOk)
    const submitEvent = userEvent.setup();
    render(
      <CustomerForm 
        {...testProps}
      />
    )
    const submitButton = screen.getByRole('button', { name: /Add/i })
    const textBoxInputElement = screen.getByLabelText(label) as HTMLInputElement;
    await userEvent.clear(textBoxInputElement);
    await userEvent.type(textBoxInputElement, newValue)
    await submitEvent.click(submitButton)

    assert.strictEqual(mockFetch.mock.calls.length, 1, `globalThis.fetch was called ${mockFetch.mock.calls.length} times instead of 1 time`);
    assert.match(mockFetch.mock.calls[0].arguments[1].body, matcher, `Request body is ${JSON.stringify(mockFetch.mock.calls[0].arguments[1].body)} has no match ${String(matcher)}`);
  })

describe("first name field", () => {
  itRendersAsATextBox('First Name');
  itIncludesTheExistingValue('First Name', 'Jane');
  itSavesExistingValueWhenSubmitted(/\"firstName\":\"Jane\"/);
  itSavesNewValueWhenSubmitted('First Name','Jamie', /\"firstName\":\"Jamie\"/);
});

describe("last name field", () => {
  itRendersAsATextBox('Last Name');
  itIncludesTheExistingValue('Last Name', 'Doe');
  itSavesExistingValueWhenSubmitted(/\"lastName\":\"Doe\"/);
  itSavesNewValueWhenSubmitted('Last Name', 'Doh', /\"lastName\":\"Doh\"/ );
});

describe("phone number field", () => {
  itRendersAsATextBox('Phone Number');
  itIncludesTheExistingValue('Phone Number', '555-1234');
  itSavesExistingValueWhenSubmitted(/\"phoneNumber\":\"555-1234/);
  itSavesNewValueWhenSubmitted('Phone Number', '555-1239', /\"phoneNumber\":\"555-1239\"/);
});