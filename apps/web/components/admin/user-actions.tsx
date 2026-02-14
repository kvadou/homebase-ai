"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserActionsProps {
  userId: string;
  onView: (userId: string) => void;
}

export function UserActions({ userId, onView }: UserActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onView(userId);
        }}
        title="View user details"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}
