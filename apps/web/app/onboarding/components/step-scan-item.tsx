"use client";

import * as React from "react";
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  ScanLine,
  Loader2,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Refrigerator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { CameraViewfinder } from "@/components/scan/camera-viewfinder";
import { ImageUpload } from "@/components/scan/image-upload";
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

interface StepScanItemProps {
  onNext: (result: ScannedItem, imagePreview: string | null) => void;
  onBack: () => void;
  onSkip: () => void;
}

const SUGGESTIONS = [
  { icon: Flame, label: "Furnace" },
  { icon: Droplets, label: "Water Heater" },
  { icon: Wind, label: "HVAC" },
  { icon: Refrigerator, label: "Fridge" },
];

type ScanMode = "idle" | "camera" | "analyzing";

export function StepScanItem({ onNext, onBack, onSkip }: StepScanItemProps) {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<ScanMode>("idle");
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
          description:
            data.error || "Could not analyze the image. Please try again.",
          variant: "destructive",
        });
        setMode("idle");
        setImagePreview(null);
        return;
      }

      onNext(data.data, `data:${mediaType};base64,${imageBase64}`);
    } catch {
      toast({
        title: "Connection error",
        description: "Could not reach the server. Please check your connection.",
        variant: "destructive",
      });
      setMode("idle");
      setImagePreview(null);
    }
  }

  // Analyzing state
  if (mode === "analyzing") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          {imagePreview && (
            <div className="mb-6 h-40 w-40 overflow-hidden rounded-2xl border border-gray-100 shadow-lg dark:border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Captured item"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="mb-3 flex items-center gap-2.5">
            <Loader2 className="h-5 w-5 animate-spin text-[#00B4A0]" />
            <span className="font-heading text-base font-semibold text-[#0A2E4D] dark:text-white">
              Analyzing your item...
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Our AI is identifying the item and extracting details
          </p>
        </div>
      </div>
    );
  }

  // Camera mode
  if (mode === "camera") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-[#0A2E4D] dark:text-white">
              Position the item
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode("idle")}
              className="text-gray-500"
            >
              Cancel
            </Button>
          </div>
          <CameraViewfinder
            onCapture={analyzeImage}
            onClose={() => setMode("idle")}
          />
        </div>
      </div>
    );
  }

  // Idle — landing screen
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-right-4 duration-400">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 inline-flex">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00B4A0]/10">
              <ScanLine className="h-7 w-7 text-[#00B4A0]" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#0A2E4D] dark:text-white">
            Scan your first item
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Point your camera at any appliance and we&apos;ll identify it
            automatically.
          </p>
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <p className="mb-2.5 text-center text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Try scanning one of these
          </p>
          <div className="flex justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50"
              >
                <s.icon className="h-4 w-4 text-[#0A2E4D] dark:text-gray-300" />
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={async () => {
              const nativeResult = await capturePhotoNative();
              if (nativeResult) {
                analyzeImage(nativeResult.base64, nativeResult.mediaType);
              } else {
                setMode("camera");
              }
            }}
            className="w-full gap-2 bg-[#00B4A0] font-semibold text-white shadow-sm shadow-[#00B4A0]/20 hover:bg-[#009e8e] sm:w-auto sm:px-8"
            size="lg"
          >
            <Camera className="h-4 w-4" />
            Open Camera
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 sm:w-auto"
            onClick={async () => {
              const nativeResult = await pickPhotoNative();
              if (nativeResult) {
                analyzeImage(nativeResult.base64, nativeResult.mediaType);
              } else {
                const el = document.getElementById("onboarding-upload-trigger");
                if (el) el.click();
              }
            }}
          >
            <ImagePlus className="h-4 w-4" />
            Upload Photo
          </Button>
        </div>

        {/* Upload drop zone */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 dark:bg-[hsl(var(--background))] dark:text-gray-500">
                or drag and drop
              </span>
            </div>
          </div>
          <div className="mt-4" id="onboarding-upload-trigger">
            <ImageUpload onUpload={analyzeImage} />
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-1.5 text-gray-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <button
            onClick={onSkip}
            className="text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
