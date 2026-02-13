"use client";

import * as React from "react";
import {
  Droplets,
  Flame,
  Wind,
  Thermometer,
  CloudOff,
  Shield,
  Loader2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ClimateRiskProfile {
  flood: { score: number; zone: string; description: string };
  fire: { score: number; description: string };
  wind: { score: number; description: string };
  heat: { score: number; description: string };
  drought: { score: number; description: string };
  overallRisk: number;
  recommendations: string[];
}

interface ClimateRiskCardProps {
  homeId: string;
}

function getRiskColor(score: number): string {
  if (score <= 33) return "text-emerald-500";
  if (score <= 66) return "text-amber-500";
  return "text-red-500";
}

function getRiskBgColor(score: number): string {
  if (score <= 33) return "bg-emerald-500";
  if (score <= 66) return "bg-amber-500";
  return "bg-red-500";
}

function getRiskLabel(score: number): string {
  if (score <= 33) return "Low";
  if (score <= 66) return "Moderate";
  return "High";
}

function RiskGauge({
  label,
  score,
  icon: Icon,
  description,
}: {
  label: string;
  score: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("h-4 w-4", getRiskColor(score))} />
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
          </span>
        </div>
        <span className={cn("text-sm font-semibold", getRiskColor(score))}>
          {score}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className={cn("h-full rounded-full transition-all", getRiskBgColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        {description}
      </p>
    </div>
  );
}

export function ClimateRiskCard({ homeId }: ClimateRiskCardProps) {
  const [data, setData] = React.useState<ClimateRiskProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchRisk() {
      try {
        const res = await fetch(`/api/homes/${homeId}/climate-risk`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error ?? "Failed to load climate risk data");
        }
      } catch {
        setError("Failed to load climate risk data");
      } finally {
        setLoading(false);
      }
    }

    fetchRisk();
  }, [homeId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-teal-500" />
            Climate Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-teal-500" />
            Climate Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-teal-500" />
            Climate Risk Assessment
          </CardTitle>
          {/* Overall risk badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-white",
              getRiskBgColor(data.overallRisk)
            )}
          >
            {data.overallRisk}
            <span className="text-xs font-normal opacity-90">
              / 100 {getRiskLabel(data.overallRisk)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk gauges */}
        <div className="space-y-4">
          <RiskGauge
            label="Flood"
            score={data.flood.score}
            icon={Droplets}
            description={`Zone ${data.flood.zone} - ${data.flood.description}`}
          />
          <RiskGauge
            label="Wildfire"
            score={data.fire.score}
            icon={Flame}
            description={data.fire.description}
          />
          <RiskGauge
            label="Wind / Storm"
            score={data.wind.score}
            icon={Wind}
            description={data.wind.description}
          />
          <RiskGauge
            label="Extreme Heat"
            score={data.heat.score}
            icon={Thermometer}
            description={data.heat.description}
          />
          <RiskGauge
            label="Drought"
            score={data.drought.score}
            icon={CloudOff}
            description={data.drought.description}
          />
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--foreground))]">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Recommendations
            </h4>
            <ul className="space-y-1.5">
              {data.recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
