import React, {useEffect, useState, useCallback, type ReactNode} from "react";
import type { Customer } from "./types.js";
import { searchParams } from "./searchParams.js";

type SearchButtonsProps = {
  handleNext: ()=>void
  disabledNext: boolean
  handlePrevious: ()=>void
  disabledPrevious: boolean
  handlePageLimit: (event: React.ChangeEvent<HTMLInputElement>)=>void
  pageLimit: number
}
const SearchButtons = ({handleNext, disabledNext, handlePrevious, disabledPrevious, handlePageLimit, pageLimit}: SearchButtonsProps) => (
  <menu>
    <li>
      <button 
        type="button"
        onClick={handlePrevious}
        disabled={disabledPrevious}
      >Previous</button >
    </li>
    <li>
      <button 
        type="button"
        onClick={handleNext}
        disabled={disabledNext}
      >Next</button >
    </li>
    <li>
      <input
        aria-label="Records per page"
        type="number"
        onChange={handlePageLimit}
        placeholder="Enter page limit" 
        value={pageLimit} 
      /> 
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
  const [pageLimit, setPageLimit] = useState(10)
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
  const handlePageLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const limit = Number(event.target.value) || 10
    setPageLimit(limit);
  }
  const fetchData = async () => {
    const after = lastRowIds[lastRowIds.length - 1] ?? '';
    const limit = pageLimit === 10 ? '' : String(pageLimit)
    const query = searchParams({after, searchTerm, limit});
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
  }, [lastRowIds, searchTerm, pageLimit]);
  return (
    <>
      <input 
        aria-label="Search for customers"
        placeholder="Enter filter text"
        type="text"
        value={searchTerm}
        onChange={handleSearchTextChanged}
      />
      <SearchButtons 
        handleNext={handleNext} 
        disabledNext={Array.isArray(customers) ? customers.length < pageLimit : true}
        handlePrevious={handlePrevious}
        disabledPrevious={lastRowIds.length === 0}
        handlePageLimit={handlePageLimit}
        pageLimit={pageLimit}
      />
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