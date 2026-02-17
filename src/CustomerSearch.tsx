import React, {useEffect, useState, useCallback, type ReactNode} from "react";
import type { Customer } from "./types.js";

const searchParams = (after: string, searchTerm: string ) => {
  let pairs = [];
  if (after) { pairs.push(`after=${after}`)}
  if (searchTerm) { pairs.push(`searchTerm=${searchTerm}`)}
  if (pairs.length > 0) {
    return `?${pairs.join("&")}`;
  }
  return "";
};

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

type CustomerRowProps = {customer: Customer, renderCustomerActions: (customer: Customer)=>ReactNode}
const CustomerRow = ({ 
  customer,
  renderCustomerActions
}: CustomerRowProps) => (
  <tr>
    <td>{customer.firstName}</td>
    <td>{customer.lastName}</td>
    <td>{customer.phoneNumber}</td>
    <td>{renderCustomerActions(customer)}</td>
    <td />
  </tr>
);

export type CustomerSearchProps = {renderCustomerActions: (customer: Customer) => ReactNode}
export const CustomerSearch = ({
  renderCustomerActions = ()=><></>
  }:CustomerSearchProps )=>{
  const [customers, setCustomers] = useState<Customer[] | undefined>(undefined);
  const [lastRowIds, setLastRowIds] = useState<(string )[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const handleNext = useCallback(async () => {
    if (!Array.isArray(customers) || customers.length === 0) return;
    const currentLastRowId = customers[customers.length - 1]!.id!;
    setLastRowIds([...lastRowIds, currentLastRowId]);
  }, [customers, lastRowIds]);
  const handlePrevious = useCallback(async () => {
    setLastRowIds(lastRowIds.slice(0, -1))
  }, [lastRowIds]);
  const handleSearchTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }
  const fetchData = async () => {
    const after = lastRowIds[lastRowIds.length - 1] ?? '';
    const query = searchParams(after, searchTerm);
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
  }, [lastRowIds, searchTerm]);
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
                <CustomerRow 
                  key={customer.id} 
                  customer={customer} 
                  renderCustomerActions={renderCustomerActions}
                />
              ))
            : null}
        </tbody>
      </table>
    </>
)}