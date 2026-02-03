import type { Customer } from "./types.js";
export type ValidatorName = 'firstName' | 'lastName' | 'phoneNumber';
export type Validators = Record<ValidatorName, (value: string) => string | undefined>;
export type ValidationErrors = Record<ValidatorName, string | undefined>

export const required = (description: string) => (value: string) => !value || value.trim() === ""
  ? description
  : undefined;
export const match = (re: RegExp, description: string) => (value: string) => !value.match(re)
  ? description
  : undefined;
export const list = (...validators: ((v: string) => string | undefined)[]) => (value: string) => validators.reduce(
  (result: string | undefined, validator) => result || validator(value),
  undefined
);
export const anyErrors = (errors: Record<string, string | undefined>): boolean => Object.values(errors).some(error => (
  error !== undefined
));
export const hasError = (fieldName: keyof Validators, validationErrors: ValidationErrors) => (validationErrors)[fieldName] !== undefined;
export const validateMany = (validators: Validators, fields: Pick<Customer, ValidatorName>): ValidationErrors => Object.entries(fields).reduce(
  (result, [name, value]) => ({
    ...result,
    [name]: validators[name as ValidatorName](value as string)
  }),
  {} as ValidationErrors
);

