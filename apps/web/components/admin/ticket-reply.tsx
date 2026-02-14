"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface TicketReplyProps {
  ticketId: string;
  onReplySent: () => void;
  disabled?: boolean;
}

export function TicketReply({ ticketId, onReplySent, disabled }: TicketReplyProps) {
  const [content, setContent] = React.useState("");
  const [sending, setSending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        onReplySent();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Type your reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={disabled || sending}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!content.trim() || sending || disabled} size="sm">
          <Send className="h-4 w-4" />
          {sending ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </form>
  );
}
