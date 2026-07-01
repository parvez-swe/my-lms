import crypto from "crypto";
import { PaymentMethod } from "@/models/Payment";
import { DEFAULT_CURRENCY } from "@/lib/currency";

export interface PaymentInitInput {
  method: PaymentMethod;
  amount: number;
  currency: string;
  courseSlug: string;
  courseTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
  payerNumber?: string;
  transactionId?: string;
}

export interface PaymentInitResult {
  success: boolean;
  manual?: boolean;
  redirectUrl?: string;
  sessionId?: string;
  message?: string;
  error?: string;
}

export function isGatewayMethod(method: PaymentMethod): boolean {
  return method === "sslcommerz" || method === "stripe";
}

export function isManualMethod(method: PaymentMethod): boolean {
  return method === "bkash" || method === "nagad";
}

export function getManualPaymentNumber(method: "bkash" | "nagad"): string {
  if (method === "bkash") {
    return process.env.NEXT_PUBLIC_BKASH_NUMBER || "+880 1XXXXXXXXX";
  }
  return process.env.NEXT_PUBLIC_NAGAD_NUMBER || "+880 1XXXXXXXXX";
}

export function isPaymentMethodEnabled(method: PaymentMethod): boolean {
  switch (method) {
    case "bkash":
      return true;
    case "nagad":
      return Boolean(process.env.NEXT_PUBLIC_NAGAD_NUMBER);
    case "sslcommerz":
      return Boolean(
        process.env.SSLCOMMERZ_STORE_ID &&
          process.env.SSLCOMMERZ_STORE_PASSWORD &&
          process.env.SSLCOMMERZ_IS_LIVE !== undefined
      );
    case "stripe":
      return Boolean(process.env.STRIPE_SECRET_KEY);
    default:
      return false;
  }
}

export async function initiateSslCommerzPayment(
  input: PaymentInitInput
): Promise<PaymentInitResult> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!storeId || !storePassword) {
    return { success: false, error: "SSLCommerz is not configured" };
  }

  const tranId = `SSL-${input.courseSlug}-${Date.now()}`;
  const baseUrl = isLive
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

  const body = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: String(input.amount),
    currency: input.currency || DEFAULT_CURRENCY,
    tran_id: tranId,
    success_url: `${appUrl}/api/payments/callback/sslcommerz?status=success`,
    fail_url: `${appUrl}/api/payments/callback/sslcommerz?status=failed`,
    cancel_url: `${appUrl}/api/payments/callback/sslcommerz?status=cancelled`,
    ipn_url: `${appUrl}/api/payments/webhook/sslcommerz`,
    cus_name: input.userName,
    cus_email: input.userEmail,
    cus_add1: "N/A",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    product_name: input.courseTitle,
    product_category: "Course",
    product_profile: "non-physical-goods",
  });

  const response = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await response.json();

  if (data.status === "SUCCESS" && data.GatewayPageURL) {
    return {
      success: true,
      redirectUrl: data.GatewayPageURL,
      sessionId: tranId,
    };
  }

  return {
    success: false,
    error: data.failedreason || "SSLCommerz initiation failed",
  };
}

export async function initiateStripePayment(
  input: PaymentInitInput
): Promise<PaymentInitResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secretKey) {
    return { success: false, error: "Stripe is not configured" };
  }

  const currency = (input.currency || "USD").toLowerCase();
  const amountInCents = Math.round(input.amount * 100);

  const params = new URLSearchParams({
    mode: "payment",
    success_url: `${appUrl}/api/payments/callback/stripe?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/api/payments/callback/stripe?status=cancelled`,
    "line_items[0][price_data][currency]": currency,
    "line_items[0][price_data][product_data][name]": input.courseTitle,
    "line_items[0][price_data][unit_amount]": String(amountInCents),
    "line_items[0][quantity]": "1",
    customer_email: input.userEmail,
    "metadata[courseSlug]": input.courseSlug,
    "metadata[userId]": input.userId,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (data.url) {
    return {
      success: true,
      redirectUrl: data.url,
      sessionId: data.id,
    };
  }

  return {
    success: false,
    error: data.error?.message || "Stripe session creation failed",
  };
}

export async function initiatePayment(
  input: PaymentInitInput
): Promise<PaymentInitResult> {
  if (isManualMethod(input.method)) {
    if (!input.payerNumber || !input.transactionId) {
      return {
        success: false,
        error: "Wallet number and transaction ID are required",
      };
    }
    return { success: true, manual: true };
  }

  if (input.method === "sslcommerz") {
    return initiateSslCommerzPayment(input);
  }

  if (input.method === "stripe") {
    return initiateStripePayment(input);
  }

  return { success: false, error: "Unsupported payment method" };
}

export function generatePaymentReference(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}
