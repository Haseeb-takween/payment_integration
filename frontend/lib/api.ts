import { apiUrl } from "./config";
import { getUserId } from "./user";

export type SubscriptionStatus = "active" | "cancelled" | "payment_failed";

export type Subscription = {
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": getUserId(),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchSubscription(): Promise<Subscription | null> {
  const { data } = await request<{ data: Subscription | null }>("/subscription");
  return data;
}

export async function confirmSubscription(input: {
  planId: string;
  paddleSubscriptionId: string;
  paddleCustomerId?: string;
}): Promise<Subscription> {
  const { data } = await request<{ data: Subscription }>("/subscription/confirm", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export async function cancelSubscription(): Promise<null> {
  const { data } = await request<{ data: null }>("/subscription/cancel", {
    method: "POST",
  });
  return data;
}
