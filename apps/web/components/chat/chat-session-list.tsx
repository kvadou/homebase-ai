"use client";

import * as React from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatSessionItem {
  id: string;
  title: string | null;
  updatedAt: string;
  _count: { messages: number };
}

interface ChatSessionListProps {
  sessions: ChatSessionItem[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export function ChatSessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatSessionListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[hsl(var(--border))] p-3">
        <Button
          onClick={onNewChat}
          className="w-full gap-2 bg-teal-500 hover:bg-teal-600"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No conversations yet.
            <br />
            Start a new chat!
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  activeSessionId === session.id
                    ? "bg-teal-500/10 text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {session.title || "New Conversation"}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    {session._count.messages} message
                    {session._count.messages !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))] group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
