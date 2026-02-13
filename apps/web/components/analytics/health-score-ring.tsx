"use client";

import { useEffect, useState } from "react";

interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function HealthScoreRing({
  score,
  size = 180,
  strokeWidth = 14,
  label = "Health Score",
}: HealthScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const dashOffset = circumference - progress;

  // Color based on score
  const getColor = (s: number) => {
    if (s <= 40) return { stroke: "#ef4444", text: "text-red-500", label: "Needs Attention" };
    if (s <= 70) return { stroke: "#f59e0b", text: "text-amber-500", label: "Fair" };
    return { stroke: "#00B4A0", text: "text-teal-500", label: "Good" };
  };

  const color = getColor(score);

  useEffect(() => {
    // Animate from 0 to score
    const duration = 1200;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(score, Math.round(increment * step));
      setAnimatedScore(current);
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${color.text}`}>
            {animatedScore}
          </span>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            out of 100
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
          {label}
        </p>
        <p className={`text-xs font-medium ${color.text}`}>{color.label}</p>
      </div>
    </div>
  );
}
