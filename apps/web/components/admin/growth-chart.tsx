"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GrowthDataPoint {
  month: string;
  signups: number;
  conversions: number;
}

interface GrowthChartProps {
  data: GrowthDataPoint[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No growth data available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxSignups = Math.max(...data.map((d) => d.signups), 1);
  const maxConversions = Math.max(...data.map((d) => d.conversions), 1);
  const maxValue = Math.max(maxSignups, maxConversions, 1);

  // Chart dimensions
  const width = 800;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 50;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Generate Y-axis ticks
  const yTicks: number[] = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(Math.round((maxValue / tickCount) * i));
  }

  function getX(index: number): number {
    return paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
  }

  function getY(value: number): number {
    return paddingTop + chartHeight - (value / maxValue) * chartHeight;
  }

  // Build path strings
  const signupsPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)},${getY(d.signups)}`)
    .join(" ");

  const conversionsPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)},${getY(d.conversions)}`)
    .join(" ");

  // Area fills
  const signupsArea = `${signupsPath} L ${getX(data.length - 1)},${getY(0)} L ${getX(0)},${getY(0)} Z`;
  const conversionsArea = `${conversionsPath} L ${getX(data.length - 1)},${getY(0)} L ${getX(0)},${getY(0)} Z`;

  const totalSignups = data.reduce((sum, d) => sum + d.signups, 0);
  const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Growth Trends</CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#00B4A0]" />
            <span className="text-[hsl(var(--muted-foreground))]">
              Signups ({totalSignups})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-[hsl(var(--muted-foreground))]">
              Conversions ({totalConversions})
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B4A0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00B4A0" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={getY(tick)}
                x2={width - paddingRight}
                y2={getY(tick)}
                stroke="hsl(var(--border))"
                strokeDasharray="4,4"
                strokeWidth="0.5"
              />
              <text
                x={paddingLeft - 8}
                y={getY(tick) + 4}
                textAnchor="end"
                className="fill-[hsl(var(--muted-foreground))]"
                fontSize="11"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={d.month}
              x={getX(i)}
              y={height - paddingBottom + 20}
              textAnchor="middle"
              className="fill-[hsl(var(--muted-foreground))]"
              fontSize="11"
            >
              {d.month}
            </text>
          ))}

          {/* Area fills */}
          <path d={signupsArea} fill="url(#signupGradient)" />
          <path d={conversionsArea} fill="url(#conversionGradient)" />

          {/* Lines */}
          <path
            d={signupsPath}
            fill="none"
            stroke="#00B4A0"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={conversionsPath}
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((d, i) => (
            <g key={`points-${i}`}>
              <circle cx={getX(i)} cy={getY(d.signups)} r="3.5" fill="#00B4A0" />
              <circle cx={getX(i)} cy={getY(d.conversions)} r="3.5" fill="#f97316" />
            </g>
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}
