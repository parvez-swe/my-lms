export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 14;
}

export function isValidBkashNumber(value: string): boolean {
  const onlyDigits = value.replace(/\D/g, "");
  if (!/^\d{10,11}$/.test(onlyDigits)) return false;
  if (onlyDigits.length === 10) return /^1\d{9}$/.test(onlyDigits);
  if (onlyDigits.length === 11) return /^(0|88)/.test(onlyDigits);
  return true;
}

export function normalizePhoneInput(value: string): string {
  return value.replace(/[^\d\s\-+()]/g, "");
}
