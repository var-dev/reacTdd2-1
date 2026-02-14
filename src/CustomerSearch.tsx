import React, {useEffect, useState, useCallback} from "react";
import type { Customer } from "./types.js";

type SearchButtonsProps = {
  handleNext: ()=>void
  handlePrevious: ()=>void
}
const SearchButtons = ({handleNext, handlePrevious}: SearchButtonsProps) => (
  <menu>
    <li>
      <button 
        type="button"
        onClick={handleNext}
      >Next</button >
    </li>
    <li>
      <button 
        type="button"
        onClick={handlePrevious}
      >Previous</button >
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
  const [queryString, setQueryString] = useState("");
  const [previousQueryString, setPreviousQueryString] = useState("");
  const handleNext = useCallback(async () => {
    if (!Array.isArray(customers) || customers.length === 0) return;
    const after = customers[customers.length - 1]!.id;
    const newQueryString = `?after=${after}`;
    setPreviousQueryString(queryString);
    setQueryString(newQueryString);
  }, [customers, queryString]);
  const handlePrevious = useCallback(async () => {
    setQueryString(previousQueryString)
  }, [previousQueryString]);
  const fetchData = async () => {
    const result = await globalThis.fetch(`/customers${queryString}`, {
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
  }, [queryString]);
  return (
    <>
      <SearchButtons handleNext={handleNext} handlePrevious={handlePrevious}/>
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