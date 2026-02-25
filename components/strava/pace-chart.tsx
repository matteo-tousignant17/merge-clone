"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { PacePoint } from "@/lib/strava-utils";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload as PacePoint;
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="text-gray-500 text-xs mb-1">Activity {d.name}</p>
        <p className="font-bold text-gray-900">{d.label}</p>
        <p className="text-xs text-gray-400">{d.type}</p>
      </div>
    );
  }
  return null;
};

export function PaceChart({ data }: { data: PacePoint[] }) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  const avg = data.reduce((s, d) => s + d.pace, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          reversed
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={avg}
          stroke="#FC4C02"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: "avg", position: "right", fontSize: 10, fill: "#FC4C02" }}
        />
        <Line
          type="monotone"
          dataKey="pace"
          stroke="#FC4C02"
          strokeWidth={2}
          dot={{ r: 3, fill: "#FC4C02", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#FC4C02", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
