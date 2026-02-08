import React, {useState, useCallback} from "react";

import { AppointmentsDayViewLoader } from "./AppointmentsDayViewLoader.js";
import { AppointmentFormLoader } from "./AppointmentFormLoader.js";
import { CustomerForm } from "./CustomerForm.js";
import type { Customer } from "./types.js";
import { CustomerSearch } from "./CustomerSearch.js";
import { blankAppointment, blankCustomer } from "./sampleDataStatic.js";

export type AppProps = {

}
export const App = (
  {
    
  }: AppProps) => {
  const [view, setView] = useState("dayView");
  const [customer, setCustomer] = useState<Customer>();
  const transitionToAddCustomer = useCallback(
    () => setView("addCustomer"),
    []
  );
  const transitionToAddAppointment = useCallback(
    (customer: Customer) => {
      setCustomer(customer);
      setView("addAppointment")
    }, 
    []
  );
  const transitionToDayView = useCallback(() => setView("dayView"), []);
  const transitionToSearchCustomers = useCallback(() => setView("searchCustomers"), []);
  switch(view){
    case "addCustomer": 
      return (
        <CustomerForm 
          customer={blankCustomer}
          onSave={transitionToAddAppointment}
          />)
    case "addAppointment":
      return (
        <AppointmentFormLoader 
          today={new Date()}
          appointment={{...blankAppointment, customer: customer!}}
          onSave={transitionToDayView}/>
      )
    case "searchCustomers":
      return (<CustomerSearch/>)
    default:
      return (
        <>
          <menu aria-label="menu">
            <li>
              <button type="button"
                onClick={transitionToAddCustomer}
              >
                Add customer and appointment
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={transitionToSearchCustomers}
              >
                Search customers
              </button>
            </li>
          </menu>
          <AppointmentsDayViewLoader today={new Date()}/>
        </> 
      )
  }
}