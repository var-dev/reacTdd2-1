import { beforeEach, describe, it, } from "node:test";
import * as assert from "node:assert/strict";

import "./domSetup"

import * as React from "react";
import { act,  } from "react";
import {createRoot} from "react-dom/client";

import {Appointment} from "../src/AppointmentsDayView.js";
import type { Customer } from "../src/AppointmentsDayView.js";
import { sampleAppointmentsShort } from "../src/sampleDataStatic.js";

let container: HTMLDivElement
const render = async (node: React.ReactNode) => {
  act(() => { createRoot(container).render(node) })
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.replaceChildren(container);
})


describe("DOM basics", () => {
  it("renders a div", async () => {
    render(<h1>Hello</h1>)
    
    assert.equal(container.textContent, "Hello");
  })

  it("renders Appointment with customer prop", async () => {
    const customer: Customer = {firstName: "Jordan", lastName: "Doe", phoneNumber: "123-456-7890"};
    render(<Appointment customer={customer} stylist="" service="" notes="" startsAt={0}/>);

    assert.match(container.textContent, /Jordan/, `Incorrect last name. Matched ${container.textContent}`);
  })
  it("renders Appointment with lastName, phoneNumber, etc", async () => {
    // render(<Appointment customer={sampleAppointments[1].customer } stylist={sampleAppointments[1].stylist} service={sampleAppointments[1].service} notes={sampleAppointments[1].notes} startsAt={sampleAppointments[1].startsAt} />);
    render(<Appointment {...sampleAppointmentsShort[1]}/>);

    assert.match(container.textContent, /Smith/, `Incorrect last name. Matched ${container.textContent}`);
    assert.match(container.textContent, /000000000001/, `Incorrect phone number. Matched ${container.textContent}`);
    assert.match(container.textContent, /Larry/, `Incorrect stylist. Matched ${container.textContent}`);
    assert.match(container.textContent, /trim/, `Incorrect service. Matched ${container.textContent}`);
    assert.match(document.body.textContent, /notes ASD/, `Incorrect notes. Matched ${container.textContent}`);
  })

})
