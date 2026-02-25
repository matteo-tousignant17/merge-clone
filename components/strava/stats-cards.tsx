import { StravaStats, formatDistance, formatDuration, formatElevation } from "@/lib/strava-utils";

interface StatCardProps {
  title: string;
  emoji: string;
  count: number;
  distance: number;
  movingTime: number;
  elevationGain: number;
  period: "recent" | "ytd" | "all";
}

const periodLabels = { recent: "Last 4 weeks", ytd: "This year", all: "All time" };

function StatCard({ title, emoji, count, distance, movingTime, elevationGain, period }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{emoji}</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400">{periodLabels[period]}</p>
        </div>
        <span className="ml-auto text-2xl font-bold text-gray-900">{count}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-800">{formatDistance(distance, 0)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Distance</p>
        </div>
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-800">{formatDuration(movingTime)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Time</p>
        </div>
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-800">{formatElevation(elevationGain)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Elevation</p>
        </div>
      </div>
    </div>
  );
}

export function StatsCards({ stats, period }: { stats: StravaStats; period: "recent" | "ytd" | "all" }) {
  const key = period === "recent" ? "recent" : period === "ytd" ? "ytd" : "all";

  const runTotals = stats[`${key}_run_totals` as keyof StravaStats] as any;
  const rideTotals = stats[`${key}_ride_totals` as keyof StravaStats] as any;
  const swimTotals = stats[`${key}_swim_totals` as keyof StravaStats] as any;

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        title="Running"
        emoji="🏃"
        count={runTotals.count}
        distance={runTotals.distance}
        movingTime={runTotals.moving_time}
        elevationGain={runTotals.elevation_gain}
        period={period}
      />
      <StatCard
        title="Cycling"
        emoji="🚴"
        count={rideTotals.count}
        distance={rideTotals.distance}
        movingTime={rideTotals.moving_time}
        elevationGain={rideTotals.elevation_gain}
        period={period}
      />
      <StatCard
        title="Swimming"
        emoji="🏊"
        count={swimTotals.count}
        distance={swimTotals.distance}
        movingTime={swimTotals.moving_time}
        elevationGain={swimTotals.elevation_gain}
        period={period}
      />
    </div>
  );
}
