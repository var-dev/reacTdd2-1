import {required, match, list, anyErrors, hasError, validateMany} from '../src/customerFormValidation.js'
import type {ValidatorName, Validators, ValidationErrors } from '../src/customerFormValidation.js'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {pickEarliest, makeFlat, stylistsActual, servicesActual, timeSlotsForServiceStylist} from '../src/appointmentFormHelper.js'
import type { AvailableTimeSlot, Service, Stylist } from '../src/types.js'

const today = new Date(1970,1,1);
const tomorrow = new Date(1970,1,2)
const availableTimeSlots: AvailableTimeSlot[] = [
  { startsAt: today.setHours(9, 0, 0, 0), stylists: ["Pat", "Jo"] },
  { startsAt: today.setHours(9, 30, 0, 0), stylists: ["Jo", "Sam"] },
  { startsAt: tomorrow.setHours(9, 30, 0, 0), stylists: ["Sam", "Pat"] },
];
const services = ["Cut & color", "Beard trim"] as Service[]
const serviceStylists = 
  {
    "Cut":          ["Ashley", "Jo", "Pat", "Sam"],
    "Blow-dry":     ["Ashley", "Jo", "Pat", "Sam"],
    "Cut & color":  ["Ashley", "Jo"],
    "Beard trim":   ["Pat", "Sam"],
    "Cut & beard trim": ["Pat", "Sam"],
    "Extensions":   ["Ashley", "Pat"],
  } as Record<Service, Stylist[]>
const expectedFlat: {service: Service, startsAt: number, stylist: Stylist}[] =
  [
    {
      service: 'Beard trim',
      startsAt: 2736000000,
      stylist: 'Pat'
    },
    {
      service: 'Cut & color',
      startsAt: 2736000000,
      stylist: 'Jo'
    },
    {
      service: 'Cut & color',
      startsAt: 2737800000,
      stylist: 'Jo'
    },
    {
      service: 'Beard trim',
      startsAt: 2737800000,
      stylist: 'Sam'
    },
    {
      service: 'Beard trim',
      startsAt: 2824200000,
      stylist: 'Sam'
    },
    {
      service: 'Beard trim',
      startsAt: 2824200000,
      stylist: 'Pat'
    }
  ]

describe('makeFlat', () => {
  it('should flatten time slots with stylists and services', () => {
    const result = makeFlat(services, availableTimeSlots, serviceStylists)
    assert.equal(result.length, 6)
    assert.deepEqual(result, expectedFlat)
  })
  it('produces list of stylists', () => {
    const actual = stylistsActual(expectedFlat)
    assert.deepEqual(actual, ['Pat', 'Jo', 'Sam'])
  })
  it('produces list of services', () => {
    const actual = servicesActual(expectedFlat)
    assert.deepEqual(actual, ['Beard trim', 'Cut & color' ])
  })
  it('produces list of time slots for a given service and stylist', () => {
    const actual = timeSlotsForServiceStylist(expectedFlat, 'Cut & color', 'Jo')
    assert.deepEqual(actual, [2736000000, 2737800000])
  })
  it('produces empty list of time slots for a given service and stylist', () => {
    const actual = timeSlotsForServiceStylist(expectedFlat, 'Cut & color', 'Pat')
    assert.deepEqual(actual, [])
  })
})

describe('pickEarliest', () => {
  it('should return the earliest date', () => {
    const result = pickEarliest(services, availableTimeSlots, serviceStylists)
    assert.notEqual(result, null)
    assert.equal(result!.service, 'Cut & color')
    assert.equal(result!.stylist, 'Jo')
  })
})
