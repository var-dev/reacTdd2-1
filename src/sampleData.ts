import { faker } from "@faker-js/faker";

declare global {
  interface Array<T> {
    unique(): Array<T>;
    pickRandom(): T;
  }
}

const randomInt = (range: number) =>
  Math.floor(Math.random() * range);

Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
};

Array.prototype.pickRandom = function () {
  return this[randomInt(this.length)];
};

const today = new Date();
const at = (hours: number) => today.setHours(hours, 0);

const stylists = ["Ashley", "Jo", "Pat", "Sam"];

const services = [
  "Cut",
  "Blow-dry",
  "Cut & color",
  "Beard trim",
  "Cut & beard trim",
  "Extensions",
];

const generateFakeCustomer = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phoneNumber: faker.phone.number({style: 'international'}),
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

type TimeSlot = { startsAt: number; stylists: any[]; }
const pickMany = <T>(items: T[], number: number) =>
  Array(number)
    .fill(1)
    .map(() => items.pickRandom());

const buildTimeSlots = () => {
  const today = new Date();
  const startTime = today.setHours(9, 0, 0, 0);
  const times = [...Array(7).keys()].map((day) => {
    const daysToAdd = day * 24 * 60 * 60 * 1000;
    return [...Array(20).keys()].map((halfHour) => {
      const halfHoursToAdd =
        halfHour * 30 * 60 * 1000;
      return {
        startsAt:
          startTime + daysToAdd + halfHoursToAdd,
        stylists: pickMany(
          stylists,
          randomInt(stylists.length)
        ),
      };
    });
  });
  return ([] as TimeSlot[]).concat(...times);
};

export const sampleAvailableTimeSlots = pickMany(
  buildTimeSlots(),
  50
);