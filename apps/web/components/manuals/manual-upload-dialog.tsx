"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface ManualUploadDialogProps {
  itemId?: string;
  trigger?: React.ReactNode;
}

type ProcessingStatus = "idle" | "creating" | "uploading" | "processing" | "done";

export function ManualUploadDialog({ itemId, trigger }: ManualUploadDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<ProcessingStatus>("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loading = status !== "idle" && status !== "done";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        toast({
          title: "Invalid file",
          description: "Only PDF files are supported.",
          variant: "destructive",
        });
        return;
      }
      setFile(selected);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;

    try {
      // Step 1: Create manual record
      setStatus("creating");
      const createRes = await fetch("/api/manuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || file.name.replace(/\.pdf$/i, ""),
          brand: brand || undefined,
          model: model || undefined,
          fileType: "pdf",
          ...(itemId ? { itemIds: [itemId] } : {}),
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        toast({
          title: "Error",
          description: createData.error || "Failed to create manual",
          variant: "destructive",
        });
        setStatus("idle");
        return;
      }

      const manualId = createData.data.id;

      // Step 2: Upload and process PDF
      setStatus("processing");
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const processRes = await fetch(`/api/manuals/${manualId}/process`, {
        method: "POST",
        body: uploadForm,
      });

      const processData = await processRes.json();
      if (!processRes.ok) {
        toast({
          title: "Warning",
          description: processData.error || "Manual created but PDF processing failed. You can retry later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Manual uploaded",
          description: `Processed ${processData.data.chunksCreated} chunks from ${processData.data.pageCount} pages.`,
        });
      }

      setStatus("done");
      setOpen(false);
      resetForm();
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload manual",
        variant: "destructive",
      });
      setStatus("idle");
    }
  }

  function resetForm() {
    setFile(null);
    setStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!loading) {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }
  }

  const statusMessage = {
    idle: "",
    creating: "Creating manual record...",
    uploading: "Uploading PDF...",
    processing: "Processing PDF and generating embeddings...",
    done: "Done!",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Upload className="h-4 w-4" />
            Upload Manual
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Manual</DialogTitle>
            <DialogDescription>
              Upload a PDF manual to extract and index its content for AI-powered search.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="manual-file">PDF File *</Label>
              <div className="mt-1.5">
                {file ? (
                  <div className="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
                    <FileText className="h-5 w-5 text-teal-600" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-[hsl(var(--muted-foreground))]">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-teal-400 hover:bg-teal-50/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                    <p className="mt-2 text-sm font-medium">
                      Click to select a PDF
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      PDF files only
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  id="manual-file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="manual-title">Title</Label>
              <Input
                id="manual-title"
                name="title"
                placeholder={file?.name.replace(/\.pdf$/i, "") || "e.g., Samsung Washer Manual"}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Leave blank to use the file name.
              </p>
            </div>

            {/* Brand */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="manual-brand">Brand</Label>
                <Input
                  id="manual-brand"
                  name="brand"
                  placeholder="e.g., Samsung"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="manual-model">Model</Label>
                <Input
                  id="manual-model"
                  name="model"
                  placeholder="e.g., WF45R6100AW"
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Processing Status */}
            {loading && (
              <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))] p-3 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                <span>{statusMessage[status]}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || loading}>
              {loading ? "Processing..." : "Upload & Process"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
