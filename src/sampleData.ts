import { faker } from "@faker-js/faker";
import type { Customer } from "./appointmentsDayView.js";

declare global {
  interface Array<T> {
    unique(): Array<T>;
    pickRandom(): T;
  }
}
Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
};

Array.prototype.pickRandom = function () {
  return this[
    Math.floor(Math.random() * this.length)
  ];
};

const today = new Date();
const at = (hours: number) => today.setHours(hours, 0);

const stylists = [0, 1, 2, 3, 4, 5, 6]
  .map(() => faker.person.firstName())
  .unique();

const services = [
  "Cut",
  "Blow-dry",
  "Cut & color",
  "Beard trim",
  "Cut & beard trim",
  "Extensions",
];

const generateFakeCustomer: ()=>Customer = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phoneNumber: faker.phone.number(),
});

const generateFakeAppointment = () => ({
  customer: generateFakeCustomer(),
  stylist: stylists.pickRandom(),
  service: services.pickRandom(),
  notes: faker.lorem.paragraph(),
});

export const sampleAppointments = [
  { startsAt: at(9), ...generateFakeAppointment() },
  { startsAt: at(10), ...generateFakeAppointment() },
  { startsAt: at(11), ...generateFakeAppointment() },
  { startsAt: at(12), ...generateFakeAppointment() },
  { startsAt: at(13), ...generateFakeAppointment() },
  { startsAt: at(14), ...generateFakeAppointment() },
  { startsAt: at(15), ...generateFakeAppointment() },
  { startsAt: at(16), ...generateFakeAppointment() },
  { startsAt: at(17), ...generateFakeAppointment() },
];

console.log(JSON.stringify(sampleAppointments, null, 2))

class EnrichedArray<T> extends Array<T> {
  constructor(...args: T[]) {
    super(...args);
  }
  unique () {
    return this.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  };
  pickRandom () {
    return this[
      Math.floor(Math.random() * this.length)
    ]!;
  };
}