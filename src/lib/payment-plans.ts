export const PAYMENT_PLANS = {
  "LeonardX AI Access — Daily": {
    amount: 2000,
    description: "1 day of LeonardX AI access.",
    aiCredits: 50,
    durationDays: 1,
  },
  "LeonardX AI Access — Weekly": {
    amount: 5500,
    description: "7 days of LeonardX AI access.",
    aiCredits: 300,
    durationDays: 7,
  },
  "LeonardX AI Access — Monthly": {
    amount: 10000,
    description: "30 days of LeonardX AI access.",
    aiCredits: 1500,
    durationDays: 30,
  },
  "LeonardX AI Access — Yearly": {
    amount: 70000,
    description: "365 days of LeonardX AI access.",
    aiCredits: 18000,
    durationDays: 365,
  },
  "LeonardX APK Access — One-time": {
    amount: 10000,
    description: "One-time access to the LeonardX APK download.",
    aiCredits: 0,
    durationDays: null,
  },
} as const;

export type PaymentPlan = keyof typeof PAYMENT_PLANS;

export function isPaymentPlan(value: unknown): value is PaymentPlan {
  return typeof value === "string" && value in PAYMENT_PLANS;
}

export function getPlanAmount(plan: PaymentPlan) {
  return PAYMENT_PLANS[plan].amount;
}
