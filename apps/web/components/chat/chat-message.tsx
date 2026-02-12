"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-[hsl(var(--primary))]"
            : "bg-teal-500/10"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-[hsl(var(--primary-foreground))]" />
        ) : (
          <Bot className="h-4 w-4 text-teal-500" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
