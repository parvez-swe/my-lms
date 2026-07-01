export interface EnrollmentFormData {
  email?: string;
  password?: string;
  confirmPassword?: string;
  hasAccount?: boolean;
  phone: string;
  currentJob: string;
  careerGoal: "freelance" | "abroad" | "job" | "remote-job" | "";
  division: string;
  district: string;
  paymentMethod: "bkash" | "nagad" | "sslcommerz" | "stripe";
  payerNumber: string;
  transactionId: string;
  /** @deprecated use payerNumber */
  bkashNumber: string;
}

export type EnrollmentFormErrors = Partial<
  Record<keyof EnrollmentFormData, string>
>;

export type PaymentMethodOption = EnrollmentFormData["paymentMethod"];
