import { beforeEach, describe, it, } from "node:test";
import * as assert from "node:assert/strict";

import "./domSetup"

import * as React from "react";
import { act } from "react";
import {createRoot} from "react-dom/client";

import {Appointment} from "../src/appointment";

let container: HTMLDivElement
const render = (node: React.ReactNode) => {
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
    const customer = { firstName: "Jordan" };
    render(<Appointment customer={customer}/>);

    assert.equal(container.textContent, "Jordan");
  })
})
