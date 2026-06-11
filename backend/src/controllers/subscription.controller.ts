import type { Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware.js";
import { cancelPaddleSubscription } from "../services/paddle.service.js";
import {
  activateSubscriptionForUser,
  findCurrentSubscriptionByUserId,
  toSubscriptionResponse,
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
  const subscription = await findCurrentSubscriptionByUserId(userId);

  if (!subscription) {
    res.status(200).json({ success: true, data: null });
    return;
  }

  res.status(200).json({
    success: true,
    data: toSubscriptionResponse(subscription),
  });
}

export async function confirmSubscription(req: Request, res: Response) {
  const userId = getUserId(req);
  const { planId, paddleSubscriptionId, paddleCustomerId } = req.body as {
    planId?: string;
    paddleSubscriptionId?: string;
    paddleCustomerId?: string;
  };

  if (!planId || !paddleSubscriptionId) {
    throw new AppError(400, "planId and paddleSubscriptionId are required");
  }

  const subscription = await activateSubscriptionForUser({
    userId,
    paddleCustomerId: paddleCustomerId ?? "unknown",
    paddleSubscriptionId,
    planId,
  });

  if (!subscription) {
    throw new AppError(400, "Unknown plan");
  }

  res.status(200).json({
    success: true,
    data: toSubscriptionResponse(subscription),
  });
}

export async function cancelSubscription(req: Request, res: Response) {
  const userId = getUserId(req);
  const subscription = await findCurrentSubscriptionByUserId(userId);

  if (!subscription || subscription.status !== "active") {
    throw new AppError(404, "No active subscription found");
  }

  await cancelPaddleSubscription(subscription.paddleSubscriptionId, "immediately");

  await updateSubscriptionStatusByPaddleId(
    subscription.paddleSubscriptionId,
    "cancelled",
  );

  res.status(200).json({ success: true, data: null });
}
