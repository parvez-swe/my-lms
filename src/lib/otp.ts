/**
 * OTP (One-Time Password) Generation and Validation Utilities
 */

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get OTP expiry time (default: 10 minutes from now)
 */
export function getOTPExpiry(minutes: number = 10): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
}

/**
 * Check if OTP has expired
 */
export function isOTPExpired(otpExpiry: Date | undefined): boolean {
  if (!otpExpiry) return true;
  return new Date() > otpExpiry;
}

/**
 * Validate OTP format
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}
