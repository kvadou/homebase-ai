"use client";

import { useState } from "react";
import { FileText, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ExportReportDialogProps {
  homeId: string;
  homeName: string;
}

export function ExportReportDialog({
  homeId,
  homeName,
}: ExportReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [includeWarranties, setIncludeWarranties] = useState(true);
  const [includePrices, setIncludePrices] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadFile(url: string, filename: string) {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "Export failed");
    }
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }

  async function handleDownloadPdf() {
    setLoadingPdf(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        includeWarranties: String(includeWarranties),
        includePrices: String(includePrices),
      });
      await downloadFile(
        `/api/homes/${homeId}/export/insurance-report?${params}`,
        `${homeName.replace(/[^a-zA-Z0-9]/g, "_")}_Insurance_Report.pdf`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setLoadingPdf(false);
    }
  }

  async function handleDownloadCsv() {
    setLoadingCsv(true);
    setError(null);
    try {
      await downloadFile(
        `/api/homes/${homeId}/export/csv`,
        `${homeName.replace(/[^a-zA-Z0-9]/g, "_")}_Items.csv`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate CSV");
    } finally {
      setLoadingCsv(false);
    }
  }

  const isLoading = loadingPdf || loadingCsv;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Insurance Report</DialogTitle>
          <DialogDescription>
            Generate a report of all items in {homeName} for insurance purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-warranties" className="cursor-pointer">
              Include warranty information
            </Label>
            <Switch
              id="include-warranties"
              checked={includeWarranties}
              onCheckedChange={setIncludeWarranties}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-prices" className="cursor-pointer">
              Include purchase prices
            </Label>
            <Switch
              id="include-prices"
              checked={includePrices}
              onCheckedChange={setIncludePrices}
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleDownloadPdf}
            disabled={isLoading}
            className="flex-1"
          >
            {loadingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button
            onClick={handleDownloadCsv}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {loadingCsv ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Download CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
