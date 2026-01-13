import { afterEach, beforeEach, describe, it, mock } from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup"; // must be imported before render/screen
import * as React from "react";

import { render, screen, cleanup, within } from "@testing-library/react";

import { AppointmentForm } from "../src/appointmentForm";
import type { Service, Appointment, AppointmentFormProps } from "../src/appointmentForm";

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
  startsAt: 0
};
const testProps: AppointmentFormProps ={
  selectableServices: ["Cut", "Blow-dry"],
  salonOpensAt: 9,
  salonClosesAt: 19,
  availableTimeSlots: [],
  today: new Date(2018, 11, 1),
  appointment: blankAppointment,
};
describe('Appointment form', ()=>{
  it("renders appointment form", async () => {
    render(<AppointmentForm {...testProps}/> )
    const form = screen.getByLabelText('Appointment form') as HTMLFormElement;

    assert.ok(form, 'No form found with aria-label "Appointment form"');
  })
  describe('service field', ()=>{
    const services: Service[] = ["Cut", "Blow-dry" ];
    it('renders select box', ()=>{
      render(<AppointmentForm {...testProps} />)
      const select = screen.getByLabelText('Service') as HTMLSelectElement;

      assert.ok(select, 'No select box found with aria-label "Service"');
      assert.strictEqual(select.tagName, 'SELECT', `Expected tag name select, but got ${select.tagName}`)
    })
    it('has a service item as a first value', ()=>{
      render(<AppointmentForm {...testProps}/>)
      const select = screen.getByRole('combobox', {name: 'Service'}) as HTMLSelectElement;

      assert.strictEqual(labelsOfAllOptions(select)[0], 'Cut', `Expected service Cut`)
    })
    it("lists all salon services", () => {
      render(<AppointmentForm {...testProps}/>)
      const select = screen.getByLabelText('Service') as HTMLSelectElement;

      assert.deepStrictEqual(labelsOfAllOptions(select), services, `Expected array ${JSON.stringify(services)}`)
    })
    it("pre selects value", () => {
      const appointment: Appointment = { service: "Blow-dry", startsAt: 0 };
      render(<AppointmentForm {...testProps} appointment={appointment}/>)
      const select = screen.getByLabelText('Service') as HTMLSelectElement;
      const option = findOption(select, appointment.service) as HTMLOptionElement

      assert.ok(option.tagName==='OPTION' && option.selected, `Expected option ${appointment.service} to be selected`)
    })
  })
  describe("time slot table", () => {
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const today = new Date();
    const tomorrow = new Date(
      today.getTime() + oneDayInMs
    );
    const availableTimeSlots = [
      { startsAt: today.setHours(9, 0, 0, 0) },
      { startsAt: today.setHours(9, 30, 0, 0) },
      { startsAt: tomorrow.setHours(9, 30, 0, 0) },
    ];
    it("renders a table for time slots with an id", () => {
      render(<AppointmentForm {...testProps} />);
      const table = screen.getByLabelText('time slot table') as HTMLTableElement;

      assert.ok(table, 'No table found with aria-label "time slot table"');
    });
    it("renders time slot headings", () => {
      render(<AppointmentForm {...testProps} />);
      const table = screen.getByLabelText('time slot table') as HTMLTableElement;
      const rowGroups = within(table).getAllByRole('rowgroup') as HTMLTableRowElement[];
      const [theadRowGroup, tbodyRowGroup] = rowGroups
      const timesOfDayHeadings = within(tbodyRowGroup).getAllByRole('columnheader') as HTMLTableRowElement[];
      assert.deepEqual(timesOfDayHeadings[0].textContent, '09:00', `Expected column heading "09:00"`);
      assert.deepEqual(timesOfDayHeadings[1].textContent, '09:30', `Expected column heading "09:30"`);
      assert.deepEqual(timesOfDayHeadings[2].textContent, '10:00', `Expected column heading "10:00"`);
    });
    it("renders day of week headings", () => {
      render(<AppointmentForm {...testProps} />);
      const table = screen.getByLabelText('time slot table') as HTMLTableElement;
      const rowGroups = within(table).getAllByRole('rowgroup') as HTMLTableRowElement[];
      const [theadRowGroup, tbodyRowGroup] = rowGroups
      const row = within(theadRowGroup).getAllByRole('row');
      const dates = within(theadRowGroup).getAllByRole('columnheader') as HTMLTableRowElement[];

      assert.deepEqual(row[0].textContent, 'Sat 01Sun 02Mon 03Tue 04Wed 05Thu 06Fri 07', `Expected:"Sat 01Sun 02Mon 03Tue 04Wed 05Thu 06Fri 07"`);
      assert.deepEqual(dates[0].textContent, '', `Expected empty heading column`);
      assert.deepEqual(dates[1].textContent, 'Sat 01', `Expected column heading "Sat 01"`);
      assert.deepEqual(dates[2].textContent, 'Sun 02', `Expected column heading "Sun 02"`);
      assert.deepEqual(dates[3].textContent, 'Mon 03', `Expected column heading "Mon 03"`);
      assert.deepEqual(dates[4].textContent, 'Tue 04', `Expected column heading "Tue 04"`);
    });
    it("renders radio buttons in the correct table cell positions", () => {
      render(
        <AppointmentForm
          {...testProps}
          availableTimeSlots={availableTimeSlots}
          today={today}
        />);
      
      const table = screen.getByLabelText('time slot table') as HTMLTableElement;
      const rowGroups = within(table).getAllByRole('rowgroup') as HTMLTableRowElement[];
      const [theadRowGroup, tbodyRowGroup] = rowGroups
      const radioButtonElements = within(tbodyRowGroup).getAllByRole('radio') as HTMLInputElement[];
      const radioButtonValues = radioButtonElements.map(rb => parseInt(rb.value));
      const availableTimeSlotValues = availableTimeSlots.map(slot=>slot.startsAt)
      
      assert.strictEqual(radioButtonElements.length, 3,'Should be 3 available time slots')
      assert.deepStrictEqual(radioButtonValues, availableTimeSlotValues, `Expected array ${JSON.stringify(availableTimeSlotValues)}`)
    });
    it("does not render radio buttons for unavailable time slots", () => {
      const today = new Date();
      render(
        <AppointmentForm
          {...testProps}
          availableTimeSlots={[]}
          today={today}
        />);
      
      const table = screen.getByLabelText('time slot table') as HTMLTableElement;
      const rowGroups = within(table).getAllByRole('rowgroup') as HTMLTableRowElement[];
      const [theadRowGroup, tbodyRowGroup] = rowGroups
      const cells = within(tbodyRowGroup).queryAllByRole('radio') as HTMLInputElement[];

      assert.strictEqual(cells.length, 0)
    });
    it("renders radio buttons in the correct table cell positions", () => {
      const appointment: Appointment = { service: "Cut", startsAt: availableTimeSlots[1].startsAt } ;
      render(
        <AppointmentForm
          {...testProps}
          availableTimeSlots={availableTimeSlots}
          today={today}
          appointment={appointment}
        />);
      
      const table = screen.getByLabelText('time slot table') as HTMLTableElement;
      const rowGroups = within(table).getAllByRole('rowgroup') as HTMLTableRowElement[];
      const [theadRowGroup, tbodyRowGroup] = rowGroups
      const radioButtonElements = within(tbodyRowGroup).getAllByRole('radio') as HTMLInputElement[];
      const checkedRadioButtons = radioButtonElements.map(rb => rb.checked);
      
      assert.strictEqual(radioButtonElements.length, 3,'Should be 3 available time slots')
      assert.deepStrictEqual(checkedRadioButtons, [false, true, false], `Expected array [false, true, false]`)
    });
  });
})

