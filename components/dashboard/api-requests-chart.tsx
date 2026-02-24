"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { apiRequestData } from "@/lib/mock-data";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="text-gray-500 mb-0.5">{label}</p>
        <p className="font-semibold text-gray-900">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function ApiRequestsChart() {
  const total = apiRequestData[apiRequestData.length - 1].requests;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Total API requests</p>
          <p className="text-3xl font-bold text-gray-900">{total.toLocaleString()}</p>
        </div>
        <select className="text-xs text-gray-500 border border-gray-200 rounded-md px-2 py-1 bg-white">
          <option>Last 11 months</option>
          <option>Last 30 days</option>
          <option>Last 7 days</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={apiRequestData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatNumber}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="requests"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
