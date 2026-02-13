"use client";

import { MapPin, Pencil, Trash2, Phone, User } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SafetyItemData } from "./safety-item-form";

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  shutoff_water: { icon: "droplet", color: "text-blue-500" },
  shutoff_gas: { icon: "flame", color: "text-orange-500" },
  shutoff_electrical: { icon: "zap", color: "text-yellow-500" },
  emergency_contact: { icon: "phone", color: "text-green-500" },
  evacuation_note: { icon: "door-open", color: "text-red-500" },
  go_bag_item: { icon: "backpack", color: "text-purple-500" },
};

interface ShutoffCardProps {
  item: SafetyItemData;
  onEdit: (item: SafetyItemData) => void;
  onDelete: (item: SafetyItemData) => void;
}

export function ShutoffCard({ item, onEdit, onDelete }: ShutoffCardProps) {
  const config = TYPE_CONFIG[item.type] ?? { icon: "info", color: "text-gray-500" };
  const isContact = item.type === "emergency_contact";

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.title}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] ${config.color}`}
            >
              {isContact ? (
                <Phone className="h-5 w-5" />
              ) : (
                <span className="text-lg font-bold">
                  {item.title.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-[hsl(var(--foreground))] truncate">
              {item.title}
            </h3>
            {item.description && (
              <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                {item.description}
              </p>
            )}
            {item.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                {isContact ? (
                  <User className="h-3 w-3" />
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                {item.location}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
