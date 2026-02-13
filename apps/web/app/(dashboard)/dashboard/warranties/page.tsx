"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WarrantyItemCard } from "@/components/warranties/warranty-item-card";
import { EditWarrantyDialog } from "@/components/warranties/edit-warranty-dialog";

interface WarrantyItem {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  warrantyExpiry: string | null;
  warrantyProvider: string | null;
  warrantyType: string | null;
  warrantyNotes: string | null;
  room: { id: string; name: string } | null;
  home: { id: string; name: string };
}

interface WarrantyData {
  all: WarrantyItem[];
  active: WarrantyItem[];
  expiring: WarrantyItem[];
  expired: WarrantyItem[];
  stats: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
  };
}

export default function WarrantiesPage() {
  const [data, setData] = useState<WarrantyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<WarrantyItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/warranties");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleEdit(item: WarrantyItem) {
    setEditItem(item);
    setEditOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  const stats = data?.stats ?? { total: 0, active: 0, expiring: 0, expired: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
            <Shield className="h-5 w-5 text-teal-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[hsl(var(--foreground))]">
              Warranties
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Track and manage warranty coverage for your items.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Total Warranties
            </CardTitle>
            <Shield className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Active
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Expiring Soon
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.expiring}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Expired
            </CardTitle>
            <ShieldX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Warranty Tabs */}
      {stats.total === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Package className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
            <h3 className="mt-4 font-heading text-lg font-semibold">
              No warranties tracked
            </h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Add warranty expiry dates to your items to track them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={stats.expiring > 0 ? "expiring" : "active"}>
          <TabsList>
            <TabsTrigger value="expiring" className="gap-1.5">
              Expiring Soon
              {stats.expiring > 0 && (
                <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                  {stats.expiring}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="expiring" className="mt-4">
            <ItemList items={data?.expiring ?? []} onEdit={handleEdit} emptyMsg="No expiring warranties." />
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <ItemList items={data?.active ?? []} onEdit={handleEdit} emptyMsg="No active warranties." />
          </TabsContent>
          <TabsContent value="expired" className="mt-4">
            <ItemList items={data?.expired ?? []} onEdit={handleEdit} emptyMsg="No expired warranties." />
          </TabsContent>
          <TabsContent value="all" className="mt-4">
            <ItemList items={data?.all ?? []} onEdit={handleEdit} emptyMsg="No warranties found." />
          </TabsContent>
        </Tabs>
      )}

      <EditWarrantyDialog
        item={editItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={load}
      />
    </div>
  );
}

function ItemList({
  items,
  onEdit,
  emptyMsg,
}: {
  items: WarrantyItem[];
  onEdit: (item: WarrantyItem) => void;
  emptyMsg: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {emptyMsg}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <WarrantyItemCard key={item.id} item={item} onEdit={onEdit} />
      ))}
    </div>
  );
}
