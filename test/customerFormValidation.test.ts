import {required, match, list, anyErrors, hasError, validateMany} from '../src/customerFormValidation.js'
import type {ValidatorName, Validators, ValidationErrors } from '../src/customerFormValidation.js'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('validators', ()=>{
  describe('validator#1: required', ()=>{
    it('should return undefined when field is not empty', ()=>{
      const actual = required('first name is required')('john')
      assert.strictEqual(actual, undefined)
    })

    it('should return error message when field is empty', ()=>{
      const actual = required('first name is required')('')
      assert.strictEqual(actual, 'first name is required')
    })
  })
  describe('validator#2: match', ()=>{
    it('should return undefined when field matches the regex', ()=>{
      const actual = match(/^Mr\./, 'must start with Mr.')('Mr.John')
      assert.strictEqual(actual, undefined)
    })
    it('should return error message when field does not match the regex', ()=>{
      const actual = match(/^Mr\./, 'must start with Mr.')('John')
      assert.strictEqual(actual, 'must start with Mr.')
    })
  })
  describe('validator#3: list', ()=>{
    const validator1 = required('first name is required')
    const validator2 = match(/^Mr\./, 'must start with Mr.')

    it('should return undefined when field passes all validations', ()=>{
      const actual = list(validator1, validator2)('Mr.John')
      assert.strictEqual(actual, undefined, `Expected undefined for no errors, received: ${actual}` )
    })
    it('should return second error message when field fails validation', ()=>{
      const actual = list(validator1, validator2)('John')
      assert.strictEqual(actual, 'must start with Mr.', `Expected second error message, received: ${actual}` )
    })
    it('should return first error message when both validators fail', ()=>{
      const actual = list(validator1, validator2)('')
      assert.strictEqual(actual, 'first name is required', `Expected first error message, received: ${actual}` )
    })
  })
  describe('validateMany', () => {
    const validators: Validators = {
      firstName: required('first name is required'),
      lastName: required('last name is required'),
      phoneNumber: match(/^\d{3}-\d{3}-\d{4}$/, 'phone number must be in XXX-XXX-XXXX format')
    }

    it('should return an object with no errors when all fields are valid', () => {
      const fields = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '123-456-7890'
      }
      const actual = validateMany(validators, fields)
      const expected: ValidationErrors = {
        firstName: undefined,
        lastName: undefined,
        phoneNumber: undefined
      }
      assert.deepEqual(actual, expected)
    })

    it('should return an object with errors when some fields are invalid', () => {
      const fields = {
        firstName: '',
        lastName: 'Doe',
        phoneNumber: '1234567890'
      }
      const actual = validateMany(validators, fields)
      const expected: ValidationErrors = {
        firstName: 'first name is required',
        lastName: undefined,
        phoneNumber: 'phone number must be in XXX-XXX-XXXX format'
      }
      assert.deepEqual(actual, expected)
    })
  })
  describe('anyErrors', () => {
    it('should return false when there are no errors', () => {
      const errors: ValidationErrors = {
        firstName: undefined,
        lastName: undefined,
        phoneNumber: undefined
      }
      const actual = anyErrors(errors)
      assert.strictEqual(actual, false)
    })

    it('should return true when there are errors', () => {
      const errors: ValidationErrors = {
        firstName: 'first name is required',
        lastName: undefined,
        phoneNumber: 'phone number must be in XXX-XXX-XXXX format'
      }
      const actual = anyErrors(errors)
      assert.strictEqual(actual, true)
    })
  })
  describe('hasError', () => {
    const validationErrors: ValidationErrors = {
      firstName: 'first name is required',
      lastName: undefined,
      phoneNumber: 'phone number must be in XXX-XXX-XXXX format'
    }

    it('should return true when the field has an error', () => {
      const actual = hasError('firstName', validationErrors)
      assert.strictEqual(actual, true)
    })

    it('should return false when the field has no error', () => {
      const actual = hasError('lastName', validationErrors)
      assert.strictEqual(actual, false)
    })
  })
})