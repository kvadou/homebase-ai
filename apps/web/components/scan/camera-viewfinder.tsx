"use client";

import * as React from "react";
import { Camera, SwitchCamera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CameraViewfinderProps {
  onCapture: (imageBase64: string, mediaType: string) => void;
  onClose: () => void;
}

export function CameraViewfinder({ onCapture, onClose }: CameraViewfinderProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [facingMode, setFacingMode] = React.useState<"user" | "environment">("environment");
  const [ready, setReady] = React.useState(false);

  const startCamera = React.useCallback(async (facing: "user" | "environment") => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setReady(true);
        };
      }

      setError(null);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera access in your browser settings and try again."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No camera found on this device. Try uploading an image instead."
            : "Could not access camera. Please check your permissions.";
      setError(message);
    }
  }, []);

  React.useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, startCamera]);

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    // Strip the data:image/jpeg;base64, prefix
    const base64 = dataUrl.split(",")[1];
    onCapture(base64, "image/jpeg");

    // Stop camera after capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  }

  function handleSwitchCamera() {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 p-8 text-center">
        <Camera className="mb-4 h-12 w-12 text-[hsl(var(--muted-foreground))]" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{error}</p>
        <Button variant="outline" className="mt-4" onClick={onClose}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "aspect-[4/3] w-full object-cover transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0"
        )}
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      {/* Viewfinder overlay */}
      <div className="pointer-events-none absolute inset-0">
        {/* Corner marks */}
        <div className="absolute left-6 top-6 h-12 w-12 border-l-2 border-t-2 border-teal-400 rounded-tl-lg" />
        <div className="absolute right-6 top-6 h-12 w-12 border-r-2 border-t-2 border-teal-400 rounded-tr-lg" />
        <div className="absolute bottom-20 left-6 h-12 w-12 border-b-2 border-l-2 border-teal-400 rounded-bl-lg" />
        <div className="absolute bottom-20 right-6 h-12 w-12 border-b-2 border-r-2 border-teal-400 rounded-br-lg" />
      </div>

      {/* Controls */}
      <div className="safe-bottom absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/60 to-transparent px-4 pb-4 pt-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <button
          onClick={handleCapture}
          disabled={!ready}
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <div className="h-12 w-12 rounded-full bg-white" />
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-white hover:bg-white/20"
          onClick={handleSwitchCamera}
        >
          <SwitchCamera className="h-6 w-6" />
        </Button>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
