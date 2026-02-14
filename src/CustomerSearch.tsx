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
  const [queryString, setQueryString] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const handleNext = useCallback(async () => {
    if (!Array.isArray(customers) || customers.length === 0) return;
    const after = customers[customers.length - 1]!.id;
    const newQueryString = `?after=${after}`;
    setQueryString([...queryString, newQueryString]);
  }, [customers, queryString]);
  const handlePrevious = useCallback(async () => {
    setQueryString(queryString.slice(0, -1))
  }, [queryString]);
  const handleSearchTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }
  const fetchData = async () => {
    let query = ''
    if (queryString.length > 0 && searchTerm !== ''){
      query = queryString[queryString.length-1] + `&searchTerm=${searchTerm}`;
    } else if(searchTerm !== ''){
      query = `?searchTerm=${searchTerm}`;
    } else if (queryString.length > 0 ){
      query = queryString[queryString.length-1] ?? '';
    }
    const result = await globalThis.fetch(`/customers${query}`, {
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
  }, [queryString, searchTerm]);
  return (
    <>
      <label>
        <input placeholder="Enter filter text"
        value={searchTerm}
        onChange={handleSearchTextChanged}
        />
      Search for customers</label>
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