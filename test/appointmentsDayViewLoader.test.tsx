/// <reference path="../quibble.d.ts" />
import { afterEach, beforeEach, describe, it, test, mock} from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup.ts"; // must be imported before render/screen
import React, {act}  from "react";

import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppointmentForm, serviceStylistRecord, stylists } from "../src/appointmentForm.tsx";
import type { Service, Appointment, AppointmentFormProps, AvailableTimeSlot } from "../src/appointmentForm.tsx";
import type { AppointmentsDayViewLoaderProps } from "../src/appointmentsDayViewLoader.tsx";

import quibble from 'quibble'


async function importSpyAppointmentsDayViewLoader() {
  const mockAppointmentsDayView = mock.fn(({ appointments }) => <div data-testid="appointmentsDayView" />)
  await quibble.esm('../src/appointmentsDayView.tsx', {
    AppointmentsDayView: mockAppointmentsDayView
  })
  const { AppointmentsDayViewLoader } = await import( "../src/appointmentsDayViewLoader.tsx");
  return {AppointmentsDayViewLoader, mockAppointmentsDayView}
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

const testProps: AppointmentsDayViewLoaderProps = {
  today
}

describe('AppointmentsDayViewLoader',  ()=>{
  const appointments: Appointment[] = [
    { startsAt: today.setHours(9, 0, 0, 0), },
    { startsAt: today.setHours(9, 30, 0, 0), },
  ]
  it('renders AppointmentsDayView', async ()=>{
    const {AppointmentsDayViewLoader} = await importSpyAppointmentsDayViewLoader()
    render(<AppointmentsDayViewLoader {...testProps} />)

    assert.strictEqual(screen.getByTestId('appointmentsDayView').tagName, 'DIV')
  })
  it("initially passes empty array of appointments to AppointmentsDayView", async () => {
    const {AppointmentsDayViewLoader, mockAppointmentsDayView} = await importSpyAppointmentsDayViewLoader()
    render(<AppointmentsDayViewLoader {...testProps} />)

    assert.strictEqual(mockAppointmentsDayView.mock.calls.length, 1, `mockAppointmentsDayView should be called once`)

    const expectedArgs = [{appointments: []}, undefined]
    const actualArgs = mockAppointmentsDayView.mock.calls[0].arguments
    assert.deepStrictEqual(actualArgs, expectedArgs, `mockAppointmentsDayView should be called with {appointments: []} but got ${JSON.stringify(actualArgs)}`)
  })
  it("fetches data when component is mounted", async () => {
    const {AppointmentsDayViewLoader, } = await importSpyAppointmentsDayViewLoader()
    const from = today.setHours(0, 0, 0, 0)
    const to = today.setHours(23, 59, 59, 999);
    const mockFetch = mock.method(globalThis,'fetch', mockFetchOk)
  
    render(
      <AppointmentsDayViewLoader {...testProps} />
    );
    await screen.findByTestId('appointmentsDayView')

    assert.strictEqual(mockFetch.mock.calls.length, 1, `mockFetch is expected to be called 1 time, but was ${mockFetch.mock.calls.length}`)
    const expectedArgs = [`/appointments/${from}-${to}`,{"method":"GET","credentials":"same-origin","headers":{"Content-Type":"application/json"}}]
    const actualArgs = mockFetch.mock.calls[0].arguments
    assert.deepStrictEqual(actualArgs, expectedArgs, `globalThis.fetch should be called with ${expectedArgs} but got ${JSON.stringify(actualArgs)}`)

    const actualResult = await (await mockFetch.mock.calls[0].result)?.json()
    assert.strictEqual(
      JSON.stringify(expectedArgs), 
      JSON.stringify(actualResult), 
      `globalThis.fetch should be returning \n${JSON.stringify(expectedArgs)} but got \n${JSON.stringify(actualResult)}`)
  });
  it("passes fetched appointments to AppointmentsDayView", async () => {
    const {AppointmentsDayViewLoader, mockAppointmentsDayView} = await importSpyAppointmentsDayViewLoader()
    const from = today.setHours(0, 0, 0, 0)
    const to = today.setHours(23, 59, 59, 999);
    mock.method(globalThis, 'fetch', mockFetchOk)
    render(<AppointmentsDayViewLoader today={today} />);
    await screen.findByTestId('appointmentsDayView')

    assert.strictEqual(mockAppointmentsDayView.mock.calls.length, 2, `mockAppointmentsDayView should be called twice`)

    const expectedArgs = [{"appointments":[`/appointments/${from}-${to}`,{"method":"GET","credentials":"same-origin","headers":{"Content-Type":"application/json"}}]},undefined]
    const actualArgs = mockAppointmentsDayView.mock.calls[1].arguments
    assert.deepStrictEqual(actualArgs, expectedArgs, `mockAppointmentsDayView should be called with \n${JSON.stringify(expectedArgs)} but got \n${JSON.stringify(actualArgs)}`)
  })
  it("re-requests appointment when today prop changes", async () => {
    const {AppointmentsDayViewLoader, mockAppointmentsDayView} = await importSpyAppointmentsDayViewLoader()
    render(<AppointmentsDayViewLoader today={today} />)
    render(<AppointmentsDayViewLoader today={new Date(2018, 11, 2)} />)

    assert.strictEqual(mockAppointmentsDayView.mock.calls.length, 2, `re-requesting appointment with a new time should trigger re-render`)
  })
})
