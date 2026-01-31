import React, {useEffect, useState} from 'react'

import { AppointmentForm} from './AppointmentForm.js'
import type { AppointmentFormProps } from './AppointmentForm.js'
import type { AvailableTimeSlot } from './types.js'
export type AppointmentFormLoaderProps = Omit<AppointmentFormProps, 'availableTimeSlots'>
export const AppointmentFormLoader = (
  {
    ...props
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
  return <AppointmentForm {...props} availableTimeSlots={availableTimeSlots} />
}