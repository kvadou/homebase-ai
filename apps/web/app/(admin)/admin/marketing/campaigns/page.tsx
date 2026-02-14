"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CampaignCard } from "@/components/admin/campaign-card";
import { CampaignForm } from "@/components/admin/campaign-form";
import { Megaphone, Plus, Loader2, FolderOpen } from "lucide-react";

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

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [channelFilter, setChannelFilter] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingCampaign, setEditingCampaign] = React.useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Campaign | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchCampaigns = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (channelFilter !== "all") params.set("channel", channelFilter);

      const res = await fetch(`/api/admin/marketing/campaigns?${params}`);
      const data = await res.json();
      if (data.success) setCampaigns(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [statusFilter, channelFilter]);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchCampaigns();
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleNewCampaign = () => {
    setEditingCampaign(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00B4A0]/10">
            <Megaphone className="h-5 w-5 text-[#00B4A0]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Manage your marketing campaigns
            </p>
          </div>
        </div>
        <Button onClick={handleNewCampaign}>
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="social">Social Media</SelectItem>
            <SelectItem value="search">Search Ads</SelectItem>
            <SelectItem value="content">Content</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16">
          <FolderOpen className="h-12 w-12 text-[hsl(var(--muted-foreground))]/40" />
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">No campaigns found</p>
          <Button className="mt-4" onClick={handleNewCampaign}>
            <Plus className="h-4 w-4" />
            Create Your First Campaign
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CampaignForm
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={editingCampaign}
        onSaved={fetchCampaigns}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
