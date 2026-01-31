import { afterEach, beforeEach, describe, it, mock} from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup.ts"; // must be imported before render/screen
import * as React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

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

describe('#3: AppointmentFormLoader. Node native AppointmentForm mock', ()=>{
 
  it('#3: Native mock-checks props for AppointmentForm', async ()=>{
    mock.method(globalThis,'fetch', mockFetchAppointmentForm)
    const mockAppointmentForm = mock.fn((...props:any[])=>(<div data-testid="appointmentForm"></div>))
    const mModule = mock.module('../src/AppointmentForm.tsx',{
      namedExports:{
        AppointmentForm: mockAppointmentForm
      }
    })
    const {AppointmentFormLoader} = await import('../src/AppointmentFormLoader.js')
    render(<AppointmentFormLoader {...testProps}/>)
    await waitFor(()=>{screen.getByTestId('appointmentForm')})
    mModule.restore()

    assert.strictEqual(mockAppointmentForm.mock.calls.length, 2, `mockAppointmentForm should be called twice because of re-render on useEffect-useState`)

    const actualResult = JSON.stringify(mockAppointmentForm.mock.calls[1].arguments)
    const expectedResult = '[{"today":"2018-12-01T16:30:00.000Z","availableTimeSlots":[{"startsAt":1543680000000,"stylists":["Jo","Pat"]},{"startsAt":1543681800000,"stylists":["Jo","Jo"]}]},null]'
     assert.strictEqual(actualResult, expectedResult, `mockAppointmentForm actual - expected\n${actualResult}\n${expectedResult}`)
  })
})