import { PaymentMethod } from "@/models/Payment";

export type PaymentMethodOption = Extract<
  PaymentMethod,
  "bkash" | "nagad" | "sslcommerz" | "stripe"
>;

export function isPaymentMethodEnabled(method: PaymentMethodOption): boolean {
  switch (method) {
    case "bkash":
      return true;
    case "nagad":
      return Boolean(process.env.NEXT_PUBLIC_NAGAD_NUMBER);
    case "sslcommerz":
      return process.env.NEXT_PUBLIC_SSLCOMMERZ_ENABLED === "true";
    case "stripe":
      return process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";
    default:
      return false;
  }
}

export function isGatewayMethod(method: PaymentMethodOption): boolean {
  return method === "sslcommerz" || method === "stripe";
}

export function isManualMethod(method: PaymentMethodOption): boolean {
  return method === "bkash" || method === "nagad";
}

export function getManualPaymentNumber(method: "bkash" | "nagad"): string {
  if (method === "bkash") {
    return process.env.NEXT_PUBLIC_BKASH_NUMBER || "+880 1XXXXXXXXX";
  }
  return process.env.NEXT_PUBLIC_NAGAD_NUMBER || "+880 1XXXXXXXXX";
}
