"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Link2,
  ScrollText,
  AlertCircle,
  Puzzle,
  Shield,
  Settings2,
  FlaskConical,
  Key,
  BookOpen,
  Sparkles,
  Activity,
  LogOut,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/linked-accounts", label: "Linked Accounts", icon: Link2 },
      { href: "/logs", label: "Logs", icon: ScrollText },
      { href: "/issues", label: "Issues", icon: AlertCircle },
    ],
  },
  {
    label: "Configure",
    items: [
      { href: "/integrations", label: "Integrations", icon: Puzzle },
      { href: "/scopes/hris", label: "Scopes", icon: Shield },
      { href: "/advanced", label: "Advanced", icon: Settings2 },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/api-tester", label: "API tester", icon: FlaskConical },
      { href: "/api-keys", label: "API keys", icon: Key },
      { href: "/get-started", label: "Get started", icon: BookOpen },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [stravaConnected, setStravaConnected] = useState(false);

  useEffect(() => {
    // Read public cookie (not HttpOnly) to decide whether to show Strava link
    const connected = document.cookie
      .split("; ")
      .some(c => c.startsWith("strava_connected=true"));
    setStravaConnected(connected);
  }, [pathname]); // re-check on route change (e.g. after connect)

  const isActive = (href: string) => {
    if (href === "/linked-accounts") return pathname.startsWith("/linked-accounts");
    if (href === "/issues") return pathname.startsWith("/issues");
    if (href === "/scopes/hris") return pathname.startsWith("/scopes");
    if (href === "/dashboard/strava") return pathname === "/dashboard/strava";
    return pathname === href;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col z-30" style={{ backgroundColor: "#0f172a" }}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-700/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: "#3b82f6" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-wider uppercase">Merge</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-2 mb-1 text-xs font-medium uppercase tracking-wider" style={{ color: "#475569" }}>
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                        active
                          ? "text-white bg-blue-600/20 border border-blue-500/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      )}
                    >
                      <Icon size={15} className={active ? "text-blue-400" : ""} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Connected Apps — only shown when Strava is connected */}
        {stravaConnected && (
          <div className="mb-6">
            <p className="px-2 mb-1 text-xs font-medium uppercase tracking-wider" style={{ color: "#475569" }}>
              Connected Apps
            </p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/dashboard/strava"
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                    isActive("/dashboard/strava")
                      ? "text-white border"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  )}
                  style={isActive("/dashboard/strava")
                    ? { backgroundColor: "rgba(252,76,2,0.15)", borderColor: "rgba(252,76,2,0.25)" }
                    : {}}
                >
                  {/* Strava "S" mark */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={isActive("/dashboard/strava") ? "#FC4C02" : "#94a3b8"}>
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                  </svg>
                  <span>Strava</span>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-700/50 space-y-0.5">
        <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <Sparkles size={15} className="text-purple-400" />
          <span>Ask AI</span>
          <span className="ml-auto text-xs text-slate-500">⌘K</span>
        </button>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
