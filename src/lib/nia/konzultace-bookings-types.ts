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
  status: "pending" | "confirmed";
  expiresAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
};

export type KonzBookingInput = Omit<KonzBooking, "id" | "createdAt" | "status" | "expiresAt" | "confirmedAt" | "cancelledAt">;

export const PENDING_TTL_MS = 15 * 60 * 1000;
