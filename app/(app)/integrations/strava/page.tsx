"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Loader2, Zap, Shield, Activity,
  User, AlertCircle, RefreshCw, Link2
} from "lucide-react";

// ── Strava SVG logo ──────────────────────────────────────────────
function StravaLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FC4C02">
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
    </svg>
  );
}

const steps = [
  { id: 1, label: "Authorize", description: "Grant access to your Strava account" },
  { id: 2, label: "Sync", description: "We pull your activities & stats" },
  { id: 3, label: "Dashboard", description: "Explore your personalized insights" },
];

const permissions = [
  { icon: Activity, label: "View all activities (runs, rides, swims, etc.)" },
  { icon: User, label: "Read your public profile and stats" },
  { icon: Shield, label: "No ability to post or modify your data" },
];

function StravaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const connected = searchParams.get("connected") === "true";
  const error = searchParams.get("error");
  const athleteName = searchParams.get("athlete");

  const [isAlreadyConnected, setIsAlreadyConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [athlete, setAthlete] = useState<{ firstname: string; lastname: string; profile_medium?: string; city?: string } | null>(null);

  useEffect(() => {
    // Check if already connected by hitting our proxy
    if (connected) { setChecking(false); return; }
    fetch("/api/strava/athlete")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.id) {
          setIsAlreadyConnected(true);
          setAthlete(data);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [connected]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  // ── State B: Just connected via OAuth ──────────────────────────
  if (connected) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Strava connected!
        </h1>
        {athleteName && (
          <p className="text-gray-500 mb-1 text-lg">Welcome, {decodeURIComponent(athleteName)}</p>
        )}
        <p className="text-gray-400 text-sm mb-8">
          Your activities are being synced. Your dashboard is ready.
        </p>

        {/* Step completion */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-1 whitespace-nowrap">{step.label}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="w-16 h-0.5 bg-emerald-400 mx-1 mb-4" />
              )}
            </div>
          ))}
        </div>

        <Link
          href="/dashboard/strava"
          className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-xl transition-colors"
          style={{ backgroundColor: "#FC4C02" }}
        >
          View your Strava Dashboard
          <ArrowRight size={18} />
        </Link>

        <div className="mt-4">
          <Link href="/integrations" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to integrations
          </Link>
        </div>
      </div>
    );
  }

  // ── State C: Already connected ──────────────────────────────────
  if (isAlreadyConnected && athlete) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <div className="flex items-center gap-3 mb-8">
          <StravaLogo size={36} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Strava</h1>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={11} /> Connected
            </span>
          </div>
        </div>

        {/* Athlete info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 flex items-center gap-4">
          {athlete.profile_medium ? (
            <img src={athlete.profile_medium} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
              {athlete.firstname?.[0]}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{athlete.firstname} {athlete.lastname}</p>
            {athlete.city && <p className="text-sm text-gray-400">{athlete.city}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/strava"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
            style={{ backgroundColor: "#FC4C02" }}
          >
            <Activity size={15} />
            View Dashboard
          </Link>
          <Link
            href="/api/strava/authorize"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            <RefreshCw size={13} />
            Reconnect
          </Link>
        </div>
      </div>
    );
  }

  // ── State A: Not connected ──────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto py-8">
      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={15} />
          {error === "access_denied"
            ? "Authorization was cancelled. Please try again."
            : "Something went wrong. Please try again."}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#FFF0EA" }}>
          <StravaLogo size={36} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connect Strava</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fitness & Health · Live integration</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
          <Zap size={11} />
          Available now
        </div>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                i === 0
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-200 bg-white text-gray-400"
              }`}>
                {step.id}
              </div>
              <p className={`text-xs mt-1 whitespace-nowrap font-medium ${i === 0 ? "text-orange-600" : "text-gray-400"}`}>
                {step.label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 mx-1 mb-4" />
            )}
          </div>
        ))}
      </div>

      {/* Permissions card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Merge will be able to:</p>
        <ul className="space-y-2.5">
          {permissions.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={11} className="text-orange-500" />
              </div>
              <span className="text-sm text-gray-600">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <Link
        href="/api/strava/authorize"
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-base font-semibold text-white rounded-xl transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99]"
        style={{ backgroundColor: "#FC4C02" }}
      >
        <StravaLogo size={20} />
        Connect with Strava
        <ArrowRight size={16} />
      </Link>

      <p className="text-xs text-gray-400 text-center mt-3">
        You&apos;ll be redirected to Strava to authorize. We never store your password.
      </p>

      <div className="mt-5 text-center">
        <Link href="/integrations" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to integrations
        </Link>
      </div>
    </div>
  );
}

export default function StravaIntegrationPage() {
  return (
    <div className="p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      }>
        <StravaPageContent />
      </Suspense>
    </div>
  );
}
