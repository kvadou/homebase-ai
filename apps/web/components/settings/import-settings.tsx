"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { CentriqImportDialog } from "@/components/import/centriq-import-dialog";

export function ImportSettings() {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>
            Import your home inventory data from other apps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4">
            <div>
              <p className="font-medium text-sm">Centriq</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Import items from a Centriq CSV export file.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <CentriqImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </>
  );
}
