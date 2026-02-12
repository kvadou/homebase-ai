"use client";

import * as React from "react";
import { FileText, Layers, Upload, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ManualUploadDialog } from "./manual-upload-dialog";
import { LinkManualDialog } from "./link-manual-dialog";
import { ManualDetail } from "./manual-detail";

interface ManualSummary {
  id: string;
  title: string;
  brand: string | null;
  model: string | null;
  fileType: string | null;
  pageCount: number | null;
  createdAt: string;
  _count: { chunks: number };
}

interface ItemManualsSectionProps {
  itemId: string;
  manuals: ManualSummary[];
}

export function ItemManualsSection({ itemId, manuals }: ItemManualsSectionProps) {
  const [selectedManualId, setSelectedManualId] = React.useState<string | null>(null);

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
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          {manuals.length} manual{manuals.length !== 1 ? "s" : ""} linked
        </p>
        <div className="flex gap-2">
          <LinkManualDialog
            itemId={itemId}
            existingManualIds={manuals.map((m) => m.id)}
          />
          <ManualUploadDialog itemId={itemId} />
        </div>
      </div>

      {manuals.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))]" />
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">
            No manuals linked yet. Upload a PDF or link an existing manual.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {manuals.map((manual) => (
            <button
              key={manual.id}
              type="button"
              className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-[hsl(var(--muted))]"
              onClick={() => setSelectedManualId(manual.id)}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="font-medium text-sm">{manual.title}</p>
                {(manual.brand || manual.model) && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {[manual.brand, manual.model].filter(Boolean).join(" ")}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                  {manual.fileType && (
                    <Badge variant="outline" className="text-[10px] uppercase px-1.5 py-0">
                      {manual.fileType}
                    </Badge>
                  )}
                  {manual._count.chunks > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Layers className="h-3 w-3" />
                      {manual._count.chunks} chunks
                    </span>
                  )}
                  {manual.pageCount && (
                    <span>{manual.pageCount} pages</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
