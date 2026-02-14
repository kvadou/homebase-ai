"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="divide-y divide-white/5">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left"
          >
            <span className="font-heading text-base font-medium text-white pr-4">
              {item.question}
            </span>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200",
                openIndex === i && "rotate-180 text-teal-400"
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              openIndex === i ? "max-h-96 pb-5" : "max-h-0"
            )}
          >
            <p className="text-sm leading-relaxed text-gray-400">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
