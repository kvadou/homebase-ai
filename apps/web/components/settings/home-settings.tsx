"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import {
  Home,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  DoorOpen,
  Package,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface HomeData {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  homeType: string | null;
  _count: { rooms: number; items: number };
}

export function HomeSettings() {
  const { toast } = useToast();
  const [homes, setHomes] = useState<HomeData[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingHome, setEditingHome] = useState<HomeData | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editZip, setEditZip] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete state
  const [deletingHome, setDeletingHome] = useState<HomeData | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchHomes = useCallback(async () => {
    try {
      const res = await fetch("/api/homes");
      const data = await res.json();
      if (data.success) {
        setHomes(data.data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load homes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  function openEdit(home: HomeData) {
    setEditingHome(home);
    setEditName(home.name);
    setEditAddress(home.address ?? "");
    setEditCity(home.city ?? "");
    setEditState(home.state ?? "");
    setEditZip(home.zipCode ?? "");
  }

  async function handleEditSave() {
    if (!editingHome) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/homes/${editingHome.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          address: editAddress || null,
          city: editCity || null,
          state: editState || null,
          zipCode: editZip || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Home updated", description: `"${editName}" has been saved.` });
        setEditingHome(null);
        fetchHomes();
      } else {
        toast({ title: "Error", description: data.error || "Failed to update home.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update home.", variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingHome) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/homes/${deletingHome.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Home deleted", description: `"${deletingHome.name}" has been removed.` });
        setDeletingHome(null);
        setDeleteConfirmText("");
        fetchHomes();
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete home.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete home.", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Your Homes</CardTitle>
            <CardDescription>Manage the homes in your inventory.</CardDescription>
          </div>
          <Button asChild className="gap-2">
            <Link href="/dashboard/home/new">
              <Plus className="h-4 w-4" />
              Add Home
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {homes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Home className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No homes yet. Add your first home to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {homes.map((home) => (
                <div
                  key={home.id}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[hsl(var(--foreground))]">{home.name}</h3>
                      {home.homeType && (
                        <Badge variant="secondary" className="text-xs">
                          {home.homeType}
                        </Badge>
                      )}
                    </div>
                    {(home.address || home.city) && (
                      <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                        {[home.address, home.city, home.state].filter(Boolean).join(", ")}
                        {home.zipCode ? ` ${home.zipCode}` : ""}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="flex items-center gap-1">
                        <DoorOpen className="h-3.5 w-3.5" />
                        {home._count.rooms} {home._count.rooms === 1 ? "room" : "rooms"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {home._count.items} {home._count.items === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(home)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
                      onClick={() => {
                        setDeletingHome(home);
                        setDeleteConfirmText("");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Home Dialog */}
      <Dialog open={!!editingHome} onOpenChange={(open) => !open && setEditingHome(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Home</DialogTitle>
            <DialogDescription>Update the details for this home.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Home name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Street address"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-zip">ZIP Code</Label>
                <Input
                  id="edit-zip"
                  value={editZip}
                  onChange={(e) => setEditZip(e.target.value)}
                  placeholder="ZIP"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingHome(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editSaving || !editName.trim()} className="gap-2">
              {editSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Home Dialog */}
      <Dialog open={!!deletingHome} onOpenChange={(open) => !open && setDeletingHome(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(var(--destructive))]">
              <AlertTriangle className="h-5 w-5" />
              Delete Home
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">&quot;{deletingHome?.name}&quot;</span> and all
              associated data.
            </DialogDescription>
          </DialogHeader>
          {deletingHome && (deletingHome._count.rooms > 0 || deletingHome._count.items > 0) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              <p className="font-medium">Warning: This home contains data</p>
              <p className="mt-1">
                {deletingHome._count.rooms} {deletingHome._count.rooms === 1 ? "room" : "rooms"} and{" "}
                {deletingHome._count.items} {deletingHome._count.items === 1 ? "item" : "items"} will
                also be deleted.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono font-semibold">delete</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="delete"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingHome(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirmText !== "delete" || deleteLoading}
              className="gap-2"
            >
              {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
