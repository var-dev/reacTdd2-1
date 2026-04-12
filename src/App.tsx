import React, {useState, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "./store.js";
import { Link, Route, Routes, useNavigate } from "react-router";
import { AppointmentsDayViewLoader } from "./AppointmentsDayViewLoader.js";
import { CustomerForm } from "./CustomerForm.js";
import type { Customer } from "./types.js";
import { blankAppointment, blankCustomer } from "./sampleDataStatic.js";
import { CustomerSearchRoute } from "./CustomerSearchRoute.js";
import { AppointmentFormRoute } from "./AppointmentFormRoute.js";
import { navigateRequest, navigationSuccessful } from "./navigationSlice.js";
import { CustomerHistoryRoute } from "./CustomerHistoryRouteRedux.js";
// import { CustomerHistoryRoute } from "./CustomerHistoryRoute.js";

type View = 'dayView' | 'addCustomer' | 'addAppointment' | 'searchCustomers'

const useAppSelector = useSelector.withTypes<RootState>()
const useAppDispatch = useDispatch.withTypes<AppDispatch>()

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
  const dispatch = useAppDispatch()
  const {navigateTo} = useAppSelector(({ navigation }) => navigation);
  useEffect(() => {
    if (navigateTo[0] === "/") {
      navigate(navigateTo);
      dispatch(navigationSuccessful());
    }
  }, [navigateTo, navigate])

  const transitionToDayView = () => {dispatch(navigateRequest('/'))}
  // const transitionToDayView = () => navigate("/");

  const searchActions = (customer: Customer) => (<>
    <Link
      role="button"
      to={`/addAppointment?customerId=${customer.id}`}
    >
      Create appointment
    </Link>
    <Link
      role="button"
      to={`/viewHistory?customer=${customer.id}`}
    >
      View history
    </Link>
  </>);

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
      <Route
        path="/viewHistory"
        element={
          <CustomerHistoryRoute/>
        }
      />
      <Route path="/" element={<MainScreen />} />
    </Routes>
  );
};