"use client";

import { useState } from "react";
import {
  Thermometer,
  Lock,
  Lightbulb,
  Camera,
  Speaker,
  Activity,
  Plug,
  Bell,
  Warehouse,
  Droplets,
  Flame,
  Bot,
  Wifi,
  ChevronDown,
  ChevronUp,
  Loader2,
  Unlink,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  smart_thermostat: Thermometer,
  smart_lock: Lock,
  smart_light: Lightbulb,
  smart_camera: Camera,
  smart_speaker: Speaker,
  smart_sensor: Activity,
  smart_plug: Plug,
  smart_doorbell: Bell,
  smart_garage: Warehouse,
  smart_sprinkler: Droplets,
  smart_smoke_detector: Flame,
  smart_vacuum: Bot,
};

const DEVICE_TYPES = [
  { type: "smart_thermostat", label: "Thermostat" },
  { type: "smart_lock", label: "Lock" },
  { type: "smart_light", label: "Light" },
  { type: "smart_camera", label: "Camera" },
  { type: "smart_speaker", label: "Speaker" },
  { type: "smart_sensor", label: "Sensor" },
  { type: "smart_plug", label: "Plug" },
  { type: "smart_doorbell", label: "Doorbell" },
  { type: "smart_garage", label: "Garage" },
  { type: "smart_sprinkler", label: "Sprinkler" },
  { type: "smart_smoke_detector", label: "Smoke Detector" },
  { type: "smart_vacuum", label: "Robot Vacuum" },
];

const PROTOCOLS = [
  { value: "wifi", label: "WiFi" },
  { value: "zigbee", label: "Zigbee" },
  { value: "zwave", label: "Z-Wave" },
  { value: "matter", label: "Matter" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "thread", label: "Thread" },
];

interface DeviceDiscoveryProps {
  itemId: string;
  currentDevice?: {
    smartDeviceId: string | null;
    smartDeviceType: string | null;
    smartDeviceMetadata: Record<string, unknown> | null;
  };
}

export function DeviceDiscovery({ itemId, currentDevice }: DeviceDiscoveryProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(!!currentDevice?.smartDeviceId);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Form state
  const [deviceName, setDeviceName] = useState("");
  const [protocol, setProtocol] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Linked device state (from props, updated after save/unlink)
  const [linkedDevice, setLinkedDevice] = useState(currentDevice);

  const hasLinkedDevice = !!linkedDevice?.smartDeviceId;

  async function handleSave() {
    if (!selectedType || !deviceName) {
      toast({
        title: "Missing fields",
        description: "Please provide at least a device name.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const metadata: Record<string, unknown> = {};
      if (protocol) metadata.protocol = protocol;
      if (brand) metadata.brand = brand;
      if (model) metadata.model = model;
      if (ipAddress) metadata.ipAddress = ipAddress;
      if (notes) metadata.notes = notes;

      const res = await fetch(`/api/items/${itemId}/smart-device`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smartDeviceId: deviceName,
          smartDeviceType: selectedType,
          smartDeviceMetadata: metadata,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setLinkedDevice({
        smartDeviceId: deviceName,
        smartDeviceType: selectedType,
        smartDeviceMetadata: metadata,
      });
      setSelectedType(null);
      resetForm();

      toast({
        title: "Device linked",
        description: "Smart device has been linked to this item.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to link smart device.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUnlink() {
    setSaving(true);
    try {
      const res = await fetch(`/api/items/${itemId}/smart-device`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smartDeviceId: null,
          smartDeviceType: null,
          smartDeviceMetadata: null,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setLinkedDevice({
        smartDeviceId: null,
        smartDeviceType: null,
        smartDeviceMetadata: null,
      });

      toast({
        title: "Device unlinked",
        description: "Smart device has been removed from this item.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to unlink smart device.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setDeviceName("");
    setProtocol("");
    setBrand("");
    setModel("");
    setIpAddress("");
    setNotes("");
  }

  const LinkedDeviceIcon = linkedDevice?.smartDeviceType
    ? ICON_MAP[linkedDevice.smartDeviceType] ?? Wifi
    : Wifi;

  return (
    <div className="space-y-4">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition-colors hover:bg-[hsl(var(--muted))]"
      >
        <div className="flex items-center gap-3">
          <Wifi className="h-5 w-5 text-[#00B4A0]" />
          <span className="font-semibold">Smart Home</span>
          {hasLinkedDevice && (
            <Badge variant="success" className="text-xs">
              Connected
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-4">
          {/* Current Linked Device */}
          {hasLinkedDevice && linkedDevice && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00B4A0]/10">
                      <LinkedDeviceIcon className="h-5 w-5 text-[#00B4A0]" />
                    </div>
                    <div>
                      <p className="font-medium">{linkedDevice.smartDeviceId}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {DEVICE_TYPES.find((d) => d.type === linkedDevice.smartDeviceType)?.label ?? linkedDevice.smartDeviceType}
                        {linkedDevice.smartDeviceMetadata?.protocol ? (
                          <> &middot; {String(linkedDevice.smartDeviceMetadata.protocol)}</>
                        ) : null}
                        {linkedDevice.smartDeviceMetadata?.brand ? (
                          <> &middot; {String(linkedDevice.smartDeviceMetadata.brand)}</>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlink}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unlink className="h-4 w-4" />
                    )}
                    Unlink
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Device Type Selector */}
          {!hasLinkedDevice && (
            <>
              <div>
                <p className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Select a device type to link:
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DEVICE_TYPES.map((device) => {
                    const Icon = ICON_MAP[device.type] ?? Wifi;
                    const isSelected = selectedType === device.type;
                    return (
                      <button
                        key={device.type}
                        onClick={() => {
                          setSelectedType(isSelected ? null : device.type);
                          if (isSelected) resetForm();
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors hover:bg-[hsl(var(--muted))]",
                          isSelected
                            ? "border-[#00B4A0] bg-[#00B4A0]/5"
                            : "border-[hsl(var(--border))]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6",
                            isSelected
                              ? "text-[#00B4A0]"
                              : "text-[hsl(var(--muted-foreground))]"
                          )}
                        />
                        <span className="text-xs font-medium">{device.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Link Form */}
              {selectedType && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="device-name">Device Name / ID *</Label>
                        <Input
                          id="device-name"
                          placeholder="e.g. Living Room Thermostat"
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="device-protocol">Protocol</Label>
                        <Select value={protocol} onValueChange={setProtocol}>
                          <SelectTrigger id="device-protocol">
                            <SelectValue placeholder="Select protocol" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROTOCOLS.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="device-brand">Brand</Label>
                        <Input
                          id="device-brand"
                          placeholder="e.g. Nest"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="device-model">Model</Label>
                        <Input
                          id="device-model"
                          placeholder="e.g. Learning Thermostat 3rd Gen"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="device-ip">IP Address (optional)</Label>
                        <Input
                          id="device-ip"
                          placeholder="e.g. 192.168.1.100"
                          value={ipAddress}
                          onChange={(e) => setIpAddress(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="device-notes">Notes (optional)</Label>
                      <textarea
                        id="device-notes"
                        placeholder="Any additional notes about this device..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="flex w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm ring-offset-[hsl(var(--background))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Link Device
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedType(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
