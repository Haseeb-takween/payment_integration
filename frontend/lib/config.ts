const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

const configuredSuccessUrl =
  process.env.NEXT_PUBLIC_PADDLE_SUCCESS_URL ?? `${appUrl}/checkout/success`;

export const paddleConfig = {
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "",
  appUrl,
  defaultLink: `${appUrl}/pricing`,
  successUrl: configuredSuccessUrl,
  cancelUrl:
    process.env.NEXT_PUBLIC_PADDLE_CANCEL_URL ?? `${appUrl}/pricing?checkout=canceled`,
  priceIds: {
    basic: process.env.NEXT_PUBLIC_BASIC_PRICE_ID ?? "",
    professional: process.env.NEXT_PUBLIC_PROFESSIONAL_PRICE_ID ?? "",
    business: process.env.NEXT_PUBLIC_BUSINESS_PRICE_ID ?? "",
  },
} as const;
