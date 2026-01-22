import React, {useEffect, useState} from "react";
import { AppointmentsDayView } from "./appointmentsDayView.js";

export type AppointmentsDayViewLoaderProps = {today: Date}
export const AppointmentsDayViewLoader = (
  {
    today
  }: AppointmentsDayViewLoaderProps) => {
  const [appointments, setAppointments] = useState([]);
  useEffect(() => {
    const from = today.setHours(0, 0, 0, 0);
    const to = today.setHours(23, 59, 59, 999);
    globalThis.fetch(
        `/appointments/${from}-${to}`,
        {
          method: "GET",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json"
          },
        }
      )
      .then(response => response.json())
      .then(appointments => {
        setAppointments(appointments)
      })
      .catch((e) => {
        // console.log(e)
      })  
  }, [today]);
  return <AppointmentsDayView appointments={appointments}/>
  }
