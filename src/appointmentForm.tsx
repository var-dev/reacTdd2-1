import React, { useState, useCallback, useRef, useEffect, useMemo } from "react"

import type { AppointmentProps } from "./AppointmentsDayView.js"
import type { Service, Stylist, AvailableTimeSlot, ServiceStylistRecord, AppointmentApi } from "./types.js"
import { serviceStylists as serviceStylistRecord, selectableServicesList, stylists} from "./sampleDataStatic.js"
import {pickEarliest, makeFlat, stylistsActual, servicesActual, timeSlotsForServiceStylist} from '../src/appointmentFormHelper.js'

type AvailableTimeSlotFlat = { startsAt: number; stylist: Stylist; service: Service } | undefined

const timeIncrements = 
  (
    numberOfTimeSlots: number,
    startTime: number,
    increment: number
  ) =>
  Array(numberOfTimeSlots)
    .fill([startTime])
    .reduce((acc, _, i) =>
      acc.concat([startTime + i * increment])
    );

const dailyTimeSlots = 
  (
    salonOpensAt: number,
    salonClosesAt: number
  ) => {
  const totalSlots = (salonClosesAt - salonOpensAt) * 2;
  const startTime = new Date().setHours(salonOpensAt, 0, 0, 0);
  const increment = 30 * 60 * 1000;
  return timeIncrements(
    totalSlots,
    startTime,
    increment
  );
};

const toTimeValue = (timestamp:number) => new Date(timestamp).toTimeString().substring(0, 5);

const weeklyDateValues = (startDate: Date) => {
  const midnight = startDate.setHours(0, 0, 0, 0);
  const increment = 24 * 60 * 60 * 1000;
  return timeIncrements(7, midnight, increment);
};
const toShortDate = (timestamp: number) => {
  const [day, , dayOfMonth] = new Date(timestamp).toDateString().split(" ");
  return `${day} ${dayOfMonth}`;
};
const mergeDateAndTime = (date: number, timeSlot: number) => {
  const time = new Date(timeSlot);
  return new Date(date).setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  );
};


type RadioButtonIfAvailableProps = {
  availableTimeSlots: AvailableTimeSlotFlat[];
  startsAt: number;
  checkedTimeSlot: number;
  handleChange: ({target: { value }}: React.ChangeEvent<HTMLInputElement>) => void;
};
const RadioButtonIfAvailable = 
  ({
    availableTimeSlots,
    startsAt,
    checkedTimeSlot,
    handleChange,
  }: RadioButtonIfAvailableProps) => {
  const checkAvailableTimeSlots: boolean = availableTimeSlots.some(
    (availableTimeSlot: AvailableTimeSlotFlat) =>
      availableTimeSlot?.startsAt === startsAt
  );
  if (checkAvailableTimeSlots)
    return (
      <input
        type="radio"
        name="startsAt"
        aria-label={String(startsAt)}
        value={startsAt}
        checked={startsAt === checkedTimeSlot}
        onChange={handleChange}
      />
    );
  return null;
};


type TimeSlotTableProps = {
  salonOpensAt: number;
  salonClosesAt: number;
  today: Date;
  availableTimeSlots: AvailableTimeSlotFlat[];
  checkedTimeSlot: number;
  handleChange: ({target: { value }}: React.ChangeEvent<HTMLInputElement>) => void;
};
const TimeSlotTable = (
  {
    salonOpensAt, 
    salonClosesAt, 
    today, 
    availableTimeSlots, 
    checkedTimeSlot, 
    handleChange
  }: TimeSlotTableProps) => {
  const timeSlots = dailyTimeSlots(salonOpensAt, salonClosesAt);
  const dates = weeklyDateValues(today);
  return <table id="time-slots" aria-label="timeSlotTable">
    <thead>
      <tr>
        <th />
        {dates.map((d: number) => (<th key={d}>{toShortDate(d)}</th>))}
      </tr>
    </thead>
    <tbody>
      {timeSlots.map((timeSlot: number, index: number) => (
        <tr key={timeSlot}>
          <th>{toTimeValue(timeSlot)}</th>
          {dates.map((date: number) => (
            <td key={date}>
              <RadioButtonIfAvailable  
                availableTimeSlots={availableTimeSlots} 
                startsAt={mergeDateAndTime(date, timeSlot)}
                checkedTimeSlot={checkedTimeSlot} 
                handleChange={handleChange}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
}

export type AppointmentFormProps = {
  selectableServices?: Service[],
  selectableStylists?: Stylist[],
  serviceStylists?: ServiceStylistRecord,
  salonOpensAt?: number,
  salonClosesAt?: number,
  appointment?: AppointmentApi,
  availableTimeSlots: AvailableTimeSlot[],
  today?: Date,
  onSave?: ()=>void
}

export const AppointmentForm = 
  ({
    selectableServices = selectableServicesList,
    selectableStylists = stylists,
    serviceStylists = serviceStylistRecord,
    salonOpensAt = 9,
    salonClosesAt = 19,
    appointment = {},
    availableTimeSlots = [],
    today = new Date(1970, 1, 1) ,
    onSave = ()=>{}
  }: AppointmentFormProps) =>{
  const flatServiceStylistTime = useMemo(
    () => makeFlat(selectableServices,availableTimeSlots,serviceStylists), 
    [availableTimeSlots, serviceStylists, selectableServices]
  )
  const [appointmentState, setAppointmentState] = useState<AppointmentApi>(appointment)
  // const calculatedServices = servicesActual(flatServiceStylistTime)
  // const calculatedStylists = stylistsActual(flatServiceStylistTime)
  // const calculatedTimeSlots = timeSlotsForServiceStylist(
  //   flatServiceStylistTime,
  //   appointmentState.service!, 
  //   appointmentState.stylist)

  const serviceRef = useRef<HTMLSelectElement>(null)
  const stylistRef = useRef<HTMLSelectElement>(null)

  const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      const result = await globalThis.fetch("/appointments", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentState),
      });
      if(result?.ok){
        onSave();
      }
      };
  const handleStartsAtChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
      setAppointmentState((appointmentState: AppointmentApi) => ({
        ...appointmentState,
        startsAt: parseInt(value),
      })),
    []
  );
  const handleChange = 
    ({ target: { name, value } }: React.ChangeEvent<HTMLSelectElement>) =>
      setAppointmentState((appointmentState: AppointmentApi) => ({
        ...appointmentState,
        [name]: value
      } as AppointmentApi))

  useEffect(() => {
    if (!appointmentState.service) {
      setAppointmentState((appointmentState: AppointmentApi) => ({
        ...appointmentState,
        service: serviceRef.current!.value ?? ''
      } as AppointmentApi))
    }
  }, [])
  useEffect(() => {
    if (!appointmentState.stylist) {
      setAppointmentState((appointmentState: AppointmentApi) => ({
        ...appointmentState,
        stylist: stylistRef.current?.value ?? ''
      } as AppointmentApi))
    }
  }, [])

  const stylistsForService = appointmentState.service
    ? serviceStylists[appointmentState.service as Service]
    : selectableStylists;

  const stylistAvailableTimeSlots = flatServiceStylistTime.map((timeSlot)=>{
    if(timeSlot.stylist === appointmentState.stylist) return timeSlot
    // return { stylists: "noOne", startsAt: -1 };
  })
  //   (timeSlot: AvailableTimeSlot): AvailableTimeSlot => {
  //     if (
  //       timeSlot.stylists === appointmentState.stylist)
  //     ) { 
  //       return timeSlot; 
  //     }
  //     return { stylists: ["noOne"], startsAt: -1 };
  //   }
  // );

  return (
    <form aria-label="Appointment form" onSubmit={handleSubmit}>
      <label htmlFor="service">Service</label>
      <select
        name="service"
        id="service"
        value={appointmentState.service}
        onChange={handleChange}
        ref={serviceRef}
      >
        {selectableServices.map((service: string) => (
          <option key={service}>{service}</option>
        ))}
      </select>
      <label htmlFor="stylist">Stylist</label>
      <select
        name="stylist"
        id="stylist"
        value={appointmentState.stylist}
        onChange={handleChange}
        ref={stylistRef}
      >
        {stylistsForService.map((stylist: Stylist) => (
          <option key={stylist}>{stylist}</option>
        ))}
      </select>

      <TimeSlotTable
        salonOpensAt={salonOpensAt}
        salonClosesAt={salonClosesAt}
        today={today}
        availableTimeSlots={stylistAvailableTimeSlots}
        checkedTimeSlot={appointmentState.startsAt!}
        handleChange={handleStartsAtChange}
      />

      <input type="submit" value="Add" aria-label="Submit" />
    </form>
  );
}


