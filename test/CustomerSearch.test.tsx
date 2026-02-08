import { afterEach, beforeEach, describe, it, mock } from "node:test";
import assert from 'node:assert/strict';

import "./domSetup"; // must be imported before render/screen
import React from "react";
import { render, screen, cleanup, within, waitFor, waitForElementToBeRemoved, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {CustomerSearch} from '../src/CustomerSearch.js'

const originalFetch = globalThis.fetch;

beforeEach( () => {
  globalThis.document.body.innerHTML = '<p>Hello world</p>';
})
afterEach(()=>{
  cleanup();
  globalThis.document.body.innerHTML = ' ';
  globalThis.fetch = originalFetch;
})
const testProps = {
}

describe('CustomerSearch', async () => {
  it("renders a table with four headings", async () => {
    render (<CustomerSearch />);
    const table = screen.getByLabelText(/customer search table/)
    const headings = within(table).getAllByRole("columnheader");
    const headingsArray = Array.from(headings).map((h) => h.textContent)
    const expected = [
      "First name",
      "Last name",
      "Phone number",
      "Actions",
    ]
    assert.deepEqual(headingsArray, expected, `Expected result is different from ${JSON.stringify(headingsArray)}`);
  });
})