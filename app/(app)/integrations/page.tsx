"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { integrations, categoryLabels, IntegrationCategory } from "@/lib/mock-data";
import { IntegrationLogo } from "@/components/ui/integration-logo";
import { cn } from "@/lib/utils";

const categories: { slug: IntegrationCategory | "all"; label: string }[] = [
  { slug: "all", label: "All" },
  { slug: "hris", label: "HR and Payroll" },
  { slug: "ats", label: "Applicant Tracking" },
  { slug: "crm", label: "CRM" },
  { slug: "ticketing", label: "Ticketing" },
  { slug: "accounting", label: "Accounting" },
  { slug: "fitness", label: "Fitness & Health" },
];

// APIs that can be requested (not in standard catalog yet, but requestable)
const requestableApis = [
  { id: "strava", name: "Strava", category: "Fitness & Health", color: "#FC4C02", initials: "ST", description: "Activity tracking & fitness data", available: true },
  { id: "fitbit", name: "Fitbit", category: "Fitness & Health", color: "#00B0B9", initials: "FB", description: "Health & activity monitoring", available: false },
  { id: "myfitnesspal", name: "MyFitnessPal", category: "Fitness & Health", color: "#0074D9", initials: "MF", description: "Nutrition & calorie tracking", available: false },
  { id: "notion", name: "Notion", category: "Productivity", color: "#000000", initials: "NO", description: "Collaborative workspace", available: false },
  { id: "airtable", name: "Airtable", category: "Productivity", color: "#FCB400", initials: "AT", description: "Flexible spreadsheet database", available: false },
  { id: "slack", name: "Slack", category: "Communication", color: "#4A154B", initials: "SL", description: "Team messaging platform", available: false },
  { id: "stripe", name: "Stripe", category: "Payments", color: "#635BFF", initials: "SP", description: "Payment processing", available: false },
  { id: "shopify", name: "Shopify", category: "E-commerce", color: "#96BF48", initials: "SH", description: "E-commerce platform", available: false },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const filtered = integrations.filter(i => {
    if (activeCategory !== "all" && i.category !== activeCategory) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredRequestable = requestableApis.filter(a =>
    !requestSearch || a.name.toLowerCase().includes(requestSearch.toLowerCase()) ||
    a.category.toLowerCase().includes(requestSearch.toLowerCase())
  );

  const handleRequest = (api: typeof requestableApis[0]) => {
    if (api.available) {
      router.push(`/integrations/${api.id}`);
    } else {
      setRequested(prev => new Set([...prev, api.id]));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {integrations.filter(i => i.category !== "fitness").length} integrations available across {Object.keys(categoryLabels).length - 1} categories
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-64"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              cat.slug === activeCategory
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {cat.label}
            <span className="ml-1.5 text-xs text-gray-400">
              {cat.slug === "all" ? integrations.length : integrations.filter(i => i.category === cat.slug).length}
            </span>
          </button>
        ))}
      </div>

      {/* Integration grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-10">
        {filtered.map((integration) => {
          const isStrava = integration.slug === "strava";
          return (
            <div
              key={integration.id}
              onClick={() => isStrava ? router.push("/integrations/strava") : undefined}
              className={cn(
                "bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 transition-all group",
                isStrava
                  ? "cursor-pointer hover:border-orange-300 hover:shadow-md ring-2 ring-orange-100"
                  : "cursor-pointer hover:border-blue-300 hover:shadow-sm"
              )}
            >
              <div className="relative">
                <IntegrationLogo integration={integration} size={48} className="rounded-xl" />
                {isStrava && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium leading-none">
                    Live
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-sm font-medium transition-colors",
                  isStrava ? "text-orange-600" : "text-gray-800 group-hover:text-blue-600"
                )}>
                  {integration.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {categoryLabels[integration.category]}
                </p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-gray-400">
            No integrations found
          </div>
        )}
      </div>

      {/* ─── Request New Integration Panel ─────────────────────────── */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plus size={16} className="text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">Don&apos;t see your integration?</h2>
            </div>
            <p className="text-sm text-gray-500">
              Request a new API and we&apos;ll connect it for you. Some are available to connect immediately.
            </p>
          </div>
          <div className="relative flex-shrink-0 ml-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search any API..."
              value={requestSearch}
              onChange={e => setRequestSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-56"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredRequestable.map((api) => {
            const isRequested = requested.has(api.id);
            return (
              <div
                key={api.id}
                className={cn(
                  "relative bg-white border rounded-xl p-4 transition-all",
                  api.available
                    ? "border-orange-200 bg-gradient-to-br from-orange-50/50 to-white hover:border-orange-300 hover:shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {api.available && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                    <Zap size={10} />
                    Connect now
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  {/* Logo */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: api.color }}
                  >
                    {api.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{api.name}</p>
                    <p className="text-xs text-gray-400">{api.category}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-3">{api.description}</p>

                <button
                  onClick={() => handleRequest(api)}
                  disabled={isRequested && !api.available}
                  className={cn(
                    "w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                    api.available
                      ? "text-white bg-orange-500 hover:bg-orange-600"
                      : isRequested
                      ? "text-emerald-600 bg-emerald-50 border border-emerald-200 cursor-default"
                      : "text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  )}
                >
                  {api.available ? (
                    <><ArrowRight size={12} /> Request &amp; Connect</>
                  ) : isRequested ? (
                    <><CheckCircle2 size={12} /> Requested</>
                  ) : (
                    <>+ Request integration</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
