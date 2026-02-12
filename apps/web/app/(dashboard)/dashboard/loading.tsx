import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-64 rounded-lg bg-[hsl(var(--muted))]" />
          <div className="mt-2 h-5 w-48 rounded bg-[hsl(var(--muted))]" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-[hsl(var(--muted))]" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 rounded bg-[hsl(var(--muted))]" />
              <div className="mt-1 h-3 w-24 rounded bg-[hsl(var(--muted))]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--muted))]" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded bg-[hsl(var(--muted))]" />
                <div className="mt-1 h-3 w-32 rounded bg-[hsl(var(--muted))]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 rounded bg-[hsl(var(--muted))]" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 rounded-lg bg-[hsl(var(--muted))]" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
