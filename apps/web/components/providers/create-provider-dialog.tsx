"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useToast } from "@/components/ui/toaster";

const SPECIALTIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Roofing",
  "Landscaping",
  "Cleaning",
  "Painting",
  "Carpentry",
  "General Contractor",
  "Pest Control",
  "Appliance Repair",
  "Locksmith",
  "Other",
];

interface CreateProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateProviderDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateProviderDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [specialty, setSpecialty] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      company: formData.get("company") || undefined,
      specialty,
      phone: formData.get("phone") || undefined,
      email: formData.get("email") || undefined,
      website: formData.get("website") || undefined,
      address: formData.get("address") || undefined,
    };

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to create provider",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Provider added",
        description: `${body.name} has been added to the directory.`,
      });

      onOpenChange(false);
      onCreated();
      setSpecialty("");
    } catch {
      toast({
        title: "Error",
        description: "Failed to create provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Service Provider</DialogTitle>
          <DialogDescription>
            Add a new service provider to the directory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="provider-name">Name *</Label>
            <Input
              id="provider-name"
              name="name"
              placeholder="e.g., John Smith"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="provider-company">Company</Label>
            <Input
              id="provider-company"
              name="company"
              placeholder="e.g., Smith Plumbing"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Specialty *</Label>
            <Select value={specialty} onValueChange={setSpecialty} required>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="provider-phone">Phone</Label>
              <Input
                id="provider-phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="provider-email">Email</Label>
              <Input
                id="provider-email"
                name="email"
                type="email"
                placeholder="john@example.com"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="provider-website">Website</Label>
            <Input
              id="provider-website"
              name="website"
              type="url"
              placeholder="https://example.com"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="provider-address">Address</Label>
            <Input
              id="provider-address"
              name="address"
              placeholder="123 Main St, City, State"
              className="mt-1.5"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !specialty}>
              {loading ? "Adding..." : "Add Provider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
