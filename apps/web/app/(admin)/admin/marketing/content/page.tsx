"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentGenerator } from "@/components/admin/content-generator";
import { ContentLibrary } from "@/components/admin/content-library";
import { Sparkles, FileText } from "lucide-react";

export default function ContentPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00B4A0]/10">
          <Sparkles className="h-5 w-5 text-[#00B4A0]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Studio</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Generate and manage marketing content with AI
          </p>
        </div>
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Library
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-6">
          <ContentGenerator onSaved={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>
        <TabsContent value="library" className="mt-6">
          <ContentLibrary refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
