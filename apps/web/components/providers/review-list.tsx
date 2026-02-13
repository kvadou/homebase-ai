import { User, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "./rating-stars";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string | null;
  isVerified?: boolean;
  createdAt: string;
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        No reviews yet. Be the first to leave a review.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-lg border border-[hsl(var(--border))] p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                <User className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              </div>
              <span className="text-sm font-medium">
                {review.authorName || "Anonymous"}
              </span>
              {review.isVerified && (
                <Badge variant="success" className="gap-1 text-[10px]">
                  <CheckCircle className="h-3 w-3" />
                  Verified Customer
                </Badge>
              )}
            </div>
            <time className="text-xs text-[hsl(var(--muted-foreground))]">
              {new Date(review.createdAt).toLocaleDateString()}
            </time>
          </div>
          <div className="mt-2">
            <RatingStars rating={review.rating} />
          </div>
          {review.comment && (
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
