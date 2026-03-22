import React, {useState, useCallback} from "react";
import { Link, Route, Routes, useNavigate } from "react-router";
import { AppointmentsDayViewLoader } from "./AppointmentsDayViewLoader.js";
import { CustomerForm } from "./CustomerForm.js";
import type { Customer } from "./types.js";
import { CustomerSearch } from "./CustomerSearch.js";
import { blankAppointment, blankCustomer } from "./sampleDataStatic.js";
import { CustomerSearchRoute } from "./CustomerSearchRoute.js";
import { AppointmentFormRoute } from "./AppointmentFormRoute.js";

type View = 'dayView' | 'addCustomer' | 'addAppointment' | 'searchCustomers'

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