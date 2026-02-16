"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SafetyHub } from "@/components/safety/safety-hub";
import type { SafetyItemData } from "@/components/safety/safety-item-form";

interface HomeOption {
  id: string;
  name: string;
}

export default function SafetyPage() {
  const { toast } = useToast();
  const [homes, setHomes] = useState<HomeOption[]>([]);
  const [selectedHome, setSelectedHome] = useState<string>("");
  const [items, setItems] = useState<SafetyItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomes = useCallback(async () => {
    try {
      const res = await fetch("/api/homes");
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setHomes(data.data);
        setSelectedHome(data.data[0].id);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load homes.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchItems = useCallback(async () => {
    if (!selectedHome) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/homes/${selectedHome}/safety`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load safety information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedHome, toast]);

  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
                Emergency &amp; Safety Hub
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Shut-off locations, emergency contacts, and evacuation plans.
              </p>
            </div>
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      ) : !selectedHome ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
            <Shield className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            No homes found
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Add a home first to set up safety information.
          </p>
        </div>
      ) : (
        <SafetyHub
          homeId={selectedHome}
          items={items}
          onRefresh={fetchItems}
        />
      )}
    </div>
  );
}
