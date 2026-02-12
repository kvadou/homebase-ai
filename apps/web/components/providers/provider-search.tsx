"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SPECIALTIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Roofing",
  "Landscaping",
  "Cleaning",
  "Painting",
  "Carpentry",
  "General Contractor",
  "Pest Control",
  "Appliance Repair",
  "Locksmith",
  "Other",
];

interface ProviderSearchProps {
  onSearch: (search: string) => void;
  onSpecialtyFilter: (specialty: string) => void;
  search: string;
  specialty: string;
}

export function ProviderSearch({
  onSearch,
  onSpecialtyFilter,
  search,
  specialty,
}: ProviderSearchProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Input
          placeholder="Search providers by name or company..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <Select
          value={specialty}
          onValueChange={onSpecialtyFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialties</SelectItem>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || (specialty && specialty !== "all")) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSearch("");
              onSpecialtyFilter("all");
            }}
            className="shrink-0"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
