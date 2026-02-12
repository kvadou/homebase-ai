import { Building2, CheckCircle, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "./rating-stars";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    company: string | null;
    specialty: string;
    phone: string | null;
    email: string | null;
    rating: number | null;
    reviewCount: number;
    isVerified: boolean;
  };
  onClick: (id: string) => void;
  isSelected?: boolean;
}

export function ProviderCard({ provider, onClick, isSelected }: ProviderCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-teal-500"
      )}
      onClick={() => onClick(provider.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-[hsl(var(--foreground))]">
                {provider.name}
              </h3>
              {provider.isVerified && (
                <CheckCircle className="h-4 w-4 shrink-0 text-teal-500" />
              )}
            </div>
            {provider.company && (
              <div className="mt-0.5 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{provider.company}</span>
              </div>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            {provider.specialty}
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <RatingStars rating={provider.rating ?? 0} />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            ({provider.reviewCount} {provider.reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[hsl(var(--muted-foreground))]">
          {provider.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{provider.phone}</span>
            </div>
          )}
          {provider.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{provider.email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
