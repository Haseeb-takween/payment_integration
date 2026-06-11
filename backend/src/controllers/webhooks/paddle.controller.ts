import type { Request, Response } from "express";
import { EventName } from "@paddle/paddle-node-sdk";
import { unmarshalPaddleEvent } from "../../services/paddle.service.js";
import {
  getPlanByPriceId,
  updateSubscriptionStatusByPaddleId,
  upsertSubscriptionFromPaddle,
} from "../../services/subscription.service.js";

export function getPaddleWebhookStatus(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    message: "Paddle webhook endpoint is ready",
    method: "POST",
  });
}

export async function handlePaddleWebhook(req: Request, res: Response) {
  const signature = req.headers["paddle-signature"];

  if (typeof signature !== "string" || !Buffer.isBuffer(req.body)) {
    res.status(400).json({ success: false, message: "Missing Paddle signature" });
    return;
  }

  let event;

  try {
    event = await unmarshalPaddleEvent(req.body, signature);
  } catch (error) {
    console.error("Paddle webhook verification failed:", error);
    res.status(400).json({ success: false, message: "Invalid Paddle webhook signature" });
    return;
  }

  switch (event.eventType) {
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionActivated: {
      const subscription = event.data;
      const priceId = subscription.items[0]?.price?.id ?? "";
      const plan = getPlanByPriceId(priceId);
      const userId = (subscription.customData as { userId?: string } | null)?.userId;

      if (userId && plan) {
        await upsertSubscriptionFromPaddle({
          userId,
          paddleCustomerId: subscription.customerId,
          paddleSubscriptionId: subscription.id,
          planId: plan.id,
          planName: plan.name,
          status: "active",
          currentPeriodEnd: subscription.currentBillingPeriod
            ? new Date(subscription.currentBillingPeriod.endsAt)
            : null,
        });
      }
      break;
    }

    case EventName.SubscriptionCanceled: {
      const subscription = event.data;
      await updateSubscriptionStatusByPaddleId(subscription.id, "cancelled");
      break;
    }

    case EventName.TransactionPaymentFailed: {
      const transaction = event.data;
      if (transaction.subscriptionId) {
        await updateSubscriptionStatusByPaddleId(
          transaction.subscriptionId,
          "payment_failed",
        );
      }
      break;
    }

    default:
      break;
  }

  res.status(200).json({ success: true });
}
