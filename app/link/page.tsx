"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { integrations, categoryLabels, IntegrationCategory } from "@/lib/mock-data";
import { IntegrationLogo } from "@/components/ui/integration-logo";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

type Step = "category" | "integration" | "auth" | "success";

const categories: { slug: IntegrationCategory; label: string; description: string }[] = [
  { slug: "hris", label: "HR and Payroll", description: "Connect your HR and payroll tools" },
  { slug: "ats", label: "Applicant Tracking", description: "Connect your recruiting tools" },
  { slug: "crm", label: "CRM", description: "Connect your CRM tools" },
  { slug: "ticketing", label: "Ticketing", description: "Connect your ticketing tools" },
  { slug: "accounting", label: "Accounting", description: "Connect your accounting tools" },
];

function MergeLinkContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [accountToken, setAccountToken] = useState<string | null>(null);

  const categoryIntegrations = selectedCategory
    ? integrations.filter(i => i.category === selectedCategory)
    : [];

  const handleCategorySelect = (cat: IntegrationCategory) => {
    setSelectedCategory(cat);
    setStep("integration");
  };

  const handleIntegrationSelect = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setStep("auth");
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 1500));
    const pt = `pt_${Math.random().toString(36).substring(2, 18)}`;
    setPublicToken(pt);

    // Exchange for account token
    try {
      const res = await fetch("/api/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token: pt }),
      });
      const data = await res.json();
      setAccountToken(data.account_token);
    } catch {
      // ignore
    }
    setAuthLoading(false);
    setStep("success");
  };

  const integration = integrations.find(i => i.id === selectedIntegration);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Modal card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Connect your tools</p>
            <p className="text-xs text-gray-400">Powered by Merge</p>
          </div>
          {step !== "category" && step !== "success" && (
            <button
              onClick={() => setStep(step === "auth" ? "integration" : "category")}
              className="ml-auto text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs"
            >
              <ArrowLeft size={12} /> Back
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {["category", "integration", "auth", "success"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  step === s ? "bg-blue-600" :
                  ["category", "integration", "auth", "success"].indexOf(step) > i ? "bg-blue-400" :
                  "bg-gray-200"
                )} />
                {i < 3 && <div className={cn("flex-1 h-0.5 rounded transition-colors",
                  ["category", "integration", "auth", "success"].indexOf(step) > i ? "bg-blue-400" : "bg-gray-200"
                )} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Step 1: Category selection */}
          {step === "category" && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Select a category</h2>
              <p className="text-sm text-gray-500 mb-4">Choose the type of tool you want to connect</p>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">{cat.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Integration selection */}
          {step === "integration" && selectedCategory && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Select a {categoryLabels[selectedCategory]} tool
              </h2>
              <p className="text-sm text-gray-500 mb-4">Choose your provider to get started</p>
              <div className="grid grid-cols-2 gap-2">
                {categoryIntegrations.map((int) => (
                  <button
                    key={int.id}
                    onClick={() => handleIntegrationSelect(int.id)}
                    className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                  >
                    <IntegrationLogo integration={int} size={40} />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 text-center">
                      {int.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Authentication */}
          {step === "auth" && integration && (
            <div className="text-center py-4">
              <IntegrationLogo integration={integration} size={56} className="mx-auto mb-4" />
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                Connect to {integration.name}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                You&apos;ll be redirected to {integration.name} to authorize access to your account
              </p>
              <button
                onClick={handleAuth}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-60"
                style={{ backgroundColor: integration.color }}
              >
                {authLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ArrowRight size={15} />
                    Authorize {integration.name}
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 mt-3">
                By connecting, you agree to share your {integration.name} data with this application
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && integration && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                {integration.name} connected!
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Your {integration.name} account has been successfully linked. Data sync will begin shortly.
              </p>
              {accountToken && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-left">
                  <p className="text-xs text-gray-400 mb-1">Account token (for demo purposes)</p>
                  <p className="text-xs font-mono text-gray-600 break-all">{accountToken}</p>
                </div>
              )}
              <button
                onClick={() => window.close?.()}
                className="w-full py-2.5 px-4 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Secured by{" "}
            <span className="font-semibold text-gray-600">Merge</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LinkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <MergeLinkContent />
    </Suspense>
  );
}
