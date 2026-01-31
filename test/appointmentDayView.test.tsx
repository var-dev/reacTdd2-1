import { beforeEach, describe, it, } from "node:test";
import * as assert from "node:assert/strict";

import "./domSetup"

import * as React from "react";
import { act } from "react";
import {createRoot} from "react-dom/client";

import { AppointmentsDayView} from "../src/AppointmentsDayView.js";
import type { AppointmentProps } from "../src/AppointmentsDayView.js";

const today = new Date();
const twoAppointments: AppointmentProps[] = [
  { 
    startsAt: today.setHours(12, 0),
    customer: { firstName: "Ashley" },
    stylist: "Mary",
    service: "cut",
    notes: "notes QWE"
  },
  { 
    startsAt: today.setHours(13, 0),
    customer: { firstName: "Jordan" },
    stylist: "Larry",
    service: "trim",
    notes: "notes ASD"
  },
  ];

let container: HTMLDivElement
const render = async (node: React.ReactNode) => {
  act(() => { createRoot(container).render(node) })
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.replaceChildren(container);
})

describe("AppointmentsDayView", () => {
  it("renders AppointmentsDayView", async () => {
    render(<AppointmentsDayView appointments={[]}/>);
    const element = document.querySelector("div#appointmentsDayView");

    assert.ok(element ?? false)
  })
  it("renders ol element", async () => {
    render(<AppointmentsDayView appointments={[]}/>);
    const listElement = document.querySelector("ol");

    assert.ok(listElement ?? false)
  })
  it("renders li for 2 appointments", async () => {
    render(<AppointmentsDayView appointments={twoAppointments}/>);
    const listChildren = document.querySelectorAll("ol>li") ;

    assert.strictEqual(listChildren.length, 2)
  })
  it("renders time for each appointment", async () => {
    render(<AppointmentsDayView appointments={twoAppointments}/>);
    const listChildren = document.querySelectorAll("ol>li") ;

    assert.strictEqual(listChildren[0].textContent, "12:00")
    assert.strictEqual(listChildren[1].textContent, "13:00")
  })
  it("initially shows no appointments today", async () => {
    render(<AppointmentsDayView appointments={[]}/>);
    const element = document.querySelector("div#appointmentsDayView");

    assert.strictEqual(document.body.textContent, 'There are no appointments scheduled for today')
  })
  it("selects the first appointment by default", async () => {
    render(<AppointmentsDayView appointments={twoAppointments}/>);

    assert.match(document.body.textContent, /Ashley/)
  })
  it("has a button element in each li", async () => {
    render(<AppointmentsDayView appointments={twoAppointments}/>);
    const buttons = document.querySelectorAll<HTMLButtonElement>("li>button") ;

    assert.strictEqual(buttons.length, 2)
    assert.strictEqual(buttons[0].type, 'button', `Type is not button but ${buttons[0].type}`)
  })

  it("renders another appointment when selected", async () => {
    render(<AppointmentsDayView appointments={twoAppointments}/>);
    const button = document.querySelectorAll<HTMLButtonElement>("li>button")[1] ;
    act(() => button.click());

    assert.match(document.body.textContent, /Jordan/)
  })
  it("renders header with appointment time", async () => {
    render(<AppointmentsDayView appointments={twoAppointments}/>);
    const button = document.querySelectorAll<HTMLButtonElement>("li>button")[1] ;
    act(() => button.click());

    assert.match(document.body.textContent, /Today's appointment at \d\d:00/)
  })
})
