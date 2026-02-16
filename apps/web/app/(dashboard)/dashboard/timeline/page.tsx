"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HomeTimeline } from "@/components/timeline/home-timeline";

interface HomeOption {
  id: string;
  name: string;
}

export default function TimelinePage() {
  const [homes, setHomes] = useState<HomeOption[]>([]);
  const [selectedHome, setSelectedHome] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchHomes = useCallback(async () => {
    try {
      const res = await fetch("/api/homes");
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setHomes(data.data);
        setSelectedHome(data.data[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
            <Clock className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
              Timeline
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Chronological history of events, purchases, and maintenance.
            </p>
          </div>
        </div>
        {homes.length > 1 && (
          <Select value={selectedHome} onValueChange={setSelectedHome}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select home" />
            </SelectTrigger>
            <SelectContent>
              {homes.map((home) => (
                <SelectItem key={home.id} value={home.id}>
                  {home.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedHome ? (
        <HomeTimeline homeId={selectedHome} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clock className="mb-4 h-10 w-10 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Add a home to start tracking your home timeline.
          </p>
        </div>
      )}
    </div>
  );
}
