"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    period: "forever",
    description: "Perfect for getting started with one home.",
    features: [
      "1 home",
      "Up to 25 items",
      "Manual entry only",
      "Basic AI chat",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 9,
    annualPrice: 7,
    period: "/month",
    description: "Full power for the modern homeowner.",
    subtext: "Less than a cup of coffee per week",
    features: [
      "Up to 3 homes",
      "Unlimited items",
      "AI scan & identify",
      "Full AI chat with manuals",
      "Maintenance scheduling",
      "Warranty tracking & alerts",
      "Priority support",
    ],
    cta: "Start Your Free Trial",
    popular: true,
  },
  {
    name: "Family",
    monthlyPrice: 19,
    annualPrice: 15,
    period: "/month",
    description: "For families and property managers.",
    features: [
      "Unlimited homes",
      "Unlimited items",
      "Everything in Pro",
      "Multi-user access",
      "Provider network access",
      "Home passport export",
      "Dedicated support",
    ],
    cta: "Start Your Free Trial",
    popular: false,
  },
];

export function PricingCards() {
  const [annual, setAnnual] = React.useState(false);

  return (
    <>
      {/* Toggle */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <span
          className={cn(
            "text-sm font-medium",
            !annual ? "text-white" : "text-gray-500"
          )}
        >
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
            annual ? "bg-teal-500" : "bg-white/20"
          )}
          aria-label="Toggle annual pricing"
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
              annual ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
        <span
          className={cn(
            "text-sm font-medium",
            annual ? "text-white" : "text-gray-500"
          )}
        >
          Annual
        </span>
        {annual && (
          <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-400">
            Save 20%
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = annual ? plan.annualPrice : plan.monthlyPrice;
          const displayPrice = price === 0 ? "$0" : `$${price}`;
          const displayPeriod = price === 0 ? "forever" : "/month";

          return (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8",
                plan.popular
                  ? "border-teal-500/50 bg-gradient-to-b from-teal-500/10 to-transparent shadow-xl shadow-teal-500/10"
                  : "border-white/5 bg-white/[0.02]"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-teal-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-heading text-lg font-semibold text-white">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold text-white">
                    {displayPrice}
                  </span>
                  <span className="text-sm text-gray-500">{displayPeriod}</span>
                </div>
                {annual && price > 0 && (
                  <p className="mt-1 text-xs text-teal-400">
                    Billed ${price * 12}/year
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-400">
                  {plan.description}
                </p>
                {plan.subtext && (
                  <p className="mt-1 text-xs text-gray-500 italic">
                    {plan.subtext}
                  </p>
                )}
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <Check className="h-4 w-4 shrink-0 text-teal-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/25"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                  asChild
                >
                  <Link href="/sign-up">{plan.cta}</Link>
                </Button>
              </div>
              {plan.popular && (
                <p className="mt-3 text-center text-xs text-gray-500">
                  30-day money-back guarantee
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
