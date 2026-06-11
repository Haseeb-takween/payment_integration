"use client";

import { useEffect, useState } from "react";
import { Fraunces } from "next/font/google";
import {
  cancelSubscription,
  fetchSubscription,
  type Subscription,
  type SubscriptionStatus,
} from "@/lib/api";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
});

const statusStyles: Record<SubscriptionStatus, string> = {
  active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  payment_failed: "border-red-400/30 bg-red-400/10 text-red-300",
};

const statusLabels: Record<SubscriptionStatus, string> = {
  active: "Active",
  cancelled: "Cancelled",
  payment_failed: "Payment Failed",
};

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription()
      .then(setSubscription)
      .catch((err) => setError(err.message));
  }, []);

  async function handleCancelSubscription() {
    setCancelling(true);
    setError(null);
    try {
      const updated = await cancelSubscription();
      setSubscription(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div
      className={`${fraunces.variable} relative flex flex-1 flex-col items-center overflow-hidden bg-[#0a0b0d] px-6 py-24 text-zinc-100 sm:px-10`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,_rgba(217,168,85,0.16),_transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
      />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.35em] text-amber-400/80">
          Account
        </span>
        <h1
          className="mt-5 text-4xl leading-[1.1] tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          Your <span className="italic text-amber-300">subscription</span>
        </h1>
      </div>

      <div className="relative z-10 mt-12 w-full max-w-md rounded-2xl border border-white/10 bg-[#121317] p-8">
        {subscription === undefined && (
          <p className="text-center text-sm text-zinc-500">Loading…</p>
        )}

        {subscription === null && (
          <div className="text-center">
            <p className="text-sm text-zinc-400">
              You don&apos;t have an active subscription yet.
            </p>
            <a
              href="/pricing"
              className="mt-6 inline-block rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-[#1a1404] transition-colors hover:bg-amber-300"
            >
              View Plans
            </a>
          </div>
        )}

        {subscription && (
          <>
            <p className="text-sm text-zinc-400">Current plan</p>
            <h2
              className="mt-2 text-3xl"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {subscription.planName}
            </h2>

            <div className="mt-6 h-px w-full bg-white/10" />

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-zinc-400">Status</p>
              <span
                className={`rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest ${statusStyles[subscription.status]}`}
              >
                {statusLabels[subscription.status]}
              </span>
            </div>

            {subscription.status === "active" && (
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="mt-10 w-full rounded-full border border-white/15 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-widest text-zinc-100 transition-colors hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel Subscription"}
              </button>
            )}

            {subscription.status === "cancelled" && (
              <div className="mt-10 text-center">
                <p className="text-sm text-zinc-500">
                  Your subscription has been cancelled.
                </p>
                <a
                  href="/pricing"
                  className="mt-6 inline-block rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-[#1a1404] transition-colors hover:bg-amber-300"
                >
                  View Plans
                </a>
              </div>
            )}

            {subscription.status === "payment_failed" && (
              <p className="mt-10 text-center text-sm text-red-300">
                Your last payment failed. Please update your payment method.
              </p>
            )}
          </>
        )}

        {error && (
          <p className="mt-6 text-center text-sm text-red-300">{error}</p>
        )}
      </div>
    </div>
  );
}
