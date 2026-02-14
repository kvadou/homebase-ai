"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0/mo",
    homes: "1",
    items: "50",
    rooms: "5 per home",
    ai: "Basic AI",
    aiPriority: false,
    api: false,
    badge: "default" as const,
  },
  {
    name: "Starter",
    price: "$9/mo",
    homes: "3",
    items: "200",
    rooms: "15 per home",
    ai: "Full AI",
    aiPriority: false,
    api: false,
    badge: "secondary" as const,
  },
  {
    name: "Pro",
    price: "$29/mo",
    homes: "10",
    items: "1,000",
    rooms: "50 per home",
    ai: "Full AI + Priority",
    aiPriority: true,
    api: false,
    badge: "success" as const,
  },
  {
    name: "Business",
    price: "$99/mo",
    homes: "Unlimited",
    items: "Unlimited",
    rooms: "Unlimited",
    ai: "Full AI + Priority + API",
    aiPriority: true,
    api: true,
    badge: "warning" as const,
  },
];

export function PricingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-teal-500" />
            Plan Limits
          </CardTitle>
          <CardDescription>
            Current subscription tier limits (read-only display)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Plan</th>
                  <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Price</th>
                  <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Homes</th>
                  <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Items</th>
                  <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Rooms</th>
                  <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">AI Features</th>
                  <th className="pb-3 text-center font-medium text-[hsl(var(--muted-foreground))]">Priority</th>
                  <th className="pb-3 text-center font-medium text-[hsl(var(--muted-foreground))]">API</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.name} className="border-b border-[hsl(var(--border))] last:border-0">
                    <td className="py-4">
                      <Badge variant={plan.badge}>{plan.name}</Badge>
                    </td>
                    <td className="py-4 font-medium">{plan.price}</td>
                    <td className="py-4">{plan.homes}</td>
                    <td className="py-4">{plan.items}</td>
                    <td className="py-4">{plan.rooms}</td>
                    <td className="py-4 text-xs">{plan.ai}</td>
                    <td className="py-4 text-center">
                      {plan.aiPriority ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {plan.api ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">
            Plan limits are hardcoded. To modify plans, update the application configuration and redeploy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
