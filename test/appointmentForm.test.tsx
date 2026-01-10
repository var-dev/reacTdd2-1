import { afterEach, beforeEach, describe, it, mock } from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup"; // must be imported before render/screen
import * as React from "react";
import { act } from "react";

import { render, screen, cleanup } from "@testing-library/react";

import { AppointmentForm } from "../src/appointmentForm";

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
})

function labelsOfAllOptions(element: HTMLSelectElement) {
  return Array.from(
    element.childNodes,
    (node) => node.textContent
  );
}

describe('Appointment form', ()=>{
  it("renders appointment form", async () => {
    render(<AppointmentForm />)
    const form = screen.getByLabelText('Appointment form') as HTMLFormElement;

    assert.ok(form, 'No form found with aria-label "Appointment form"');
  })
  describe('service field', ()=>{
    it('renders select box', ()=>{
      render(<AppointmentForm />)
      const select = screen.getByLabelText('Service') as HTMLSelectElement;

      assert.ok(select, 'No select box found with aria-label "Service"');
      assert.strictEqual(select.tagName, 'SELECT', `Expected tag name select, but got ${select.tagName}`)
    })
    it('has a blank item as a first value', ()=>{
      render(<AppointmentForm selectableServices={['']}/>)
      const select = screen.getByRole('combobox', {name: 'Service'}) as HTMLSelectElement;

      assert.strictEqual(labelsOfAllOptions(select)[0], '', `Expected empty node`)
    })
    it("lists all salon services", () => {
      const services = ["Cut", "Blow-dry" ];
      render(<AppointmentForm selectableServices={services}/>)
      const select = screen.getByLabelText('Service') as HTMLSelectElement;

      assert.deepStrictEqual(labelsOfAllOptions(select), services, `Expected array ${JSON.stringify(services)}`)
    })
  })
})

