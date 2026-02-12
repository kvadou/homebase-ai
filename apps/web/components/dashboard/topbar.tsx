"use client";

import { UserButton } from "@clerk/nextjs";
import { SidebarToggle } from "./sidebar";
import { HomeSelector } from "./home-selector";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarToggle onClick={onMenuClick} />
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
