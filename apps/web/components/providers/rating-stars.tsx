import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md";
  className?: string;
}

export function RatingStars({ rating, maxStars = 5, size = "sm", className }: RatingStarsProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            className={cn(
              iconSize,
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-[hsl(var(--muted-foreground))]"
            )}
          />
        );
      })}
    </div>
  );
}

interface InteractiveRatingStarsProps {
  value: number;
  onChange: (value: number) => void;
  maxStars?: number;
  className?: string;
}

export function InteractiveRatingStars({
  value,
  onChange,
  maxStars = 5,
  className,
}: InteractiveRatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="rounded p-0.5 transition-colors hover:bg-[hsl(var(--accent))]"
          >
            <Star
              className={cn(
                "h-5 w-5",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-[hsl(var(--muted-foreground))]"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
