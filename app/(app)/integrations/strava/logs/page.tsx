"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight, RefreshCw, AlertCircle, CheckCircle2,
  Loader2, Zap, Link2, Activity,
} from "lucide-react";
import type { LogEntry, RateLimit, DiagnoseResult } from "@/app/api/strava/diagnose/route";

// ── Sub-components ─────────────────────────────────────────────────────────────

function RateLimitBar({
  usage, limit, label,
}: {
  usage: number; limit: number; label: string;
}) {
  const pct = Math.min(100, Math.round((usage / limit) * 100));
  const color = pct >= 80 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#3b82f6";
  const textColor = pct >= 80 ? "text-red-500" : pct >= 60 ? "text-amber-500" : "text-gray-700";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
          {usage.toLocaleString()} / {limit.toLocaleString()}
          <span className="font-normal text-gray-400 ml-1">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatusCode({ code }: { code: number }) {
  const cfg =
    code === 429 ? { bg: "#fef3c7", color: "#d97706" }
    : code < 300  ? { bg: "#dcfce7", color: "#16a34a" }
    : code < 500  ? { bg: "#fff7ed", color: "#ea580c" }
    :               { bg: "#fee2e2", color: "#dc2626" };
  return (
    <span
      className="inline-block font-mono text-xs font-bold px-1.5 py-0.5 rounded"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {code}
    </span>
  );
}

function LatencyBadge({ ms }: { ms: number }) {
  const slow = ms > 1000;
  return (
    <span className={`tabular-nums text-sm ${slow ? "text-amber-500 font-semibold" : "text-gray-600"}`}>
      {ms}ms{slow && <span className="ml-0.5 text-[10px] text-amber-400">▲</span>}
    </span>
  );
}

function getIssues(logs: LogEntry[], rl: RateLimit | null) {
  const issues: { severity: "error" | "warning"; message: string }[] = [];

  for (const log of logs) {
    if (log.status === 429) {
      issues.push({ severity: "error", message: `Rate limit exceeded on ${log.endpoint} — sync will be blocked until window resets` });
    } else if (log.status >= 500) {
      issues.push({ severity: "error", message: `Strava server error (${log.status}) on ${log.endpoint}` });
    } else if (log.status === 401) {
      issues.push({ severity: "error", message: `Authorization failed on ${log.endpoint} — access token may be expired or revoked` });
    } else if (log.status >= 400) {
      issues.push({ severity: "warning", message: `Client error (${log.status}) on ${log.endpoint} — check OAuth scopes` });
    }
    if (log.latency > 1000) {
      issues.push({ severity: "warning", message: `Slow response on ${log.endpoint}: ${log.latency}ms exceeds 1,000ms threshold` });
    }
  }

  if (rl) {
    const p15 = (rl.usage15m / rl.limit15m) * 100;
    const pDay = (rl.usageDay / rl.limitDay) * 100;
    if (p15 >= 80) {
      issues.push({
        severity: p15 >= 95 ? "error" : "warning",
        message: `15-min rate limit at ${Math.round(p15)}% (${rl.usage15m}/${rl.limit15m}) — approaching Strava's throttle threshold`,
      });
    }
    if (pDay >= 80) {
      issues.push({
        severity: pDay >= 95 ? "error" : "warning",
        message: `Daily budget at ${Math.round(pDay)}% (${rl.usageDay}/${rl.limitDay}) — consider reducing sync frequency`,
      });
    }
  }

  return issues;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function StravaLogsPage() {
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [displayed, setDisplayed] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [fetching, setFetching] = useState(false); // spinner row
  const [error, setError] = useState<string | null>(null);
  const [runCount, setRunCount] = useState(0);
  const [lastRun, setLastRun] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setFetching(true);
    setDisplayed([]);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/strava/diagnose");
      if (res.status === 401) { setError("not_connected"); return; }
      if (!res.ok) throw new Error();

      const data: DiagnoseResult = await res.json();
      setResult(data);
      setFetching(false);
      setLastRun(new Date().toLocaleTimeString());
      setRunCount((c) => c + 1);

      // Stream entries in with staggered delay
      data.logs.forEach((log, i) => {
        setTimeout(() => {
          setDisplayed((prev) => [...prev, log]);
          if (i === data.logs.length - 1) setRunning(false);
        }, i * 480);
      });
    } catch {
      setError("fetch_error");
      setFetching(false);
      setRunning(false);
    }
  }

  useEffect(() => { run(); }, []);

  const issues = result ? getIssues(displayed, result.rateLimit) : [];
  const done = !running && displayed.length > 0;
  const allGreen = done && displayed.every((l) => l.status < 300) && issues.length === 0;
  const avgLatency = displayed.length
    ? Math.round(displayed.reduce((s, l) => s + l.latency, 0) / displayed.length)
    : 0;

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour12: false });
  }

  // ── Not connected ──────────────────────────────────────────────
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

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <Link href="/integrations/strava" className="hover:text-gray-600 transition-colors">Strava</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600 font-medium">Sync Logs</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-orange-500" />
              <h1 className="text-lg font-semibold text-gray-900">Sync Logs</h1>
              {running && (
                <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                  <Loader2 size={11} className="animate-spin" /> Running
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              Live API call trace for the Strava integration. Records endpoint timing,
              HTTP status, and real rate limit consumption from Strava response headers.
            </p>
          </div>
          <button
            onClick={run}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <RefreshCw size={13} className={running ? "animate-spin" : ""} />
            {running ? "Running…" : "Re-run"}
          </button>
        </div>
      </div>

      {/* Rate limit bars */}
      {result?.rateLimit && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3.5">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-700">Rate Limit</h3>
            <span className="text-[10px] text-gray-400 font-mono">Strava API v3</span>
          </div>
          <RateLimitBar
            usage={result.rateLimit.usage15m}
            limit={result.rateLimit.limit15m}
            label="15-minute window"
          />
          <RateLimitBar
            usage={result.rateLimit.usageDay}
            limit={result.rateLimit.limitDay}
            label="Daily budget"
          />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Rolling 15-minute window resets continuously · Daily limit resets midnight UTC ·
            Merge batches requests and caches responses to minimize consumption.
          </p>
        </div>
      )}

      {/* Issues / all-clear */}
      {(issues.length > 0 || allGreen) && (
        <div
          className={`rounded-xl border p-4 ${
            issues.length > 0
              ? issues.some((i) => i.severity === "error")
                ? "bg-red-50 border-red-200"
                : "bg-amber-50 border-amber-200"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          {issues.length > 0 ? (
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertCircle
                    size={14}
                    className={`mt-0.5 flex-shrink-0 ${
                      issue.severity === "error" ? "text-red-500" : "text-amber-500"
                    }`}
                  />
                  <p className={`text-sm leading-snug ${
                    issue.severity === "error" ? "text-red-700" : "text-amber-700"
                  }`}>
                    {issue.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <p className="text-sm text-emerald-700 font-medium">
                All checks passed — no issues detected
              </p>
            </div>
          )}
        </div>
      )}

      {/* Log table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Table header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-gray-100"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Request Log
          </h3>
          {displayed.length > 0 && (
            <span className="text-xs text-gray-400 tabular-nums">
              {displayed.length} request{displayed.length !== 1 ? "s" : ""} · avg {avgLatency}ms
            </span>
          )}
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Time", "Endpoint", "Description", "Status", "Latency", "Records"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`text-[10px] font-medium text-gray-400 uppercase tracking-wide px-5 py-2.5 ${
                      i >= 3 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayed.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/40 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                  {fmtTime(log.timestamp)}
                </td>
                <td className="px-5 py-3">
                  <span className="font-mono text-xs">
                    <span className="text-gray-400">{log.method} </span>
                    <span className="text-gray-700">{log.endpoint}</span>
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{log.label}</td>
                <td className="px-5 py-3 text-right">
                  <StatusCode code={log.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <LatencyBadge ms={log.latency} />
                </td>
                <td className="px-5 py-3 text-right text-sm text-gray-500">
                  {log.recordCount !== null ? log.recordCount : "—"}
                </td>
              </tr>
            ))}

            {/* Spinner row while waiting for API */}
            {fetching && (
              <tr>
                <td colSpan={6} className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 size={13} className="animate-spin" />
                    <span>Contacting Strava API…</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!running && !fetching && displayed.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                  No logs yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {lastRun && !running && (
        <p className="text-xs text-gray-400 text-right">
          Diagnostic run #{runCount} · {lastRun}
        </p>
      )}
    </div>
  );
}
