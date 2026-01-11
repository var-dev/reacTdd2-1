import { afterEach, beforeEach, describe, it, mock } from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup"; // must be imported before render/screen
import * as React from "react";

import { render, screen, cleanup } from "@testing-library/react";

import { AppointmentForm } from "../src/appointmentForm";
import type { Service, Appointment } from "../src/appointmentForm";

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
})

function labelsOfAllOptions(selectBox: HTMLSelectElement) {
  return Array.from(
    selectBox.childNodes,
    (node) => node.textContent
  );
}
function findOption(selectBox: HTMLSelectElement, textContent: string) {
  const options = Array.from(selectBox.childNodes);
  return options.find(
    option => option.textContent === textContent
  );
};
const blankAppointment: Appointment = {
  service: "Cut",
};

describe('Appointment form', ()=>{
  it("renders appointment form", async () => {
    render(<AppointmentForm appointment={blankAppointment}/>)
    const form = screen.getByLabelText('Appointment form') as HTMLFormElement;

    assert.ok(form, 'No form found with aria-label "Appointment form"');
  })
  describe('service field', ()=>{
    const services: Service[] = ["Cut", "Blow-dry" ];
    it('renders select box', ()=>{
      render(<AppointmentForm appointment={blankAppointment} />)
      const select = screen.getByLabelText('Service') as HTMLSelectElement;

      assert.ok(select, 'No select box found with aria-label "Service"');
      assert.strictEqual(select.tagName, 'SELECT', `Expected tag name select, but got ${select.tagName}`)
    })
    it('has a service item as a first value', ()=>{
      render(<AppointmentForm selectableServices={['Cut']} appointment={blankAppointment}/>)
      const select = screen.getByRole('combobox', {name: 'Service'}) as HTMLSelectElement;

      assert.strictEqual(labelsOfAllOptions(select)[0], 'Cut', `Expected service Cut`)
    })
    it("lists all salon services", () => {
      render(<AppointmentForm selectableServices={services} appointment={blankAppointment}/>)
      const select = screen.getByLabelText('Service') as HTMLSelectElement;

      assert.deepStrictEqual(labelsOfAllOptions(select), services, `Expected array ${JSON.stringify(services)}`)
    })
    it("pre selects value", () => {
      const appointment: Appointment = { service: "Blow-dry" };
      render(<AppointmentForm selectableServices={services} appointment={appointment}/>)
      const select = screen.getByLabelText('Service') as HTMLSelectElement;
      const option = findOption(select, appointment.service) as HTMLOptionElement

      assert.ok(option.tagName==='OPTION' && option.selected, `Expected option ${appointment.service} to be selected`)
    })
  })
})

