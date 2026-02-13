"use client";

interface ApiAttributionProps {
  hasGoogle: boolean;
  hasYelp: boolean;
}

export function ApiAttribution({ hasGoogle, hasYelp }: ApiAttributionProps) {
  if (!hasGoogle && !hasYelp) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
      {hasGoogle && <span>Powered by Google</span>}
      {hasGoogle && hasYelp && (
        <span className="text-[hsl(var(--border))]">|</span>
      )}
      {hasYelp && <span>Powered by Yelp</span>}
    </div>
  );
}
