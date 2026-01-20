/// <reference path="../quibble.d.ts" />
import { afterEach, beforeEach, describe, it, test, mock} from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup.ts"; // must be imported before render/screen
import * as React from "react";

import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppointmentForm, serviceStylists, stylists } from "../src/appointmentForm.tsx";
import type { Service, Appointment, AppointmentFormProps, AvailableTimeSlot } from "../src/appointmentForm.tsx";


import quibble from 'quibble'


async function importSpyAppointmentsDayViewLoader() {
  const mockAppointmentsDayView = mock.fn(({ appointments }) => <div data-testid="appointmentsDayView" />)
  await quibble.esm('../src/appointmentsDayView.tsx', {
    AppointmentsDayView: mockAppointmentsDayView
  })
  const {AppointmentsDayView} = await import("../src/appointmentsDayView.tsx")
  const { AppointmentsDayViewLoader } = await import( "../src/appointmentsDayViewLoader.tsx");
  return {AppointmentsDayViewLoader, mockAppointmentsDayView}
}

const originalFetch = globalThis.fetch;

beforeEach( async () => {
  quibble.reset()
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})

const testProps = {}

describe('AppointmentsDayViewLoader',  ()=>{
  it('renders AppointmentsDayView', async ()=>{
    const {AppointmentsDayViewLoader} = await importSpyAppointmentsDayViewLoader()
    render(<AppointmentsDayViewLoader {...testProps} />)

    assert.strictEqual(screen.getByTestId('appointmentsDayView').tagName, 'DIV')
  })
  it("initially passes empty array of appointments toAppointmentsDayView", async () => {
    const {AppointmentsDayViewLoader, mockAppointmentsDayView} = await importSpyAppointmentsDayViewLoader()
    render(<AppointmentsDayViewLoader {...testProps} />)

    assert.strictEqual(mockAppointmentsDayView.mock.calls.length, 1, `mockAppointmentsDayView should be called once`)
    
    const expectedArgs = [{appointments: []}, undefined]
    const actualArgs = mockAppointmentsDayView.mock.calls[0].arguments
    assert.deepStrictEqual(actualArgs, expectedArgs, `mockAppointmentsDayView should be called with {appointments: []} but got ${JSON.stringify(actualArgs)}`)
  })
})
