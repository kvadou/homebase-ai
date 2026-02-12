"use client";

import * as React from "react";
import type { Message } from "ai/react";
import { ChatMessage } from "./chat-message";
import { Bot, MessageSquare, Sparkles } from "lucide-react";

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
            <MessageSquare className="h-8 w-8 text-teal-500" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        </div>
        <h2 className="font-heading text-lg font-semibold text-[hsl(var(--foreground))]">
          Chat With Your Home
        </h2>
        <p className="mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
          Ask questions about your appliances, get maintenance advice,
          troubleshoot issues, and more.
        </p>
        <div className="mt-6 grid gap-2 text-left">
          {[
            "When should I replace my HVAC filter?",
            "What maintenance is due this month?",
            "Help me troubleshoot my dishwasher",
          ].map((suggestion) => (
            <div
              key={suggestion}
              className="rounded-lg border border-[hsl(var(--border))] px-4 py-2.5 text-xs text-[hsl(var(--muted-foreground))]"
            >
              {suggestion}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          role={message.role as "user" | "assistant"}
          content={message.content}
        />
      ))}

      {isLoading &&
        messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10">
              <Bot className="h-4 w-4 text-teal-500" />
            </div>
            <div className="rounded-2xl bg-[hsl(var(--muted))] px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[hsl(var(--muted-foreground))]/50 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[hsl(var(--muted-foreground))]/50 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[hsl(var(--muted-foreground))]/50 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

      <div ref={bottomRef} />
    </div>
  );
}
