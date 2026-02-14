"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  month: string;
  mrr: number;
  subscribers: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  loading?: boolean;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
        </CardContent>
      </Card>
    );
  }

  const maxMrr = Math.max(...data.map((d) => d.mrr), 1);
  const chartWidth = 800;
  const chartHeight = 300;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const niceMax = getNiceMax(maxMrr);
  const yTicks = getYTicks(niceMax);

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
    const y = paddingTop + plotHeight - (d.mrr / niceMax) * plotHeight;
    return { x, y, ...d };
  });

  const linePath =
    points.length > 0
      ? `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`
      : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${paddingTop + plotHeight} L ${points[0].x},${paddingTop + plotHeight} Z`
      : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
            No revenue data available yet.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {yTicks.map((tick) => {
              const y = paddingTop + plotHeight - (tick / niceMax) * plotHeight;
              return (
                <g key={tick}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="hsl(var(--border))"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-[hsl(var(--muted-foreground))] text-[11px]"
                  >
                    ${formatCompact(tick)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="hsl(var(--primary))" opacity={0.08} />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                {/* Tooltip on hover - show value above point */}
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="fill-[hsl(var(--foreground))] text-[10px] font-medium opacity-0 hover:opacity-100"
                >
                  ${p.mrr.toLocaleString()}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-[hsl(var(--muted-foreground))] text-[11px]"
              >
                {p.month}
              </text>
            ))}

            {/* Axes */}
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={paddingTop + plotHeight}
              stroke="hsl(var(--border))"
            />
            <line
              x1={paddingLeft}
              y1={paddingTop + plotHeight}
              x2={chartWidth - paddingRight}
              y2={paddingTop + plotHeight}
              stroke="hsl(var(--border))"
            />
          </svg>
        )}
      </CardContent>
    </Card>
  );
}

function getNiceMax(max: number): number {
  if (max <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalized = max / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function getYTicks(niceMax: number): number[] {
  const step = niceMax / 4;
  return [0, step, step * 2, step * 3, niceMax];
}

function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return value.toString();
}
