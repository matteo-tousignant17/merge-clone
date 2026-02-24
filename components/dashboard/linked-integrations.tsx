"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { integrations, linkedAccounts, categoryLabels, IntegrationCategory } from "@/lib/mock-data";
import { IntegrationLogo } from "@/components/ui/integration-logo";

const categories: IntegrationCategory[] = ["hris", "ats", "crm", "ticketing", "accounting"];

export default function LinkedIntegrations() {
  const [expanded, setExpanded] = useState<IntegrationCategory | null>("hris");

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Linked integrations</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {categories.map((cat) => {
          const catIntegrations = integrations.filter(i => i.category === cat);
          const linkedCount = linkedAccounts.filter(a => a.category === cat && !a.isTest).length;
          const isExpanded = expanded === cat;

          return (
            <div key={cat}>
              <button
                onClick={() => setExpanded(isExpanded ? null : cat)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex -space-x-2 flex-shrink-0">
                  {catIntegrations.slice(0, 3).map((int) => (
                    <IntegrationLogo key={int.id} integration={int} size={24} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700">
                    {linkedCount} {categoryLabels[cat]}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown size={14} className="text-gray-400" />
                ) : (
                  <ChevronRight size={14} className="text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-5 pb-3 pt-1 flex flex-wrap gap-2 bg-gray-50/50">
                  {catIntegrations.map((int) => (
                    <div
                      key={int.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600"
                    >
                      <IntegrationLogo integration={int} size={18} />
                      <span>{int.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
