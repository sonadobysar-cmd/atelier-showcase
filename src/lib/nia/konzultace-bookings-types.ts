export type KonzBooking = {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  dateIso: string;
  time: string;
  meetUrl: string;
  createdAt: string;
  cancelledAt?: string;
};

export type KonzBookingInput = Omit<KonzBooking, "id" | "createdAt" | "cancelledAt">;
