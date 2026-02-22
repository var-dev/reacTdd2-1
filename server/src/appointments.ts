import {stylists} from '../../src/sampleDataStatic.js'

import type {Customer, AvailableTimeSlot, AppointmentApi, RealStylist, Service} from '../../src/types.js'

declare global {
  interface Array<T> {
    unique(): Array<T>;
    pickRandom(): T;
  }
}


const stylistServices: {[K in RealStylist]: Service[]} = {
  Ashley: ["Cut", "Blow-dry", "Extensions"],
  Jo: ["Cut", "Blow-dry", "Cut & color"],
  Pat: [
    "Cut",
    "Blow-dry",
    "Beard trim",
    "Cut & beard trim",
    "Extensions",
  ],
  Sam: [
    "Cut",
    "Blow-dry",
    "Beard trim",
    "Cut & beard trim",
  ],
};

const randomInt = (range: number) =>
  Math.floor(Math.random() * range);

Array.prototype.pickRandom = function () {
  return this[randomInt(this.length)];
};

export function buildTimeSlots() {
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  const startTime = startDate.setHours(9, 0, 0, 0);
  const times = [...Array(365 + 30).keys()].map(
    (day) => {
      const daysToAdd = day * 24 * 60 * 60 * 1000;
      return [...Array(20).keys()].map((halfHour) => {
        const halfHoursToAdd =
          halfHour * 30 * 60 * 1000;
        return {
          startsAt:
            startTime + daysToAdd + halfHoursToAdd,
          stylists,
        };
      });
    }
  );
  return ([] as AvailableTimeSlot[]).concat(...times);
}

function shouldFillTimeSlot() {
  return randomInt(3) < 2;
}

export function generateFakeAppointments(
  customers: Customer[],
  timeSlots: AvailableTimeSlot[]
) {
  const appointments: AppointmentApi[] = [];
  timeSlots.forEach((timeSlot) => {
    const stylist = timeSlot.stylists.pickRandom();
    if (shouldFillTimeSlot()) {
      appointments.push({
        customerId: customers.pickRandom().id!,
        startsAt: timeSlot.startsAt,
        stylist,
        service: stylistServices[(stylist as RealStylist)].pickRandom(),
      });
    }
  });
  return appointments;
}

export class Appointments {
  private appointments: Required<AppointmentApi>[];
  private timeSlots: AvailableTimeSlot[];
  constructor(
    initialAppointments: Required<AppointmentApi>[] = [],
    initialTimeSlots: AvailableTimeSlot[] = []
  ) {
    this.appointments = [];
    this.timeSlots = initialTimeSlots;
    this.add = this.add.bind(this);
    initialAppointments.forEach(this.add);
  }

  add(appointment: Required<AppointmentApi>) {
    this.timeSlots = this.timeSlots
      .map((timeSlot) => {
        if (
          timeSlot.startsAt === appointment.startsAt
        ) {
          const stylists = timeSlot.stylists.filter(
            (stylist) =>
              stylist !== appointment.stylist
          );
          return { ...timeSlot, stylists };
        }
        return timeSlot;
      })
      .filter(({ stylists }) => stylists.length > 0);

    this.appointments.push(appointment);
    return appointment;
  }

  deleteAll() {
    this.appointments.length = 0;
  }

  getAppointments(from: number, to: number, customers: Customer[]) {
    return this.appointments
      .filter((appointment) => {
        if (
          from !== undefined &&
          appointment.startsAt < from
        ) {
          return false;
        }
        if (
          to !== undefined &&
          appointment.startsAt > to
        ) {
          return false;
        }
        return true;
      })
      .map((appointment) => {
        return Object.assign({}, appointment, {
          customer: customers[appointment.customerId],
        });
      })
      .sort((a, b) => a.startsAt - b.startsAt);
  }

  forCustomer(customerId: number) {
    return this.appointments.filter(
      (appointment) =>
        appointment.customerId === customerId
    );
  }

  getTimeSlots() {
    return this.timeSlots;
  }

  isValid(appointment: AppointmentApi) {
    return (
      Object.keys(this.errors(appointment)).length ===
      0
    );
  }

  errors(appointment: AppointmentApi) {
    let errors = {};
    let key = {
      startsAt: appointment.startsAt,
      stylist: appointment.stylist,
    };
    errors = Object.assign(
      errors,
      this.uniqueSetValidation(
        key,
        "Stylist already has an appointment at this time"
      )
    );
    return errors;
  }

  uniqueSetValidation(uniqueSet: any, fieldDescription: string) {
    const allValuesMatch = (a: any) =>
      !Object.entries(uniqueSet).some(
        ([k, v]) => a[k] !== v
      );

    if (this.appointments.some(allValuesMatch)) {
      return Object.keys(uniqueSet).reduce(
        (acc, field) => ({
          ...acc,
          [field]: fieldDescription,
        }),
        {}
      );
    }
    return {};
  }
}