"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { AdminSidebarToggle } from "./admin-sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <header className="safe-top sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <AdminSidebarToggle onClick={onMenuClick} />
        <Link href="/admin" className="lg:hidden">
          <Image
            src="/logo.png"
            alt="HomeBase AI"
            width={28}
            height={28}
            className="rounded-md shadow-sm"
          />
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-600 sm:inline-flex">
          Admin
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
