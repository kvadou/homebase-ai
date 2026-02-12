"use client";

import * as React from "react";
import { Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ManualCard } from "./manual-card";
import { ManualDetail } from "./manual-detail";

interface ManualItem {
  item: { id: string; name: string; brand: string | null };
}

interface Manual {
  id: string;
  title: string;
  brand: string | null;
  model: string | null;
  fileType: string | null;
  pageCount: number | null;
  createdAt: string;
  items: ManualItem[];
  _count: { chunks: number };
}

interface ManualListProps {
  manuals: Manual[];
  itemId?: string;
}

export function ManualList({ manuals, itemId }: ManualListProps) {
  const [search, setSearch] = React.useState("");
  const [selectedManualId, setSelectedManualId] = React.useState<string | null>(null);

  const filtered = manuals.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.brand?.toLowerCase().includes(q) ||
      m.model?.toLowerCase().includes(q)
    );
  });

  if (selectedManualId) {
    return (
      <ManualDetail
        manualId={selectedManualId}
        onBack={() => setSelectedManualId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {manuals.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search manuals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))]" />
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">
            {search
              ? "No manuals match your search."
              : "No manuals yet. Upload a PDF to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((manual) => (
            <ManualCard
              key={manual.id}
              manual={manual}
              onClick={() => setSelectedManualId(manual.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
