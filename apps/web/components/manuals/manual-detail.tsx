"use client";

import * as React from "react";
import { ArrowLeft, FileText, Trash2, Link2, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ManualDetailProps {
  manualId: string;
  onBack: () => void;
}

interface ManualData {
  id: string;
  title: string;
  brand: string | null;
  model: string | null;
  fileUrl: string | null;
  sourceUrl: string | null;
  fileType: string | null;
  pageCount: number | null;
  createdAt: string;
  chunks: {
    id: string;
    content: string;
    pageNumber: number | null;
    chunkIndex: number;
  }[];
  items: {
    item: { id: string; name: string; brand: string | null; model: string | null };
  }[];
  _count: { chunks: number };
}

export function ManualDetail({ manualId, onBack }: ManualDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [manual, setManual] = React.useState<ManualData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/manuals/${manualId}`);
        const data = await res.json();
        if (data.success) {
          setManual(data.data);
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to load manual",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [manualId, toast]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/manuals/${manualId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete manual",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Manual deleted", description: "The manual has been removed." });
      setDeleteOpen(false);
      onBack();
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete manual",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
          Loading manual...
        </div>
      </div>
    );
  }

  if (!manual) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
          Manual not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle>{manual.title}</CardTitle>
              {(manual.brand || manual.model) && (
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {[manual.brand, manual.model].filter(Boolean).join(" ")}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {manual.fileType && (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {manual.fileType}
                  </Badge>
                )}
                {manual.pageCount && (
                  <Badge variant="secondary">
                    {manual.pageCount} page{manual.pageCount !== 1 ? "s" : ""}
                  </Badge>
                )}
                <Badge variant="secondary">
                  <Layers className="mr-1 h-3 w-3" />
                  {manual._count.chunks} chunk{manual._count.chunks !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Linked Items */}
          {manual.items.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Linked Items
              </p>
              <div className="mt-2 space-y-1">
                {manual.items.map((link) => (
                  <div
                    key={link.item.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Link2 className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                    <span>{link.item.name}</span>
                    {link.item.brand && (
                      <span className="text-[hsl(var(--muted-foreground))]">
                        ({link.item.brand})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chunk Preview */}
          {manual.chunks.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Content Preview ({manual.chunks.length} chunks)
                </p>
                <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
                  {manual.chunks.slice(0, 5).map((chunk) => (
                    <div
                      key={chunk.id}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="mb-1 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                        <span>Chunk {chunk.chunkIndex + 1}</span>
                        {chunk.pageNumber && <span>Page {chunk.pageNumber}</span>}
                      </div>
                      <p className="line-clamp-3 text-[hsl(var(--muted-foreground))]">
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                  {manual.chunks.length > 5 && (
                    <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                      ... and {manual.chunks.length - 5} more chunks
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Manual</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{manual.title}&rdquo;? This
              will remove all processed chunks and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Manual"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
