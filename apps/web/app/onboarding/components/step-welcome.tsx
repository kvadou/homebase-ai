"use client";

import { Home, ScanLine, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepWelcomeProps {
  firstName: string | null;
  onNext: () => void;
  onSkip: () => void;
}

const FEATURES = [
  {
    icon: Home,
    title: "Add your home",
    desc: "Set up your home profile",
  },
  {
    icon: ScanLine,
    title: "Scan an item",
    desc: "AI identifies it instantly",
  },
  {
    icon: Wrench,
    title: "Get a plan",
    desc: "Auto-generated maintenance",
  },
];

export function StepWelcome({ firstName, onNext, onSkip }: StepWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        {/* Logo mark */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2E4D] to-[#0d3d66] shadow-lg animate-in fade-in duration-500">
          <Home className="h-8 w-8 text-white" />
        </div>

        {/* Headline */}
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[#0A2E4D] dark:text-white sm:text-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both delay-100">
          Welcome{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-gray-500 dark:text-gray-400 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both delay-200">
          Let&apos;s set up your home in under 5 minutes. You&apos;ll scan your
          first item and get an AI-powered maintenance plan.
        </p>

        {/* Feature pills */}
        <div className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both delay-300">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={cn(
                "flex flex-1 flex-col items-center rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/50",
              )}
            >
              <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#00B4A0]/10">
                <feature.icon className="h-5 w-5 text-[#00B4A0]" />
              </div>
              <p className="text-sm font-semibold text-[#0A2E4D] dark:text-white">
                {feature.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {feature.desc}
              </p>
              {i < FEATURES.length - 1 && (
                <ArrowRight className="mt-2 hidden h-3 w-3 text-gray-300 sm:hidden" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both delay-500">
          <Button
            onClick={onNext}
            size="lg"
            className="gap-2 bg-[#00B4A0] px-8 text-base font-semibold text-white shadow-md shadow-[#00B4A0]/20 transition-all hover:bg-[#009e8e] hover:shadow-lg hover:shadow-[#00B4A0]/30"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Skip */}
        <button
          onClick={onSkip}
          className="mt-6 text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 animate-in fade-in duration-500 fill-mode-both delay-700"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
