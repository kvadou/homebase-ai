"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketReply } from "./ticket-reply";
import { cn } from "@/lib/utils";
import { ArrowLeft, User, Clock } from "lucide-react";

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  content: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  messages: Message[];
}

const statusStyles: Record<string, string> = {
  open: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const priorityStyles: Record<string, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function formatLabel(str: string) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface TicketDetailProps {
  ticket: Ticket;
  onRefresh: () => void;
}

export function TicketDetail({ ticket, onRefresh }: TicketDetailProps) {
  const router = useRouter();
  const [updating, setUpdating] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket.messages]);

  async function updateTicket(field: string, value: string) {
    setUpdating(true);
    try {
      await fetch(`/api/admin/support/tickets/${ticket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      onRefresh();
    } finally {
      setUpdating(false);
    }
  }

  const userName = [ticket.user.firstName, ticket.user.lastName].filter(Boolean).join(" ") || ticket.user.email;
  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/support")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-bold truncate flex-1">{ticket.subject}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Conversation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-lg p-3",
                    msg.senderType === "admin"
                      ? "bg-blue-50 dark:bg-blue-950/20 ml-8"
                      : "bg-[hsl(var(--muted))] mr-8"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{msg.senderName}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
              <TicketReply
                ticketId={ticket.id}
                onReplySent={onRefresh}
                disabled={isClosed}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Status</label>
                <Select
                  value={ticket.status}
                  onValueChange={(v) => updateTicket("status", v)}
                  disabled={updating}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Priority</label>
                <Select
                  value={ticket.priority}
                  onValueChange={(v) => updateTicket("priority", v)}
                  disabled={updating}
                >
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

              <div className="space-y-2 pt-2 border-t border-[hsl(var(--border))]">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[hsl(var(--muted-foreground))]">Requester:</span>
                  <span className="font-medium">{userName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[hsl(var(--muted-foreground))]">Created:</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                {ticket.category && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">Category:</span>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Status:</span>
                  <Badge className={cn("border-0", statusStyles[ticket.status])}>
                    {formatLabel(ticket.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Priority:</span>
                  <Badge className={cn("border-0", priorityStyles[ticket.priority])}>
                    {formatLabel(ticket.priority)}
                  </Badge>
                </div>
                {ticket.resolvedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">Resolved:</span>
                    <span>{new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
