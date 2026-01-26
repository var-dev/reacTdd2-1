import React, {useState, useCallback} from "react";

import { AppointmentsDayViewLoader } from "./AppointmentsDayViewLoader.js";
import { CustomerForm } from "./CustomerForm.js";
import type { Customer } from "./AppointmentsDayView.js";

export type AppProps = {
  today?: Date;
  customer: Customer
}
export const App = (
  {
    today = new Date(1970,1,1),
    customer
  }:any) => {
  const [view, setView] = useState("dayView");
  const transitionToAddCustomer = useCallback(
    () => setView("addCustomer"),
    []
  );
  return (
    <>
      {view === "addCustomer" 
        ? (<CustomerForm 
          customer={customer}
          onSave={()=>{}}
          /> )
        :
        <>
          <menu aria-label="menu">
            <li>
              <button type="button"
                onClick={transitionToAddCustomer}
              >
              Add customer and appointment
              </button>
            </li>
          </menu>
          <AppointmentsDayViewLoader today={today}/>
        </> 
      }
    </>
  )
}