import { Subscription, type SubscriptionStatus } from "../models/subscription.model.js";
import { env } from "../config/env.js";

const PLANS_BY_PRICE_ID: Record<string, { id: string; name: string }> = {
  [env.plans.basic.priceId]: { id: env.plans.basic.id, name: env.plans.basic.name },
  [env.plans.professional.priceId]: {
    id: env.plans.professional.id,
    name: env.plans.professional.name,
  },
  [env.plans.business.priceId]: {
    id: env.plans.business.id,
    name: env.plans.business.name,
  },
};

export function getPlanByPriceId(priceId: string) {
  return PLANS_BY_PRICE_ID[priceId];
}

export function findSubscriptionByUserId(userId: string) {
  return Subscription.findOne({ userId }).sort({ createdAt: -1 });
}

export function findSubscriptionByPaddleId(paddleSubscriptionId: string) {
  return Subscription.findOne({ paddleSubscriptionId });
}

export async function upsertSubscriptionFromPaddle(params: {
  userId: string;
  paddleCustomerId: string;
  paddleSubscriptionId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date | null;
}) {
  return Subscription.findOneAndUpdate(
    { paddleSubscriptionId: params.paddleSubscriptionId },
    {
      userId: params.userId,
      paddleCustomerId: params.paddleCustomerId,
      planId: params.planId,
      planName: params.planName,
      status: params.status,
      currentPeriodEnd: params.currentPeriodEnd ?? undefined,
    },
    { upsert: true, new: true },
  );
}

export async function updateSubscriptionStatusByPaddleId(
  paddleSubscriptionId: string,
  status: SubscriptionStatus,
) {
  return Subscription.findOneAndUpdate(
    { paddleSubscriptionId },
    { status },
    { new: true },
  );
}
