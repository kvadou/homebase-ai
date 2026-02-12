"use client";

import { FileText, Link2, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ManualItem {
  item: { id: string; name: string; brand: string | null };
}

interface ManualCardProps {
  manual: {
    id: string;
    title: string;
    brand: string | null;
    model: string | null;
    fileType: string | null;
    pageCount: number | null;
    createdAt: string;
    items: ManualItem[];
    _count: { chunks: number };
  };
  onClick?: () => void;
}

export function ManualCard({ manual, onClick }: ManualCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-[hsl(var(--muted))]"
      onClick={onClick}
    >
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-tight">{manual.title}</p>
            <div className="flex shrink-0 gap-1">
              {manual.fileType && (
                <Badge variant="outline" className="text-[10px] uppercase">
                  {manual.fileType}
                </Badge>
              )}
            </div>
          </div>
          {(manual.brand || manual.model) && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {[manual.brand, manual.model].filter(Boolean).join(" ")}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {manual.items.length > 0 && (
              <span className="flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                {manual.items.length} item{manual.items.length !== 1 ? "s" : ""}
              </span>
            )}
            {manual._count.chunks > 0 && (
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {manual._count.chunks} chunk{manual._count.chunks !== 1 ? "s" : ""}
              </span>
            )}
            {manual.pageCount && (
              <span>{manual.pageCount} page{manual.pageCount !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
