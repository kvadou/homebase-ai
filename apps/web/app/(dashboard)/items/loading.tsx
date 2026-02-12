import { Card, CardContent } from "@/components/ui/card";

export default function ItemsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-32 rounded-lg bg-[hsl(var(--muted))]" />
          <div className="mt-2 h-5 w-48 rounded bg-[hsl(var(--muted))]" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-[hsl(var(--muted))]" />
      </div>

      {/* Category filter skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-[hsl(var(--muted))]" />
        ))}
      </div>

      {/* Item cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-[hsl(var(--muted))]" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 rounded bg-[hsl(var(--muted))]" />
                  <div className="h-4 w-24 rounded bg-[hsl(var(--muted))]" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-16 rounded-full bg-[hsl(var(--muted))]" />
                    <div className="h-5 w-20 rounded-full bg-[hsl(var(--muted))]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
