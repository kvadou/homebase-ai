export default function ChatLoading() {
  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] sm:-m-6 lg:-m-8 animate-pulse">
      {/* Sidebar skeleton */}
      <div className="w-72 border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 space-y-3">
        <div className="h-10 w-full rounded-lg bg-[hsl(var(--muted))]" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </div>

      {/* Main area skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-4 py-3">
          <div className="h-8 w-8 rounded bg-[hsl(var(--muted))]" />
          <div className="h-5 w-24 rounded bg-[hsl(var(--muted))]" />
          <div className="ml-auto h-8 w-32 rounded-lg bg-[hsl(var(--muted))]" />
        </div>

        {/* Messages area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-[hsl(var(--muted))]" />
            <div className="h-5 w-40 mx-auto rounded bg-[hsl(var(--muted))]" />
            <div className="h-4 w-56 mx-auto rounded bg-[hsl(var(--muted))]" />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-[hsl(var(--border))] p-4">
          <div className="h-12 w-full rounded-lg bg-[hsl(var(--muted))]" />
        </div>
      </div>
    </div>
  );
}
