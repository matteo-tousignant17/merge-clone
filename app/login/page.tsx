"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Copy, Check, ExternalLink } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1 rounded text-slate-400 hover:text-white transition-colors"
      title="Copy"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

const passwordSet = process.env.NEXT_PUBLIC_AUTH_CONFIGURED === "true";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Detect setup mode at runtime by trying to ping a known endpoint
  // We use a simpler approach: the login API returns 503 when not configured
  const [isSetup, setIsSetup] = useState<boolean | null>(null);

  // Check mode on mount
  useState(() => {
    fetch("/api/auth/login", { method: "HEAD" })
      .then((r) => setIsSetup(r.status === 503))
      .catch(() => setIsSetup(false));
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Incorrect password");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "#3b82f6" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-wider uppercase">
            Merge
          </span>
        </div>

        {isSetup === true ? (
          /* ── Setup mode ───────────────────────────────────────── */
          <div
            className="rounded-xl border p-7"
            style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-blue-400" />
              <h1 className="text-white font-semibold text-base">
                Set up your password
              </h1>
            </div>
            <p className="text-slate-400 text-sm mb-5 leading-relaxed">
              Add these environment variables to your Vercel project, then
              redeploy.
            </p>

            <div
              className="rounded-lg border p-4 font-mono text-xs space-y-2"
              style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
            >
              {[
                "AUTH_PASSWORD=your_password_here",
                "AUTH_SECRET=" +
                  Array.from({ length: 32 }, () =>
                    Math.random().toString(36)[2]
                  ).join(""),
              ].map((line) => (
                <div key={line.split("=")[0]} className="flex items-center justify-between gap-3">
                  <span className="text-emerald-400 truncate">{line}</span>
                  <CopyButton text={line} />
                </div>
              ))}
            </div>

            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#3b82f6" }}
            >
              <ExternalLink size={13} />
              Open Vercel Dashboard
            </a>
            <p className="text-center text-xs text-slate-500 mt-3">
              After saving env vars, trigger a new deployment to apply changes.
            </p>
          </div>
        ) : (
          /* ── Login mode ───────────────────────────────────────── */
          <div
            className="rounded-xl border p-7"
            style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
          >
            <h1 className="text-white font-semibold text-base mb-1">
              Sign in
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              Enter your password to access the dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 border outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all"
                  style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#3b82f6" }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
