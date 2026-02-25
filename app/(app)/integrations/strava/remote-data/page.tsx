"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Code2, Loader2, AlertCircle, Link2 } from "lucide-react";
import { StravaActivity, StravaAthlete, formatDate } from "@/lib/strava-utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type ModelType = "activity" | "athlete";

interface FieldMapping {
  mergeField: string;
  mergeType: string;
  stravaField: string | null;
  status: "direct" | "transformed" | "computed";
  transform?: string;
  getValue: (data: any) => any;
}

// ── Mapping definitions ────────────────────────────────────────────────────────

const ACTIVITY_MAPPINGS: FieldMapping[] = [
  { mergeField: "id", mergeType: "integer", stravaField: "id", status: "direct", getValue: (a) => a.id },
  { mergeField: "remote_id", mergeType: "string", stravaField: "id", status: "transformed", transform: "Integer → String", getValue: (a) => String(a.id) },
  { mergeField: "name", mergeType: "string", stravaField: "name", status: "direct", getValue: (a) => a.name },
  { mergeField: "type", mergeType: "ActivityTypeEnum", stravaField: "sport_type", status: "transformed", transform: '"Run" → "RUN"', getValue: (a) => (a.sport_type ?? a.type)?.toUpperCase() },
  { mergeField: "start_date", mergeType: "datetime", stravaField: "start_date", status: "direct", getValue: (a) => a.start_date },
  { mergeField: "distance_meters", mergeType: "float", stravaField: "distance", status: "direct", getValue: (a) => a.distance },
  { mergeField: "duration_seconds", mergeType: "integer", stravaField: "moving_time", status: "direct", getValue: (a) => a.moving_time },
  { mergeField: "elapsed_seconds", mergeType: "integer", stravaField: "elapsed_time", status: "direct", getValue: (a) => a.elapsed_time },
  { mergeField: "elevation_gain_meters", mergeType: "float", stravaField: "total_elevation_gain", status: "direct", getValue: (a) => a.total_elevation_gain },
  { mergeField: "average_speed_ms", mergeType: "float", stravaField: "average_speed", status: "direct", getValue: (a) => a.average_speed },
  { mergeField: "average_heart_rate", mergeType: "float", stravaField: "average_heartrate", status: "direct", getValue: (a) => a.average_heartrate ?? null },
  { mergeField: "max_heart_rate", mergeType: "float", stravaField: "max_heartrate", status: "direct", getValue: (a) => a.max_heartrate ?? null },
  { mergeField: "has_heart_rate", mergeType: "boolean", stravaField: "has_heartrate", status: "direct", getValue: (a) => a.has_heartrate },
  { mergeField: "kudos_count", mergeType: "integer", stravaField: null, status: "computed", transform: "Not in Merge model — available as remote_data", getValue: () => null },
];

const ACTIVITY_UNMAPPED = [
  "achievement_count", "comment_count", "athlete_count", "photo_count",
  "map", "trainer", "commute", "manual", "private", "visibility",
  "gear_id", "average_cadence", "elev_high", "elev_low", "upload_id",
  "external_id", "pr_count", "suffer_score", "calories", "flagged",
  "workout_type", "utc_offset", "timezone", "start_latlng",
];

const ATHLETE_MAPPINGS: FieldMapping[] = [
  { mergeField: "id", mergeType: "integer", stravaField: "id", status: "direct", getValue: (a) => a.id },
  { mergeField: "remote_id", mergeType: "string", stravaField: "id", status: "transformed", transform: "Integer → String", getValue: (a) => String(a.id) },
  { mergeField: "first_name", mergeType: "string", stravaField: "firstname", status: "direct", getValue: (a) => a.firstname },
  { mergeField: "last_name", mergeType: "string", stravaField: "lastname", status: "direct", getValue: (a) => a.lastname },
  { mergeField: "city", mergeType: "string", stravaField: "city", status: "direct", getValue: (a) => a.city },
  { mergeField: "state", mergeType: "string", stravaField: "state", status: "direct", getValue: (a) => a.state },
  { mergeField: "country", mergeType: "string", stravaField: "country", status: "direct", getValue: (a) => a.country },
  { mergeField: "sex", mergeType: "GenderEnum", stravaField: "sex", status: "direct", getValue: (a) => a.sex },
  { mergeField: "premium", mergeType: "boolean", stravaField: "summit", status: "transformed", transform: "Merged 'premium' + 'summit' flags", getValue: (a) => a.premium || a.summit },
  { mergeField: "profile_url", mergeType: "string", stravaField: "profile", status: "direct", getValue: (a) => a.profile },
  { mergeField: "weight_kg", mergeType: "float", stravaField: "weight", status: "direct", getValue: (a) => a.weight },
  { mergeField: "follower_count", mergeType: "integer", stravaField: "follower_count", status: "direct", getValue: (a) => a.follower_count },
];

const ATHLETE_UNMAPPED = [
  "username", "resource_state", "athlete_type", "date_preference",
  "measurement_preference", "ftp", "bikes", "shoes", "clubs",
  "created_at", "updated_at", "badge_type_id",
];

// ── JSON Viewer ────────────────────────────────────────────────────────────────

function renderValue(value: any, depth = 0): React.ReactNode {
  if (value === null || value === undefined)
    return <span style={{ color: "#6b7280" }}>null</span>;
  if (typeof value === "boolean")
    return <span style={{ color: "#c4b5fd" }}>{String(value)}</span>;
  if (typeof value === "number")
    return <span style={{ color: "#93c5fd" }}>{value}</span>;
  if (typeof value === "string") {
    const s = value.length > 72 ? value.slice(0, 72) + "…" : value;
    return <span style={{ color: "#86efac" }}>"{s}"</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: "#94a3b8" }}>[]</span>;
    if (depth >= 1) return <span style={{ color: "#94a3b8" }}>[…{value.length}]</span>;
    return (
      <>
        <span style={{ color: "#94a3b8" }}>{"["}</span>
        <br />
        {value.slice(0, 2).map((item, i) => (
          <span key={i}>
            {"  ".repeat(depth + 1)}{renderValue(item, depth + 1)}
            {i < Math.min(value.length, 2) - 1 && <span style={{ color: "#94a3b8" }}>,</span>}
            <br />
          </span>
        ))}
        {value.length > 2 && (
          <>
            {"  ".repeat(depth + 1)}
            <span style={{ color: "#6b7280" }}>…{value.length - 2} more</span>
            <br />
          </>
        )}
        {"  ".repeat(depth)}<span style={{ color: "#94a3b8" }}>{"]"}</span>
      </>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return <span style={{ color: "#94a3b8" }}>{"{}"}</span>;
    if (depth >= 1) return <span style={{ color: "#94a3b8" }}>{"{"}{entries.length} fields{"}"}</span>;
    return (
      <>
        <span style={{ color: "#94a3b8" }}>{"{"}</span>
        <br />
        {entries.map(([k, v], i) => (
          <span key={k}>
            {"  ".repeat(depth + 1)}
            <span style={{ color: "#f1f5f9" }}>"{k}"</span>
            <span style={{ color: "#94a3b8" }}>: </span>
            {renderValue(v, depth + 1)}
            {i < entries.length - 1 && <span style={{ color: "#94a3b8" }}>,</span>}
            <br />
          </span>
        ))}
        {"  ".repeat(depth)}<span style={{ color: "#94a3b8" }}>{"}"}</span>
      </>
    );
  }
  return <span>{String(value)}</span>;
}

function JsonViewer({ data, highlightKey }: { data: any; highlightKey: string | null }) {
  if (!data || typeof data !== "object") return null;
  const entries = Object.entries(data);

  return (
    <div className="font-mono text-xs leading-5 select-text">
      <div style={{ color: "#94a3b8" }}>{"{"}</div>
      {entries.map(([key, value], i) => {
        const lit = key === highlightKey;
        return (
          <div
            key={key}
            className="px-3 rounded-sm transition-colors duration-100"
            style={{ backgroundColor: lit ? "rgba(59,130,246,0.18)" : "transparent" }}
          >
            <span style={{ color: lit ? "#60a5fa" : "#94a3b8", fontWeight: lit ? 600 : 400 }}>
              "{key}"
            </span>
            <span style={{ color: "#475569" }}>: </span>
            {renderValue(value, 0)}
            {i < entries.length - 1 && <span style={{ color: "#475569" }}>,</span>}
          </div>
        );
      })}
      <div style={{ color: "#94a3b8" }}>{"}"}</div>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FieldMapping["status"] }) {
  const styles = {
    direct: { bg: "rgba(16,185,129,0.12)", color: "#34d399", label: "Direct" },
    transformed: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", label: "Transformed" },
    computed: { bg: "rgba(99,102,241,0.12)", color: "#818cf8", label: "Computed" },
  }[status];
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
      style={{ backgroundColor: styles.bg, color: styles.color }}
    >
      {styles.label}
    </span>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function RemoteDataPage() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [model, setModel] = useState<ModelType>("activity");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [actsRes, athRes] = await Promise.all([
          fetch("/api/strava/activities?per_page=20"),
          fetch("/api/strava/athlete"),
        ]);
        if (actsRes.status === 401) { setError("not_connected"); return; }
        if (!actsRes.ok || !athRes.ok) throw new Error("API error");
        const [acts, ath] = await Promise.all([actsRes.json(), athRes.json()]);
        setActivities(Array.isArray(acts) ? acts : []);
        setAthlete(ath);
        if (Array.isArray(acts) && acts.length > 0) setSelectedId(acts[0].id);
      } catch {
        setError("fetch_error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selected = model === "activity"
    ? activities.find((a) => a.id === selectedId) ?? null
    : athlete;

  const mappings = model === "activity" ? ACTIVITY_MAPPINGS : ATHLETE_MAPPINGS;
  const unmapped = model === "activity" ? ACTIVITY_UNMAPPED : ATHLETE_UNMAPPED;
  const modelLabel = model === "activity" ? "Activity" : "Athlete";

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={28} className="animate-spin text-orange-400" />
        <p className="text-sm text-gray-500">Loading data…</p>
      </div>
    );
  }

  if (error === "not_connected") {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-24">
        <Link2 size={28} className="text-orange-400 mx-auto mb-3" />
        <h2 className="font-semibold text-gray-900 mb-2">Strava not connected</h2>
        <Link href="/integrations/strava" className="text-sm text-blue-600 hover:underline">
          Connect account →
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-24">
        <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Failed to load data from Strava.</p>
      </div>
    );
  }

  // ── Data ─────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <Link href="/integrations/strava" className="hover:text-gray-600 transition-colors">
            Strava
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-600 font-medium">Remote Data</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Code2 size={18} className="text-orange-500" />
              <h1 className="text-lg font-semibold text-gray-900">Remote Data Inspector</h1>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              See the raw Strava API response alongside the normalized Merge Common Model.
              Hover a field to highlight its source in the provider response.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Model switcher */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {(["activity", "athlete"] as ModelType[]).map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors capitalize ${
                model === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Activity selector (only in activity mode) */}
        {model === "activity" && activities.length > 0 && (
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {formatDate(a.start_date_local)}
              </option>
            ))}
          </select>
        )}

        {/* Field counts */}
        <span className="ml-auto text-xs text-gray-400">
          {mappings.filter(m => m.status !== "computed").length} mapped ·{" "}
          {unmapped.length} unmapped
        </span>
      </div>

      {/* Main inspector */}
      <div className="grid grid-cols-2 gap-4 items-start">
        {/* LEFT: Raw JSON */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "#0d1627", borderColor: "#1e293b" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "#1e293b" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs font-semibold text-slate-300">Provider Response</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Strava API v3</span>
          </div>
          {/* JSON */}
          <div className="p-4 overflow-y-auto max-h-[640px]">
            {selected ? (
              <JsonViewer data={selected} highlightKey={hoveredField} />
            ) : (
              <p className="text-slate-500 text-xs italic">No data selected</p>
            )}
          </div>
        </div>

        {/* RIGHT: Common Model */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-gray-700">Merge Common Model</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{modelLabel}</span>
          </div>

          {/* Mapped fields */}
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2">Field</th>
                  <th className="text-left text-[10px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2">Type</th>
                  <th className="text-left text-[10px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2">Source</th>
                  <th className="text-right text-[10px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2">Value</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mappings.map((m) => {
                  const val = selected ? m.getValue(selected) : undefined;
                  const isHovered = hoveredField === m.stravaField && m.stravaField !== null;
                  return (
                    <tr
                      key={m.mergeField}
                      className="transition-colors cursor-default"
                      style={{ backgroundColor: isHovered ? "#eff6ff" : "transparent" }}
                      onMouseEnter={() => setHoveredField(m.stravaField)}
                      onMouseLeave={() => setHoveredField(null)}
                    >
                      {/* Merge field name */}
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs text-gray-800 font-medium">{m.mergeField}</span>
                      </td>
                      {/* Type */}
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                          {m.mergeType}
                        </span>
                      </td>
                      {/* Source Strava field */}
                      <td className="px-4 py-2.5">
                        {m.stravaField ? (
                          <span
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                            style={{ color: isHovered ? "#2563eb" : "#64748b", backgroundColor: isHovered ? "#dbeafe" : "#f1f5f9" }}
                          >
                            {m.stravaField}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-300 italic">—</span>
                        )}
                      </td>
                      {/* Resolved value */}
                      <td className="px-4 py-2.5 text-right">
                        {val !== undefined && val !== null ? (
                          <span className="font-mono text-xs text-gray-700 truncate max-w-[120px] inline-block">
                            {typeof val === "string" && val.length > 24
                              ? `"${val.slice(0, 24)}…"`
                              : typeof val === "string"
                              ? `"${val}"`
                              : String(val)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      {/* Status badge */}
                      <td className="px-4 py-2.5 text-right">
                        <StatusBadge status={m.status} />
                        {m.transform && (
                          <span
                            className="ml-1.5 text-[10px] text-gray-400 italic hidden group-hover:inline"
                            title={m.transform}
                          >
                            ⚡ {m.transform}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Unmapped / Additional fields section */}
          <div className="border-t border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Additional Fields
              </span>
              <span className="text-[10px] text-gray-300">
                — not in the Common Model, accessible via <span className="font-mono">remote_data</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unmapped.map((field) => (
                <span
                  key={field}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-400"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-gray-400">
        <span className="font-medium text-gray-500">Field status:</span>
        {(["direct", "transformed", "computed"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <StatusBadge status={s} />
            <span>
              {s === "direct" && "1:1 mapping, no change"}
              {s === "transformed" && "Value normalized or converted"}
              {s === "computed" && "Not in Merge Common Model"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
