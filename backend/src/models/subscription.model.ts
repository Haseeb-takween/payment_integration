import { Schema, model, type InferSchemaType } from "mongoose";

export const SUBSCRIPTION_STATUSES = [
  "active",
  "cancelled",
  "payment_failed",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

const subscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    paddleCustomerId: { type: String, required: true },
    paddleSubscriptionId: { type: String, required: true, unique: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      required: true,
      default: "active",
    },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true },
);

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema>;

export const Subscription = model("Subscription", subscriptionSchema);
