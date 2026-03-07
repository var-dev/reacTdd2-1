import React, {useState, useCallback} from "react";
import { Link, Route, Routes, useNavigate } from "react-router";
import { AppointmentsDayViewLoader } from "./AppointmentsDayViewLoader.js";
import { AppointmentFormLoader } from "./AppointmentFormLoader.js";
import { CustomerForm } from "./CustomerForm.js";
import type { Customer } from "./types.js";
import { CustomerSearch } from "./CustomerSearch.js";
import { blankAppointment, blankCustomer } from "./sampleDataStatic.js";
import { CustomerSearchRoute } from "./CustomerSearchRoute.js";
import { AppointmentFormRoute } from "./AppointmentFormRoute.js";

type View = 'dayView' | 'addCustomer' | 'addAppointment' | 'searchCustomers'
// export const App1 = (
//   {
//   }) => {
//   const [view, setView] = useState<View>("dayView");
//   const [customer, setCustomer] = useState<Customer>();
//   const searchActions = (customer: Customer) => (
//     <button 
//       type="button"
//       onClick={()=>transitionToAddAppointment(customer)}
//     >Create appointment</button>
//   );
//   const MainScreen = ()=>( 
//     <>
//       <menu aria-label="menu">
//         <li>
//           <button type="button"
//             onClick={transitionToAddCustomer}
//           >
//             Add customer and appointment
//           </button>
//         </li>
//         <li>
//           <button
//             type="button"
//             onClick={transitionToSearchCustomers}
//           >
//             Search customers
//           </button>
//         </li>
//       </menu>
//       <AppointmentsDayViewLoader today={new Date()} />
//     </>
//   );
  
//   const transitionToAddCustomer = useCallback(
//     () => setView("addCustomer"),
//     []
//   );
//   const transitionToAddAppointment = useCallback(
//     (customer: Customer) => {
//       setCustomer(customer);
//       setView("addAppointment")
//     }, 
//     []
//   );
//   const transitionToDayView = useCallback(() => setView("dayView"), []);
//   const transitionToSearchCustomers = useCallback(() => setView("searchCustomers"), []);
//   switch(view){
//     case "addCustomer": 
//       return (
//         <CustomerForm 
//           customer={blankCustomer}
//           onSave={transitionToAddAppointment}
//           />)
//     case "addAppointment":
//       return (
//         <AppointmentFormLoader 
//           today={new Date()}
//           appointment={{...blankAppointment, customerId: customer?.id!}}
//           onSave={transitionToDayView}/>
//       )
//     case "searchCustomers":
//       return (<CustomerSearch renderCustomerActions={searchActions}/>)
//     default:
//       return (<MainScreen />)
//   }
// }

export const MainScreen = () => (
  <>
    <menu aria-label="menu">
      <li>
        <Link to="/addCustomer" role="button">
          Add customer and appointment
        </Link>
      </li>
      <li>
        <Link to="/searchCustomers" role="button">
          Search customers
        </Link>
      </li>
    </menu>
    <AppointmentsDayViewLoader today={new Date()} />
  </>
);

export const App = () => {
  const navigate = useNavigate();

  const transitionToAddAppointment = (customer: Customer) =>
    navigate(
      `/addAppointment?customerId=${customer.id}`
    );

  const transitionToDayView = () => navigate("/");

  const searchActions = (customer: Customer) => (
    <Link
      role="button"
      to={`/addAppointment?customerId=${customer.id}`}
    >
      Create appointment
    </Link>
  );

  return (
    <Routes>
      <Route
        path="/addCustomer"
        element={
          <CustomerForm
            customer={blankCustomer}
            onSave={transitionToAddAppointment}
          />
        }
      />
      <Route
        path="/addAppointment"
        element={
          <AppointmentFormRoute
            today={new Date()}
            onSave={transitionToDayView}
          />
        }
      />
      <Route
        path="/searchCustomers"
        element={
          <CustomerSearchRoute
            renderCustomerActions={searchActions}
          />
        }
      />
      <Route path="/" element={<MainScreen />} />
    </Routes>
  );
};