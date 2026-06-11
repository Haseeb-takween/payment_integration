import type { Request, Response } from "express";
import { unmarshalPaddleEvent } from "../../services/paddle.service.js";
import { processPaddleWebhookEvent } from "../../services/paddle-webhook.service.js";

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

  try {
    await processPaddleWebhookEvent(event);
  } catch (error) {
    console.error("Paddle webhook processing failed:", error);
    res.status(500).json({ success: false, message: "Failed to process webhook" });
    return;
  }

  res.status(200).json({ success: true });
}
