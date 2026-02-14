"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  LifeBuoy,
  Megaphone,
  BarChart3,
  Settings,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "safe-left fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="safe-top flex h-[4.5rem] items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="HomeBase AI"
              width={40}
              height={40}
              className="rounded-lg shadow-sm"
            />
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold leading-tight">
                HomeBase <span className="text-teal-500">AI</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide text-orange-500">
                Admin Portal
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
                    : "text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-[hsl(var(--sidebar-primary))]" : ""
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="safe-bottom border-t border-[hsl(var(--sidebar-border))] p-4">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Admin Portal v6.0
          </span>
        </div>
      </aside>
    </>
  );
}

export function AdminSidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClick}>
      <Menu className="h-5 w-5" />
    </Button>
  );
}
