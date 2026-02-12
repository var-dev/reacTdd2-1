import React, {useEffect, useState, useCallback} from "react";
import type { Customer } from "./types.js";

type SearchButtonsProps = {
  handleNext: ()=>void
}
const SearchButtons = ({handleNext}: SearchButtonsProps) => (
  <menu>
    <li>
      <button 
        type="button"
        onClick={handleNext}
      >Next</button >
    </li>
  </menu>
);
const CustomerRow = ({ customer }: {customer: Customer}) => (
  <tr>
    <td>{customer.firstName}</td>
    <td>{customer.lastName}</td>
    <td>{customer.phoneNumber}</td>
    <td />
  </tr>
);

export const CustomerSearch = ()=>{
  const [customers, setCustomers] = useState<Customer[] | undefined>(undefined);
  const handleNext = useCallback(async () => {
    if (!Array.isArray(customers) || customers.length === 0) return;
    const after = customers[customers.length - 1]!.id;
    const url = `/customers?after=${after}`;
    const result = await globalThis.fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" }
    });
    setCustomers(await result.json());
  }, [customers]);
  const fetchData = async () => {
    const result = await globalThis.fetch("/customers", {
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
      <SearchButtons handleNext={handleNext}/>
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
          {Array.isArray(customers) 
            ? customers.map((customer: Customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))
            : null}
        </tbody>
      </table>
    </>
)}