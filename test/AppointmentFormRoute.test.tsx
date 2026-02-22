import { afterEach, beforeEach, describe, it, mock} from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup.ts"; // must be imported before render/screen
import * as React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { AppointmentFormProps } from "../src/AppointmentForm.js";
import type { AvailableTimeSlot } from "../src/types.ts";


const today = new Date(2018, 11, 1);
const originalFetch = globalThis.fetch;
const mockFetchOk = (...args: any[]) => Promise.resolve({ ok: true, json: ()=>Promise.resolve(args) });
const mockFetchError = (...args: any[]) => Promise.resolve({ ok: false });

beforeEach( async () => {
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


describe('AppointmentFormRoute', async ()=>{
  it('renders without crashing', async ()=>{

    mock.method(globalThis,'fetch', mockFetchAppointmentForm)
    const mockAppointmentForm = mock.fn((...props:any[])=>(<div data-testid="appointmentForm"></div>))
    const mModule = mock.module('../src/AppointmentForm.tsx',{
      namedExports:{
        AppointmentForm: mockAppointmentForm
      }
    })
    const {AppointmentFormRoute} = await import('../src/AppointmentFormRoute.js')
    mModule.restore()
    render(
      <MemoryRouter initialEntries={["/addAppointment?customerId=123"]}>
        <AppointmentFormRoute />
      </MemoryRouter>
    );
    await waitFor(()=>{screen.getByTestId('appointmentForm')})

    const count = mockAppointmentForm.mock.callCount()
    assert.strictEqual(count, 2, 'AppointmentForm called more than once')
    const actual = mockAppointmentForm.mock.calls[count-1].arguments[0].appointment.customerId
    const expected = 123
    assert.strictEqual(actual, expected, 'AppointmentForm called with wrong args')
  })
})