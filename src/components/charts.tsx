"use client";

import { cn } from "@/lib/utils";
import type { TrendPoint } from "@/types";

export function LineChart({
  data,
  height = 180,
  color = "#f5b942",
  className,
  formatValue,
}: {
  data: TrendPoint[];
  height?: number;
  color?: string;
  className?: string;
  formatValue?: (v: number) => string;
}) {
  const width = 600;
  const padding = 8;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((d.value - min) / range) * (height - padding * 2);
    return { x, y, ...d };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#line-fill)" />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <circle
            key={p.label}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={color}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/60">
        <span>{points[0]?.label}</span>
        <span>{formatValue ? formatValue(max) : max.toLocaleString()}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function BarChart({
  data,
  height = 180,
  color = "#a34ae0",
  className,
  formatValue,
}: {
  data: TrendPoint[];
  height?: number;
  color?: string;
  className?: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  const range = 8;

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex w-full items-end gap-2"
        style={{ height }}
      >
        {data.map((d) => {
          const h = (d.value / max) * 100;
          return (
            <div
              key={d.label}
              className="group relative flex h-full flex-1 items-end"
            >
              <div
                className={cn(
                  "w-full rounded-t-md bg-gradient-to-t transition-all duration-300 group-hover:from-purple/80",
                  color.includes("gold")
                    ? "from-gold/80 to-gold/40"
                    : "from-purple/80 to-purple/30"
                )}
                style={{
                  height: `${Math.max(h, range)}%`,
                  background: `linear-gradient(to top, ${color}cc, ${color}55)`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/60">
        <span>{data[0]?.label}</span>
        <span>{formatValue ? formatValue(max) : max.toLocaleString()}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function RetentionCurve({
  data,
  height = 200,
  className,
}: {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
}) {
  const width = 600;
  const padding = 8;
  const max = 100;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.value / max) * (height - padding * 2);
    return { x, y, ...d };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="retention-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5b942" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f5b942" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#retention-fill)" />
        <path
          d={path}
          fill="none"
          stroke="#f5b942"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/60">
        <span>{points[0]?.label}</span>
        <span>{"100%"}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}