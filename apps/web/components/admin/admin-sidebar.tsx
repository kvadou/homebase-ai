"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getActiveSection, type NavSection } from "./admin-nav-config";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname);
  const children = activeSection?.children;

  // No sidebar if section has no children
  if (!children || children.length === 0) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Section header */}
        <div className="flex h-12 items-center justify-between border-b border-[hsl(var(--border))] px-4">
          <div className="flex items-center gap-2">
            {activeSection.icon && (
              <activeSection.icon className="h-4 w-4 text-[#00B4A0]" />
            )}
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
              {activeSection.label}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sub-navigation */}
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {children.map((child) => {
            const isActive = pathname === child.href;
            const Icon = child.icon;

            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-[#00B4A0]/10 text-[#00B4A0] dark:bg-[#00B4A0]/15"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-[#00B4A0]" />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                {child.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
