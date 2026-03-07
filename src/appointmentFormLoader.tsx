import React, {useEffect, useState} from 'react'

import { AppointmentForm} from './AppointmentForm.js'
import type { AppointmentFormRouteProps } from "./AppointmentFormRoute.js"
import type { AppointmentApi } from './types.js'
import type { AvailableTimeSlot } from './types.js'
import { salonDefaults } from './sampleDataStatic.js'
import { blankAppointment } from "./sampleDataStatic.js";
export type AppointmentFormLoaderProps = AppointmentFormRouteProps & {customerId: number}
export const AppointmentFormLoader = (
  {
    today,
    onSave,
    customerId
  }: AppointmentFormLoaderProps) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<AvailableTimeSlot[]>([]);
  useEffect(() => {
    globalThis.fetch(
      '/availableTimeSlots',
        {
          method: "GET",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json"
          },
        })
      .then(res => res.json())
      .then(json=> setAvailableTimeSlots(json))
      .catch((e) =>  console.log('FETCH availableTimeSlots ERROR ',e))
  }, [])
  useEffect(()=>{
    //TODO Fix {...blankAppointment, customerId}
    // Fetch proper appointment for customer
  }, [])
  return <
    AppointmentForm 
      {...salonDefaults} 
      today={today}
      appointment={{...blankAppointment, customerId}} // FixMe
      availableTimeSlots={availableTimeSlots} 
      onSave={onSave}
    />
}