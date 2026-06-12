"use client";

import { useEffect, useRef, useState } from "react";
import { Fraunces } from "next/font/google";
import {
  CheckoutEventNames,
  initializePaddle,
  type Paddle,
  type PaddleEventData,
} from "@paddle/paddle-js";
import { confirmSubscription } from "@/lib/api";
import { paddleConfig } from "@/lib/config";
import { getUserId } from "@/lib/user";

function readCheckoutIds(data: Record<string, unknown>) {
  const subscriptionId =
    data.subscription_id ??
    data.subscriptionId ??
    (typeof data.subscription === "object" &&
    data.subscription !== null &&
    "id" in data.subscription
      ? String((data.subscription as { id?: string }).id ?? "")
      : undefined);

  const customerId =
    data.customer_id ??
    data.customerId ??
    (typeof data.customer === "object" &&
    data.customer !== null &&
    "id" in data.customer
      ? String((data.customer as { id?: string }).id ?? "")
      : undefined);

  return {
    subscriptionId: subscriptionId || undefined,
    customerId: customerId || undefined,
  };
}

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
});

type Plan = {
  id: "basic" | "professional" | "business";
  priceId: string;
  name: string;
  price: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    id: "basic",
    priceId: paddleConfig.priceIds.basic,
    name: "Basic",
    price: "12",
    tagline: "For solo builders testing the waters",
    features: [
      "1 active project",
      "Up to 1,000 transactions / mo",
      "Email support",
      "Community access",
    ],
  },
  {
    id: "professional",
    priceId: paddleConfig.priceIds.professional,
    name: "Professional",
    price: "39",
    tagline: "For growing teams that need headroom",
    features: [
      "10 active projects",
      "Up to 50,000 transactions / mo",
      "Priority email & chat support",
      "Advanced analytics dashboard",
      "Webhook event history (90 days)",
    ],
    highlighted: true,
  },
  {
    id: "business",
    priceId: paddleConfig.priceIds.business,
    name: "Business",
    price: "99",
    tagline: "For scaling operations & compliance needs",
    features: [
      "Unlimited projects",
      "Unlimited transactions",
      "Dedicated account manager",
      "Custom contracts & SLAs",
    ],
  },
];

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
    >
      <path
        d="M3 8.5L6.2 11.5L13 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PricingPage() {
  const [paddle, setPaddle] = useState<Paddle>();
  const pendingPlanRef = useRef<Plan | null>(null);

  useEffect(() => {
    async function setupPaddle() {
      const instance = await initializePaddle({
        environment: "sandbox",
        token: paddleConfig.clientToken,
      });

      if (!instance) return;

      instance.Update({
        eventCallback: async (event: PaddleEventData) => {
          if (event.name !== CheckoutEventNames.CHECKOUT_COMPLETED) return;

          const plan = pendingPlanRef.current;
          if (!plan) return;

          const checkoutData = (event.data ?? {}) as Record<string, unknown>;
          const { subscriptionId, customerId } = readCheckoutIds(checkoutData);

          if (typeof subscriptionId !== "string" || !subscriptionId) return;

          try {
            await confirmSubscription({
              planId: plan.id,
              paddleSubscriptionId: subscriptionId,
              paddleCustomerId:
                typeof customerId === "string" ? customerId : undefined,
            });
          } catch (error) {
            console.error("Failed to confirm subscription after checkout:", error);
          } finally {
            pendingPlanRef.current = null;
            window.location.href = paddleConfig.successUrl;
          }
        },
      });

      setPaddle(instance);
    }

    setupPaddle();
  }, []);

  function handleSubscribe(plan: Plan) {
    if (!paddle) return;

    pendingPlanRef.current = plan;

    paddle.Checkout.open({
      items: [{ priceId: plan.priceId, quantity: 1 }],
      customData: {
        userId: getUserId(),
        planId: plan.id,
      },
      settings: {
        displayMode: "overlay",
        successUrl: paddleConfig.successUrl,
      },
    });
  }

  return (
    <div
      className={`${fraunces.variable} relative flex flex-1 flex-col items-center overflow-hidden bg-[#0a0b0d] px-6 py-24 text-zinc-100 sm:px-10`}
    >
      {/* ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,_rgba(217,168,85,0.16),_transparent_70%)] blur-2xl"
      />
      {/* grain overlay */}
      <div
        aria-hidden="true"
        className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <span
          className="animate-fade-in-up font-mono text-xs font-medium uppercase tracking-[0.35em] text-amber-400/80"
          style={{ animationDelay: "0ms" }}
        >
          Membership Tiers
        </span>
        <h1
          className="animate-fade-in-up mt-5 text-4xl leading-[1.1] tracking-tight sm:text-6xl"
          style={{ fontFamily: "var(--font-fraunces)", animationDelay: "80ms" }}
        >
          Plans built for{" "}
          <span className="italic text-amber-300">how you grow</span>
        </h1>
        <p
          className="animate-fade-in-up mt-6 max-w-xl text-balance text-base text-zinc-400 sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          Start small, scale without friction. Cancel or change plans at any
          time — every tier includes the essentials, no hidden fees.
        </p>
      </div>

      <div className="relative z-10 mt-16 grid w-full max-w-5xl gap-6 md:grid-cols-3 md:items-center">
        {plans.map((plan, i) => (
          <div
            key={plan.id}
            className={`animate-fade-in-up relative flex flex-col rounded-2xl border p-8 transition-transform duration-300 ${
              plan.highlighted
                ? "border-amber-400/40 bg-gradient-to-b from-[#1c1812] to-[#121214] shadow-[0_0_60px_-15px_rgba(217,168,85,0.35)] md:-translate-y-4 md:scale-[1.04]"
                : "border-white/10 bg-[#121317] hover:border-white/20"
            }`}
            style={{ animationDelay: `${240 + i * 100}ms` }}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#1a1404]">
                Most Popular
              </span>
            )}

            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {plan.name}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">{plan.tagline}</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-mono text-5xl font-medium tracking-tight text-zinc-50">
                ${plan.price}
              </span>
              <span className="font-mono text-sm text-zinc-500">/ month</span>
            </div>

            <div className="mt-8 h-px w-full bg-white/10" />

            <ul className="mt-8 flex flex-1 flex-col gap-3 text-left text-sm text-zinc-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span
                    className={
                      plan.highlighted ? "text-amber-400" : "text-zinc-500"
                    }
                  >
                    <CheckIcon />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleSubscribe(plan)}
              disabled={!paddle}
              className={`mt-10 w-full rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                plan.highlighted
                  ? "bg-amber-400 text-[#1a1404] hover:bg-amber-300"
                  : "border border-white/15 bg-transparent text-zinc-100 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>

      <p
        className="animate-fade-in-up relative z-10 mt-14 font-mono text-xs uppercase tracking-[0.3em] text-zinc-600"
        style={{ animationDelay: "560ms" }}
      >
        Sandbox mode — test cards only, no real charges
      </p>
    </div>
  );
}
