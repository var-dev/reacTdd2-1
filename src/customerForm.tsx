import React, { useState } from "react"
import type { Customer } from "./appointmentsDayView.js"
export type CustomerFormProps = {
  customer?: Customer
  onSubmit?: (customer: Customer)=>void
}
export const CustomerForm = ({customer, onSubmit}: CustomerFormProps) =>{
  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() 
    if (onSubmit) {
      return onSubmit(customerState)
    }
  }
  const [customerState, setCustomerState] = useState<Customer>(customer ?? {firstName: ""});
  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerState((customerState) => ({ ...customerState, [target.name]: target.value}))
  }

  
  return <form onSubmit = {onSubmitHandler} aria-label="Customer form">
    <label htmlFor="firstName">First Name</label>
    <input type="text" name="firstName" id="firstName" value={customerState.firstName} onChange={handleChange}/>
    <label htmlFor="lastName">Last Name</label>
    <input type="text" name="lastName" id="lastName" value={customerState.lastName} onChange={handleChange}/>
    <label htmlFor="phoneNumber">Phone Number</label>
    <input type="text" name="phoneNumber" id="phoneNumber" value={customerState.phoneNumber} onChange={handleChange}/>
    <input type="submit" value="Add" />
  </form>
}