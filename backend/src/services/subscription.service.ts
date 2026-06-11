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

const PLANS_BY_ID: Record<string, { id: string; name: string }> = {
  [env.plans.basic.id]: { id: env.plans.basic.id, name: env.plans.basic.name },
  [env.plans.professional.id]: {
    id: env.plans.professional.id,
    name: env.plans.professional.name,
  },
  [env.plans.business.id]: {
    id: env.plans.business.id,
    name: env.plans.business.name,
  },
};

export function getPlanByPriceId(priceId: string) {
  if (!priceId) return undefined;
  return PLANS_BY_PRICE_ID[priceId];
}

export function getPlanById(planId: string) {
  if (!planId) return undefined;
  return PLANS_BY_ID[planId];
}

export function resolvePlan(priceId?: string, planId?: string) {
  if (priceId) {
    const byPrice = getPlanByPriceId(priceId);
    if (byPrice) return byPrice;
  }

  if (planId) {
    return getPlanById(planId);
  }

  return undefined;
}

export function findCurrentSubscriptionByUserId(userId: string) {
  return Subscription.findOne({
    userId,
    status: { $in: ["active", "payment_failed"] },
  }).sort({ createdAt: -1 });
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
  if (params.status === "active") {
    await Subscription.updateMany(
      {
        userId: params.userId,
        paddleSubscriptionId: { $ne: params.paddleSubscriptionId },
        status: "active",
      },
      { status: "cancelled" },
    );
  }

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

export async function activateSubscriptionForUser(params: {
  userId: string;
  paddleCustomerId: string;
  paddleSubscriptionId: string;
  priceId?: string;
  planId?: string;
  currentPeriodEnd?: Date | null;
}) {
  const plan = resolvePlan(params.priceId, params.planId);

  if (!plan) {
    console.warn("Subscription activation skipped: unknown plan", {
      userId: params.userId,
      priceId: params.priceId,
      planId: params.planId,
    });
    return null;
  }

  return upsertSubscriptionFromPaddle({
    userId: params.userId,
    paddleCustomerId: params.paddleCustomerId,
    paddleSubscriptionId: params.paddleSubscriptionId,
    planId: plan.id,
    planName: plan.name,
    status: "active",
    currentPeriodEnd: params.currentPeriodEnd ?? null,
  });
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

export function toSubscriptionResponse(subscription: {
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date | null;
}) {
  return {
    planId: subscription.planId,
    planName: subscription.planName,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd ?? null,
  };
}
