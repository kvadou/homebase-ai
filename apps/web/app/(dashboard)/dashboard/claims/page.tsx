"use client";

import { useState, useEffect, useCallback } from "react";
import { FileCheck, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { ClaimCard, type ClaimData } from "@/components/claims/claim-card";
import { ClaimBuilder } from "@/components/claims/claim-builder";

interface HomeOption {
  id: string;
  name: string;
}

export default function ClaimsPage() {
  const { toast } = useToast();
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [homes, setHomes] = useState<HomeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);

  const fetchClaims = useCallback(async () => {
    try {
      const res = await fetch("/api/claims");
      const data = await res.json();
      if (data.success) setClaims(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHomes = useCallback(async () => {
    const res = await fetch("/api/homes");
    const data = await res.json();
    if (data.success) setHomes(data.data);
  }, []);

  useEffect(() => {
    fetchHomes();
    fetchClaims();
  }, [fetchHomes, fetchClaims]);

  function handleClaimClick(claim: ClaimData) {
    // For now, we could show a detail view; keeping it simple
    toast({
      title: claim.title,
      description: `Status: ${claim.status}${claim.totalValue != null ? ` | Value: $${claim.totalValue.toLocaleString()}` : ""}`,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[hsl(var(--foreground))]">
            <FileCheck className="h-6 w-6 text-teal-500" />
            Insurance Claims
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Build and manage insurance claims with AI-generated narratives.
          </p>
        </div>
        <Button onClick={() => setBuilderOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Claim
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        </div>
      ) : claims.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
            <FileCheck className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            No insurance claims yet
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Create a claim to document incidents and generate professional narratives.
          </p>
          <Button
            className="mt-4 gap-2"
            size="sm"
            onClick={() => setBuilderOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Claim
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {claims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onClick={handleClaimClick}
            />
          ))}
        </div>
      )}

      {/* Claim Builder Wizard */}
      <ClaimBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onCreated={fetchClaims}
        homes={homes}
      />
    </div>
  );
}
