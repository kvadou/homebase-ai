"use client";

import * as React from "react";
import { Camera, ImagePlus, ScanLine, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { CameraViewfinder } from "@/components/scan/camera-viewfinder";
import { ImageUpload } from "@/components/scan/image-upload";
import { ScanResultCard } from "@/components/scan/scan-result-card";
import { capturePhotoNative, pickPhotoNative } from "@/lib/camera";

interface ScannedItem {
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  description: string;
  condition: string;
  estimatedAge: string | null;
}

type ScanMode = "idle" | "camera" | "analyzing" | "result";

export default function ScanPage() {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<ScanMode>("idle");
  const [result, setResult] = React.useState<ScannedItem | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  async function analyzeImage(imageBase64: string, mediaType: string) {
    setMode("analyzing");
    setImagePreview(`data:${mediaType};base64,${imageBase64}`);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, mediaType }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          title: "Scan failed",
          description: data.error || "Could not analyze the image. Please try again.",
          variant: "destructive",
        });
        setMode("idle");
        return;
      }

      setResult(data.data);
      setMode("result");
    } catch {
      toast({
        title: "Connection error",
        description: "Could not reach the server. Please check your connection.",
        variant: "destructive",
      });
      setMode("idle");
    }
  }

  function handleReset() {
    setMode("idle");
    setResult(null);
    setImagePreview(null);
  }

  // Analyzing state
  if (mode === "analyzing") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          {imagePreview && (
            <div className="mb-6 h-48 w-48 overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Captured item"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              Analyzing image...
            </span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Our AI is identifying the item and extracting details
          </p>
        </div>
      </div>
    );
  }

  // Result state
  if (mode === "result" && result) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
            Scan Results
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Review the identified item and add it to your inventory
          </p>
        </div>
        <ScanResultCard
          result={result}
          imagePreview={imagePreview}
          onScanAgain={handleReset}
        />
      </div>
    );
  }

  // Camera mode
  if (mode === "camera") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-4">
          <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
            Scan Item
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Position the item in the viewfinder and tap to capture
          </p>
        </div>
        <CameraViewfinder
          onCapture={analyzeImage}
          onClose={() => setMode("idle")}
        />
      </div>
    );
  }

  // Idle state - landing screen
  return (
    <div className="mx-auto max-w-lg">
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-500/10">
            <ScanLine className="h-10 w-10 text-teal-500" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
          AI-Powered Scanning
        </h1>
        <p className="mt-2 max-w-md text-[hsl(var(--muted-foreground))]">
          Point your camera at any appliance or product to instantly identify it
          and add it to your inventory.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={async () => {
              // Try native camera first, fall back to WebRTC viewfinder
              const nativeResult = await capturePhotoNative();
              if (nativeResult) {
                analyzeImage(nativeResult.base64, nativeResult.mediaType);
              } else {
                setMode("camera");
              }
            }}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            Open Camera
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              // Try native gallery first, fall back to file input
              const nativeResult = await pickPhotoNative();
              if (nativeResult) {
                analyzeImage(nativeResult.base64, nativeResult.mediaType);
              } else {
                const el = document.getElementById("scan-upload-trigger");
                if (el) el.click();
              }
            }}
          >
            <ImagePlus className="h-4 w-4" />
            Upload Photo
          </Button>
        </div>

        <div className="mt-8 w-full max-w-sm">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[hsl(var(--border))]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[hsl(var(--background))] px-2 text-[hsl(var(--muted-foreground))]">
                or drag and drop
              </span>
            </div>
          </div>

          <div className="mt-4" id="scan-upload-trigger">
            <ImageUpload onUpload={analyzeImage} />
          </div>
        </div>
      </div>
    </div>
  );
}
