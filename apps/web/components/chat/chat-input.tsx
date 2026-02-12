"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSubmit();
      }
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className="flex items-end gap-2">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your home, appliances, or maintenance..."
          disabled={isLoading || disabled}
          rows={1}
          className={cn(
            "w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 pr-12 text-sm",
            "placeholder:text-[hsl(var(--muted-foreground))]",
            "focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>
      <Button
        onClick={onSubmit}
        disabled={!value.trim() || isLoading || disabled}
        size="icon"
        className="h-11 w-11 shrink-0 rounded-xl bg-teal-500 hover:bg-teal-600"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
