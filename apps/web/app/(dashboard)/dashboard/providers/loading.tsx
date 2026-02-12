import { Card, CardContent } from "@/components/ui/card";

export default function ProvidersLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-48 rounded-lg bg-[hsl(var(--muted))]" />
          <div className="mt-2 h-4 w-72 rounded bg-[hsl(var(--muted))]" />
        </div>
        <div className="h-10 w-48 rounded-lg bg-[hsl(var(--muted))]" />
      </div>

      {/* Search skeleton */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-[hsl(var(--muted))]" />
        <div className="h-10 w-40 rounded-lg bg-[hsl(var(--muted))]" />
        <div className="h-10 w-32 rounded-lg bg-[hsl(var(--muted))]" />
      </div>

      {/* Provider cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-[hsl(var(--muted))]" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 rounded bg-[hsl(var(--muted))]" />
                  <div className="h-4 w-24 rounded bg-[hsl(var(--muted))]" />
                </div>
              </div>
              <div className="h-4 w-full rounded bg-[hsl(var(--muted))]" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-16 rounded bg-[hsl(var(--muted))]" />
                <div className="h-3 w-20 rounded bg-[hsl(var(--muted))]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
