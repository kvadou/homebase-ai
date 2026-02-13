"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SafetyItemData {
  id: string;
  homeId: string;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  photoUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const SAFETY_TYPES = [
  { value: "shutoff_water", label: "Water Shut-off" },
  { value: "shutoff_gas", label: "Gas Shut-off" },
  { value: "shutoff_electrical", label: "Electrical Shut-off" },
  { value: "emergency_contact", label: "Emergency Contact" },
  { value: "evacuation_note", label: "Evacuation Note" },
  { value: "go_bag_item", label: "Go-Bag Item" },
];

interface SafetyItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  homeId: string;
  editItem?: SafetyItemData | null;
  defaultType?: string;
}

export function SafetyItemForm({
  open,
  onOpenChange,
  onSaved,
  homeId,
  editItem,
  defaultType,
}: SafetyItemFormProps) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(editItem?.title ?? "");
  const [description, setDescription] = useState(editItem?.description ?? "");
  const [location, setLocation] = useState(editItem?.location ?? "");
  const [type, setType] = useState(editItem?.type ?? defaultType ?? "shutoff_water");

  // Reset form when dialog opens with new data
  const handleOpenChange = (val: boolean) => {
    if (val) {
      setTitle(editItem?.title ?? "");
      setDescription(editItem?.description ?? "");
      setLocation(editItem?.location ?? "");
      setType(editItem?.type ?? defaultType ?? "shutoff_water");
    }
    onOpenChange(val);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const url = editItem
        ? `/api/homes/${homeId}/safety/${editItem.id}`
        : `/api/homes/${homeId}/safety`;
      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null, location: location.trim() || null, type }),
      });

      const data = await res.json();
      if (data.success) {
        onOpenChange(false);
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  }

  const isContact = type === "emergency_contact";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Safety Item" : "Add Safety Item"}</DialogTitle>
          <DialogDescription>
            {isContact
              ? "Add an emergency contact with their name and phone number."
              : "Add safety information for your home."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="safety-type">Type</Label>
            <Select value={type} onValueChange={setType} disabled={!!editItem}>
              <SelectTrigger id="safety-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAFETY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety-title">
              {isContact ? "Contact Name" : "Title"}
            </Label>
            <Input
              id="safety-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isContact ? "e.g., John's Plumbing" : "e.g., Main Water Valve"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety-description">
              {isContact ? "Phone / Details" : "Description"}
            </Label>
            <Textarea
              id="safety-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isContact
                  ? "e.g., (555) 123-4567 - Available 24/7"
                  : "Describe how to access or use this"
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety-location">
              {isContact ? "Service Type" : "Location"}
            </Label>
            <Input
              id="safety-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={
                isContact
                  ? "e.g., Plumber, Electrician, Fire Dept"
                  : "e.g., Basement, near water heater"
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
