import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[hsl(var(--muted))]" />
        <div>
          <div className="h-7 w-32 rounded-lg bg-[hsl(var(--muted))]" />
          <div className="mt-1.5 h-4 w-56 rounded bg-[hsl(var(--muted))]" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 w-80 rounded-lg bg-[hsl(var(--muted))]" />

      {/* Settings card skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-40 rounded bg-[hsl(var(--muted))]" />
          <div className="mt-1 h-4 w-64 rounded bg-[hsl(var(--muted))]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
              <div className="h-10 w-full rounded-lg bg-[hsl(var(--muted))]" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
              <div className="h-10 w-full rounded-lg bg-[hsl(var(--muted))]" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
            <div className="h-10 w-full rounded-lg bg-[hsl(var(--muted))]" />
          </div>
          <div className="h-10 w-24 rounded-lg bg-[hsl(var(--muted))]" />
        </CardContent>
      </Card>
    </div>
  );
}
