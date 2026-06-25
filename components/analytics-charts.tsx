"use client";

import { formatCurrency } from "@/lib/format";

const chartColors = ["#0f172a", "#0d9488", "#2563eb", "#d97706", "#dc2626", "#7c3aed"];

type ChartPoint = {
  label: string;
  value: number;
};

export function AnalyticsCharts({
  currency,
  lineData,
  pieData,
}: {
  currency: string;
  lineData: ChartPoint[];
  pieData: ChartPoint[];
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <ChartPanel title="Spending by category">
        <PieChart data={pieData} currency={currency} />
      </ChartPanel>
      <ChartPanel title="Monthly cost trend">
        <LineChart data={lineData} currency={currency} />
      </ChartPanel>
    </section>
  );
}

function ChartPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function PieChart({ currency, data }: { currency: string; data: ChartPoint[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  if (!data.length || total <= 0) {
    return <EmptyChart message="No active subscription spend yet." />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
      <svg aria-label="Spending by category pie chart" className="h-44 w-44" viewBox="0 0 42 42">
        <circle cx="21" cy="21" fill="transparent" r="15.915" stroke="#e2e8f0" strokeWidth="8" />
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const dashArray = `${percentage} ${100 - percentage}`;
          const segment = (
            <circle
              cx="21"
              cy="21"
              fill="transparent"
              key={item.label}
              r="15.915"
              stroke={chartColors[index % chartColors.length]}
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              strokeWidth="8"
            />
          );
          offset += percentage;
          return segment;
        })}
        <text
          className="fill-slate-950 text-[0.18rem] font-semibold"
          textAnchor="middle"
          x="21"
          y="20"
        >
          Total
        </text>
        <text
          className="fill-slate-500 text-[0.16rem]"
          textAnchor="middle"
          x="21"
          y="23"
        >
          {formatCurrency(total, currency)}
        </text>
      </svg>
      <div className="space-y-3">
        {data.slice(0, 6).map((item, index) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={item.label}>
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <span className="truncate text-slate-600">{item.label}</span>
            </div>
            <span className="font-medium text-slate-950">
              {formatCurrency(item.value, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ currency, data }: { currency: string; data: ChartPoint[] }) {
  const width = 420;
  const height = 180;
  const padding = 28;
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => {
    const x =
      padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (item.value / max) * (height - padding * 2);
    return { ...item, x, y };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  if (!data.length) {
    return <EmptyChart message="No trend data yet." />;
  }

  return (
    <div className="overflow-hidden">
      <svg aria-label="Monthly spending trend line chart" className="h-56 w-full" viewBox={`0 0 ${width} ${height}`}>
        <line
          stroke="#e2e8f0"
          strokeWidth="1"
          x1={padding}
          x2={width - padding}
          y1={height - padding}
          y2={height - padding}
        />
        <path d={path} fill="none" stroke="#0d9488" strokeLinecap="round" strokeWidth="3" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} fill="#0f766e" r="4" />
            <text
              className="fill-slate-500 text-[0.55rem]"
              textAnchor="middle"
              x={point.x}
              y={height - 8}
            >
              {point.label}
            </text>
          </g>
        ))}
        <text className="fill-slate-500 text-[0.55rem]" x={padding} y={16}>
          {formatCurrency(max, currency)}
        </text>
      </svg>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
      {message}
    </div>
  );
}
