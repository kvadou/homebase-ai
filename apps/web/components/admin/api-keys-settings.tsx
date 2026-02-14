"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiKeyStatus {
  anthropic: boolean;
  stripe: boolean;
  google: boolean;
  yelp: boolean;
}

const keyLabels: Record<keyof ApiKeyStatus, { name: string; envVar: string; description: string }> = {
  anthropic: {
    name: "Anthropic (Claude AI)",
    envVar: "ANTHROPIC_API_KEY",
    description: "Powers AI scanning, chat, and vision features",
  },
  stripe: {
    name: "Stripe",
    envVar: "STRIPE_SECRET_KEY",
    description: "Handles subscription billing and payments",
  },
  google: {
    name: "Google Places",
    envVar: "GOOGLE_PLACES_API_KEY",
    description: "Provider directory and location services",
  },
  yelp: {
    name: "Yelp",
    envVar: "YELP_API_KEY",
    description: "Provider reviews and business listings",
  },
};

export function ApiKeysSettings() {
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/api-keys");
      const json = await res.json();
      if (json.success) {
        setStatus(json.data.configured);
      } else {
        setError(json.error || "Failed to fetch API key status");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-teal-500" />
                API Key Configuration
              </CardTitle>
              <CardDescription>
                Status of external API keys configured in the environment
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {loading && !status ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-[hsl(var(--muted))]"
                />
              ))}
            </div>
          ) : status ? (
            <div className="space-y-3">
              {(Object.keys(keyLabels) as (keyof ApiKeyStatus)[]).map((key) => {
                const info = keyLabels[key];
                const configured = status[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] px-4 py-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{info.name}</span>
                        <code className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                          {info.envVar}
                        </code>
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {info.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {configured ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <Badge variant="success">Configured</Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <Badge variant="destructive">Not Set</Badge>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">
            API keys are configured via environment variables. Update them in your deployment settings (Vercel, .env) and redeploy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
