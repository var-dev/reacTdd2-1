import React, {useEffect, useState, useCallback, type ReactNode} from "react";
import { useSearchParams } from "react-router";
import type { Customer } from "./types.js";
import { searchParams, convertParams, commaStringPop, commaStringPush} from "./searchParams.js";

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
  
  const [params, setParams] = useSearchParams();
  // const [params, setParams] = useSearchParams({
  //   after: '',
  //   searchTerm: '',
  //   limit: '10'});  
  const [lastRowIds, setLastRowIds] = useState<string>('');
  // const [searchTerm, setSearchTerm] = useState("");
  // const [limit, setPageLimit] = useState(10)
  const handlePageLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const limit = event.target.value ?? '10'
    setParams({...convertParams(params), limit});
  }
  const handleSearchTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setParams({
    // after: params.get('after') ?? '',
    // searchTerm: event.target.value,
    // limit: params.get('limit') ?? ''}
    //   );
    setParams({...convertParams(params), searchTerm: event.target.value})
  }
  const [customers, setCustomers] = useState<Customer[] | undefined>(undefined);
  const handleNext = useCallback(async () => {
    if (!Array.isArray(customers) || customers.length === 0) return;
    const currentLastRowId = customers[customers.length - 1]!.id!;
    setLastRowIds(commaStringPush(lastRowIds, String(currentLastRowId)));
  }, [customers, lastRowIds]);
  const handlePrevious = useCallback(async () => {
    const [commaString, last] = commaStringPop(lastRowIds)
    setLastRowIds(commaString)
  }, [lastRowIds]);


  const fetchData = async () => {
    const [, after] = commaStringPop(lastRowIds)
    const query = searchParams({after, searchTerm: params.get('searchTerm') ?? '', limit: String(convertParams(params).limit ?? '') });
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
  }, [lastRowIds, params.get('searchTerm'), convertParams(params).limit]);
  return (
    <>
      <input 
        aria-label="Search for customers"
        placeholder="Enter filter text"
        type="text"
        value={params.get('searchTerm') ?? ''}
        onChange={handleSearchTextChanged}
      />
      <SearchButtons 
        handleNext={handleNext} 
        disabledNext={Array.isArray(customers) ? customers.length < (convertParams(params).limit ?? 10) : true}
        handlePrevious={handlePrevious}
        disabledPrevious={lastRowIds.length === 0}
        handlePageLimit={handlePageLimit}
        pageLimit={convertParams(params).limit ?? 10}
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