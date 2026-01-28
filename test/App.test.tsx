import { afterEach, beforeEach, describe, it, mock} from "node:test";
import * as assert from 'node:assert/strict';

import "./domSetup.ts"; // must be imported before render/screen
import React, {act} from "react";
import { render, screen, cleanup, waitForElementToBeRemoved, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {blankAppointment, blankCustomer} from '../src/sampleDataStatic.ts'
import { type CustomerFormProps } from "../src/CustomerForm.js";
import { type AppointmentFormLoaderProps } from "../src/AppointmentFormLoader.js";

const today = new Date(2018, 11, 1);

const mockCustomerForm = mock.fn((
  {
    customer,
    onSave
  }: CustomerFormProps)=>(<div data-testid='mockCustomerForm'></div>))
const mockAppointmentFormLoader = mock.fn((
  {
    today,
    onSave
  }: AppointmentFormLoaderProps)=>(<div data-testid='mockAppointmentFormLoader'></div>))
mock.module('../src/CustomerForm.tsx', {
  namedExports: {
    CustomerForm: mockCustomerForm
  }
})
mock.module('../src/AppointmentFormLoader.tsx', {
  namedExports: {
    AppointmentFormLoader: mockAppointmentFormLoader
  }
})
const {App} = await import('../src/App.js')

beforeEach( async () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
})

const testProps = {
  customer: blankCustomer
}

describe('App', ()=>{
  it('initially shows the AppointmentDayViewLoader', async ()=>{
    render(<App/>)
    // await waitFor(()=>{screen.getByText('App')})
    assert.ok(screen.getByText('There are no appointments scheduled for today'))
  })
  it('has a menu bar', async ()=>{
    const {container} = render(<App/>)
    assert.ok(container.getElementsByTagName('menu'))
    assert.ok(screen.getByLabelText('menu'))
  })
  it('has a button to initiate add customer and appointment action', async ()=>{
    render(<App/>)
    assert.ok(screen.getByText('Add customer and appointment'))
  })
  it('displays the CustomerForm when button is clicked', async ()=>{
    let isHiddenAppointmentDayViewLoader = false
    const evt = userEvent.setup()
    render(<App/>)
    const button = screen.getByText('Add customer and appointment')
    waitForElementToBeRemoved(
      ()=>screen.getByText('There are no appointments scheduled for today'))
      .then(()=>{isHiddenAppointmentDayViewLoader = true})
    await evt.click(button)
    await screen.findByTestId('mockCustomerForm')

    assert.ok(screen.getByTestId('mockCustomerForm'))
    assert.equal(mockCustomerForm.mock.callCount(), 1, 'CustomerForm expected to be called once on App render')
    const actualArguments = JSON.stringify(mockCustomerForm.mock.calls[0].arguments)
    const expectedArguments = JSON.stringify([{customer: blankCustomer}, null])
    assert.strictEqual(actualArguments, expectedArguments, 'CustomerForm called with expected arguments')

    assert.ok(isHiddenAppointmentDayViewLoader, 'AppointmentDayViewLoader should not be found')
    assert.ok(!screen.queryByText('Add customer and appointment'), 'Button should be gone too')
  })
  it('displays the AppointmentFormLoader after the CustomerForm is submitted', async ()=>{
    const evt = userEvent.setup()
    const a = render(<App/>)
    const button = screen.getByText('Add customer and appointment')
    await evt.click(button)
    await screen.findByTestId('mockCustomerForm')
    const onSaveCustomerForm = mockCustomerForm.mock.calls[mockCustomerForm.mock.callCount()-1].arguments[0].onSave
    const customerId = {id: 123}
    await waitFor(()=>onSaveCustomerForm({...blankCustomer, ...customerId}))
    const AppointmentFormLoaderElement = await screen.findByTestId('mockAppointmentFormLoader')
    
    assert.ok(AppointmentFormLoaderElement, 'Should render mockAppointmentFormLoader')
    const actualArguments = JSON.stringify(
      mockAppointmentFormLoader.mock.calls[mockAppointmentFormLoader.mock.callCount()-1]
        .arguments[0]
        .appointment)
    const expectedArguments = JSON.stringify({...blankAppointment, customer:{...blankCustomer,...customerId}})

    assert.strictEqual(
      actualArguments, 
      expectedArguments, 
      'Should pass blank original appointment object to CustomerForm via AppointmentFormLoader')

    const onSaveAppointmentFormLoader = mockAppointmentFormLoader.mock.calls[mockAppointmentFormLoader.mock.callCount()-1]
      .arguments[0]
      .onSave!
    await waitFor(()=>onSaveAppointmentFormLoader())
    assert.ok(await screen.findByText('There are no appointments scheduled for today'), 'Should render AppointmentDayView')
  })
})
