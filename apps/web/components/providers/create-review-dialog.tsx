"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { InteractiveRatingStars } from "./rating-stars";

interface CreateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  providerName: string;
  onCreated: () => void;
}

export function CreateReviewDialog({
  open,
  onOpenChange,
  providerId,
  providerName,
  onCreated,
}: CreateReviewDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [rating, setRating] = React.useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      rating,
      comment: formData.get("comment") || undefined,
      authorName: formData.get("authorName") || undefined,
    };

    try {
      const res = await fetch(`/api/providers/${providerId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to submit review",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Review submitted",
        description: `Your review for ${providerName} has been submitted.`,
      });

      onOpenChange(false);
      onCreated();
      setRating(0);
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {providerName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Rating *</Label>
            <InteractiveRatingStars
              value={rating}
              onChange={setRating}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="review-author">Your Name</Label>
            <Input
              id="review-author"
              name="authorName"
              placeholder="Optional"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="review-comment">Comment</Label>
            <Textarea
              id="review-comment"
              name="comment"
              placeholder="Tell others about your experience..."
              className="mt-1.5"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
