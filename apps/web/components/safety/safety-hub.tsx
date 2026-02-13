"use client";

import { useState } from "react";
import {
  Droplets,
  Flame,
  Zap,
  Phone,
  DoorOpen,
  Backpack,
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ShutoffCard } from "./shutoff-card";
import { SafetyItemForm, type SafetyItemData } from "./safety-item-form";
import { EmergencyContactForm } from "./emergency-contact-form";

interface SafetyHubProps {
  homeId: string;
  items: SafetyItemData[];
  onRefresh: () => void;
}

const TAB_CONFIG = [
  {
    value: "shutoffs",
    label: "Shut-offs",
    icon: Droplets,
    types: ["shutoff_water", "shutoff_gas", "shutoff_electrical"],
    defaultType: "shutoff_water",
    emptyTitle: "No shut-off locations documented",
    emptyDesc: "Add the locations of your water, gas, and electrical shut-offs.",
  },
  {
    value: "contacts",
    label: "Emergency Contacts",
    icon: Phone,
    types: ["emergency_contact"],
    defaultType: "emergency_contact",
    emptyTitle: "No emergency contacts added",
    emptyDesc: "Add plumbers, electricians, and other emergency contacts.",
  },
  {
    value: "evacuation",
    label: "Evacuation",
    icon: DoorOpen,
    types: ["evacuation_note"],
    defaultType: "evacuation_note",
    emptyTitle: "No evacuation plans documented",
    emptyDesc: "Document evacuation routes and meeting points.",
  },
  {
    value: "go_bag",
    label: "Go-Bag",
    icon: Backpack,
    types: ["go_bag_item"],
    defaultType: "go_bag_item",
    emptyTitle: "No go-bag items listed",
    emptyDesc: "List items for your emergency go-bag, or generate a checklist with AI.",
  },
];

export function SafetyHub({ homeId, items, onRefresh }: SafetyHubProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState("shutoffs");

  // Form dialogs
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<SafetyItemData | null>(null);
  const [defaultType, setDefaultType] = useState("shutoff_water");

  // Delete dialog
  const [deleteItem, setDeleteItem] = useState<SafetyItemData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // AI generation
  const [generating, setGenerating] = useState(false);

  function handleAdd() {
    const currentTab = TAB_CONFIG.find((t) => t.value === tab);
    setEditItem(null);
    setDefaultType(currentTab?.defaultType ?? "shutoff_water");

    if (tab === "contacts") {
      setContactFormOpen(true);
    } else {
      setItemFormOpen(true);
    }
  }

  function handleEdit(item: SafetyItemData) {
    setEditItem(item);
    if (item.type === "emergency_contact") {
      setContactFormOpen(true);
    } else {
      setItemFormOpen(true);
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/homes/${homeId}/safety/${deleteItem.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Deleted", description: "Safety item has been removed." });
        setDeleteItem(null);
        onRefresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleGenerateGoBag() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/homes/${homeId}/safety/generate-go-bag`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Go-bag checklist generated",
          description: `${data.data.length} items added to your go-bag list.`,
          variant: "success",
        });
        onRefresh();
      } else {
        toast({
          title: "Generation failed",
          description: data.error || "Could not generate checklist.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate go-bag checklist.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }

  function handleSaved() {
    toast({
      title: editItem ? "Updated" : "Added",
      description: editItem
        ? "Safety item has been updated."
        : "Safety item has been added.",
      variant: "success",
    });
    onRefresh();
  }

  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            {TAB_CONFIG.map((t) => {
              const Icon = t.icon;
              const count = items.filter((i) => t.types.includes(i.type)).length;
              return (
                <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                  {count > 0 && (
                    <span className="ml-1 rounded-full bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex gap-2">
            {tab === "go_bag" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleGenerateGoBag}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generating ? "Generating..." : "AI Generate Checklist"}
              </Button>
            )}
            <Button size="sm" className="gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {TAB_CONFIG.map((tabConfig) => {
          const tabItems = items.filter((i) =>
            tabConfig.types.includes(i.type)
          );
          return (
            <TabsContent key={tabConfig.value} value={tabConfig.value}>
              {tabItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
                    <tabConfig.icon className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {tabConfig.emptyTitle}
                  </p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {tabConfig.emptyDesc}
                  </p>
                  <Button className="mt-4 gap-2" size="sm" onClick={handleAdd}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tabItems.map((item) => (
                    <ShutoffCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={(i) => setDeleteItem(i)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Safety Item Form (generic) */}
      <SafetyItemForm
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        onSaved={handleSaved}
        homeId={homeId}
        editItem={editItem}
        defaultType={defaultType}
      />

      {/* Emergency Contact Form */}
      <EmergencyContactForm
        open={contactFormOpen}
        onOpenChange={setContactFormOpen}
        onSaved={handleSaved}
        homeId={homeId}
        editItem={editItem}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteItem}
        onOpenChange={(val) => {
          if (!val) setDeleteItem(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Safety Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteItem?.title}&rdquo;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteItem(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
