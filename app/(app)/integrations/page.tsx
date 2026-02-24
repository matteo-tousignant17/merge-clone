"use client";

import { useState } from "react";
import { Search } from "lucide-react";
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
];

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = integrations.filter(i => {
    if (activeCategory !== "all" && i.category !== activeCategory) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {integrations.length} integrations available across {Object.keys(categoryLabels).length} categories
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
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((integration) => (
          <div
            key={integration.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <IntegrationLogo integration={integration} size={48} className="rounded-xl" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                {integration.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">
                {categoryLabels[integration.category]}
              </p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-gray-400">
            No integrations found
          </div>
        )}
      </div>
    </div>
  );
}
