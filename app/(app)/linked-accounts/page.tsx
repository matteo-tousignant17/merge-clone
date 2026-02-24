"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, ChevronDown } from "lucide-react";
import { linkedAccounts, getIntegration, categoryLabels, LinkedAccountStatus } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { IntegrationLogo } from "@/components/ui/integration-logo";
import { formatDate } from "@/lib/utils";

export default function LinkedAccountsPage() {
  const [tab, setTab] = useState<"production" | "test">("production");
  const [searchOrg, setSearchOrg] = useState("");

  const filtered = linkedAccounts.filter(a => {
    if (tab === "production" && a.isTest) return false;
    if (tab === "test" && !a.isTest) return false;
    if (searchOrg && !a.orgName.toLowerCase().includes(searchOrg.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    LINKED: filtered.filter(a => a.status === "LINKED").length,
    IDLE: filtered.filter(a => a.status === "IDLE").length,
    INCOMPLETE: filtered.filter(a => a.status === "INCOMPLETE").length,
    RELINK: filtered.filter(a => a.status === "RELINK").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Linked Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and monitor your customers&apos; connected integrations
          </p>
        </div>
        {tab === "test" && (
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <Plus size={15} />
            Create test Linked Account
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-5">
        <button
          onClick={() => setTab("production")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "production"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Production
        </button>
        <button
          onClick={() => setTab("test")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "test"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Test
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {(["LINKED", "IDLE", "INCOMPLETE", "RELINK"] as LinkedAccountStatus[]).map((status) => (
          <div key={status} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{statusCounts[status]}</p>
            <StatusBadge status={status} className="mt-2" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search organization..."
            value={searchOrg}
            onChange={e => setSearchOrg(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-64"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
          <Filter size={13} />
          Integration
          <ChevronDown size={12} />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
          <Filter size={13} />
          Status
          <ChevronDown size={12} />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
          Date range
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Date linked</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Organization</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Integration</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Category</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                  No linked accounts found
                </td>
              </tr>
            ) : (
              filtered.map((account) => {
                const integration = getIntegration(account.integrationId);
                return (
                  <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {formatDate(account.linkedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/linked-accounts/${account.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {account.orgName}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      {integration && (
                        <div className="flex items-center gap-2">
                          <IntegrationLogo integration={integration} size={24} />
                          <span className="text-sm text-gray-700">{integration.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-500 capitalize">
                        {categoryLabels[account.category]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={account.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>Showing {filtered.length} accounts</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40" disabled>
            Previous
          </button>
          <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
