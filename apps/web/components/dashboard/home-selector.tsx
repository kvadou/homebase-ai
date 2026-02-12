"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Home, ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HomeItem {
  id: string;
  name: string;
}

export function HomeSelector() {
  const router = useRouter();
  const [homes, setHomes] = React.useState<HomeItem[]>([]);
  const [activeHome, setActiveHome] = React.useState<HomeItem | null>(null);

  React.useEffect(() => {
    fetch("/api/homes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setHomes(data.data);
          if (data.data.length > 0 && !activeHome) {
            setActiveHome(data.data[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Home className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {activeHome?.name ?? "Select Home"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Your Homes</DropdownMenuLabel>
        {homes.map((home) => (
          <DropdownMenuItem
            key={home.id}
            onClick={() => {
              setActiveHome(home);
              router.push(`/home/${home.id}`);
            }}
          >
            <Home className="mr-2 h-4 w-4" />
            {home.name}
          </DropdownMenuItem>
        ))}
        {homes.length === 0 && (
          <DropdownMenuItem disabled>No homes yet</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/home/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Home
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
