import { after, afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from 'node:assert/strict';
import "./domSetup"; // must be imported before render/screen
import React, { ReactElement} from "react";
import { render, screen, cleanup, within, waitFor, act } from "@testing-library/react";

import type { AppointmentApi } from "../src/types.js";

const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})

const date = new Date("February 16, 2019");
const appointments:AppointmentApi[] = [
  {
    startsAt: date.setHours(9, 0, 0, 0),
    stylist: "Jo",
    service: "Cut",
    notes: "Note one"
  },
  {
    startsAt: date.setHours(10, 0, 0, 0),
    stylist: "Stevie",
    service: "Cut & color",
    notes: "Note two"
  }
];
const customer = {
  firstName: "Ashley",
  lastName: "Jones",
  phoneNumber: "123",
  appointments
};


describe("CustomerHistory", () => {
  it("renders the first name and last name together in a h2", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistoryAmplify.js')
    render(<CustomerHistory customer={customer}/>);
    const elementH2 = await screen.findByText<HTMLHeadingElement>(/ashley jones/i)
    const elementP = await screen.findByText<HTMLParagraphElement>(/123/i)
    const elementH3 = await screen.findByText<HTMLHeadingElement>(/booked appointments/i)
    assert.strictEqual(elementH2.tagName, 'H2', 'expect to find the customer\'s full name <H2></H2>')
    assert.strictEqual(elementP.tagName, 'P', 'expect to find the customer\'s phone number <P></P>')
    assert.strictEqual(elementH3.tagName, 'H3', 'expect to find the appointments header <H3></H3>')
  });
  it("renders a table with four column headings", async ()=>{
    const { CustomerHistory } = await import('../src/CustomerHistoryAmplify.js')
    render(<CustomerHistory customer={customer} />);
    const columnHeadings = await screen.findAllByRole('columnheader');
    const headings = Array.from(columnHeadings, (element)=> element.textContent)
    assert.deepEqual(headings, ['When','Stylist','Service','Notes'], 'expect to find four column headings')
  })
  it("renders the start time of each appointment in the correct format", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistoryAmplify.js')
    render (<CustomerHistory customer={customer} />);
    const element = await screen.findAllByText<HTMLTableCellElement>(/Feb 16 2019/i)
    const actual = Array.from(element, (el)=> el.textContent)
  //   "Sat Feb 16 2019 09:00",
  //   "Sat Feb 16 2019 10:00",
    assert.deepEqual(actual, ["Sat Feb 16 2019 09:00", "Sat Feb 16 2019 10:00"],'expect two dates')
  });
  it("renders the stylist", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistoryAmplify.js')
    render (<CustomerHistory customer={customer} />);
    const element = await screen.findAllByText<HTMLTableCellElement>(/\bJo\b|Stevie/i)
    const actual = Array.from(element, (el)=> el.textContent)
    assert.deepEqual(actual, ["Jo", "Stevie"],'expect two stylists')
  });
  it("renders the service", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistoryAmplify.js')
    render (<CustomerHistory customer={customer} />);
    const element = await screen.findAllByText<HTMLTableCellElement>(/Cut/i)
    const actual = Array.from(element, (el)=> el.textContent)
    assert.deepEqual(actual, ["Cut", "Cut & color"],'expect two services')
  });
  it("renders the note", async () => {
    const { CustomerHistory } = await import('../src/CustomerHistoryAmplify.js')
    render (<CustomerHistory customer={customer} />);
    const element = await screen.findAllByText<HTMLTableCellElement>(/\bnote\b/i)
    const actual = Array.from(element, (el)=> el.textContent)
    assert.deepEqual(actual, ["Note one", "Note two"],'expect two notes')
  });
});