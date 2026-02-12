"use client";

import * as React from "react";
import { ImagePlus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onUpload: (imageBase64: string, mediaType: string) => void;
}

function getMediaType(file: File): string {
  const typeMap: Record<string, string> = {
    "image/jpeg": "image/jpeg",
    "image/jpg": "image/jpeg",
    "image/png": "image/png",
    "image/webp": "image/webp",
    "image/gif": "image/gif",
  };
  return typeMap[file.type] ?? "image/jpeg";
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix to get raw base64
      const base64 = result.split(",")[1];
      onUpload(base64, getMediaType(file));
    };
    reader.readAsDataURL(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
        dragOver
          ? "border-teal-500 bg-teal-500/5"
          : "border-[hsl(var(--border))] hover:border-teal-500/50 hover:bg-[hsl(var(--muted))]/50"
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10">
        {dragOver ? (
          <Upload className="h-6 w-6 text-teal-500" />
        ) : (
          <ImagePlus className="h-6 w-6 text-teal-500" />
        )}
      </div>
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
        {dragOver ? "Drop image here" : "Upload from gallery"}
      </p>
      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        Drag and drop or click to browse
      </p>
      <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
        JPG, PNG, WebP, or GIF
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
