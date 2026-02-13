"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";

interface AddEventDialogProps {
  homeId: string;
  onEventAdded: () => void;
}

const EVENT_TYPES = [
  { value: "maintenance", label: "Maintenance" },
  { value: "purchase", label: "Purchase" },
  { value: "improvement", label: "Home Improvement" },
  { value: "warranty", label: "Warranty" },
  { value: "custom", label: "Custom Event" },
];

export function AddEventDialog({ homeId, onEventAdded }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("custom");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [cost, setCost] = useState("");

  const resetForm = () => {
    setType("custom");
    setTitle("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setCost("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/homes/${homeId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          description: description || undefined,
          date,
          cost: cost ? parseFloat(cost) : undefined,
        }),
      });

      if (res.ok) {
        resetForm();
        setOpen(false);
        onEventAdded();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Event
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
          <DialogDescription>
            Record a home event such as a purchase, improvement, or maintenance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="event-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Replaced kitchen faucet"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Description (optional)</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-cost">Cost (optional)</Label>
              <Input
                id="event-cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title}>
              {loading ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
