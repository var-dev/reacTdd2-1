import { beforeEach, describe, it, } from "node:test";
import * as assert from "node:assert/strict";

import "./domSetup"

import * as React from "react";
import { act } from "react";
import {createRoot} from "react-dom/client";

import { AppointmentsDayView} from "../src/appointment";

let container: HTMLDivElement
const render = async (node: React.ReactNode) => {
  act(() => { createRoot(container).render(node) })
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.replaceChildren(container);
})

describe("DOM basics", () => {
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
    const today = new Date();
    const twoAppointments = [
    { startsAt: today.setHours(12, 0) },
    { startsAt: today.setHours(13, 0) },
    ];
    render(<AppointmentsDayView appointments={twoAppointments}/>);
    const listChildren = document.querySelectorAll("ol>li") ;

    assert.strictEqual(listChildren.length, 2)
  })
  it("renders time for each appointment", async () => {
    const today = new Date();
    const twoAppointments = [
    { startsAt: today.setHours(12, 0) },
    { startsAt: today.setHours(13, 0) },
    ];
    render(<AppointmentsDayView appointments={twoAppointments}/>);
    const listChildren = document.querySelectorAll("ol>li") ;

    assert.strictEqual(listChildren[0].textContent, "12:00")
    assert.strictEqual(listChildren[1].textContent, "13:00")
  })
})
