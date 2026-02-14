"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Platform {
  name: string;
  description: string;
  status: "connected" | "not_configured";
  icon: string;
}

const platforms: Platform[] = [
  {
    name: "Google Ads",
    description: "Search, display, and YouTube advertising",
    status: "not_configured",
    icon: "G",
  },
  {
    name: "Meta Ads",
    description: "Facebook and Instagram advertising",
    status: "not_configured",
    icon: "M",
  },
  {
    name: "LinkedIn Ads",
    description: "Professional audience B2B advertising",
    status: "not_configured",
    icon: "in",
  },
];

export function AdPlatforms() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ad Platform Integrations</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <Card key={platform.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--muted))] font-bold text-sm">
                  {platform.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{platform.name}</CardTitle>
                  <Badge
                    variant={platform.status === "connected" ? "success" : "secondary"}
                    className="mt-1"
                  >
                    {platform.status === "connected" ? "Connected" : "Not Configured"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {platform.description}
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full" disabled>
                <ExternalLink className="h-3.5 w-3.5" />
                Configure (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
