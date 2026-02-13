"use client";

import { format } from "date-fns";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ClaimData {
  id: string;
  homeId: string;
  title: string;
  incidentDate: string;
  incidentType: string;
  description: string | null;
  status: string;
  totalValue: number | null;
  itemIds: string[] | null;
  aiNarrative: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
  home: { id: string; name: string };
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  draft: "secondary",
  submitted: "default",
  in_review: "warning",
  approved: "success",
  denied: "destructive",
  closed: "secondary",
};

const INCIDENT_LABELS: Record<string, string> = {
  fire: "Fire",
  water: "Water Damage",
  theft: "Theft",
  storm: "Storm Damage",
  vandalism: "Vandalism",
  accident: "Accident",
  natural_disaster: "Natural Disaster",
  other: "Other",
};

interface ClaimCardProps {
  claim: ClaimData;
  onClick: (claim: ClaimData) => void;
}

export function ClaimCard({ claim, onClick }: ClaimCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onClick(claim)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
            <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-[hsl(var(--foreground))] truncate">
                {claim.title}
              </h3>
              <Badge variant={STATUS_VARIANT[claim.status] ?? "secondary"} className="shrink-0">
                {claim.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
              {INCIDENT_LABELS[claim.incidentType] ?? claim.incidentType} &middot;{" "}
              {format(new Date(claim.incidentDate), "MMM d, yyyy")}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
              {claim.totalValue != null && (
                <span className="font-medium text-[hsl(var(--foreground))]">
                  ${claim.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
              <span>{claim.home.name}</span>
              {claim.itemIds && (
                <span>{(claim.itemIds as string[]).length} item(s)</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
