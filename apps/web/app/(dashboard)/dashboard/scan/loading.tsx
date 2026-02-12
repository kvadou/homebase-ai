export default function ScanLoading() {
  return (
    <div className="mx-auto max-w-lg animate-pulse">
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 h-20 w-20 rounded-2xl bg-[hsl(var(--muted))]" />
        <div className="h-8 w-56 rounded-lg bg-[hsl(var(--muted))]" />
        <div className="mt-3 h-4 w-72 rounded bg-[hsl(var(--muted))]" />
        <div className="mt-1 h-4 w-64 rounded bg-[hsl(var(--muted))]" />
        <div className="mt-8 flex gap-3">
          <div className="h-10 w-36 rounded-lg bg-[hsl(var(--muted))]" />
          <div className="h-10 w-36 rounded-lg bg-[hsl(var(--muted))]" />
        </div>
      </div>
    </div>
  );
}
