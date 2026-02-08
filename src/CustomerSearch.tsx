import React from "react";

export type CustomerSearchProps = {}
export const CustomerSearch = ({}:CustomerSearchProps)=>{
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
      </table>
    </>
)}