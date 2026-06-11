import type { EventEntity } from "@paddle/paddle-node-sdk";
import { EventName } from "@paddle/paddle-node-sdk";
import {
  activateSubscriptionForUser,
  updateSubscriptionStatusByPaddleId,
} from "./subscription.service.js";

type PaddleCustomData = { userId?: string; planId?: string } | null | undefined;

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

function readCustomData(customData: unknown): PaddleCustomData {
  if (!customData || typeof customData !== "object") return null;
  return customData as PaddleCustomData;
}

function readPriceId(items?: Array<{ price?: { id?: string | null } | null }>) {
  return items?.[0]?.price?.id ?? undefined;
}

async function activateFromSubscriptionEvent(
  subscription: {
    id: string;
    customerId: string;
    customData?: unknown;
    items?: Array<{ price?: { id?: string | null } | null }>;
    currentBillingPeriod?: { endsAt: string } | null;
    status?: string;
  },
  options?: { requireActiveStatus?: boolean },
) {
  const customData = readCustomData(subscription.customData);
  const userId = customData?.userId;

  if (!userId) {
    console.warn("Subscription activation skipped: missing userId in customData", {
      paddleSubscriptionId: subscription.id,
    });
    return;
  }

  if (
    options?.requireActiveStatus &&
    subscription.status &&
    !ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)
  ) {
    return;
  }

  await activateSubscriptionForUser({
    userId,
    paddleCustomerId: subscription.customerId,
    paddleSubscriptionId: subscription.id,
    priceId: readPriceId(subscription.items),
    planId: customData?.planId,
    currentPeriodEnd: subscription.currentBillingPeriod
      ? new Date(subscription.currentBillingPeriod.endsAt)
      : null,
  });
}

async function activateFromTransactionEvent(transaction: {
  subscriptionId?: string | null;
  customerId?: string | null;
  customData?: unknown;
  items?: Array<{ price?: { id?: string | null } | null }>;
}) {
  if (!transaction.subscriptionId) {
    console.warn("Transaction activation skipped: missing subscriptionId");
    return;
  }

  if (!transaction.customerId) {
    console.warn("Transaction activation skipped: missing customerId");
    return;
  }

  const customData = readCustomData(transaction.customData);
  const userId = customData?.userId;

  if (!userId) {
    console.warn("Transaction activation skipped: missing userId in customData", {
      paddleSubscriptionId: transaction.subscriptionId,
    });
    return;
  }

  await activateSubscriptionForUser({
    userId,
    paddleCustomerId: transaction.customerId,
    paddleSubscriptionId: transaction.subscriptionId,
    priceId: readPriceId(transaction.items),
    planId: customData?.planId,
  });
}

export async function processPaddleWebhookEvent(event: EventEntity) {
  switch (event.eventType) {
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionActivated: {
      await activateFromSubscriptionEvent(event.data);
      break;
    }

    case EventName.SubscriptionUpdated: {
      await activateFromSubscriptionEvent(event.data, { requireActiveStatus: true });
      break;
    }

    case EventName.TransactionCompleted: {
      await activateFromTransactionEvent(event.data);
      break;
    }

    case EventName.SubscriptionCanceled: {
      await updateSubscriptionStatusByPaddleId(event.data.id, "cancelled");
      break;
    }

    case EventName.TransactionPaymentFailed: {
      if (event.data.subscriptionId) {
        await updateSubscriptionStatusByPaddleId(
          event.data.subscriptionId,
          "payment_failed",
        );
      }
      break;
    }

    default:
      break;
  }
}
