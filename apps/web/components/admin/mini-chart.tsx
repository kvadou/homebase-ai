"use client";

import { cn } from "@/lib/utils";

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export function MiniChart({
  data,
  color = "hsl(var(--primary))",
  height = 40,
  className,
}: MiniChartProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;
  const width = 120;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = points.map((p, i) => (i === 0 ? `M ${p}` : `L ${p}`)).join(" ");

  // Area fill path
  const firstX = padding;
  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2);
  const areaD = `${pathD} L ${lastX},${height} L ${firstX},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full", className)}
      style={{ height }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`gradient-${color.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaD}
        fill={`url(#gradient-${color.replace(/[^a-zA-Z0-9]/g, "")})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
