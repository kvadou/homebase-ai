"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Sparkles, Loader2 } from "lucide-react";

interface ContentItem {
  id: string;
  type: string;
  title: string;
  content: string;
  platform?: string | null;
  status: string;
  aiGenerated: boolean;
  createdAt: string;
  campaign?: { id: string; name: string } | null;
}

interface ContentLibraryProps {
  refreshKey?: number;
}

const typeLabels: Record<string, string> = {
  blog: "Blog Post",
  social: "Social Media",
  email: "Email",
  ad_copy: "Ad Copy",
};

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning"> = {
  draft: "secondary",
  published: "success",
  scheduled: "warning",
  archived: "default",
};

export function ContentLibrary({ refreshKey }: ContentLibraryProps) {
  const [items, setItems] = React.useState<ContentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const fetchContent = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/marketing/content?${params}`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  React.useEffect(() => {
    fetchContent();
  }, [fetchContent, refreshKey]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="blog">Blog Post</SelectItem>
            <SelectItem value="social">Social Media</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="ad_copy">Ad Copy</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchContent}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-[hsl(var(--muted-foreground))]/40" />
            <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
              No content found. Use the AI generator to create some!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                  {item.aiGenerated && (
                    <Sparkles className="h-4 w-4 shrink-0 text-[#00B4A0]" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={statusVariant[item.status] || "secondary"}>
                    {item.status}
                  </Badge>
                  <Badge variant="outline">
                    {typeLabels[item.type] || item.type}
                  </Badge>
                  {item.platform && (
                    <Badge variant="secondary" className="capitalize">
                      {item.platform.replace("_", " ")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-3">
                  {item.content}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {item.campaign && (
                    <span className="truncate max-w-[120px]">{item.campaign.name}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
