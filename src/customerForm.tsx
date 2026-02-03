import React, { useState } from "react"
import type { Customer, CustomerWithId } from "./types.js";

const required = (description: string) => (value: string) =>
  !value || value.trim() === ""
    ? description
    : undefined;
const match = (re: RegExp, description: string) => (value: string) =>
  !value.match(re) 
    ? description 
    : undefined;
const list = (...validators: ((v:string)=>string|undefined)[]) => (value: string) =>
  validators.reduce(
    (result:string|undefined, validator) => result || validator(value),
    undefined
  );
const anyErrors = (errors: Record<string, string|undefined>): boolean =>
  Object.values(errors).some(error => (
    error !== undefined
  ));

type ErrorProps = {hasError:boolean}
const Error = ({hasError}: ErrorProps) => (
  <p role="alert" >{hasError ? 'An error occurred during save.' : ''}</p>
);

export type CustomerFormProps = {
  customer?: Customer | undefined
  onSave: (customer: Customer)=>void
}
export const CustomerForm = (
  {
    customer, 
    onSave
  }: CustomerFormProps) =>{
  const [customerState, setCustomerState] = useState<Customer>(customer ?? {firstName: ""});
  const [error, setError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({} as Record<ValidatorName, string | undefined>);


  type ValidatorName = 'firstName' | 'lastName' | 'phoneNumber';
  type Validators = Record<ValidatorName, (value: string) => string | undefined>;
  const validators = {
    firstName: required("First name is required"),
    lastName: required("Last name is required"),
    phoneNumber: 
      list(
        required("Phone Number is required"), 
        match(/^[0-9+()\- ]*$/, 'Only numbers, spaces and these symbols are allowed: ( ) + -')
      ),
  } satisfies Validators;

  const validateMany = (fields: Pick<Customer,ValidatorName>): Record<ValidatorName, string|undefined> =>
    Object.entries(fields).reduce(
      (result, [name, value]) => ({
        ...result,
        [name]: validators[name as ValidatorName](value as string)
      }),
      {} as Record<ValidatorName, string|undefined>
    );
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() 
    const validationResult = validateMany(customerState);
    if (anyErrors(validationResult)) {
      setValidationErrors(validationResult);
      return
    }

    const result = await globalThis.fetch("/customers", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerState),
    });
    if(result?.ok){
      setError(false);
      const customerWithId = await result.json();
      onSave(customerWithId);
    } else {
      setError(true);
    }
  }
  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerState((customerState) => ({ ...customerState, [target.name]: target.value}))
  }
  const handleBlur = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (validators.hasOwnProperty(target.name)) {
      const result = (validators as any)[target.name](target.value);
      setValidationErrors({
        ...validationErrors,
        [target.name]: result
      });
    }
    
  };
  const hasError = (fieldName: string) => (validationErrors as any)[fieldName] !== undefined;

  const renderError = (fieldName: string) => {
    return <span id={`${fieldName}Error`} role="alert">
      {hasError(fieldName) ? (validationErrors as any)[fieldName] : ""}
    </span>;
  }
  
  return <form onSubmit = {handleSubmit} aria-label="Customer form">
    <Error hasError={error} />
    <label htmlFor="firstName">First Name</label>
    <input 
      type="text" 
      name="firstName" 
      id="firstName" 
      value={customerState.firstName} 
      onChange={handleChange}
      onBlur={handleBlur}
      aria-describedby="firstNameError"
      />
    {renderError("firstName")}

    <label htmlFor="lastName">Last Name</label>
    <input 
      type="text" 
      name="lastName" 
      id="lastName" 
      value={customerState.lastName} 
      onChange={handleChange}
      onBlur={handleBlur}
      aria-describedby="lastNameError"
      />
    {renderError("lastName")}

    <label htmlFor="phoneNumber">Phone Number</label>
    <input 
      type="text" 
      name="phoneNumber" 
      id="phoneNumber" 
      value={customerState.phoneNumber} 
      onChange={handleChange}
      onBlur={handleBlur}
      aria-describedby="phoneNumberError"
      />
    {renderError("phoneNumber")}
    <input type="submit" value="Add" />
  </form>
}

