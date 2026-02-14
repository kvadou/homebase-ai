"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdPlatforms } from "@/components/admin/ad-platforms";
import {
  Megaphone,
  BarChart3,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface Stats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalContent: number;
  aiGenerated: number;
}

export default function MarketingOverviewPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const [campaignsRes, contentRes] = await Promise.all([
          fetch("/api/admin/marketing/campaigns"),
          fetch("/api/admin/marketing/content"),
        ]);
        const campaignsData = await campaignsRes.json();
        const contentData = await contentRes.json();

        const campaigns = campaignsData.success ? campaignsData.data : [];
        const content = contentData.success ? contentData.data : [];

        setStats({
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(
            (c: { status: string }) => c.status === "active"
          ).length,
          totalContent: content.length,
          aiGenerated: content.filter(
            (c: { aiGenerated: boolean }) => c.aiGenerated
          ).length,
        });
      } catch {
        setStats({
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalContent: 0,
          aiGenerated: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Campaigns",
      value: stats?.totalCampaigns ?? 0,
      icon: Megaphone,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Active Campaigns",
      value: stats?.activeCampaigns ?? 0,
      icon: BarChart3,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Content Pieces",
      value: stats?.totalContent ?? 0,
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "AI Generated",
      value: stats?.aiGenerated ?? 0,
      icon: Sparkles,
      color: "text-[#00B4A0]",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00B4A0]/10">
            <Megaphone className="h-5 w-5 text-[#00B4A0]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Marketing Command Center
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Manage campaigns, generate content, and track performance
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Create and manage marketing campaigns across email, social
                  media, search, and content channels.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Email</Badge>
                  <Badge variant="secondary">Social</Badge>
                  <Badge variant="secondary">Search</Badge>
                  <Badge variant="secondary">Content</Badge>
                </div>
                <Button asChild>
                  <Link href="/admin/marketing/campaigns">
                    Manage Campaigns
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#00B4A0]" />
                  AI Content Studio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Generate blog posts, social media content, emails, and ad copy
                  using AI. Edit, refine, and publish from one place.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Blog</Badge>
                  <Badge variant="secondary">Social</Badge>
                  <Badge variant="secondary">Email</Badge>
                  <Badge variant="secondary">Ad Copy</Badge>
                </div>
                <Button asChild>
                  <Link href="/admin/marketing/content">
                    Open Content Studio
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <AdPlatforms />
        </>
      )}
    </div>
  );
}
