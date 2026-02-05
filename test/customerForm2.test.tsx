import { afterEach, beforeEach, describe, it, mock } from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup"; // must be imported before render/screen
import React from "react";

import { render, screen, cleanup, within, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Customer } from "../src/types.js";
import {CustomerForm, CustomerFormProps as testProps} from "../src/CustomerForm.js";
import { validCustomer, blankCustomer } from "../src/sampleDataStatic.js";

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
  customer: validCustomer,
  onSave: (customer: Customer)=>{}
}
const mockFetchOk = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(args) });
const mockFetchError = (...args: any[]) => Promise.resolve({ ok: false });

const mockFetchErr422 = (...args: any[]) => Promise.resolve({ 
  ok: false ,
  status: 422,
  json: ()=>Promise.resolve({errors:{phoneNumber: "Phone number already exists in the system"}}) 
});

describe('CustomerForm tests using render and screen', ()=>{
  it("types into firstName", async () => {
    render(<CustomerForm {...testProps}/>)
    const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Jamie")
    assert.equal(firstNameInput.value, "Jamie", 'Name should be Jamie, not first');
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
  it("renders an alert space", async () => {
    render(<CustomerForm {...testProps} />);
    const alerts = await screen.findAllByRole("alert", );
    const alertPiElements = alerts.filter(alert => alert.tagName === 'P');
    
    assert.ok(alertPiElements.length===1, `Expected single tag name P, but got ${JSON.stringify(alertPiElements.map(el=>el.tagName))}`)
  });
  it("initially has no error message", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetchOk)
    const submitEvent = userEvent.setup();
    render(<CustomerForm {...testProps} />);
    const submitButton = screen.getByRole('button', { name: /Add/i })
    await submitEvent.click(submitButton)
    const alerts = await screen.findAllByRole("alert", );
    const alertPiElements = alerts.filter(alert => alert.tagName === 'P');
    assert.ok(alertPiElements.length===1, `Expected single tag name P, but got ${JSON.stringify(alertPiElements.map(el=>el.tagName))}`)
    
    assert.strictEqual(alertPiElements[0].textContent, "", `Expected empty string, but got ${JSON.stringify(alertPiElements.map(el=>el.textContent))}`)
  });
  describe('when POST request returns an error', ()=>{
    it("renders error message", async () => {
      mock.method(global,'fetch', mockFetchError)
      const submitEvent = userEvent.setup();
      render(<CustomerForm {...testProps} />);
      const submitButton = screen.getByRole('button', { name: /Add/i })
      await submitEvent.click(submitButton)
      
      // const alert = await screen.findByRole("alert", ) as HTMLParagraphElement;
      // assert.match(alert.textContent, /error occurred/i, `Expected /error occurred/i, but got ${alert.textContent}`)
      const alerts = await screen.findAllByRole("alert", );
      const alertPiElements = alerts.filter(alert => alert.tagName === 'P');

      assert.ok(alertPiElements.length===1, `Expected single tag name P, but got ${JSON.stringify(alertPiElements.map(el=>el.tagName))}`)
      assert.match(alertPiElements[0].textContent, /error occurred/i, `Expected /error occurred/i, but got ${JSON.stringify(alertPiElements.map(el=>el.textContent))}`)

      mock.method(global,'fetch', mockFetchOk)
      await submitEvent.click(submitButton)
      
      assert.strictEqual(alertPiElements[0].textContent, "", `Expected empty string after clearing error`)
    });
    it("does not notify onSave", async () => {
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
  })
  it("Does not submit when there is an error", async ()=>{
    const mockFetch = mock.method(global,'fetch', mockFetchOk)
    const interactiveEvent = userEvent.setup();
    render(<CustomerForm {...testProps} />)
    const form = await screen.findByRole("form", {name:/Customer form/i} );
    const firstNameInput = within(form).getByLabelText<HTMLInputElement>('First Name');
    await userEvent.clear(firstNameInput);
    await userEvent.tab()
    const submitButton = screen.getByRole('button', { name: /Add/i })
    await interactiveEvent.click(submitButton)

    assert.strictEqual(mockFetch.mock.calls.length, 0, `Expected NO fetch calls because firstName empty error, but got ${mockFetch.mock.calls.length}`)
  })
})


const itRendersAsATextBox = (
  label: string
  ) => it("renders as a text box with label", () => {
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
  itIncludesTheExistingValue('First Name', 'first');
  itSavesExistingValueWhenSubmitted(/\"firstName\":\"first\"/);
  itSavesNewValueWhenSubmitted('First Name','Jamie', /\"firstName\":\"Jamie\"/);
});

describe("last name field", () => {
  itRendersAsATextBox('Last Name');
  itIncludesTheExistingValue('Last Name', 'last');
  itSavesExistingValueWhenSubmitted(/\"lastName\":\"last\"/);
  itSavesNewValueWhenSubmitted('Last Name', 'Doh', /\"lastName\":\"Doh\"/ );
});

describe("phone number field", () => {
  itRendersAsATextBox('Phone Number');
  itIncludesTheExistingValue('Phone Number', '123456789');
  itSavesExistingValueWhenSubmitted(/\"phoneNumber\":\"123456789/);
  itSavesNewValueWhenSubmitted('Phone Number', '555-1239', /\"phoneNumber\":\"555-1239\"/);
});

describe("validation", () => {
  it("renders alert spaces for 3 input validation errors", async () => {
    render(<CustomerForm {...testProps} />);
    const form = await screen.findByRole("form", {name:/Customer form/i} );
    const alerts = await within(form).findAllByRole("alert", );
    const alertSpanElements = alerts.filter(alert => alert.tagName === 'SPAN');
    assert.ok(alertSpanElements.length===3, `Expected 3 tag name SPAN, but got ${JSON.stringify(alertSpanElements.map(el=>el.tagName))}`)
  });
  it("renders First Name input validation error", async () => {
    render(<CustomerForm {...testProps} />);
    const form = await screen.findByRole("form", {name:/Customer form/i} );
    const firstNameInput = within(form).getByLabelText<HTMLInputElement>('First Name');
    await userEvent.clear(firstNameInput);
    await userEvent.tab()
    const spanElement = await within(form).findByText(/first name is required/i)
    assert.ok(spanElement.tagName === 'SPAN', 'Expected first name is required error')

    await userEvent.type(firstNameInput,'Amanda');
    await userEvent.tab()
    assert.throws( ()=> within(form).getByText(/first name is required/i), 'Expected to throw on no First Name error')
  });
  it("renders Last Name input validation error", async () => {
    render(<CustomerForm {...testProps} />);
    const form = await screen.findByRole("form", {name:/Customer form/i} );
    const lastNameInput = within(form).getByLabelText<HTMLInputElement>('Last Name');
    await userEvent.clear(lastNameInput);
    await userEvent.tab()
    const spanElement = await within(form).findByText(/last name is required/i)
    assert.ok(spanElement.tagName === 'SPAN', 'Expected Last Name is required error')

    await userEvent.type(lastNameInput,'Smith');
    await userEvent.tab()
    assert.throws( ()=> within(form).getByText(/last name is required/i), 'Expected to throw on no Last Name error')
  });
  it("renders Phone Number input validation error", async () => {
    render(<CustomerForm {...testProps} />);
    const form = await screen.findByRole("form", {name:/Customer form/i} );
    const phoneNumberInput = within(form).getByLabelText<HTMLInputElement>('Phone Number');
    await userEvent.clear(phoneNumberInput);
    await userEvent.tab()
    const spanElement = await within(form).findByText(/phone number is required/i)
    assert.ok(spanElement.tagName === 'SPAN', 'Expected Phone Number is required error')

    await userEvent.type(phoneNumberInput,'555-5555');
    await userEvent.tab()
    assert.throws( ()=> within(form).getByText(/phone number is required/i), 'Expected to throw on no Phone Number error')

    await userEvent.clear(phoneNumberInput);
    await userEvent.type(phoneNumberInput,'555A5555');
    await userEvent.tab()
    const spanElement2 = await within(form).findByText(/numbers, spaces and these symbols are allowed/i)
    assert.ok(spanElement2.tagName === 'SPAN', 'Only numbers, spaces and +- symbols are allowed')

    await userEvent.clear(phoneNumberInput);
    await userEvent.type(phoneNumberInput,'0123456789+()- ');
    await userEvent.tab()
    assert.throws( ()=> within(form).getByText(/numbers, spaces and these symbols are allowed/i), 'Expected not to error (throw text not found) on valid Phone Number chars')
  });
  it("renders validation errors after submission fails", async ()=>{
    const mockFetch = mock.method(global,'fetch', mockFetchOk)
    const submitEvent = userEvent.setup();
    const mockEventListenerHandler = mock.fn((e: Event) => {})
    render(<CustomerForm {...testProps} customer={blankCustomer}  />);
    const form = screen.getByRole("form", { name: /customer/i });
    form.addEventListener("submit", (e: Event) => {});
    const submitButton = screen.getByRole('button', { name: /Add/i })
    await submitEvent.click(submitButton)

    const firstNameSpan = within(form).getByText(/first name is required/i)
    assert.ok(firstNameSpan.tagName === 'SPAN', 'Expected first name is required error')
    const lastNameSpan = within(form).getByText(/last name is required/i)
    assert.ok(lastNameSpan.tagName === 'SPAN', 'Expected last name is required error')
    const numberNameSpan = within(form).getByText(/phone number is required/i)
    assert.ok(numberNameSpan.tagName === 'SPAN', 'Expected phone number is required error')

    assert.strictEqual(mockFetch.mock.calls.length, 0, `mockFetch was called ${mockFetch.mock.calls.length} times instead of 0 times`);;
  })
  it("renders field validation errors from server", async ()=>{
    const mockFetch = mock.method(global,'fetch', mockFetchErr422)
    render(<CustomerForm {...testProps}  />);
    const submitButton = screen.getByRole('button', { name: /Add/i })
    await userEvent.click(submitButton)
    assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected fetch to be called once, but got ${mockFetch.mock.calls.length}`)
    const result = await mockFetch.mock.calls[0].result;
    assert.strictEqual(result?.status, 422, `Expected fetch status to be 422`)

    const errSpan = await screen.findByText(/Phone number already exists/i)
    assert.strictEqual(errSpan.tagName, 'SPAN', 'Expected a phone exist server error on submit')
  })
});
describe("submitting indicator", () => {
  it("displays spinner when form is submitting", async () => {
    mock.method(global,'fetch', mockFetchOk)
    render(<CustomerForm {...testProps}/>);
    const submitButton = screen.getByRole('button', { name: /Add/i })
    userEvent.click(submitButton)
    let spinner: HTMLElement | null = null
    await waitFor(()=>{
      spinner = screen.queryByLabelText(/spinner/); 
      assert.ok(spinner, 'Expected spinner to appear');
      assert.strictEqual(spinner!.tagName, 'SPAN', 'Expected spinner appearing on submit')
    })

    assert.strictEqual(screen.queryByLabelText(/spinner/i), null, 'Expected spinner to be removed');
  });
  it("initially does not display the submitting indicator", async () => {
    render(<CustomerForm {...testProps}/>);
    assert.throws( ()=>( screen.getByLabelText(/spinner/i)), 'Expected no spinner before submit')
  });
});