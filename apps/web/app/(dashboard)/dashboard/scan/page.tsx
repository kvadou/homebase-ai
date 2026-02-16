"use client";

import * as React from "react";
import { ScanLine, Receipt, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemScanner } from "@/components/scan/item-scanner";
import { ReceiptScanner } from "@/components/scan/receipt-scanner";
import { HomeInspector } from "@/components/scan/home-inspector";

export default function ScanPage() {
  return (
    <div>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00B4A0]/10">
          <ScanLine className="h-6 w-6 text-[#00B4A0]" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
          AI Scanner
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Identify items, extract receipts, or inspect home issues with AI
        </p>
      </div>

      <div className="flex justify-center">
        <Tabs defaultValue="item" className="w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="item" className="gap-2">
              <ScanLine className="h-4 w-4" />
              Item Scan
            </TabsTrigger>
            <TabsTrigger value="receipt" className="gap-2">
              <Receipt className="h-4 w-4" />
              Receipt
            </TabsTrigger>
            <TabsTrigger value="inspect" className="gap-2">
              <Search className="h-4 w-4" />
              Inspect
            </TabsTrigger>
          </TabsList>
          <TabsContent value="item">
            <ItemScanner />
          </TabsContent>
          <TabsContent value="receipt">
            <ReceiptScanner />
          </TabsContent>
          <TabsContent value="inspect">
            <HomeInspector />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
