"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TypeBreakdown, formatDistance } from "@/lib/strava-utils";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="font-semibold text-gray-900">{d.type}</p>
        <p className="text-gray-500 text-xs">{d.count} activities</p>
        <p className="text-gray-500 text-xs">{formatDistance(d.distance * 1000)}</p>
      </div>
    );
  }
  return null;
};

export function ActivityTypeChart({ data }: { data: TypeBreakdown[] }) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            dataKey="count"
            nameKey="type"
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {data.slice(0, 6).map((entry) => (
          <div key={entry.type} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-gray-600 truncate">{entry.type}</span>
            </div>
            <span className="text-xs font-semibold text-gray-800 flex-shrink-0">{entry.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
