"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Pencil, Trash2 } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  description?: string | null;
  budget?: number | null;
  spent?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  content?: { id: string }[];
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

const channelLabels: Record<string, string> = {
  email: "Email",
  social: "Social Media",
  search: "Search Ads",
  content: "Content",
};

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  draft: "secondary",
  active: "success",
  paused: "warning",
  completed: "default",
  cancelled: "outline",
};

export function CampaignCard({ campaign, onEdit, onDelete }: CampaignCardProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-lg">{campaign.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[campaign.status] || "outline"}>
              {campaign.status}
            </Badge>
            <Badge variant="secondary">
              {channelLabels[campaign.channel] || campaign.channel}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(campaign)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(campaign)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaign.description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
            {campaign.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
          {campaign.budget != null && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span>
                {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
              </span>
            </div>
          )}
          {(campaign.startDate || campaign.endDate) && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {formatDate(campaign.startDate)}
                {campaign.endDate ? ` - ${formatDate(campaign.endDate)}` : ""}
              </span>
            </div>
          )}
          {campaign.content && (
            <span>{campaign.content.length} content piece{campaign.content.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
