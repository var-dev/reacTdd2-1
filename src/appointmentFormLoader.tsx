import React, {useEffect, useState} from 'react'

import { AppointmentForm, type AppointmentFormProps, type AvailableTimeSlot } from './AppointmentForm.js'

export const AppointmentFormLoader = (
  {
    ...props
  }: AppointmentFormProps) => {
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
      .catch(console.log)
  }, [])
  return <AppointmentForm {...props} availableTimeSlots={availableTimeSlots} />
}