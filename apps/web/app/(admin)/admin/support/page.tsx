"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketTable } from "@/components/admin/ticket-table";
import { TicketStats } from "@/components/admin/ticket-stats";
import { Search, Headset } from "lucide-react";

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

export default function AdminSupportPage() {
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [stats, setStats] = React.useState({ open: 0, in_progress: 0, resolved: 0, closed: 0 });

  const fetchTickets = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    params.set("limit", "100");

    try {
      const res = await fetch(`/api/admin/support/tickets?${params}`);
      const json = await res.json();
      if (json.success) {
        setTickets(json.data.tickets);
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  const fetchStats = React.useCallback(async () => {
    // Fetch all tickets to compute stats
    const res = await fetch("/api/admin/support/tickets?limit=10000");
    const json = await res.json();
    if (json.success) {
      const all = json.data.tickets as Ticket[];
      setStats({
        open: all.filter((t) => t.status === "open").length,
        in_progress: all.filter((t) => t.status === "in_progress").length,
        resolved: all.filter((t) => t.status === "resolved").length,
        closed: all.filter((t) => t.status === "closed").length,
      });
    }
  }, []);

  React.useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [fetchTickets, fetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Headset className="h-6 w-6 text-[hsl(var(--primary))]" />
        <h1 className="text-2xl font-bold">Support Tickets</h1>
      </div>

      <TicketStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Tickets</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
              Loading tickets...
            </div>
          ) : (
            <TicketTable tickets={tickets} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
