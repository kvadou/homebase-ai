"use client";

import { useState, useEffect } from "react";
import { Download, Copy, QrCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";

interface ItemQRCodeProps {
  itemId: string;
  itemName: string;
}

export function ItemQRCode({ itemId, itemName }: ItemQRCodeProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const url = `/api/items/${itemId}/qr?format=png`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load QR code");
        return res.blob();
      })
      .then((blob) => {
        setQrUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        toast({ title: "Failed to load QR code", variant: "destructive" });
      })
      .finally(() => setLoading(false));

    return () => {
      if (qrUrl) URL.revokeObjectURL(qrUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  async function handleDownload(format: "png" | "svg") {
    try {
      const res = await fetch(`/api/items/${itemId}/qr?format=${format}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${itemName.replace(/[^a-zA-Z0-9_-]/g, "_")}-qr.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: `QR code downloaded as ${format.toUpperCase()}`, variant: "success" });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  }

  function handleCopyLink() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const link = `${baseUrl}/items/${itemId}`;
    navigator.clipboard.writeText(link).then(
      () => toast({ title: "Link copied to clipboard", variant: "success" }),
      () => toast({ title: "Failed to copy link", variant: "destructive" })
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="h-5 w-5 text-[#00B4A0]" />
          QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {loading ? (
          <div className="flex h-40 w-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
          </div>
        ) : qrUrl ? (
          <img
            src={qrUrl}
            alt={`QR code for ${itemName}`}
            className="h-40 w-40 rounded-lg border border-[hsl(var(--border))] p-2"
          />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Unavailable</p>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleDownload("png")}>
            <Download className="h-4 w-4" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload("svg")}>
            <Download className="h-4 w-4" />
            SVG
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
