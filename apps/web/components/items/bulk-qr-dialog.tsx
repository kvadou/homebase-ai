"use client";

import { useState } from "react";
import { QrCode, Download, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";

interface ItemSummary {
  id: string;
  name: string;
  brand: string | null;
}

interface BulkQRDialogProps {
  items: ItemSummary[];
}

export function BulkQRDialog({ items }: BulkQRDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const allSelected = selectedIds.size === items.length && items.length > 0;

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleGenerate() {
    if (selectedIds.size === 0) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/items/qr-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error("Failed to generate QR codes");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-labels.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: `${selectedIds.size} QR label${selectedIds.size > 1 ? "s" : ""} downloaded`,
        variant: "success",
      });
      setOpen(false);
    } catch {
      toast({ title: "Failed to generate QR codes", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCode className="h-4 w-4" />
          QR Labels
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate QR Labels</DialogTitle>
          <DialogDescription>
            Select items to generate QR code labels as a downloadable ZIP file.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {/* Select All */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-3 transition-colors hover:bg-[hsl(var(--accent))]">
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                allSelected
                  ? "border-[#00B4A0] bg-[#00B4A0] text-white"
                  : "border-[hsl(var(--border))]"
              }`}
              onClick={(e) => {
                e.preventDefault();
                toggleAll();
              }}
            >
              {allSelected && <Check className="h-3.5 w-3.5" />}
            </div>
            <span className="text-sm font-medium">
              Select All ({items.length} item{items.length !== 1 ? "s" : ""})
            </span>
          </label>

          {/* Item list */}
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const checked = selectedIds.has(item.id);
              return (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[hsl(var(--accent))]"
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked
                        ? "border-[#00B4A0] bg-[#00B4A0] text-white"
                        : "border-[hsl(var(--border))]"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleItem(item.id);
                    }}
                  >
                    {checked && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    {item.brand && (
                      <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                        {item.brand}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={selectedIds.size === 0 || generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate QR Labels ({selectedIds.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
