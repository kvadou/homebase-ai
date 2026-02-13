"use client";

import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Loader2, CheckCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

interface ServiceRequestPaymentProps {
  requestId: string;
  amount: number;
  providerName: string;
  commissionRate: number;
  paymentStatus?: string | null;
}

function PaymentForm({
  requestId,
  amount,
  providerName,
  commissionRate,
  onSuccess,
}: {
  requestId: string;
  amount: number;
  providerName: string;
  commissionRate: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const commissionAmount = amount * commissionRate;
  const providerReceives = amount - commissionAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/providers?payment=success&requestId=${requestId}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: `Payment of $${amount.toFixed(2)} sent to ${providerName}.`,
        variant: "success",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 rounded-lg bg-[hsl(var(--muted))] p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[hsl(var(--muted-foreground))]">Total Amount</span>
          <span className="font-medium text-[hsl(var(--foreground))]">
            ${amount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[hsl(var(--muted-foreground))]">
            Platform Fee ({(commissionRate * 100).toFixed(0)}%)
          </span>
          <span className="text-[hsl(var(--muted-foreground))]">
            ${commissionAmount.toFixed(2)}
          </span>
        </div>
        <div className="border-t border-[hsl(var(--border))] pt-2">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">
              {providerName} receives
            </span>
            <span className="font-medium text-teal-600">
              ${providerReceives.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full gap-1.5"
      >
        {processing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

export function ServiceRequestPayment({
  requestId,
  amount,
  providerName,
  commissionRate,
  paymentStatus,
}: ServiceRequestPaymentProps) {
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [paid, setPaid] = React.useState(paymentStatus === "succeeded");
  const { toast } = useToast();

  const handleInitiatePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();

      if (data.success && data.data?.clientSecret) {
        setClientSecret(data.data.clientSecret);
      } else {
        toast({
          title: "Payment Error",
          description: data.error ?? "Could not initiate payment.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10">
            <CheckCircle className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <p className="font-medium text-[hsl(var(--foreground))]">Payment Complete</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              ${amount.toFixed(2)} paid to {providerName}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-teal-500" />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Amount</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Provider</span>
              <span>{providerName}</span>
            </div>
          </div>
          <Button
            onClick={handleInitiatePayment}
            disabled={loading}
            className="w-full gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {loading ? "Setting up..." : "Pay Now"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5 text-teal-500" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#00B4A0",
                borderRadius: "8px",
              },
            },
          }}
        >
          <PaymentForm
            requestId={requestId}
            amount={amount}
            providerName={providerName}
            commissionRate={commissionRate}
            onSuccess={() => setPaid(true)}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
