/** Strip spaces and force lowercase before save/validate. */
export function normalizeEmail(email: string): string {
  return email.replace(/\s+/g, "").toLowerCase();
}

/** Format check only — call after normalizeEmail (or it normalizes first). */
export function validateEmailInput(email: string): string | null {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    return "Email is required.";
  }

  if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(normalized)) {
    return "Please enter a valid email address (e.g. name@gmail.com).";
  }

  return null;
}
