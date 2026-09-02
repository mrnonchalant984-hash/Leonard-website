export const PAYMENT_PLANS = {
  "Premium AI Access": {
    amount: Number(process.env.PREMIUM_AI_PRICE_NGN || 5000),
    description: "Unlock LeonardX AI after manual admin approval.",
  },
  "Premium APK Download": {
    amount: Number(process.env.PREMIUM_APK_PRICE_NGN || 5000),
    description: "Unlock the approved APK download after manual admin approval.",
  },
} as const;

export type PaymentPlan = keyof typeof PAYMENT_PLANS;

export function isPaymentPlan(value: unknown): value is PaymentPlan {
  return typeof value === "string" && value in PAYMENT_PLANS;
}

export function getPlanAmount(plan: PaymentPlan) {
  return PAYMENT_PLANS[plan].amount;
}
