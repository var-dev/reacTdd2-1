import React, {useState, useCallback} from "react";

import { AppointmentsDayViewLoader } from "./AppointmentsDayViewLoader.js";
import { AppointmentFormLoader } from "./AppointmentFormLoader.js";
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
  }: AppProps) => {
  const [view, setView] = useState("dayView");
  const transitionToAddCustomer = useCallback(
    () => setView("addCustomer"),
    []
  );
  const transitionToAddAppointment = useCallback(
    () => setView("addAppointment"), 
    []
  );
  switch(view){
    case "addCustomer": 
      return (
        <CustomerForm 
          customer={customer}
          onSave={transitionToAddAppointment}
          />)
    case "addAppointment":
      return (
        <AppointmentFormLoader today={today}/>
      )
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
          </menu>
          <AppointmentsDayViewLoader today={today}/>
        </> 
      )
  }
  // return (
  //   <>
  //     {view === "addCustomer" 
  //       ? (<CustomerForm 
  //         customer={customer}
  //         onSave={transitionToAddAppointment}
  //         /> )
  //       :
  //       <>
  //         <menu aria-label="menu">
  //           <li>
  //             <button type="button"
  //               onClick={transitionToAddCustomer}
  //             >
  //             Add customer and appointment
  //             </button>
  //           </li>
  //         </menu>
  //         <AppointmentsDayViewLoader today={today}/>
  //       </> 
  //     }
  //   </>
  // )
}