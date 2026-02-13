"use client";

import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export function UpgradePrompt({ open, onClose, feature }: UpgradePromptProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center">Plan Limit Reached</DialogTitle>
          <DialogDescription className="text-center">
            {feature
              ? `You've reached the limit for ${feature} on your current plan.`
              : "You've reached the limit on your current plan."}{" "}
            Upgrade to unlock more capacity and premium features.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600"
            onClick={() => {
              onClose();
              router.push("/dashboard/billing");
            }}
          >
            <Zap className="mr-2 h-4 w-4" />
            View Plans & Upgrade
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Inline banner version of the upgrade prompt for embedding in pages.
 */
interface UpgradeBannerProps {
  feature?: string;
}

export function UpgradeBanner({ feature }: UpgradeBannerProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
          <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Plan limit reached
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {feature
              ? `Upgrade your plan to add more ${feature}.`
              : "Upgrade your plan to unlock more features."}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        className="bg-amber-600 text-white hover:bg-amber-700"
        onClick={() => router.push("/dashboard/billing")}
      >
        Upgrade
      </Button>
    </div>
  );
}
