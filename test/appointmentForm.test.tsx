import { afterEach, beforeEach, describe, it, mock,  } from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup"; // must be imported before render/screen
import * as React from "react";

import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppointmentForm, serviceStylistRecord, stylists } from "../src/appointmentForm";
import type { Service, Appointment, AppointmentFormProps, AvailableTimeSlot } from "../src/appointmentForm";



const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
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
const oneDayInMs = 24 * 60 * 60 * 1000;
const today = new Date(2018, 11, 1);
const tomorrow = new Date(
  today.getTime() + oneDayInMs
);
const testProps: AppointmentFormProps ={
  selectableServices: ["Cut", "Blow-dry"],
  selectableStylists: stylists,
  serviceStylists: serviceStylistRecord,
  salonOpensAt: 9,
  salonClosesAt: 19,
  availableTimeSlots: [],
  today,
  appointment: blankAppointment,
  onSave: ()=>{}
};
const availableTimeSlots: AvailableTimeSlot[] = [
  { startsAt: today.setHours(9, 0, 0, 0), stylists: ["Ashley", "Jo"] },
  { startsAt: today.setHours(9, 30, 0, 0), stylists: ["Ashley", "Sam"] },
  { startsAt: tomorrow.setHours(9, 30, 0, 0), stylists: ["Ashley", "Jo"] },
];

const mockFetch201 = (...args: any[]) => Promise.resolve({ ok: true, status: 201 });
const mockFetchError = (...args: any[]) => Promise.resolve({ ok: false });

describe('Appointment form', ()=>{
  it("renders appointment form", async () => {
    render(<AppointmentForm {...testProps}/> )
    const form = screen.getByLabelText('Appointment form') as HTMLFormElement;

    assert.ok(form, 'No form found with aria-label "Appointment form"');
  })
  it("renders submit button", async () => {
    render(<AppointmentForm {...testProps}/> )
    const submit = screen.getByLabelText('Submit') as HTMLFormElement;

    assert.ok(submit, 'No button found with aria-label "Submit"');
  })
  it("saves existing value when submitted", async () => {
    const mockFetch = mock.method(global,'fetch', mockFetch201)
    const appointment: Appointment = {startsAt: availableTimeSlots[1].startsAt, service:'Cut', stylist: 'Ashley'};
    const submitEvent = userEvent.setup();
    const mockEventListenerHandler = mock.fn((e: Event) => {})
    render(<AppointmentForm {...testProps} appointment={appointment}/> )
    const submit = screen.getByLabelText('Submit') as HTMLFormElement;
    const form = screen.getByLabelText('Appointment form') as HTMLFormElement;
    form.addEventListener("submit", mockEventListenerHandler);
    await submitEvent.click(submit)

    const expectedRequest = "{\"startsAt\":1543681800000,\"service\":\"Cut\",\"stylist\":\"Ashley\"}";
    assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected onSubmit to be called once, but got ${mockFetch.mock.calls.length}`)
    assert.strictEqual(mockFetch.mock.calls[0].arguments[1].body, expectedRequest, `Expected submitted appointment data ${JSON.stringify(expectedRequest)}, but got ${JSON.stringify(mockFetch.mock.calls[0].arguments[1].body)}`)
    assert.strictEqual(mockEventListenerHandler.mock.calls[0].arguments[0].type, "submit", 'Event is not of Submit type');
    assert.strictEqual(mockEventListenerHandler.mock.calls[0].arguments[0].defaultPrevented, true, 'PreventDefault was not set correctly');
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
      const option = findOption(select, appointment.service!) as HTMLOptionElement

      assert.ok(option.tagName==='OPTION' && option.selected, `Expected option ${appointment.service} to be selected`)
    })
    it("saves existing selectBox value when submitted", async () => {
      const mockFetch = mock.method(global,'fetch', mockFetch201)
      const appointment: Appointment = {};
      const submitEvent = userEvent.setup();
      render(<AppointmentForm {...testProps} appointment={appointment}/> )
      const submit = screen.getByLabelText('Submit') as HTMLFormElement;
      await submitEvent.click(submit)

      const expectedResult = "{\"service\":\"Cut\",\"stylist\":\"Ashley\"}"
      assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected onSubmit to be called once, but got ${mockFetch.mock.calls.length}`)
      assert.strictEqual(mockFetch.mock.calls[0].arguments[1].body, expectedResult, `Expected existing data ${expectedResult}, but got ${mockFetch.mock.calls[0].arguments[1].body}`)
    })
    it("saves new selectBox value when submitted", async () => {
      const mockFetch = mock.method(global,'fetch', mockFetch201)
      const appointment: Appointment = {};
      const submitEvent = userEvent.setup();
      render(<AppointmentForm {...testProps} appointment={appointment}/> )
      const submit = screen.getByLabelText('Submit') as HTMLFormElement;
      const select = screen.getByLabelText('Service') as HTMLSelectElement;
      await submitEvent.selectOptions(select, 'Blow-dry')
      await submitEvent.click(submit)

      const expectedResult = "{\"service\":\"Blow-dry\",\"stylist\":\"Ashley\"}"
      assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected fetch to be called once, but got ${mockFetch.mock.calls.length}`)
      assert.strictEqual(mockFetch.mock.calls[0].arguments[1].body, expectedResult, `Expected new appointment data ${expectedResult}, but got ${mockFetch.mock.calls[0].arguments[1].body}`)
    })
  })
  describe("time slot table", () => {
    it("renders a table for time slots with an id", () => {
      render(<AppointmentForm {...testProps} />);
      const table = screen.getByLabelText('timeSlotTable') as HTMLTableElement;

      assert.ok(table, 'No table found with aria-label "timeSlotTable"');
    });
    it("renders time slot headings", () => {
      render(<AppointmentForm {...testProps} />);
      const table = screen.getByLabelText('timeSlotTable') as HTMLTableElement;
      const rowGroups = within(table).getAllByRole('rowgroup') as HTMLTableRowElement[];
      const [theadRowGroup, tbodyRowGroup] = rowGroups
      const timesOfDayHeadings = within(tbodyRowGroup).getAllByRole('columnheader') as HTMLTableRowElement[];
      assert.deepEqual(timesOfDayHeadings[0].textContent, '09:00', `Expected column heading "09:00"`);
      assert.deepEqual(timesOfDayHeadings[1].textContent, '09:30', `Expected column heading "09:30"`);
      assert.deepEqual(timesOfDayHeadings[2].textContent, '10:00', `Expected column heading "10:00"`);
    });
    it("renders day of week headings", () => {
      render(<AppointmentForm {...testProps} />);
      const table = screen.getByLabelText('timeSlotTable') as HTMLTableElement;
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
      
      const table = screen.getByLabelText('timeSlotTable') as HTMLTableElement;
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
      
      const table = screen.getByLabelText('timeSlotTable') as HTMLTableElement;
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
      
      const table = screen.getByLabelText('timeSlotTable') as HTMLTableElement;
      const rowGroups = within(table).getAllByRole('rowgroup') as HTMLTableRowElement[];
      const [theadRowGroup, tbodyRowGroup] = rowGroups
      const radioButtonElements = within(tbodyRowGroup).getAllByRole('radio') as HTMLInputElement[];
      const checkedRadioButtons = radioButtonElements.map(rb => rb.checked);
      
      assert.strictEqual(radioButtonElements.length, 3,'Should be 3 available time slots')
      assert.deepStrictEqual(checkedRadioButtons, [false, true, false], `Expected array [false, true, false]`)
    });
  });
  describe('stylist', ()=>{
    it('renders a stylist field', ()=>{
      render(<AppointmentForm {...testProps}/>)
      const stylist = screen.getByLabelText('Stylist') as HTMLSelectElement;

      assert.ok(stylist, 'No input found with aria-label "Stylist"');
      assert.strictEqual(stylist.tagName, 'SELECT', `Expected tag name input, but got ${stylist.tagName}`)
    })
    it('lists all stylists', ()=>{
      render(<AppointmentForm {...testProps}/>)
      const stylists = screen.getByLabelText('Stylist') as HTMLSelectElement;
      const stylistNames = Array.from(stylists.childNodes, (option)=>{return option.textContent} )

      assert.deepStrictEqual(stylistNames, ["Ashley","Jo","Pat","Sam"], `Expected ["Ashley","Jo","Pat","Sam"], but got ${JSON.stringify(stylistNames)}`)
    })
    it("saves new stylist box value when submitted", async () => {
      const mockFetch = mock.method(global,'fetch', mockFetch201)
      const appointment: Appointment = {};
      const submitEvent = userEvent.setup();
      render(<AppointmentForm {...testProps} appointment={appointment}/> )
      const submit = screen.getByLabelText('Submit') as HTMLFormElement;
      const select = screen.getByLabelText('Stylist') as HTMLSelectElement;
      await submitEvent.selectOptions(select, 'Jo')
      await submitEvent.click(submit)
      const expectedResult = "{\"service\":\"Cut\",\"stylist\":\"Jo\"}"
      assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected onSubmit to be called once, but got ${mockFetch.mock.calls.length}`)
      assert.strictEqual(mockFetch.mock.calls[0].arguments[1].body
        , expectedResult
        , `Expected submitting appointment data ${expectedResult}, but got ${mockFetch.mock.calls[0].arguments}`)
    })
  })
  describe('time slot - stylist availability', ()=>{
    it('shows no appointments', async ()=>{
      render(
        <AppointmentForm
          {...testProps}
          appointment={{service: 'Beard trim', startsAt:today.getTime()}}
          selectableServices={['Beard trim']}
          availableTimeSlots={availableTimeSlots}
        />);
      const radioButtons = screen.queryAllByRole('radio')

      assert.strictEqual(radioButtons.length, 0)
    })
    it('shows 1 appointment for Sam', async ()=>{
      const submitEvent = userEvent.setup();
      render(
        <AppointmentForm
          {...testProps}
          availableTimeSlots={availableTimeSlots}
          selectableServices={["Cut","Blow-dry","Cut & color","Beard trim","Cut & beard trim","Extensions"]}
        />);
      const stylists = screen.getByLabelText('Stylist') as HTMLSelectElement;
      const service = screen.getByLabelText('Service') as HTMLSelectElement;
      await submitEvent.selectOptions(service, 'Beard trim')
      await submitEvent.selectOptions(stylists, 'Sam')
      const radioButtons = screen.queryAllByRole('radio')

      assert.strictEqual(radioButtons.length, 1)
    })
  })
  describe('Customer Form fetch mock', async ()=>{
    beforeEach(()=>{
      mock.restoreAll()
    })
    it('mock fetch', async ()=>{
      const mockFetch = mock.method(global,'fetch', mockFetch201)
      globalThis.fetch('www.example.com')
      
      assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected fetch to be called once, but got ${mockFetch.mock.calls.length}`)
      assert.deepStrictEqual(mockFetch.mock.calls[0].arguments, ['www.example.com'], `Expected fetch to be called with "www.example.com", but got ${JSON.stringify(mockFetch.mock.calls[0].arguments)}`)
    })
    it("sends request to POST /appointments when submitting the form", async () => {
      const mockFetch = mock.method(global,'fetch', mockFetch201)
      const submitEvent = userEvent.setup();
      const mockOnSave = mock.fn(()=>{})
      render(
        <AppointmentForm
          {...testProps}
          availableTimeSlots={availableTimeSlots}
          selectableServices={["Cut","Blow-dry","Cut & color","Beard trim","Cut & beard trim","Extensions"]}
          onSave={mockOnSave}
        />);
      const stylists = screen.getByLabelText('Stylist') as HTMLSelectElement;
      const service = screen.getByLabelText('Service') as HTMLSelectElement;
      const submit = screen.getByLabelText('Submit') as HTMLFormElement;
      await submitEvent.selectOptions(service, 'Beard trim')
      await submitEvent.selectOptions(stylists, 'Sam')
      await submitEvent.click(submit)
      
      const expectedRequest = ["/appointments",{"method":"POST","credentials":"same-origin","headers":{"Content-Type":"application/json"},"body":"{\"service\":\"Beard trim\",\"startsAt\":0,\"stylist\":\"Sam\"}"}]
      const expectedResponse = [expectedRequest]

      assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected fetch to be called once, but got ${mockFetch.mock.calls.length}`)
      assert.deepStrictEqual(
        mockFetch.mock.calls[0].arguments
        , expectedRequest
        , `Expected fetch to be called with ${JSON.stringify(expectedRequest)}, but got ${JSON.stringify(mockFetch.mock.calls[0].arguments)}`)
      
      const actualResult = await mockFetch.mock.calls[0].result
      const expectedResult = {"ok":true,"status":201}

      assert.deepStrictEqual(actualResult, expectedResult, `Expected fetch to return ${JSON.stringify(expectedResult)}, but got ${JSON.stringify(actualResult)}`)
      assert.strictEqual(mockOnSave.mock.calls.length, 1, `Expected onSave to be called once, but got ${mockOnSave.mock.calls.length}`)
    })
    it("does not notify onSave if the POST request returns an error", async () => {
      const mockFetch = mock.method(global,'fetch', mockFetchError)
      const submitEvent = userEvent.setup();
      const mockOnSave = mock.fn(()=>{})
      render(
        <AppointmentForm
          {...testProps}
          availableTimeSlots={availableTimeSlots}
          selectableServices={["Cut","Blow-dry","Cut & color","Beard trim","Cut & beard trim","Extensions"]}
          onSave={mockOnSave}
        />);
      const stylists = screen.getByLabelText('Stylist') as HTMLSelectElement;
      const service = screen.getByLabelText('Service') as HTMLSelectElement;
      const submit = screen.getByLabelText('Submit') as HTMLFormElement;
      await submitEvent.selectOptions(service, 'Beard trim')
      await submitEvent.selectOptions(stylists, 'Sam')
      await submitEvent.click(submit)

      const expectedRequest = ["/appointments",{"method":"POST","credentials":"same-origin","headers":{"Content-Type":"application/json"},"body":"{\"service\":\"Beard trim\",\"startsAt\":0,\"stylist\":\"Sam\"}"}]
      assert.strictEqual(mockFetch.mock.calls.length, 1, `Expected fetch to be called once, but got ${mockFetch.mock.calls.length}`)
      assert.deepStrictEqual(
        mockFetch.mock.calls[0].arguments
        , expectedRequest
        , `Expected fetch to be called with ${JSON.stringify(expectedRequest)}, but got ${JSON.stringify(mockFetch.mock.calls[0].arguments)}`)

      const actualResult = await mockFetch.mock.calls[0].result
      const expectedResult = {"ok":false}

      assert.deepStrictEqual(actualResult, expectedResult, `Expected fetch to return ${JSON.stringify(expectedResult)}, but got ${JSON.stringify(actualResult)}`)
      assert.strictEqual(mockOnSave.mock.calls.length, 0, `Expected NO onSave calls, but got ${mockOnSave.mock.calls.length}`)
    })
  })
})

