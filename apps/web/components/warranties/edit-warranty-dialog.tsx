"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

interface WarrantyItem {
  id: string;
  name: string;
  warrantyExpiry: string | null;
  warrantyProvider: string | null;
  warrantyType: string | null;
  warrantyNotes: string | null;
}

interface EditWarrantyDialogProps {
  item: WarrantyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditWarrantyDialog({
  item,
  open,
  onOpenChange,
  onSaved,
}: EditWarrantyDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [warrantyProvider, setWarrantyProvider] = useState("");
  const [warrantyType, setWarrantyType] = useState("");
  const [warrantyNotes, setWarrantyNotes] = useState("");

  // Reset form when item changes
  function initForm() {
    if (item) {
      setWarrantyExpiry(
        item.warrantyExpiry
          ? new Date(item.warrantyExpiry).toISOString().split("T")[0]!
          : ""
      );
      setWarrantyProvider(item.warrantyProvider ?? "");
      setWarrantyType(item.warrantyType ?? "");
      setWarrantyNotes(item.warrantyNotes ?? "");
    }
  }

  async function handleSave() {
    if (!item) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/items/${item.id}/warranty`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warrantyExpiry: warrantyExpiry || null,
          warrantyProvider: warrantyProvider || null,
          warrantyType: warrantyType || null,
          warrantyNotes: warrantyNotes || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: "Warranty updated" });
        onSaved();
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update warranty",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update warranty",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) initForm();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Warranty — {item?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warranty-expiry">Expiry Date</Label>
            <Input
              id="warranty-expiry"
              type="date"
              value={warrantyExpiry}
              onChange={(e) => setWarrantyExpiry(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warranty-type">Warranty Type</Label>
            <Select value={warrantyType} onValueChange={setWarrantyType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                <SelectItem value="extended">Extended</SelectItem>
                <SelectItem value="home_warranty">Home Warranty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="warranty-provider">Provider</Label>
            <Input
              id="warranty-provider"
              value={warrantyProvider}
              onChange={(e) => setWarrantyProvider(e.target.value)}
              placeholder="e.g., Best Buy, SquareTrade"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warranty-notes">Notes</Label>
            <Textarea
              id="warranty-notes"
              value={warrantyNotes}
              onChange={(e) => setWarrantyNotes(e.target.value)}
              placeholder="Coverage details, claim info, etc."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
