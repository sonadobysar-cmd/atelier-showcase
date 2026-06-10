export const GLOSS_SCRATCH_STORAGE = "gloss-scratch-claimed";
export const GLOSS_SCRATCH_DISMISS = "gloss-scratch-dismissed";

export type GlossScratchClaim = {
  email: string;
  discount: number;
  code: string;
  claimedAt: string;
};

export function normalizeScratchEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeScratchEmail(email));
}

/** Server & client: guaranteed 5–12 % */
export function rollScratchDiscount(): number {
  return Math.floor(Math.random() * 8) + 5;
}

export function makeScratchCode(discount: number): string {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GLOSS${discount}-${suffix}`;
}

export function readScratchClaim(): GlossScratchClaim | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GLOSS_SCRATCH_STORAGE);
    if (!raw) return null;
    return JSON.parse(raw) as GlossScratchClaim;
  } catch {
    return null;
  }
}

export function saveScratchClaim(claim: GlossScratchClaim): void {
  localStorage.setItem(GLOSS_SCRATCH_STORAGE, JSON.stringify(claim));
}

export function wasScratchDismissedThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(GLOSS_SCRATCH_DISMISS) === "1";
}

export function dismissScratchThisSession(): void {
  sessionStorage.setItem(GLOSS_SCRATCH_DISMISS, "1");
}
