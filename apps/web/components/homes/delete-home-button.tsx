"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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

interface Props {
  homeId: string;
  homeName: string;
}

export function DeleteHomeButton({ homeId, homeName }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/homes/${homeId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete home",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Home deleted", description: `${homeName} has been deleted.` });
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete home",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Home</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{homeName}&rdquo;? This will permanently remove the home, all rooms, and all items. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Home"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
