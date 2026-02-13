"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkQRDialog } from "./bulk-qr-dialog";

interface ItemSummary {
  id: string;
  name: string;
  brand: string | null;
}

interface ItemsHeaderProps {
  itemCount: number;
  items: ItemSummary[];
}

export function ItemsHeader({ itemCount, items }: ItemsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-heading text-3xl font-bold">Items</h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          {itemCount} item{itemCount !== 1 ? "s" : ""} across all your homes
        </p>
      </div>
      <div className="flex gap-2">
        {items.length > 0 && <BulkQRDialog items={items} />}
        <Button asChild>
          <Link href="/items/new">
            <Plus className="h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>
    </div>
  );
}
