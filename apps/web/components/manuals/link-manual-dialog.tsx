"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Link2, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface LinkManualDialogProps {
  itemId: string;
  existingManualIds: string[];
  trigger?: React.ReactNode;
}

interface AvailableManual {
  id: string;
  title: string;
  brand: string | null;
  model: string | null;
  _count: { chunks: number };
}

export function LinkManualDialog({
  itemId,
  existingManualIds,
  trigger,
}: LinkManualDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [manuals, setManuals] = React.useState<AvailableManual[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [linking, setLinking] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      loadManuals();
    }
  }, [open]);

  async function loadManuals() {
    setLoading(true);
    try {
      const res = await fetch("/api/manuals");
      const data = await res.json();
      if (data.success) {
        setManuals(data.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const filtered = manuals.filter((m) => {
    if (existingManualIds.includes(m.id)) return false;
    const q = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.brand?.toLowerCase().includes(q) ||
      m.model?.toLowerCase().includes(q)
    );
  });

  async function handleLink(manualId: string) {
    setLinking(manualId);
    try {
      const res = await fetch("/api/manuals/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualId, itemId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to link manual",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Manual linked", description: "Manual has been linked to this item." });
      setOpen(false);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to link manual",
        variant: "destructive",
      });
    } finally {
      setLinking(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Link2 className="h-4 w-4" />
            Link Existing
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Manual to Item</DialogTitle>
          <DialogDescription>
            Select an existing manual to link to this item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input
              placeholder="Search manuals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-60 space-y-1 overflow-y-auto">
            {loading ? (
              <p className="py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Loading manuals...
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                {search
                  ? "No matching manuals found."
                  : "No unlinked manuals available."}
              </p>
            ) : (
              filtered.map((manual) => (
                <button
                  key={manual.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
                  onClick={() => handleLink(manual.id)}
                  disabled={linking === manual.id}
                >
                  <FileText className="h-4 w-4 shrink-0 text-teal-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{manual.title}</p>
                    {(manual.brand || manual.model) && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {[manual.brand, manual.model].filter(Boolean).join(" ")}
                      </p>
                    )}
                  </div>
                  {linking === manual.id ? (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      Linking...
                    </span>
                  ) : (
                    <Link2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
