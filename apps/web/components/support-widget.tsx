"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  Plus,
  ArrowLeft,
  Send,
  MessageSquare,
  Loader2,
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  _count: { messages: number };
}

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  content: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  open: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

function formatLabel(str: string) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SupportWidget() {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<"list" | "create" | "detail">("list");
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [replyContent, setReplyContent] = React.useState("");
  const [sending, setSending] = React.useState(false);

  // Create form state
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState("medium");
  const [creating, setCreating] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets");
      const json = await res.json();
      if (json.success) setTickets(json.data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(ticketId: string) {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`);
      const json = await res.json();
      if (json.success) setMessages(json.data);
    } finally {
      setLoadingMessages(false);
    }
  }

  React.useEffect(() => {
    if (open) fetchTickets();
  }, [open]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function openTicketDetail(ticketId: string) {
    setSelectedTicketId(ticketId);
    setView("detail");
    fetchMessages(ticketId);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || creating) return;

    setCreating(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          priority,
        }),
      });
      if (res.ok) {
        setSubject("");
        setDescription("");
        setPriority("medium");
        setView("list");
        fetchTickets();
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim() || !selectedTicketId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      if (res.ok) {
        setReplyContent("");
        fetchMessages(selectedTicketId);
      }
    } finally {
      setSending(false);
    }
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setView("list");
      setSelectedTicketId(null);
      setMessages([]);
    }
  }

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Open support"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          {view === "list" && (
            <>
              <DialogHeader>
                <DialogTitle>Support</DialogTitle>
                <DialogDescription>
                  View your tickets or create a new one.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-3 mt-2">
                <Button
                  onClick={() => setView("create")}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  New Ticket
                </Button>

                {loading ? (
                  <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </div>
                ) : tickets.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    No tickets yet. Create one to get help.
                  </p>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => openTicketDetail(ticket.id)}
                      className="w-full rounded-lg border border-[hsl(var(--border))] p-3 text-left hover:bg-[hsl(var(--muted))]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium line-clamp-1">{ticket.subject}</span>
                        <Badge className={cn("border-0 shrink-0 text-[10px]", statusStyles[ticket.status])}>
                          {formatLabel(ticket.status)}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket._count.messages > 0 && (
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="h-3 w-3" />
                            {ticket._count.messages}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {view === "create" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setView("list")} className="h-8 w-8 p-0">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <DialogTitle>New Ticket</DialogTitle>
                </div>
                <DialogDescription>
                  Describe your issue and we will get back to you.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your issue"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about your issue..."
                    rows={4}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={creating || !subject.trim() || !description.trim()}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </form>
            </>
          )}

          {view === "detail" && selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setView("list")} className="h-8 w-8 p-0">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <DialogTitle className="line-clamp-1 text-base">{selectedTicket.subject}</DialogTitle>
                </div>
                <DialogDescription className="flex items-center gap-2">
                  <Badge className={cn("border-0 text-[10px]", statusStyles[selectedTicket.status])}>
                    {formatLabel(selectedTicket.status)}
                  </Badge>
                  <span>{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-3 mt-2 max-h-[300px]">
                {loadingMessages ? (
                  <div className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" />
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "rounded-lg p-3 text-sm",
                        msg.senderType === "admin"
                          ? "bg-blue-50 dark:bg-blue-950/20 ml-6"
                          : "bg-[hsl(var(--muted))] mr-6"
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium">
                          {msg.senderType === "admin" ? "Support" : "You"}
                        </span>
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                <form onSubmit={handleReply} className="flex gap-2 mt-3 border-t border-[hsl(var(--border))] pt-3">
                  <Input
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button type="submit" size="icon" disabled={!replyContent.trim() || sending}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
