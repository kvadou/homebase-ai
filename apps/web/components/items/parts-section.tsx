"use client";

import * as React from "react";
import { Plus, Cog, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";

interface PartData {
  id: string;
  name: string;
  partNumber: string | null;
  manufacturer: string | null;
  price: number | null;
  sourceUrl: string | null;
  notes: string | null;
  filterSize: string | null;
  quantity: number | null;
  lastReplacedDate: string | null;
  replacementInterval: string | null;
}

interface PartsSectionProps {
  itemId: string;
  parts: PartData[];
}

export function PartsSection({ itemId, parts: initialParts }: PartsSectionProps) {
  const { toast } = useToast();
  const [parts, setParts] = React.useState(initialParts);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function handleAddPart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      itemId,
      name: formData.get("name"),
      partNumber: formData.get("partNumber") || undefined,
      manufacturer: formData.get("manufacturer") || undefined,
      price: formData.get("price") ? Number(formData.get("price")) : undefined,
      sourceUrl: formData.get("sourceUrl") || undefined,
      notes: formData.get("notes") || undefined,
      filterSize: formData.get("filterSize") || undefined,
      quantity: formData.get("quantity") ? Number(formData.get("quantity")) : undefined,
      lastReplacedDate: formData.get("lastReplacedDate") || undefined,
      replacementInterval: formData.get("replacementInterval") || undefined,
    };

    try {
      const res = await fetch(`/api/items/${itemId}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to add part",
          variant: "destructive",
        });
        return;
      }

      setParts((prev) => [...prev, result.data]);
      setDialogOpen(false);
      toast({ title: "Part added", description: `${body.name} has been added.` });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Parts & Filters</h3>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Part
        </Button>
      </div>

      {parts.length === 0 ? (
        <div className="py-8 text-center">
          <Cog className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            No parts tracked yet. Add replacement parts, filters, or components.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {parts.map((part) => (
            <div
              key={part.id}
              className="rounded-lg border border-[hsl(var(--border))] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{part.name}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                    {part.manufacturer && <span>{part.manufacturer}</span>}
                    {part.partNumber && (
                      <span>#{part.partNumber}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {part.price != null && (
                    <Badge variant="secondary">${part.price.toFixed(2)}</Badge>
                  )}
                  {part.sourceUrl && (
                    <a
                      href={part.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-500 hover:text-teal-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {(part.filterSize || part.lastReplacedDate || part.replacementInterval) && (
                <div className="mt-3 flex flex-wrap gap-3 border-t border-[hsl(var(--border))] pt-3 text-xs">
                  {part.filterSize && (
                    <span className="text-[hsl(var(--muted-foreground))]">
                      Size: <span className="font-medium text-[hsl(var(--foreground))]">{part.filterSize}</span>
                    </span>
                  )}
                  {part.quantity != null && (
                    <span className="text-[hsl(var(--muted-foreground))]">
                      Qty: <span className="font-medium text-[hsl(var(--foreground))]">{part.quantity}</span>
                    </span>
                  )}
                  {part.lastReplacedDate && (
                    <span className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                      <Calendar className="h-3 w-3" />
                      Last replaced: {new Date(part.lastReplacedDate).toLocaleDateString()}
                    </span>
                  )}
                  {part.replacementInterval && (
                    <span className="text-[hsl(var(--muted-foreground))]">
                      Replace every: <span className="font-medium text-[hsl(var(--foreground))]">{part.replacementInterval}</span>
                    </span>
                  )}
                </div>
              )}

              {part.notes && (
                <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                  {part.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddPart}>
            <DialogHeader>
              <DialogTitle>Add Part</DialogTitle>
              <DialogDescription>
                Track replacement parts, filters, or components for this item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="part-name">Part Name *</Label>
                <Input
                  id="part-name"
                  name="name"
                  placeholder="e.g., Air Filter"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="part-number">Part Number</Label>
                <Input
                  id="part-number"
                  name="partNumber"
                  placeholder="e.g., MERV-13"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="part-manufacturer">Manufacturer</Label>
                <Input
                  id="part-manufacturer"
                  name="manufacturer"
                  placeholder="e.g., Honeywell"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="part-filter-size">Filter Size</Label>
                <Input
                  id="part-filter-size"
                  name="filterSize"
                  placeholder="e.g., 20x25x1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="part-quantity">Quantity</Label>
                <Input
                  id="part-quantity"
                  name="quantity"
                  type="number"
                  placeholder="1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="part-price">Price ($)</Label>
                <Input
                  id="part-price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="part-replacement-interval">Replacement Interval</Label>
                <Input
                  id="part-replacement-interval"
                  name="replacementInterval"
                  placeholder="e.g., 90 days"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="part-last-replaced">Last Replaced</Label>
                <Input
                  id="part-last-replaced"
                  name="lastReplacedDate"
                  type="date"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="part-source-url">Purchase URL</Label>
                <Input
                  id="part-source-url"
                  name="sourceUrl"
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="part-notes">Notes</Label>
                <Textarea
                  id="part-notes"
                  name="notes"
                  placeholder="Additional notes..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add Part"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
