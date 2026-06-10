export type TimeSlot = {
  id: string;
  label: string;
  available: boolean;
};

export type BookingService = {
  id: string;
  name: string;
  duration: string;
  price: string;
};

/** Demo sloty — bez backendu, jen pro ukázku UX rezervace. */
export function getDemoSlots(): TimeSlot[] {
  return [
    { id: "1", label: "Po 9:00", available: true },
    { id: "2", label: "Po 11:30", available: false },
    { id: "3", label: "Út 14:00", available: true },
    { id: "4", label: "St 10:00", available: true },
    { id: "5", label: "Čt 16:30", available: false },
    { id: "6", label: "Pá 9:30", available: true },
  ];
}
