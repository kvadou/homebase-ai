"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { CalendarDays, Copy, ExternalLink, Trash2, Loader2 } from "lucide-react";

export function CalendarSettings() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const { toast } = useToast();

  const feedUrl = token
    ? `${window.location.origin}/api/calendar/feed?token=${token}`
    : null;

  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar/token");
      const json = await res.json();
      if (json.success) {
        setToken(json.data.token);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/calendar/token", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setToken(json.data.token);
        toast({ title: "Calendar feed generated", description: "Your iCal feed URL is ready.", variant: "success" });
      } else {
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate calendar feed.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      const res = await fetch("/api/calendar/token", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setToken(null);
        toast({ title: "Feed revoked", description: "Your calendar feed has been disabled.", variant: "success" });
      } else {
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to revoke calendar feed.", variant: "destructive" });
    } finally {
      setRevoking(false);
    }
  };

  const handleCopy = async () => {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      toast({ title: "Copied", description: "Feed URL copied to clipboard.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Failed to copy to clipboard.", variant: "destructive" });
    }
  };

  const googleCalendarUrl = feedUrl
    ? `https://calendar.google.com/calendar/r?cid=webcal://${feedUrl.replace(/^https?:\/\//, "")}`
    : null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendar Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Calendar Feed
        </CardTitle>
        <CardDescription>
          Subscribe to your maintenance schedule in any calendar app that supports iCal feeds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!token ? (
          <div className="space-y-3">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Generate a calendar feed URL to sync your maintenance tasks with Google Calendar, Apple Calendar, Outlook, or any other calendar app.
            </p>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating && <Loader2 className="h-4 w-4 animate-spin" />}
              <CalendarDays className="h-4 w-4" />
              Generate Calendar Feed
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Feed URL</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={feedUrl ?? ""}
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copy URL">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Paste this URL into your calendar app to subscribe to your maintenance schedule.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {googleCalendarUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Add to Google Calendar
                  </a>
                </Button>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={handleRevoke}
                disabled={revoking}
              >
                {revoking && <Loader2 className="h-4 w-4 animate-spin" />}
                <Trash2 className="h-4 w-4" />
                Revoke Feed
              </Button>
            </div>

            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Revoking the feed will invalidate the current URL. You can generate a new one at any time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
