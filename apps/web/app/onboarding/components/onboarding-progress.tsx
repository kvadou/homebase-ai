"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Welcome" },
  { label: "Your Home" },
  { label: "Scan Item" },
  { label: "Review" },
  { label: "Plan" },
];

interface OnboardingProgressProps {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center px-4 py-6">
      <div className="flex items-center gap-0">
        {STEPS.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={step.label} className="flex items-center">
              {/* Dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-500",
                    isCompleted &&
                      "border-[#0A2E4D] bg-[#0A2E4D] text-white",
                    isActive &&
                      "border-[#00B4A0] bg-[#00B4A0] text-white shadow-[0_0_0_4px_rgba(0,180,160,0.15)]",
                    !isCompleted &&
                      !isActive &&
                      "border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-[10px] font-medium transition-colors duration-300",
                    isActive && "text-[#00B4A0]",
                    isCompleted && "text-[#0A2E4D] dark:text-gray-300",
                    !isActive && !isCompleted && "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="mx-1.5 mb-5 h-0.5 w-8 sm:mx-2.5 sm:w-12">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      stepNum < currentStep
                        ? "bg-[#0A2E4D]"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
