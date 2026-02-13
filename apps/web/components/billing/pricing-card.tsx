"use client";

import { Check, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isCurrentPlan: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  isCurrentPlan,
  isRecommended = false,
  onSelect,
  isLoading = false,
  disabled = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col transition-shadow duration-200",
        isRecommended && "border-teal-500 shadow-lg shadow-teal-500/10",
        isCurrentPlan && "border-[hsl(var(--primary))]"
      )}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-teal-500 text-white hover:bg-teal-600">
            <Crown className="mr-1 h-3 w-3" />
            Recommended
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="success">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="pb-4 pt-6">
        <CardTitle className="text-xl">{name}</CardTitle>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        <div className="mt-4">
          <span className="font-heading text-4xl font-bold text-[hsl(var(--foreground))]">
            {price}
          </span>
          {period && (
            <span className="ml-1 text-[hsl(var(--muted-foreground))]">/{period}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
              <span className="text-sm text-[hsl(var(--foreground))]">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className={cn(
            "w-full",
            isRecommended && !isCurrentPlan && "bg-teal-500 hover:bg-teal-600"
          )}
          variant={isCurrentPlan ? "outline" : "default"}
          onClick={onSelect}
          disabled={isCurrentPlan || isLoading || disabled}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : (
            "Upgrade"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
