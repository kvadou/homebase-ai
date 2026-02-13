"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const INCIDENT_TYPES = [
  { value: "fire", label: "Fire" },
  { value: "water", label: "Water Damage" },
  { value: "theft", label: "Theft" },
  { value: "storm", label: "Storm Damage" },
  { value: "vandalism", label: "Vandalism" },
  { value: "accident", label: "Accident" },
  { value: "natural_disaster", label: "Natural Disaster" },
  { value: "other", label: "Other" },
];

interface ItemOption {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  purchasePrice: number | null;
  photoUrl: string | null;
  home: { id: string; name: string };
}

interface HomeOption {
  id: string;
  name: string;
}

interface ClaimBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  homes: HomeOption[];
}

export function ClaimBuilder({ open, onOpenChange, onCreated, homes }: ClaimBuilderProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Step 1: Incident details
  const [homeId, setHomeId] = useState(homes[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [incidentType, setIncidentType] = useState("water");
  const [incidentDate, setIncidentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");

  // Step 2: Items
  const [items, setItems] = useState<ItemOption[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [loadingItems, setLoadingItems] = useState(false);

  // Step 3: Narrative
  const [narrative, setNarrative] = useState("");
  const [generatingNarrative, setGeneratingNarrative] = useState(false);

  // Step 4: Save
  const [saving, setSaving] = useState(false);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setHomeId(homes[0]?.id ?? "");
      setTitle("");
      setIncidentType("water");
      setIncidentDate(format(new Date(), "yyyy-MM-dd"));
      setDescription("");
      setSelectedItemIds(new Set());
      setNarrative("");
    }
  }, [open, homes]);

  // Fetch items when moving to step 2
  const fetchItems = useCallback(async () => {
    if (!homeId) return;
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/items?homeId=${homeId}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } finally {
      setLoadingItems(false);
    }
  }, [homeId]);

  function toggleItem(itemId: string) {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  const selectedItems = items.filter((i) => selectedItemIds.has(i.id));
  const totalValue = selectedItems.reduce(
    (sum, i) => sum + (i.purchasePrice ?? 0),
    0
  );

  async function handleGenerateNarrative() {
    setGeneratingNarrative(true);
    try {
      // First create a draft claim to get an ID
      const createRes = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeId,
          title: title || `${INCIDENT_TYPES.find((t) => t.value === incidentType)?.label} Claim`,
          incidentDate,
          incidentType,
          description,
          itemIds: Array.from(selectedItemIds),
          totalValue,
        }),
      });
      const createData = await createRes.json();
      if (!createData.success) {
        toast({ title: "Error", description: createData.error, variant: "destructive" });
        return;
      }

      const claimId = createData.data.id;

      // Generate narrative
      const narrativeRes = await fetch(`/api/claims/${claimId}/generate-narrative`, {
        method: "POST",
      });
      const narrativeData = await narrativeRes.json();
      if (narrativeData.success) {
        setNarrative(narrativeData.data.narrative);
        // Store the claim ID so we can update it on save
        setDraftClaimId(claimId);
      } else {
        toast({ title: "Error", description: "Failed to generate narrative", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate narrative", variant: "destructive" });
    } finally {
      setGeneratingNarrative(false);
    }
  }

  const [draftClaimId, setDraftClaimId] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    try {
      if (draftClaimId) {
        // Update existing draft
        const res = await fetch(`/api/claims/${draftClaimId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || `${INCIDENT_TYPES.find((t) => t.value === incidentType)?.label} Claim`,
            aiNarrative: narrative,
            totalValue,
            itemIds: Array.from(selectedItemIds),
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast({ title: "Claim saved", description: "Your insurance claim has been saved.", variant: "success" });
          onOpenChange(false);
          onCreated();
        }
      } else {
        // Create new
        const res = await fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homeId,
            title: title || `${INCIDENT_TYPES.find((t) => t.value === incidentType)?.label} Claim`,
            incidentDate,
            incidentType,
            description,
            itemIds: Array.from(selectedItemIds),
            totalValue,
            aiNarrative: narrative,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast({ title: "Claim created", description: "Your insurance claim has been created.", variant: "success" });
          onOpenChange(false);
          onCreated();
        }
      }
    } finally {
      setSaving(false);
    }
  }

  function handleNext() {
    if (step === 1) {
      fetchItems();
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  }

  const stepTitles = [
    "Describe the Incident",
    "Select Affected Items",
    "AI Narrative",
    "Review & Save",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Insurance Claim</DialogTitle>
          <DialogDescription>
            Step {step} of 4: {stepTitles[step - 1]}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-teal-500" : "bg-[hsl(var(--muted))]"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Incident Details */}
        {step === 1 && (
          <div className="space-y-4">
            {homes.length > 1 && (
              <div className="space-y-2">
                <Label>Home</Label>
                <Select value={homeId} onValueChange={setHomeId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {homes.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="claim-title">Claim Title</Label>
              <Input
                id="claim-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Kitchen Water Damage Claim"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Incident Type</Label>
                <Select value={incidentType} onValueChange={setIncidentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-date">Incident Date</Label>
                <Input
                  id="claim-date"
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="claim-description">Description</Label>
              <Textarea
                id="claim-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, when you discovered it, and any immediate actions taken..."
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Step 2: Select Items */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Select the items affected by this incident. Their values will be included in your claim.
            </p>
            {loadingItems ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
                No items found for this home. You can still create a claim without items.
              </div>
            ) : (
              <div className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
                {items.map((item) => {
                  const isSelected = selectedItemIds.has(item.id);
                  return (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20"
                          : "hover:bg-[hsl(var(--muted))]"
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <CardContent className="flex items-center gap-3 p-3">
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? "border-teal-500 bg-teal-500 text-white"
                              : "border-[hsl(var(--border))]"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {[item.brand, item.model].filter(Boolean).join(" ") || "No brand/model"}
                          </p>
                        </div>
                        {item.purchasePrice != null && (
                          <span className="shrink-0 text-sm font-medium">
                            ${item.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {selectedItemIds.size > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--muted))] px-4 py-2">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {selectedItemIds.size} item(s) selected
                </span>
                <span className="text-sm font-semibold">
                  Total: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: AI Narrative */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Generate a professional claim narrative using AI, then edit as needed.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleGenerateNarrative}
                disabled={generatingNarrative}
              >
                {generatingNarrative ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generatingNarrative ? "Generating..." : narrative ? "Regenerate" : "Generate"}
              </Button>
            </div>
            <Textarea
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder={
                generatingNarrative
                  ? "Generating narrative..."
                  : "Click 'Generate' to create an AI narrative, or write your own..."
              }
              rows={12}
              disabled={generatingNarrative}
            />
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Title</p>
                  <p className="text-sm font-medium">
                    {title || `${INCIDENT_TYPES.find((t) => t.value === incidentType)?.label} Claim`}
                  </p>
                </div>
                <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Incident Type</p>
                  <p className="text-sm font-medium">
                    {INCIDENT_TYPES.find((t) => t.value === incidentType)?.label}
                  </p>
                </div>
                <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Date</p>
                  <p className="text-sm font-medium">
                    {format(new Date(incidentDate), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Value</p>
                  <p className="text-sm font-semibold text-teal-600">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                    Affected Items ({selectedItems.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedItems.map((item) => (
                      <Badge key={item.id} variant="secondary" className="text-xs">
                        {item.name}
                        {item.purchasePrice != null && ` ($${item.purchasePrice})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {narrative && (
                <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">AI Narrative</p>
                  <p className="text-sm whitespace-pre-wrap line-clamp-6">{narrative}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-2">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button onClick={handleNext} disabled={step === 1 && !homeId}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Claim"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
