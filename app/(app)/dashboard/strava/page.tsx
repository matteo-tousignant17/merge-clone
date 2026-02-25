"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, ExternalLink, AlertCircle, Link2, Code2 } from "lucide-react";
import {
  StravaAthlete, StravaActivity, StravaStats,
  groupByWeek, groupByType, buildPaceSeries
} from "@/lib/strava-utils";
import { AthleteCard } from "@/components/strava/athlete-card";
import { StatsCards } from "@/components/strava/stats-cards";
import { DistanceChart } from "@/components/strava/distance-chart";
import { ActivityTypeChart } from "@/components/strava/activity-type-chart";
import { PaceChart } from "@/components/strava/pace-chart";
import { ActivityList } from "@/components/strava/activity-list";

type Period = "recent" | "ytd" | "all";

export default function StravaDashboardPage() {
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [stats, setStats] = useState<StravaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("ytd");
  const [refreshing, setRefreshing] = useState(false);

  async function fetchAll(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [athleteRes, activitiesRes, statsRes] = await Promise.all([
        fetch("/api/strava/athlete"),
        fetch("/api/strava/activities?per_page=50"),
        fetch("/api/strava/stats"),
      ]);

      if (athleteRes.status === 401) {
        setError("not_connected");
        return;
      }

      if (!athleteRes.ok || !activitiesRes.ok || !statsRes.ok) {
        throw new Error("API error");
      }

      const [athleteData, activitiesData, statsData] = await Promise.all([
        athleteRes.json(),
        activitiesRes.json(),
        statsRes.json(),
      ]);

      setAthlete(athleteData);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setStats(statsData);
    } catch (e) {
      setError("fetch_error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FC4C02" }}>
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Strava Dashboard</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 size={32} className="animate-spin text-orange-400" />
          <p className="text-gray-500 text-sm">Loading your Strava data…</p>
        </div>
      </div>
    );
  }

  // ── Not connected ────────────────────────────────────────────────
  if (error === "not_connected") {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Strava Dashboard</h1>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Link2 size={28} className="text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Strava not connected</h2>
          <p className="text-gray-500 text-sm mb-6">
            Connect your Strava account to see your activities, stats, and personalized insights.
          </p>
          <Link
            href="/integrations/strava"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl"
            style={{ backgroundColor: "#FC4C02" }}
          >
            Connect Strava
          </Link>
        </div>
      </div>
    );
  }

  // ── Fetch error ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Strava Dashboard</h1>
        <div className="max-w-md mx-auto text-center py-16">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-900 mb-1">Failed to load data</h2>
          <p className="text-gray-500 text-sm mb-4">There was a problem connecting to the Strava API.</p>
          <button
            onClick={() => fetchAll()}
            className="flex items-center gap-2 mx-auto px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={13} /> Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Data ready ───────────────────────────────────────────────────
  const weeklyData = groupByWeek(activities);
  const typeData = groupByType(activities);
  const paceData = buildPaceSeries(activities);

  // Filter pace data to most common activity type for coherent chart
  const topType = typeData[0]?.type;
  const filteredPace = paceData.filter(p => p.type === topType || paceData.length < 5);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FC4C02" }}>
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Strava Dashboard</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
            Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {(["recent", "ytd", "all"] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p === "recent" ? "Recent" : p === "ytd" ? "This year" : "All time"}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          <Link
            href="/integrations/strava/remote-data"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Code2 size={12} />
            Remote Data
          </Link>
          <Link
            href="https://www.strava.com/athlete/training"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ExternalLink size={12} />
            Open Strava
          </Link>
        </div>
      </div>

      {/* Athlete card */}
      {athlete && <AthleteCard athlete={athlete} />}

      {/* Stats cards */}
      {stats && <StatsCards stats={stats} period={period} />}

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Distance by week — 2 cols */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Distance by week</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 12 weeks · km</p>
            </div>
            <span className="text-xs text-gray-400">{activities.length} activities loaded</span>
          </div>
          <DistanceChart data={weeklyData} />
        </div>

        {/* Activity type donut — 1 col */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Activity breakdown</h3>
          <ActivityTypeChart data={typeData} />
        </div>
      </div>

      {/* Pace/speed trend */}
      {filteredPace.length > 2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">
                {topType === "Ride" || topType?.includes("Ride") ? "Speed" : "Pace"} trend
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Last {filteredPace.length} {topType?.toLowerCase() ?? "activity"} activities ·{" "}
                {topType === "Ride" ? "km/h" : "min/km (lower = faster)"}
              </p>
            </div>
          </div>
          <PaceChart data={filteredPace} />
        </div>
      )}

      {/* Activity list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Recent activities</h3>
          <span className="text-xs text-gray-400">Showing last {Math.min(activities.length, 20)}</span>
        </div>
        <ActivityList activities={activities} limit={20} />
      </div>
    </div>
  );
}
