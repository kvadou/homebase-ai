"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { SafetyItemData } from "./safety-item-form";

const CONTACT_TYPES = [
  "Plumber",
  "Electrician",
  "HVAC",
  "General Contractor",
  "Locksmith",
  "Fire Department",
  "Police",
  "Poison Control",
  "Insurance Agent",
  "Neighbor",
  "Family",
  "Other",
];

interface EmergencyContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  homeId: string;
  editItem?: SafetyItemData | null;
}

export function EmergencyContactForm({
  open,
  onOpenChange,
  onSaved,
  homeId,
  editItem,
}: EmergencyContactFormProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(editItem?.title ?? "");
  const [phone, setPhone] = useState(editItem?.description ?? "");
  const [contactType, setContactType] = useState(editItem?.location ?? "Plumber");

  const handleOpenChange = (val: boolean) => {
    if (val) {
      setName(editItem?.title ?? "");
      setPhone(editItem?.description ?? "");
      setContactType(editItem?.location ?? "Plumber");
    }
    onOpenChange(val);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setSaving(true);
    try {
      const url = editItem
        ? `/api/homes/${homeId}/safety/${editItem.id}`
        : `/api/homes/${homeId}/safety`;
      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: name.trim(),
          description: phone.trim(),
          location: contactType,
          type: "emergency_contact",
        }),
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editItem ? "Edit Emergency Contact" : "Add Emergency Contact"}
          </DialogTitle>
          <DialogDescription>
            Add someone to call in case of an emergency.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John's Plumbing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone Number</Label>
            <Input
              id="contact-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., (555) 123-4567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-type">Type</Label>
            <Select value={contactType} onValueChange={setContactType}>
              <SelectTrigger id="contact-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((ct) => (
                  <SelectItem key={ct} value={ct}>
                    {ct}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={saving || !name.trim() || !phone.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editItem ? "Update" : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
