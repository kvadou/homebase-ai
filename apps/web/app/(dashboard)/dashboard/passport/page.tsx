"use client";

import * as React from "react";
import {
  FileText,
  Share2,
  RefreshCw,
  Loader2,
  Home,
  ChevronDown,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { PassportViewer, type PassportData } from "@/components/passport/passport-viewer";
import { SharePassportDialog } from "@/components/passport/share-passport-dialog";

interface HomeOption {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

interface PassportState {
  id: string;
  homeId: string;
  data: PassportData;
  generatedAt: string | null;
  shareToken: string | null;
  shareExpiresAt: string | null;
  isPublic: boolean;
}

export default function PassportPage() {
  const { toast } = useToast();
  const [homes, setHomes] = React.useState<HomeOption[]>([]);
  const [selectedHomeId, setSelectedHomeId] = React.useState<string | null>(
    null
  );
  const [passport, setPassport] = React.useState<PassportState | null>(null);
  const [isLoadingHomes, setIsLoadingHomes] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [homeMenuOpen, setHomeMenuOpen] = React.useState(false);
  const homeMenuRef = React.useRef<HTMLDivElement>(null);

  // Close home menu on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        homeMenuRef.current &&
        !homeMenuRef.current.contains(e.target as Node)
      ) {
        setHomeMenuOpen(false);
      }
    }
    if (homeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [homeMenuOpen]);

  // Fetch user homes
  React.useEffect(() => {
    async function fetchHomes() {
      try {
        const res = await fetch("/api/homes");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          const homeList = json.data.map(
            (h: { id: string; name: string; city: string | null; state: string | null }) => ({
              id: h.id,
              name: h.name,
              city: h.city,
              state: h.state,
            })
          );
          setHomes(homeList);
          setSelectedHomeId(homeList[0].id);
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to load homes",
          variant: "destructive",
        });
      } finally {
        setIsLoadingHomes(false);
      }
    }
    fetchHomes();
  }, [toast]);

  async function handleGenerate() {
    if (!selectedHomeId) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/homes/${selectedHomeId}/passport`);
      const json = await res.json();
      if (json.success) {
        setPassport(json.data);
        toast({
          title: "Passport generated",
          description: "Your home passport has been created with the latest data.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to generate passport",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate passport",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  // When selected home changes, reset passport
  React.useEffect(() => {
    setPassport(null);
  }, [selectedHomeId]);

  const selectedHome = homes.find((h) => h.id === selectedHomeId);

  if (isLoadingHomes) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A2E4D] dark:text-teal-400" />
      </div>
    );
  }

  if (homes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Home Passport</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            A complete digital record of your home.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Home className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
            <h3 className="mt-4 font-heading text-lg font-semibold">
              No homes yet
            </h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Add a home first to generate a passport.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Home Passport</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            A complete digital record of your home.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedHomeId}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : passport ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {passport ? "Refresh Passport" : "Generate Passport"}
          </Button>
          {passport && (
            <Button
              variant="outline"
              onClick={() => setShareDialogOpen(true)}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Home selector */}
      {homes.length > 1 && (
        <div className="relative" ref={homeMenuRef}>
          <button
            onClick={() => setHomeMenuOpen(!homeMenuOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-left transition-colors hover:bg-[hsl(var(--muted))]/50 sm:w-80"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2E4D]/5 dark:bg-[#0A2E4D]/20">
                <Home className="h-4 w-4 text-[#0A2E4D] dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {selectedHome?.name || "Select a home"}
                </p>
                {selectedHome?.city && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {selectedHome.city}
                    {selectedHome.state ? `, ${selectedHome.state}` : ""}
                  </p>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </button>
          {homeMenuOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-lg sm:w-80">
              {homes.map((home) => (
                <button
                  key={home.id}
                  onClick={() => {
                    setSelectedHomeId(home.id);
                    setHomeMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-[hsl(var(--muted))]/50 ${
                    home.id === selectedHomeId
                      ? "bg-[#0A2E4D]/5"
                      : ""
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2E4D]/5 dark:bg-[#0A2E4D]/20">
                    <Home className="h-4 w-4 text-[#0A2E4D] dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{home.name}</p>
                    {home.city && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {home.city}
                        {home.state ? `, ${home.state}` : ""}
                      </p>
                    )}
                  </div>
                  {home.id === selectedHomeId && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-[#0A2E4D] dark:text-teal-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status card (when no passport yet) */}
      {!passport && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0A2E4D]/5 dark:bg-[#0A2E4D]/20">
              <FileText className="h-8 w-8 text-[#0A2E4D] dark:text-teal-400" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold">
              Generate Your Home Passport
            </h3>
            <p className="mt-2 max-w-md text-center text-sm text-[hsl(var(--muted-foreground))]">
              Your home passport aggregates all your property data, room details,
              items, warranties, and maintenance records into a single
              comprehensive document. Perfect for sharing with buyers, agents, or
              insurance providers.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-6 gap-2"
              size="lg"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Generate Passport
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Passport info bar */}
      {passport && passport.generatedAt && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Clock className="h-4 w-4" />
            <span>
              Last generated:{" "}
              {format(new Date(passport.generatedAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          {passport.isPublic && passport.shareToken && (
            <Badge variant="success" className="text-xs">
              Shared
            </Badge>
          )}
        </div>
      )}

      {/* Passport content */}
      {passport && passport.data && (
        <PassportViewer data={passport.data as PassportData} />
      )}

      {/* Share dialog */}
      {passport && selectedHomeId && (
        <SharePassportDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          homeId={selectedHomeId}
          shareToken={passport.shareToken}
          shareExpiresAt={passport.shareExpiresAt}
          isPublic={passport.isPublic}
          onShareCreated={(data) => {
            setPassport((prev) =>
              prev
                ? {
                    ...prev,
                    shareToken: data.shareToken,
                    shareExpiresAt: data.shareExpiresAt,
                    isPublic: data.isPublic,
                  }
                : prev
            );
          }}
          onShareRevoked={() => {
            setPassport((prev) =>
              prev
                ? {
                    ...prev,
                    shareToken: null,
                    shareExpiresAt: null,
                    isPublic: false,
                  }
                : prev
            );
          }}
        />
      )}
    </div>
  );
}
