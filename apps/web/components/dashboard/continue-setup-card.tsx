"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContinueSetupCard() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Show card if onboarding was skipped
    const skipped = document.cookie.includes("onboarding_skipped=1");
    setVisible(skipped);
  }, []);

  function handleDismiss() {
    setVisible(false);
    document.cookie = "onboarding_dismissed=1; path=/; max-age=31536000; SameSite=Lax; Secure";
  }

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#00B4A0]/20 bg-gradient-to-r from-[#00B4A0]/5 to-teal-50/50 p-4 dark:from-[#00B4A0]/10 dark:to-teal-950/20">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#00B4A0]/15">
          <Sparkles className="h-5 w-5 text-[#00B4A0]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0A2E4D] dark:text-white">
            Continue setting up your home
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Scan your first item and get an AI-powered maintenance plan.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 gap-1.5 bg-[#00B4A0] font-semibold text-white hover:bg-[#009e8e]"
        >
          <Link href="/onboarding">
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
