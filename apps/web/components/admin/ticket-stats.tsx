"use client";

import { Headset, Clock, CheckCircle2, XCircle } from "lucide-react";
import { StatCard } from "./stat-card";

interface TicketStatsProps {
  stats: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
}

export function TicketStats({ stats }: TicketStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Open Tickets"
        value={stats.open}
        icon={Headset}
        className="border-l-4 border-l-amber-400"
      />
      <StatCard
        label="In Progress"
        value={stats.in_progress}
        icon={Clock}
        className="border-l-4 border-l-blue-400"
      />
      <StatCard
        label="Resolved"
        value={stats.resolved}
        icon={CheckCircle2}
        className="border-l-4 border-l-emerald-400"
      />
      <StatCard
        label="Closed"
        value={stats.closed}
        icon={XCircle}
        className="border-l-4 border-l-gray-400"
      />
    </div>
  );
}
