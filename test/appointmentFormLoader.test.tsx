/// <reference path="../quibble.d.ts" />
import { afterEach, beforeEach, describe, it, test, mock} from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup.ts"; // must be imported before render/screen
import * as React from "react";

import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppointmentForm, serviceStylistRecord, stylists, selectableServicesList } from "../src/appointmentForm.tsx";
import type { Service, Appointment, AppointmentFormProps, AvailableTimeSlot } from "../src/appointmentForm.tsx";

import quibble from 'quibble'


async function importSpyAppointmentFormLoader() {
  const mockAppointmentForm = mock.fn(({ appointments }) => <div data-testid="appointmentForm" />)
  await quibble.esm('../src/appointmentForm.tsx', {
    AppointmentForm: mockAppointmentForm
  })
  const { AppointmentFormLoader } = await import( "../src/appointmentFormLoader.tsx");
  return {AppointmentFormLoader, mockAppointmentForm}
}

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

describe('AppointmentFormLoader', ()=>{
  it('renders AppointmentFormLoader', async ()=>{
    const {AppointmentFormLoader} = await importSpyAppointmentFormLoader()
    mock.method(globalThis, 'fetch', mockFetchOk)
    render(<AppointmentFormLoader {...testProps}/>)
    await screen.findByTestId('appointmentForm')

    assert.strictEqual(screen.getByTestId('appointmentForm').tagName, 'DIV')
  })
  it('calls fetch on GET availableTimeSlots', async ()=>{
    const {AppointmentFormLoader} = await importSpyAppointmentFormLoader()
    const mockFetch = mock.method(globalThis,'fetch', mockFetchAppointmentForm)
    render(<AppointmentFormLoader {...testProps}/>)
    await screen.findByTestId('appointmentForm')

    assert.strictEqual(mockFetch.mock.calls.length, 1, `mockFetch is expected to be called 1 time, but was ${mockFetch.mock.calls.length}`)
    assert.match(JSON.stringify(mockFetch.mock.calls[0].arguments), /availableTimeSlots.+same-origin.+application.json"/)

    const actualResult = JSON.stringify(await (await mockFetch.mock.calls[0].result)?.json())
    const expectedResult = '[{"startsAt":1543680000000,"stylists":["Jo","Pat"]},{"startsAt":1543681800000,"stylists":["Jo","Jo"]}]'
    assert.strictEqual(actualResult, expectedResult, `availableTimeSlots: actual - expected mismatch`)
  })
  it('supplies props for AppointmentForm', async ()=>{
    const {AppointmentFormLoader, mockAppointmentForm} = await importSpyAppointmentFormLoader()
    mock.method(globalThis,'fetch', mockFetchAppointmentForm)
    render(<AppointmentFormLoader {...testProps}/>)
    await screen.findByTestId('appointmentForm')

    assert.strictEqual(mockAppointmentForm.mock.calls.length, 2, `mockAppointmentForm should be called twice because of re-render on useEffect-useState`)

    const actualResult = JSON.stringify(mockAppointmentForm.mock.calls[1].arguments)
    const expectedResult = '[{"today":"2018-12-01T16:30:00.000Z","availableTimeSlots":[{"startsAt":1543680000000,"stylists":["Jo","Pat"]},{"startsAt":1543681800000,"stylists":["Jo","Jo"]}]},null]'
     assert.strictEqual(actualResult, expectedResult, `mockAppointmentForm actual - expected\n${actualResult}\n${expectedResult}`)
  })
})