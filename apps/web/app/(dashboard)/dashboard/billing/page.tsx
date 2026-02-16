"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Home,
  Package,
  ScanLine,
  Users,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/billing/pricing-card";
import { UsageMeter } from "@/components/billing/usage-meter";

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
}

interface SubscriptionData {
  plan: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  usage: {
    plan: string;
    items: UsageData;
    homes: UsageData;
    aiScans: UsageData;
    members: UsageData;
  };
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "mo",
    description: "Get started with the basics",
    features: [
      "1 home",
      "25 items",
      "10 AI scans per month",
      "1 member",
      "Basic maintenance tracking",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    period: "mo",
    description: "For homeowners who want more",
    features: [
      "5 homes",
      "500 items",
      "100 AI scans per month",
      "3 members",
      "Priority support",
      "Home passport export",
      "Advanced analytics",
    ],
    isRecommended: true,
  },
  {
    id: "family",
    name: "Family",
    price: "$19.99",
    period: "mo",
    description: "For families managing multiple properties",
    features: [
      "10 homes",
      "Unlimited items",
      "Unlimited AI scans",
      "10 members",
      "Priority support",
      "Home passport export",
      "Advanced analytics",
      "Provider marketplace access",
    ],
  },
];

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/subscription");
      const data = await res.json();
      if (data.success) {
        setSubscription(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Show success/cancel messages from Stripe redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setSuccessMessage("Subscription activated successfully! Your plan has been upgraded.");
      // Refresh data after successful checkout
      fetchSubscription();
    } else if (searchParams.get("canceled") === "true") {
      setError("Checkout was canceled. No changes were made.");
    }
  }, [searchParams, fetchSubscription]);

  const handleUpgrade = async (plan: string) => {
    if (plan === "free") return;

    setUpgradeLoading(plan);
    setError(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        setError(data.error || "Failed to start checkout");
      }
    } catch {
      setError("Failed to start checkout");
    } finally {
      setUpgradeLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        setError(data.error || "Failed to open billing portal");
      }
    } catch {
      setError("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "past_due":
        return <Badge variant="warning">Past Due</Badge>;
      case "canceled":
        return <Badge variant="destructive">Canceled</Badge>;
      case "trialing":
        return <Badge variant="secondary">Trial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
              Billing
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Manage your subscription and usage.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan ?? "free";
  const isPaidPlan = currentPlan !== "free";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
              Billing
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Manage your subscription and usage.
            </p>
          </div>
        </div>
        {isPaidPlan && (
          <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading}>
            {portalLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Manage Subscription
              </>
            )}
          </Button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            {successMessage}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Current Plan</CardTitle>
            {getStatusBadge(subscription?.status ?? "active")}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
                {PLANS.find((p) => p.id === currentPlan)?.name ?? "Free"} Plan
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {PLANS.find((p) => p.id === currentPlan)?.price ?? "$0"}/mo
              </p>
              {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                  Cancels at end of period:{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
              {subscription?.currentPeriodEnd && !subscription.cancelAtPeriodEnd && isPaidPlan && (
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Renews:{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            {subscription?.status === "past_due" && (
              <Button
                variant="destructive"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                Update Payment Method
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Meters */}
      {subscription?.usage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <UsageMeter
                label="Homes"
                used={subscription.usage.homes.used}
                limit={subscription.usage.homes.limit}
                icon={<Home className="h-4 w-4" />}
              />
              <UsageMeter
                label="Items"
                used={subscription.usage.items.used}
                limit={subscription.usage.items.limit}
                icon={<Package className="h-4 w-4" />}
              />
              <UsageMeter
                label="AI Scans (this month)"
                used={subscription.usage.aiScans.used}
                limit={subscription.usage.aiScans.limit}
                icon={<ScanLine className="h-4 w-4" />}
              />
              <UsageMeter
                label="Members"
                used={subscription.usage.members.used}
                limit={subscription.usage.members.limit}
                icon={<Users className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div>
        <h2 className="mb-6 font-heading text-xl font-bold text-[hsl(var(--foreground))]">
          {isPaidPlan ? "Change Plan" : "Upgrade Your Plan"}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              isCurrentPlan={currentPlan === plan.id}
              isRecommended={plan.isRecommended}
              onSelect={() => handleUpgrade(plan.id)}
              isLoading={upgradeLoading === plan.id}
              disabled={upgradeLoading !== null}
            />
          ))}
        </div>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Can I cancel anytime?
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Yes, you can cancel your subscription at any time. Your plan will remain active
                until the end of the current billing period.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Your data is never deleted. If you downgrade, you won&apos;t be able to add new
                items or homes beyond the free plan limits, but existing data remains accessible.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Do AI scan limits reset monthly?
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Yes, AI scan limits reset at the beginning of each calendar month.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
