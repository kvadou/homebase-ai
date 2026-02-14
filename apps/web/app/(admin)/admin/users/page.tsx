"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, TrendingUp, UserX } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { UserTable, type UserRow } from "@/components/admin/user-table";
import { UserDetailDialog } from "@/components/admin/user-detail-dialog";
import { Badge } from "@/components/ui/badge";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  newUsers7d: number;
  newUsers30d: number;
  planDistribution: Record<string, number>;
  churnRate: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "20",
        sort,
        order,
      });
      if (search) params.set("search", search);
      if (plan && plan !== "all") params.set("plan", plan);

      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users);
        setPagination(json.data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search, plan, sort, order]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users/stats");
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch {
      // stats are non-critical, silently fail
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  function handleSearchChange(newSearch: string) {
    setSearch(newSearch);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handlePlanChange(newPlan: string) {
    setPlan(newPlan);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handleSortChange(sortStr: string) {
    const [field, dir] = sortStr.split(":");
    setSort(field);
    setOrder((dir as "asc" | "desc") || "asc");
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handlePageChange(page: number) {
    setPagination((prev) => ({ ...prev, page }));
  }

  function handleViewUser(userId: string) {
    setSelectedUserId(userId);
    setDialogOpen(true);
  }

  function handleAdminToggled() {
    fetchUsers();
    fetchStats();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold">User Management</h1>
          <Badge variant="secondary" className="text-sm">
            {stats?.totalUsers ?? pagination.total} users
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? "-"}
          icon={Users}
          trend={
            stats
              ? { value: stats.newUsers30d, label: "last 30 days" }
              : undefined
          }
        />
        <StatCard
          label="New Today"
          value={stats?.newUsersToday ?? "-"}
          icon={UserPlus}
        />
        <StatCard
          label="New This Week"
          value={stats?.newUsers7d ?? "-"}
          icon={TrendingUp}
        />
        <StatCard
          label="Churn Rate"
          value={stats ? `${stats.churnRate}%` : "-"}
          icon={UserX}
        />
      </div>

      {/* Plan Distribution */}
      {stats?.planDistribution && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats.planDistribution).map(([planName, count]) => (
            <div
              key={planName}
              className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2"
            >
              <span className="text-sm font-medium capitalize">{planName}</span>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* User Table */}
      <UserTable
        users={users}
        pagination={pagination}
        search={search}
        plan={plan}
        sort={sort}
        order={order}
        onSearchChange={handleSearchChange}
        onPlanChange={handlePlanChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onViewUser={handleViewUser}
        loading={loading}
      />

      {/* User Detail Dialog */}
      <UserDetailDialog
        userId={selectedUserId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdminToggled={handleAdminToggled}
      />
    </div>
  );
}
