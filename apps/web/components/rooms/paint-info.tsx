"use client";

import * as React from "react";
import { Paintbrush, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";

interface PaintData {
  paintBrand: string | null;
  paintColor: string | null;
  paintFinish: string | null;
  paintSheen: string | null;
  paintPurchaseDate: string | null;
}

interface PaintInfoProps {
  roomId: string;
  paint: PaintData;
}

const PAINT_FINISHES = ["Flat", "Matte", "Eggshell", "Satin", "Semi-Gloss", "High-Gloss"];
const PAINT_SHEENS = ["No Sheen", "Low Sheen", "Medium Sheen", "High Sheen"];

export function PaintInfo({ roomId, paint }: PaintInfoProps) {
  const { toast } = useToast();
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [data, setData] = React.useState<PaintData>(paint);

  const hasPaintInfo = data.paintBrand || data.paintColor || data.paintFinish || data.paintSheen;

  function formatDate(d: string | null) {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const body: PaintData = {
      paintBrand: (formData.get("paintBrand") as string) || null,
      paintColor: (formData.get("paintColor") as string) || null,
      paintFinish: (formData.get("paintFinish") as string) || null,
      paintSheen: (formData.get("paintSheen") as string) || null,
      paintPurchaseDate: (formData.get("paintPurchaseDate") as string) || null,
    };

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to update paint info",
          variant: "destructive",
        });
        return;
      }

      setData(body);
      setEditing(false);
      toast({ title: "Paint info updated", description: "Room paint details saved." });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save paint info",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 font-semibold text-sm">
            <Paintbrush className="h-4 w-4 text-teal-500" />
            Paint Details
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="paintBrand">Brand</Label>
            <Input
              id="paintBrand"
              name="paintBrand"
              placeholder="e.g., Benjamin Moore"
              defaultValue={data.paintBrand ?? ""}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="paintColor">Color</Label>
            <Input
              id="paintColor"
              name="paintColor"
              placeholder="e.g., Simply White OC-117"
              defaultValue={data.paintColor ?? ""}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="paintFinish">Finish</Label>
            <Select name="paintFinish" defaultValue={data.paintFinish ?? ""}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select finish" />
              </SelectTrigger>
              <SelectContent>
                {PAINT_FINISHES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="paintSheen">Sheen</Label>
            <Select name="paintSheen" defaultValue={data.paintSheen ?? ""}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select sheen" />
              </SelectTrigger>
              <SelectContent>
                {PAINT_SHEENS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="paintPurchaseDate">Purchase Date</Label>
            <Input
              id="paintPurchaseDate"
              name="paintPurchaseDate"
              type="date"
              defaultValue={formatDate(data.paintPurchaseDate)}
              className="mt-1"
            />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Paint Info"}
        </Button>
      </form>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-semibold text-sm">
          <Paintbrush className="h-4 w-4 text-teal-500" />
          Paint
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
        >
          <Edit className="h-4 w-4" />
          {hasPaintInfo ? "Edit" : "Add"}
        </Button>
      </div>
      {hasPaintInfo ? (
        <div className="mt-2 flex items-start gap-3">
          {data.paintColor && (
            <div
              className="mt-0.5 h-8 w-8 shrink-0 rounded-md border border-[hsl(var(--border))] shadow-sm"
              style={{ backgroundColor: data.paintColor.toLowerCase().includes("#") ? data.paintColor : undefined }}
            />
          )}
          <div className="grid gap-1 text-sm">
            {data.paintBrand && (
              <p>
                <span className="text-[hsl(var(--muted-foreground))]">Brand:</span>{" "}
                {data.paintBrand}
              </p>
            )}
            {data.paintColor && (
              <p>
                <span className="text-[hsl(var(--muted-foreground))]">Color:</span>{" "}
                {data.paintColor}
              </p>
            )}
            {data.paintFinish && (
              <p>
                <span className="text-[hsl(var(--muted-foreground))]">Finish:</span>{" "}
                {data.paintFinish}
              </p>
            )}
            {data.paintSheen && (
              <p>
                <span className="text-[hsl(var(--muted-foreground))]">Sheen:</span>{" "}
                {data.paintSheen}
              </p>
            )}
            {data.paintPurchaseDate && (
              <p>
                <span className="text-[hsl(var(--muted-foreground))]">Purchased:</span>{" "}
                {new Date(data.paintPurchaseDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
          No paint info recorded. Click Edit to add paint details.
        </p>
      )}
    </div>
  );
}
