"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  plan: string;
  subscriptionStatus: string;
  homeCount: number;
  itemCount: number;
  createdAt: string;
  lastActive: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserTableProps {
  users: UserRow[];
  pagination: Pagination;
  search: string;
  plan: string;
  sort: string;
  order: "asc" | "desc";
  onSearchChange: (search: string) => void;
  onPlanChange: (plan: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onViewUser: (userId: string) => void;
  loading: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

function planBadgeVariant(plan: string) {
  switch (plan) {
    case "pro":
      return "default" as const;
    case "premium":
      return "success" as const;
    default:
      return "secondary" as const;
  }
}

const columns = [
  { key: "firstName", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "plan", label: "Plan", sortable: false },
  { key: "homes", label: "Homes", sortable: false },
  { key: "items", label: "Items", sortable: false },
  { key: "createdAt", label: "Joined", sortable: true },
  { key: "lastActive", label: "Last Active", sortable: false },
  { key: "actions", label: "", sortable: false },
];

export function UserTable({
  users,
  pagination,
  search,
  plan,
  sort,
  order,
  onSearchChange,
  onPlanChange,
  onSortChange,
  onPageChange,
  onViewUser,
  loading,
}: UserTableProps) {
  const [localSearch, setLocalSearch] = useState(search);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearchChange(localSearch);
  }

  function handleSort(key: string) {
    if (sort === key) {
      onSortChange(key + (order === "asc" ? ":desc" : ":asc"));
    } else {
      onSortChange(key + ":asc");
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search by name or email..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select value={plan} onValueChange={onPlanChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]",
                      col.sortable && "cursor-pointer select-none hover:text-[hsl(var(--foreground))]"
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sort === col.key && (
                        order === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={cn(loading && "opacity-50")}>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    {loading ? "Loading users..." : "No users found"}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/30 transition-colors cursor-pointer"
                    onClick={() => onViewUser(user.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-medium">
                            {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                              : "No name"}
                          </div>
                          {user.isAdmin && (
                            <Badge variant="warning" className="mt-0.5 text-[10px] px-1.5 py-0">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={planBadgeVariant(user.plan)}>
                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">{user.homeCount}</td>
                    <td className="px-4 py-3 text-center">{user.itemCount}</td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {formatRelative(user.lastActive)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewUser(user.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-4 py-3">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              Showing {(pagination.page - 1) * pagination.limit + 1}
              {" - "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="min-w-[36px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
