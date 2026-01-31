/// <reference path="../quibble.d.ts" />
import { afterEach, beforeEach, describe, it, test, mock} from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup.ts"; // must be imported before render/screen
import * as React from "react";

import { render, screen, cleanup, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AppointmentFormProps } from "../src/AppointmentForm.js";
import type { AvailableTimeSlot } from "../src/types.ts";
import { AppointmentFormLoader } from "../src/AppointmentFormLoader.js";
import quibble from 'quibble'


const today = new Date(2018, 11, 1);
const originalFetch = globalThis.fetch;
const mockFetchOk = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(args) });
const mockFetchError = (...args: any[]) => Promise.resolve({ ok: false });

beforeEach( async () => {
  quibble.reset()
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})

const availableTimeSlots: AvailableTimeSlot[] = [
  { startsAt: today.setHours(9, 0, 0, 0),  stylists: ["Jo","Pat"] },
  { startsAt: today.setHours(9, 30, 0, 0), stylists: ["Jo", "Jo"] }]

const testProps: AppointmentFormProps = {
  today,
  availableTimeSlots
}
const mockFetchAppointmentForm = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(availableTimeSlots)});

describe('#2: AppointmentFormLoader. No AppointmentForm mock ', ()=>{
  it('#2: renders AppointmentFormLoader', async ()=>{
    mock.method(globalThis, 'fetch', mockFetchAppointmentForm)
    render(<AppointmentFormLoader {...testProps}/>)
    const form = await screen.findByLabelText<HTMLFormElement>("Appointment form", )

    assert.strictEqual(form.tagName, 'FORM')
  })
  it('#2: calls fetch on GET availableTimeSlots', async ()=>{
    const mockFetch = mock.method(globalThis,'fetch', mockFetchAppointmentForm)
    render(<AppointmentFormLoader {...testProps}/>)
    const form = await screen.findByLabelText<HTMLFormElement>("Appointment form", )

    assert.strictEqual(mockFetch.mock.calls.length, 1, `mockFetch is expected to be called 1 time, but was ${mockFetch.mock.calls.length}`)
    assert.match(JSON.stringify(mockFetch.mock.calls[0].arguments), /availableTimeSlots.+same-origin.+application.json"/)

    const actualResult = JSON.stringify(await (await mockFetch.mock.calls[0].result)?.json())
    const expectedResult = '[{"startsAt":1543680000000,"stylists":["Jo","Pat"]},{"startsAt":1543681800000,"stylists":["Jo","Jo"]}]'
    assert.strictEqual(actualResult, expectedResult, `availableTimeSlots: actual - expected mismatch`)
  })
  it('#2: indirectly checks props for AppointmentForm', async ()=>{
    const doSelect = userEvent.setup();
    mock.method(globalThis,'fetch', mockFetchAppointmentForm)
    render(<AppointmentFormLoader {...testProps}/>)
    const form = await screen.findByLabelText<HTMLFormElement>("Appointment form", )
    const stylistSelect = within(form).getByLabelText<HTMLSelectElement>('Stylist')
    await doSelect.selectOptions(stylistSelect, 'Jo')
    const radioButtonValues = Array.from(await screen.findAllByRole('radio')).map(el=> el.getAttribute('value'))
    assert.deepStrictEqual(radioButtonValues,['1543680000000','1543681800000'],'There should be 2 Radio Button values')
  })
})