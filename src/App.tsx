import React, {useState, useCallback} from "react";

import { AppointmentsDayViewLoader } from "./AppointmentsDayViewLoader.js";
import { AppointmentFormLoader } from "./AppointmentFormLoader.js";
import { CustomerForm } from "./CustomerForm.js";
import type { Customer } from "./types.js";
import { CustomerSearch } from "./CustomerSearch.js";
import { blankAppointment, blankCustomer } from "./sampleDataStatic.js";

type View = 'dayView' | 'addCustomer' | 'addAppointment' | 'searchCustomers'
export const App = (
  {
  }) => {
  const [view, setView] = useState<View>("dayView");
  const [customer, setCustomer] = useState<Customer>();
  const searchActions = (customer: Customer) => (
    <button 
      type="button"
      onClick={()=>transitionToAddAppointment(customer)}
    >Create appointment</button>
  );
  const MainScreen = ()=>( 
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
      <AppointmentsDayViewLoader today={new Date()} />
    </>
  );
  
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
          appointment={{...blankAppointment, customerId: customer?.id!}}
          onSave={transitionToDayView}/>
      )
    case "searchCustomers":
      return (<CustomerSearch renderCustomerActions={searchActions}/>)
    default:
      return (<MainScreen />)
  }
}