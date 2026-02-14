"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, MessageSquare } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  _count: { messages: number };
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

interface TicketTableProps {
  tickets: Ticket[];
}

export function TicketTable({ tickets }: TicketTableProps) {
  const router = useRouter();

  if (tickets.length === 0) {
    return (
      <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
        No support tickets found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">ID</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Subject</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">User</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Status</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Priority</th>
            <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Created</th>
            <th className="px-4 py-3 text-right font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                {ticket.id.slice(0, 8)}...
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ticket.subject}</span>
                  {ticket._count.messages > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <MessageSquare className="h-3 w-3" />
                      {ticket._count.messages}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                {[ticket.user.firstName, ticket.user.lastName].filter(Boolean).join(" ") || ticket.user.email}
              </td>
              <td className="px-4 py-3">
                <Badge className={cn("border-0", statusStyles[ticket.status])}>
                  {formatLabel(ticket.status)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge className={cn("border-0", priorityStyles[ticket.priority])}>
                  {formatLabel(ticket.priority)}
                </Badge>
              </td>
              <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/admin/support/${ticket.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
