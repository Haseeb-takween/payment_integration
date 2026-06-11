import type { Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware.js";
import { cancelPaddleSubscription } from "../services/paddle.service.js";
import {
  findSubscriptionByUserId,
  updateSubscriptionStatusByPaddleId,
} from "../services/subscription.service.js";

function getUserId(req: Request): string {
  const userId = req.headers["x-user-id"];
  if (typeof userId !== "string" || !userId) {
    throw new AppError(401, "Missing x-user-id header");
  }
  return userId;
}

export async function getSubscription(req: Request, res: Response) {
  const userId = getUserId(req);
  const subscription = await findSubscriptionByUserId(userId);

  if (!subscription) {
    res.status(200).json({ success: true, data: null });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      planId: subscription.planId,
      planName: subscription.planName,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    },
  });
}

export async function cancelSubscription(req: Request, res: Response) {
  const userId = getUserId(req);
  const subscription = await findSubscriptionByUserId(userId);

  if (!subscription || subscription.status !== "active") {
    throw new AppError(404, "No active subscription found");
  }

  await cancelPaddleSubscription(subscription.paddleSubscriptionId, "immediately");

  const updated = await updateSubscriptionStatusByPaddleId(
    subscription.paddleSubscriptionId,
    "cancelled",
  );

  res.status(200).json({
    success: true,
    data: {
      planId: updated?.planId,
      planName: updated?.planName,
      status: updated?.status,
      currentPeriodEnd: updated?.currentPeriodEnd,
    },
  });
}
