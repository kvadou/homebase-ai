"use client";

import * as React from "react";
import { ScanLine, Receipt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemScanner } from "@/components/scan/item-scanner";
import { ReceiptScanner } from "@/components/scan/receipt-scanner";

export default function ScanPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
          AI Scanner
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Identify items or extract receipt details with AI
        </p>
      </div>

      <div className="flex justify-center">
        <Tabs defaultValue="item" className="w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="item" className="gap-2">
              <ScanLine className="h-4 w-4" />
              Item Scan
            </TabsTrigger>
            <TabsTrigger value="receipt" className="gap-2">
              <Receipt className="h-4 w-4" />
              Receipt Scan
            </TabsTrigger>
          </TabsList>
          <TabsContent value="item">
            <ItemScanner />
          </TabsContent>
          <TabsContent value="receipt">
            <ReceiptScanner />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
