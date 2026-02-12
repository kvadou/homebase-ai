"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { MaintenanceTaskData } from "./maintenance-task-card";

interface LogCompletionDialogProps {
  task: MaintenanceTaskData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogged: () => void;
}

export function LogCompletionDialog({
  task,
  open,
  onOpenChange,
  onLogged,
}: LogCompletionDialogProps) {
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setNotes("");
    setCost("");
    setPerformedBy("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/maintenance/${task.id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes || undefined,
          cost: cost ? parseFloat(cost) : undefined,
          performedBy: performedBy || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Failed to log completion");
        return;
      }

      resetForm();
      onOpenChange(false);
      onLogged();
    } catch {
      setError("Failed to log completion");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Completion</DialogTitle>
          <DialogDescription>
            {task
              ? `Mark "${task.title}" as completed and log details.`
              : "Log maintenance completion details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was done? Any issues found?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performedBy">Performed By</Label>
              <Input
                id="performedBy"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                placeholder="Name or company"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Completion
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
