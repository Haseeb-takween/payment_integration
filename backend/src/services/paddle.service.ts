import { Paddle, Environment, type EventEntity } from "@paddle/paddle-node-sdk";
import { env } from "../config/env.js";

export const paddleClient = new Paddle(env.paddle.apiKey, {
  environment:
    env.paddle.environment === "production"
      ? Environment.production
      : Environment.sandbox,
});

export function unmarshalPaddleEvent(
  rawBody: Buffer,
  signature: string,
): Promise<EventEntity> {
  return paddleClient.webhooks.unmarshal(
    rawBody.toString(),
    env.paddle.webhookSecret,
    signature,
  );
}

export async function cancelPaddleSubscription(
  paddleSubscriptionId: string,
  effective: "immediately" | "next_billing_period" = "immediately",
) {
  return paddleClient.subscriptions.cancel(paddleSubscriptionId, {
    effectiveFrom: effective,
  });
}
