export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  summit: boolean;
  profile_medium: string;
  profile: string;
  follower_count: number;
  friend_count: number;
  created_at: string;
  weight: number;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;         // meters
  moving_time: number;      // seconds
  elapsed_time: number;     // seconds
  total_elevation_gain: number; // meters
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;    // m/s
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  has_heartrate: boolean;
  kudos_count: number;
  achievement_count: number;
  elev_high?: number;
  elev_low?: number;
  map?: { summary_polyline: string };
}

export interface StravaStatTotals {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
}

export interface StravaStats {
  biggest_ride_distance: number;
  biggest_climb_elevation_gain: number;
  recent_ride_totals: StravaStatTotals;
  recent_run_totals: StravaStatTotals;
  recent_swim_totals: StravaStatTotals;
  ytd_ride_totals: StravaStatTotals;
  ytd_run_totals: StravaStatTotals;
  ytd_swim_totals: StravaStatTotals;
  all_ride_totals: StravaStatTotals;
  all_run_totals: StravaStatTotals;
  all_swim_totals: StravaStatTotals;
}

// ─── Formatting ────────────────────────────────────────────────

export function formatDistance(meters: number, decimals = 1): string {
  const km = meters / 1000;
  return `${km.toFixed(decimals)} km`;
}

export function formatPace(speedMs: number, type: string): string {
  if (speedMs <= 0) return "—";
  const isRun = ["Run", "Walk", "Hike", "TrailRun", "VirtualRun"].includes(type);
  if (isRun) {
    // pace: min/km
    const secsPerKm = 1000 / speedMs;
    const mins = Math.floor(secsPerKm / 60);
    const secs = Math.round(secsPerKm % 60);
    return `${mins}:${String(secs).padStart(2, "0")} /km`;
  }
  // speed: km/h
  const kmh = speedMs * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m`;
}

export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getActivityEmoji(type: string): string {
  const map: Record<string, string> = {
    Run: "🏃",
    TrailRun: "🏔️",
    VirtualRun: "🏃",
    Ride: "🚴",
    VirtualRide: "🚴",
    MountainBikeRide: "🚵",
    GravelRide: "🚴",
    EBikeRide: "⚡",
    Swim: "🏊",
    Walk: "🚶",
    Hike: "🥾",
    AlpineSki: "⛷️",
    BackcountrySki: "🎿",
    Snowboard: "🏂",
    Yoga: "🧘",
    WeightTraining: "🏋️",
    Workout: "💪",
    Rowing: "🚣",
    Kayaking: "🛶",
    Soccer: "⚽",
    Tennis: "🎾",
  };
  return map[type] ?? "⚡";
}

export function getActivityColor(type: string): string {
  const map: Record<string, string> = {
    Run: "#FC4C02",
    TrailRun: "#e05a1a",
    Ride: "#3b82f6",
    VirtualRide: "#60a5fa",
    MountainBikeRide: "#1d4ed8",
    Swim: "#06b6d4",
    Walk: "#22c55e",
    Hike: "#16a34a",
    AlpineSki: "#a855f7",
    WeightTraining: "#f59e0b",
    Workout: "#f59e0b",
  };
  return map[type] ?? "#6b7280";
}

// ─── Aggregation helpers ────────────────────────────────────────

export interface WeeklyDistance {
  week: string;
  distance: number;
  count: number;
}

export function groupByWeek(activities: StravaActivity[]): WeeklyDistance[] {
  const map = new Map<string, WeeklyDistance>();

  for (const a of activities) {
    const d = new Date(a.start_date_local);
    // Get Monday of that week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const key = monday.toISOString().slice(0, 10);
    const label = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (!map.has(key)) map.set(key, { week: label, distance: 0, count: 0 });
    const entry = map.get(key)!;
    entry.distance += a.distance / 1000; // km
    entry.count += 1;
  }

  return Array.from(map.values()).slice(-12); // last 12 weeks
}

export interface TypeBreakdown {
  type: string;
  count: number;
  distance: number;
  color: string;
}

export function groupByType(activities: StravaActivity[]): TypeBreakdown[] {
  const map = new Map<string, TypeBreakdown>();

  for (const a of activities) {
    const type = a.sport_type ?? a.type;
    if (!map.has(type)) {
      map.set(type, { type, count: 0, distance: 0, color: getActivityColor(type) });
    }
    const entry = map.get(type)!;
    entry.count += 1;
    entry.distance += a.distance / 1000;
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export interface PacePoint {
  name: string;
  pace: number;    // for display: secs/km for runs, km/h for rides
  label: string;
  type: string;
}

export function buildPaceSeries(activities: StravaActivity[]): PacePoint[] {
  return activities
    .slice(0, 30)
    .reverse()
    .map((a, i) => {
      const type = a.sport_type ?? a.type;
      const isRun = ["Run", "TrailRun", "Walk", "Hike"].includes(type);
      const pace = isRun
        ? a.average_speed > 0 ? 1000 / a.average_speed / 60 : 0  // min/km
        : a.average_speed * 3.6; // km/h

      return {
        name: `#${i + 1}`,
        pace: parseFloat(pace.toFixed(2)),
        label: formatPace(a.average_speed, type),
        type,
      };
    });
}
