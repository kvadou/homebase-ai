"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { TicketDetail } from "@/components/admin/ticket-detail";

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = React.useState<React.ComponentProps<typeof TicketDetail>["ticket"] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTicket = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`);
      const json = await res.json();
      if (json.success) {
        setTicket(json.data);
        setError(null);
      } else {
        setError(json.error || "Failed to load ticket");
      }
    } catch {
      setError("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  React.useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  if (loading) {
    return (
      <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
        Loading ticket...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="py-12 text-center text-red-500">
        {error || "Ticket not found"}
      </div>
    );
  }

  return <TicketDetail ticket={ticket} onRefresh={fetchTicket} />;
}
