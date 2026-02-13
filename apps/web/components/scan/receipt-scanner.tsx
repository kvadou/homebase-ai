"use client";

import * as React from "react";
import {
  Camera,
  ImagePlus,
  Loader2,
  Receipt,
  Sparkles,
  Trash2,
  Plus,
  Save,
  RotateCcw,
  Store,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  DollarSign,
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toaster";
import { CameraViewfinder } from "@/components/scan/camera-viewfinder";
import { ImageUpload } from "@/components/scan/image-upload";
import { capturePhotoNative, pickPhotoNative } from "@/lib/camera";

interface ReceiptItem {
  name: string;
  price: number | null;
  quantity: number | null;
}

interface ReceiptData {
  storeName: string | null;
  purchaseDate: string | null;
  items: ReceiptItem[];
  total: number | null;
  warrantyInfo: string | null;
  paymentMethod: string | null;
}

interface InventoryItem {
  id: string;
  name: string;
  home: { id: string; name: string };
}

type ScanMode = "idle" | "camera" | "analyzing" | "result";

export function ReceiptScanner() {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<ScanMode>("idle");
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [receiptData, setReceiptData] = React.useState<ReceiptData | null>(null);

  // Editable form state
  const [storeName, setStoreName] = React.useState("");
  const [purchaseDate, setPurchaseDate] = React.useState("");
  const [items, setItems] = React.useState<ReceiptItem[]>([]);
  const [total, setTotal] = React.useState("");
  const [warrantyInfo, setWarrantyInfo] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");

  // Link-to-item state
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [loadingItems, setLoadingItems] = React.useState(false);

  // Load inventory items when we get receipt results
  React.useEffect(() => {
    if (mode === "result") {
      loadInventoryItems();
    }
  }, [mode]);

  async function loadInventoryItems() {
    setLoadingItems(true);
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setInventoryItems(data.data);
      }
    } catch {
      // Silently fail — items dropdown will just be empty
    } finally {
      setLoadingItems(false);
    }
  }

  function populateForm(data: ReceiptData) {
    setStoreName(data.storeName ?? "");
    setPurchaseDate(data.purchaseDate ?? "");
    setItems(data.items.length > 0 ? data.items : [{ name: "", price: null, quantity: 1 }]);
    setTotal(data.total != null ? String(data.total) : "");
    setWarrantyInfo(data.warrantyInfo ?? "");
    setPaymentMethod(data.paymentMethod ?? "");
  }

  async function analyzeImage(imageBase64: string, mediaType: string) {
    setMode("analyzing");
    setImagePreview(`data:${mediaType};base64,${imageBase64}`);

    try {
      const res = await fetch("/api/scan/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, mediaType }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          title: "Scan failed",
          description: data.error || "Could not analyze the receipt. Please try again.",
          variant: "destructive",
        });
        setMode("idle");
        return;
      }

      setReceiptData(data.data);
      populateForm(data.data);
      setMode("result");
    } catch {
      toast({
        title: "Connection error",
        description: "Could not reach the server. Please check your connection.",
        variant: "destructive",
      });
      setMode("idle");
    }
  }

  function handleReset() {
    setMode("idle");
    setReceiptData(null);
    setImagePreview(null);
    setStoreName("");
    setPurchaseDate("");
    setItems([]);
    setTotal("");
    setWarrantyInfo("");
    setPaymentMethod("");
    setSelectedItemId("");
  }

  function updateItem(index: number, field: keyof ReceiptItem, value: string) {
    setItems((prev) => {
      const updated = [...prev];
      if (field === "name") {
        updated[index] = { ...updated[index], name: value };
      } else if (field === "price") {
        updated[index] = { ...updated[index], price: value ? parseFloat(value) : null };
      } else if (field === "quantity") {
        updated[index] = { ...updated[index], quantity: value ? parseInt(value, 10) : null };
      }
      return updated;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", price: null, quantity: 1 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!selectedItemId) {
      toast({
        title: "No item selected",
        description: "Please select an inventory item to link the receipt data to.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Find the most relevant receipt line item price to use
      // Use total if available, otherwise use the first item's price
      const priceToSave = total
        ? parseFloat(total)
        : items.length > 0 && items[0].price != null
          ? items[0].price
          : null;

      const updateData: Record<string, unknown> = {};

      if (purchaseDate) {
        updateData.purchaseDate = purchaseDate;
      }
      if (priceToSave != null && !isNaN(priceToSave)) {
        updateData.purchasePrice = priceToSave;
      }
      if (warrantyInfo) {
        updateData.warrantyNotes = warrantyInfo;
      }

      const res = await fetch(`/api/items/${selectedItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          title: "Save failed",
          description: data.error || "Could not update the item. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Receipt saved",
        description: `Purchase data has been linked to ${data.data.name}.`,
        variant: "success",
      });

      handleReset();
    } catch {
      toast({
        title: "Connection error",
        description: "Could not reach the server. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // Analyzing state
  if (mode === "analyzing") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          {imagePreview && (
            <div className="mb-6 h-48 w-48 overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Captured receipt"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              Analyzing receipt...
            </span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Our AI is extracting purchase details from the receipt
          </p>
        </div>
      </div>
    );
  }

  // Result state — editable form
  if (mode === "result" && receiptData) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="mb-2">
          <div className="flex items-start justify-between">
            <div>
              <Badge
                variant="outline"
                className="mb-2 border-teal-200 bg-teal-50 text-teal-600 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
              >
                AI Extracted
              </Badge>
              <h2 className="font-heading text-xl font-bold text-[hsl(var(--foreground))]">
                Receipt Details
              </h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Review and edit the extracted data, then link to an inventory item
              </p>
            </div>
            {imagePreview && (
              <div className="ml-4 h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[hsl(var(--border))]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Scanned receipt"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Store & Date */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  Store Name
                </Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Store name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  Purchase Date
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  Payment Method
                </Label>
                <Input
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="e.g., Visa ending 1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total" className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  Total
                </Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Line Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_80px_60px]">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    placeholder="Item name"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={item.price != null ? String(item.price) : ""}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    placeholder="Price"
                  />
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={item.quantity != null ? String(item.quantity) : ""}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    placeholder="Qty"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 h-8 w-8 flex-shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                No items extracted. Click &quot;Add Item&quot; to add manually.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Warranty Info */}
        {(warrantyInfo || receiptData.warrantyInfo) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-1.5 text-base">
                <ShieldCheck className="h-4 w-4 text-teal-500" />
                Warranty Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={warrantyInfo}
                onChange={(e) => setWarrantyInfo(e.target.value)}
                placeholder="Warranty details"
              />
            </CardContent>
          </Card>
        )}

        {/* Link to Item */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <LinkIcon className="h-4 w-4 text-teal-500" />
              Link to Inventory Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="linkItem">Select an item to save purchase data to</Label>
              {loadingItems ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--muted-foreground))]" />
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    Loading items...
                  </span>
                </div>
              ) : inventoryItems.length === 0 ? (
                <p className="py-2 text-sm text-[hsl(var(--muted-foreground))]">
                  No inventory items found. Add items to your home first.
                </p>
              ) : (
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.home.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button
              onClick={handleSave}
              disabled={!selectedItemId || saving}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save to Item"}
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Scan Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Camera mode
  if (mode === "camera") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-4">
          <h2 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
            Scan Receipt
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Position the receipt in the viewfinder and capture
          </p>
        </div>
        <CameraViewfinder
          onCapture={analyzeImage}
          onClose={() => setMode("idle")}
        />
      </div>
    );
  }

  // Idle state — landing screen
  return (
    <div className="mx-auto max-w-lg">
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-500/10">
            <Receipt className="h-10 w-10 text-teal-500" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        </div>

        <h2 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
          Receipt Scanner
        </h2>
        <p className="mt-2 max-w-md text-[hsl(var(--muted-foreground))]">
          Scan a receipt to extract purchase details and link them to items in
          your inventory.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={async () => {
              const nativeResult = await capturePhotoNative();
              if (nativeResult) {
                analyzeImage(nativeResult.base64, nativeResult.mediaType);
              } else {
                setMode("camera");
              }
            }}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            Open Camera
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              const nativeResult = await pickPhotoNative();
              if (nativeResult) {
                analyzeImage(nativeResult.base64, nativeResult.mediaType);
              } else {
                const el = document.getElementById("receipt-upload-trigger");
                if (el) el.click();
              }
            }}
          >
            <ImagePlus className="h-4 w-4" />
            Upload Photo
          </Button>
        </div>

        <div className="mt-8 w-full max-w-sm">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[hsl(var(--border))]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[hsl(var(--background))] px-2 text-[hsl(var(--muted-foreground))]">
                or drag and drop
              </span>
            </div>
          </div>

          <div className="mt-4" id="receipt-upload-trigger">
            <ImageUpload onUpload={analyzeImage} />
          </div>
        </div>
      </div>
    </div>
  );
}
