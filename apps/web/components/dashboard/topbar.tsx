"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { SidebarToggle } from "./sidebar";
import { HomeSelector } from "./home-selector";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="safe-top sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarToggle onClick={onMenuClick} />
        <Link href="/dashboard" className="lg:hidden">
          <Image
            src="/logo.png"
            alt="HomeBase AI"
            width={28}
            height={28}
            className="rounded-md shadow-sm"
          />
        </Link>
        <HomeSelector />
      </div>
      <div className="flex items-center gap-4">
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
