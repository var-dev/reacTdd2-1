import { beforeEach, describe, it, mock} from "node:test";
import * as assert from "node:assert/strict";

import "./domSetup"

import * as React from "react";
import { act,  } from "react";
import {createRoot} from "react-dom/client";

import { fireEvent } from '@testing-library/react';

import type { Customer } from "../src/appointmentsDayView";
import {CustomerForm, CustomerFormProps} from "../src/customerForm";

let container: HTMLDivElement
const render = async (node: React.ReactNode) => {
  act(() => { createRoot(container).render(node) })
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.replaceChildren(container);
})

const originalProps: CustomerFormProps = {
  customer: { firstName: "Jane", lastName: "Doe", phoneNumber: "555-1234" }
}

describe("CustomerForm", () => {
  it("renders CustomerForm", async () => {
    render(<CustomerForm />)
    
    assert.ok(document.querySelector('form'));
  })
  it("renders Label and Input in the form", async () => {
    render(<CustomerForm />)
    
    assert.ok(document.querySelector('form>input'), 'No input found in the form');
    assert.ok(document.querySelector('form>label'), 'No label found in the form');
  })
  it("includes the existing value for the first name", ()=> {
    const customer = originalProps.customer
    render(<CustomerForm customer={customer}/>)
    const firstNameInput = document.querySelector('form>input[id=firstName]') as HTMLInputElement;

    assert.equal(firstNameInput.value, "Jane");
  })
  it("includes the existing value for the first name#2", ()=> {
    render(<CustomerForm {...originalProps}/>)
    const firstNameInput = document.querySelector('form>input#firstName') as HTMLInputElement;

    assert.equal(firstNameInput.tagName, "INPUT", `Wrong tagName, received ${firstNameInput.tagName}`);
    assert.equal(firstNameInput.value, "Jane");
  })
  it("renders Label for firstName", async () => {
    render(<CustomerForm />)
    
    assert.strictEqual(document.querySelector('label[for=firstName]')?.textContent, 'First Name', 'No label found in the form');
  })
  it("renders Submit button", async () => {
    render(<CustomerForm />)
    
    assert.ok(document.querySelector('input[type=submit]'), 'No Submit found in the form');
  })
  it("saves firstName when submitted", async () => {
    let submitted = '';
    const onSubmitTestHandler = ({firstName}: Customer) => { submitted = firstName ?? 'undefined'; }
    render(
      <CustomerForm 
        customer={originalProps.customer}
        onSubmit={onSubmitTestHandler}
      />
    )
    const button = document.querySelector('input[type=submit]') as HTMLButtonElement
    act(()=>{button.click()})
    assert.strictEqual(submitted, "Jane");
  })
  it("checks preventDefault to be true", async () => {
    let event: Event|null = null
    const onSubmitTestHandler = ({firstName}: Customer) => { }
    const mockHandler = mock.fn((e:Event)=>{ event = e; });
    render(
      <CustomerForm 
        customer={originalProps.customer}
        onSubmit={onSubmitTestHandler}
      />
    )
    const form = document.querySelector('form') as HTMLFormElement
    form.addEventListener('submit', (e) => { mockHandler(e) })  
    act(()=>{fireEvent.submit(form)})
    
    assert.ok(event!.defaultPrevented, 'Event defaultPrevented not set');
    assert.strictEqual(mockHandler.mock.calls.length, 1);
  })
})