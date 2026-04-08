import { test, describe, beforeEach, afterEach, expect, vi } from "vitest";
import React, { Suspense} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MockEnvironment, MockPayloadGenerator, createMockEnvironment } from "relay-test-utils";
import { RelayEnvironmentProvider } from "react-relay";
import { render, screen, cleanup, within, waitFor, waitForElementToBeRemoved } from "@testing-library/react";

import type { Customer, AppointmentApi } from "../src/types.js";
import { CustomerHistory } from "../src/CustomerHistoryLazy.js";

const originalFetch = globalThis.fetch;

const renderWithRelay = (env: MockEnvironment, id: string) => {
  render(
    <RelayEnvironmentProvider environment={env}>
      <ErrorBoundary 
        fallback={<p>Sorry, an error occurred while pulling data from the server.</p>}
        // onError={(error) => console.error(error)}
      >
        <Suspense fallback={<p>Loading...</p>}>
          <CustomerHistory id={id} />
        </Suspense>
      </ErrorBoundary>
    </RelayEnvironmentProvider>
  );
};
 
const resolve = (env: MockEnvironment, data: Record<string, unknown> | null) => {
  env.mock.resolveMostRecentOperation((operation) =>
    MockPayloadGenerator.generate(operation, {
      Query: () => ({ customer: data }),
    })
  );
};

const reject = (env: MockEnvironment, ) => {
  env.mock.rejectMostRecentOperation(new Error());
};

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

describe("CustomerHistory", ( ) => {
  let env: MockEnvironment;
 
  beforeEach(() => {
    env = createMockEnvironment();
  });
  
  test("renders the first name and last name together in a h2", async () => {
    renderWithRelay(env, '123');
    resolve(env, customer);
    const elementH2 = await screen.findByText<HTMLHeadingElement>(/ashley jones/i)
    const elementP = await screen.findByText<HTMLParagraphElement>(/123/i)
    const elementH3 = await screen.findByText<HTMLHeadingElement>(/booked appointments/i)
    expect(elementH2.tagName).toBe('H2')//, 'expect to find the customer\'s full name <H2></H2>')
    expect(elementP.tagName).toBe( 'P') //, 'expect to find the customer\'s phone number <P></P>')
    expect(elementH3.tagName).toBe( 'H3')//, 'expect to find the appointments header <H3></H3>')
  });
  test("renders a table with four column headings", async ()=>{
    renderWithRelay(env, '123');
    resolve(env, customer);
    const columnHeadings = await screen.findAllByRole('columnheader');
    const headings = Array.from(columnHeadings, (element)=> element.textContent)
    expect(headings).toEqual( ['When','Stylist','Service','Notes'])
  })
  test("renders the start time of each appointment in the correct format", async () => {
    renderWithRelay(env, '123');
    resolve(env, customer);
    const element = await screen.findAllByText<HTMLTableCellElement>(/Feb 16 2019/i)
    const actual = Array.from(element, (el)=> el.textContent)
  //   "Sat Feb 16 2019 09:00",
  //   "Sat Feb 16 2019 10:00",
    expect(actual).toEqual( ["Sat Feb 16 2019 09:00", "Sat Feb 16 2019 10:00"])
  });
  test("renders the stylist", async () => {
    renderWithRelay(env, '123');
    resolve(env, customer);
    const element = await screen.findAllByText<HTMLTableCellElement>(/\bJo\b|Stevie/i)
    const actual = Array.from(element, (el)=> el.textContent)
    expect(actual).toEqual( ["Jo", "Stevie"])
  });
  test("renders the service", async () => {
    renderWithRelay(env, '123');
    resolve(env, customer);
    const element = await screen.findAllByText<HTMLTableCellElement>(/Cut/i)
    const actual = Array.from(element, (el)=> el.textContent)
    expect(actual).toEqual( ["Cut", "Cut & color"])
  });
  test("renders the note", async () => {
    renderWithRelay(env, '123');
    resolve(env, customer);
    const element = await screen.findAllByText<HTMLTableCellElement>(/\bnote\b/i)
    const actual = Array.from(element, (el)=> el.textContent)
    expect(actual).toEqual( ["Note one", "Note two"])
  });
  test("displays a loading message", async () => {
    renderWithRelay(env, '123');
    resolve(env, customer);
    const element = await screen.findAllByText<HTMLElement>(/Loading/i)
    const [actual] = Array.from(element, (el)=> el.textContent)
    expect(actual).toContain('Loading')
  });
  test("displays an error message", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    renderWithRelay(env, '123');
    reject(env);
    await waitForElementToBeRemoved( ()=>screen.getByText(/Loading/i))
    const element = await screen.findAllByText<HTMLElement>(/Sorry/i)
    const [actual] = Array.from(element, (el)=> el.textContent)
    expect(actual).toBe( 'Sorry, an error occurred while pulling data from the server.')
  });
});