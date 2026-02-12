"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toaster";
import { ExternalLink, Loader2, Save } from "lucide-react";

export function ProfileSettings() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (isLoaded && !initialized && user) {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setInitialized(true);
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!user) return null;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName,
        lastName,
      });
      toast({ title: "Profile updated", description: "Your name has been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <img
                src={user.imageUrl}
                alt={user.fullName ?? "Avatar"}
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-medium text-[hsl(var(--foreground))]">
                {user.fullName || "No name set"}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manage Profile</CardTitle>
          <CardDescription>
            Access your full Clerk profile to manage email addresses, connected accounts, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.open(
                  "https://accounts.clerk.dev/user",
                  "_blank",
                  "noopener,noreferrer"
                );
              }
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Open Profile Management
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
