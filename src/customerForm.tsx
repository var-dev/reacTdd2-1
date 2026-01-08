import React from "react"
import type { Customer } from "./appointmentsDayView.js"
export type CustomerFormProps = {
  customer?: Customer
  onSubmit?: (customer: Customer)=>void
}
export const CustomerForm = ({customer, onSubmit}: CustomerFormProps) =>{
  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() 
    if (onSubmit) {
      return onSubmit(customer!)
    }
  }
  
  return <form onSubmit={
      onSubmitHandler
      }>
    <label htmlFor="firstName">First Name</label>
    <input type="text" name="firstName" id="firstName" value={customer?.firstName} readOnly />
    <input type="submit" value="Add" />
  </form>
}