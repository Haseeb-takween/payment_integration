"use client";

import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
});

const DASHBOARD_URL = "/dashboard?checkout=success";

export default function CheckoutSuccessPage() {
  return (
    <div
      className={`${fraunces.variable} relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#0a0b0d] px-6 py-24 text-zinc-100 sm:px-10`}
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
          Payment Confirmed
        </span>
        <h1
          className="mt-5 text-4xl leading-[1.1] tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          You&apos;re <span className="italic text-amber-300">all set</span>
        </h1>
        <p className="mt-6 text-sm text-zinc-400">
          Thanks for subscribing. Click below to head to your dashboard.
        </p>

        <a
          href={DASHBOARD_URL}
          className="mt-10 inline-block rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-[#1a1404] transition-colors hover:bg-amber-300"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
