import React, {useEffect, useState} from "react";
import type { Customer } from "./types.js";

const CustomerRow = ({ customer }: {customer: Customer}) => (
  <tr>
    <td>{customer.firstName}</td>
    <td>{customer.lastName}</td>
    <td>{customer.phoneNumber}</td>
    <td />
  </tr>
);

export type CustomerSearchProps = {}
export const CustomerSearch = ({}:CustomerSearchProps)=>{
  const [customers, setCustomers] = useState([]);
  const fetchData = async () => {
    const result = await global.fetch("/customers", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
      });
    setCustomers(await result.json());
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <table aria-label="customer search table">
        <thead>
          <tr>
            <th>First name</th>
            <th>Last name</th>
            <th>Phone number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer: Customer) => (
            <CustomerRow key={customer.id} customer={customer} />
          ))}
        </tbody>
      </table>
    </>
)}