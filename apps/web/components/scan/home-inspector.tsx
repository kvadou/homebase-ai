"use client";

import * as React from "react";
import {
  Camera,
  ImagePlus,
  Search,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  Save,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { CameraViewfinder } from "@/components/scan/camera-viewfinder";
import { ImageUpload } from "@/components/scan/image-upload";
import { capturePhotoNative, pickPhotoNative } from "@/lib/camera";
import Link from "next/link";

interface InspectionResult {
  issue: string;
  severity: "cosmetic" | "moderate" | "urgent" | "critical";
  diagnosis: string;
  recommendedAction: string;
  estimatedCost: string;
  urgency: string;
  safetyRisk: boolean;
}

type InspectMode = "idle" | "camera" | "analyzing" | "result";

const severityConfig = {
  cosmetic: {
    label: "Cosmetic",
    className:
      "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    color: "text-slate-600",
  },
  moderate: {
    label: "Moderate",
    className:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    color: "text-amber-600",
  },
  urgent: {
    label: "Urgent",
    className:
      "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    color: "text-orange-600",
  },
  critical: {
    label: "Critical",
    className:
      "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    color: "text-red-600",
  },
};

export function HomeInspector() {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<InspectMode>("idle");
  const [result, setResult] = React.useState<InspectionResult | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [description, setDescription] = React.useState("");
  const [roomType, setRoomType] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [selectedHomeId, setSelectedHomeId] = React.useState("");
  const [homes, setHomes] = React.useState<
    Array<{ id: string; name: string }>
  >([]);

  React.useEffect(() => {
    fetch("/api/homes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setHomes(data.data);
          if (data.data.length === 1) {
            setSelectedHomeId(data.data[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  async function analyzeImage(imageBase64: string, mediaType: string) {
    setMode("analyzing");
    setImagePreview(`data:${mediaType};base64,${imageBase64}`);

    try {
      const res = await fetch("/api/scan/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          mediaType,
          description: description.trim() || undefined,
          roomType: roomType.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          title: "Inspection failed",
          description: data.error || "Could not analyze the image.",
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
        description: "Could not reach the server.",
        variant: "destructive",
      });
      setMode("idle");
    }
  }

  async function handleSaveIssue() {
    if (!result || !selectedHomeId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/homes/${selectedHomeId}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.issue,
          description: description || result.diagnosis,
          severity: result.severity,
          aiDiagnosis: result.diagnosis,
          estimatedCost: result.estimatedCost,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        toast({
          title: "Issue saved",
          description: "The issue has been recorded for your home.",
        });
      } else {
        toast({
          title: "Save failed",
          description: data.error || "Could not save the issue.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Connection error",
        description: "Could not reach the server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setMode("idle");
    setResult(null);
    setImagePreview(null);
    setDescription("");
    setRoomType("");
    setSaved(false);
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
                alt="Issue photo"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
            <span className="text-sm font-medium">Inspecting image...</span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Our AI is diagnosing the issue and assessing severity
          </p>
        </div>
      </div>
    );
  }

  // Result state
  if (mode === "result" && result) {
    const severity = severityConfig[result.severity];

    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="mb-2">
          <h2 className="font-heading text-2xl font-bold">Inspection Results</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            AI assessment of the identified issue
          </p>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Inspected issue"
              className="h-48 w-full object-cover"
            />
          </div>
        )}

        {/* Issue title + severity */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{result.issue}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className={severity.className}>
                    {severity.label}
                  </Badge>
                  {result.safetyRisk && (
                    <Badge className="border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      <ShieldAlert className="mr-1 h-3 w-3" />
                      Safety Risk
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              {result.diagnosis}
            </p>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recommended Action</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              {result.recommendedAction}
            </p>
          </CardContent>
        </Card>

        {/* Cost + Urgency */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Estimated Cost
              </p>
              <p className="mt-1 text-lg font-bold text-teal-600">
                {result.estimatedCost}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Urgency
              </p>
              <p className={`mt-1 text-sm font-semibold ${severity.color}`}>
                {result.urgency}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Safety warning */}
        {result.safetyRisk && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-xs text-red-800 dark:text-red-400">
              This issue may pose a safety risk. Consider addressing it promptly
              and consulting a professional if needed.
            </p>
          </div>
        )}

        {/* Save + Actions */}
        <div className="space-y-3">
          {!saved ? (
            <div className="space-y-2">
              {homes.length > 1 && (
                <select
                  className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                  value={selectedHomeId}
                  onChange={(e) => setSelectedHomeId(e.target.value)}
                >
                  <option value="">Select home to save to...</option>
                  {homes.map((home) => (
                    <option key={home.id} value={home.id}>
                      {home.name}
                    </option>
                  ))}
                </select>
              )}
              <Button
                className="w-full gap-2"
                onClick={handleSaveIssue}
                disabled={saving || !selectedHomeId}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Issue
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Issue saved to your home
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              asChild
            >
              <Link href="/dashboard/providers">
                <ArrowRight className="h-4 w-4" />
                Find Provider
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleReset}
            >
              Inspect Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Camera mode
  if (mode === "camera") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-4">
          <h2 className="font-heading text-2xl font-bold">
            Inspect Issue
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Point the camera at the problem area
          </p>
        </div>
        <CameraViewfinder
          onCapture={analyzeImage}
          onClose={() => setMode("idle")}
        />
      </div>
    );
  }

  // Idle state
  return (
    <div className="mx-auto max-w-lg">
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-500/10">
            <Search className="h-10 w-10 text-teal-500" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            <ShieldAlert className="h-3.5 w-3.5" />
          </div>
        </div>

        <h2 className="font-heading text-2xl font-bold">
          AI Home Inspector
        </h2>
        <p className="mt-2 max-w-md text-[hsl(var(--muted-foreground))]">
          Take a photo of any home issue — cracks, leaks, damage, or wear — and
          get an instant AI diagnosis with severity assessment and cost estimate.
        </p>

        {/* Optional context fields */}
        <div className="mt-6 w-full max-w-sm space-y-3">
          <input
            type="text"
            placeholder="Describe the issue (optional)"
            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value="">Room type (optional)</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Bathroom">Bathroom</option>
            <option value="Bedroom">Bedroom</option>
            <option value="Living Room">Living Room</option>
            <option value="Basement">Basement</option>
            <option value="Attic">Attic</option>
            <option value="Garage">Garage</option>
            <option value="Exterior">Exterior</option>
            <option value="Roof">Roof</option>
            <option value="Yard">Yard</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={async () => {
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
            Take Photo
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              const nativeResult = await pickPhotoNative();
              if (nativeResult) {
                analyzeImage(nativeResult.base64, nativeResult.mediaType);
              } else {
                const el = document.getElementById("inspect-upload-trigger");
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

          <div className="mt-4" id="inspect-upload-trigger">
            <ImageUpload onUpload={analyzeImage} />
          </div>
        </div>
      </div>
    </div>
  );
}
