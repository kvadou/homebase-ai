import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MaintenanceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-48 rounded-lg bg-[hsl(var(--muted))]" />
          <div className="mt-2 h-4 w-72 rounded bg-[hsl(var(--muted))]" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-[hsl(var(--muted))]" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-40 rounded-lg bg-[hsl(var(--muted))]" />
        <div className="h-10 w-40 rounded-lg bg-[hsl(var(--muted))]" />
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 w-80 rounded-lg bg-[hsl(var(--muted))]" />

      {/* Task cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 rounded bg-[hsl(var(--muted))]" />
                <div className="h-5 w-16 rounded-full bg-[hsl(var(--muted))]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-4 w-full rounded bg-[hsl(var(--muted))]" />
              <div className="h-4 w-2/3 rounded bg-[hsl(var(--muted))]" />
              <div className="mt-3 flex items-center gap-2">
                <div className="h-3 w-20 rounded bg-[hsl(var(--muted))]" />
                <div className="h-3 w-24 rounded bg-[hsl(var(--muted))]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
