"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { WeeklyDistance } from "@/lib/strava-utils";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="font-bold text-gray-900">{payload[0].value.toFixed(1)} km</p>
        <p className="text-xs text-gray-400">{payload[0].payload.count} activities</p>
      </div>
    );
  }
  return null;
};

export function DistanceChart({ data }: { data: WeeklyDistance[] }) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.distance));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}km`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.distance === maxVal ? "#FC4C02" : "#fed7aa"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
