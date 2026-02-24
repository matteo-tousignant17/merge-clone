"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ChevronRight } from "lucide-react";
import { issues, getLinkedAccount, getIntegration } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { IntegrationLogo } from "@/components/ui/integration-logo";
import { formatDate } from "@/lib/utils";

export default function IssuesPage() {
  const [tab, setTab] = useState<"ongoing" | "all">("ongoing");

  const filtered = tab === "ongoing"
    ? issues.filter(i => i.status === "ONGOING")
    : issues;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Issues</h1>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setTab("ongoing")}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              tab === "ongoing" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Ongoing
            <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
              {issues.filter(i => i.status === "ONGOING").length}
            </span>
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              tab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All
            <span className="ml-1.5 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {issues.length}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Issue</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Account</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Integration</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Created</th>
              <th className="w-8 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                  No issues found
                </td>
              </tr>
            ) : (
              filtered.map((issue) => {
                const account = getLinkedAccount(issue.linkedAccountId);
                const integration = account ? getIntegration(account.integrationId) : null;
                return (
                  <tr key={issue.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />
                        <Link
                          href={`/issues/${issue.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {issue.type}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {account && (
                        <Link
                          href={`/linked-accounts/${account.id}`}
                          className="text-sm text-gray-700 hover:text-blue-600"
                        >
                          {account.orgName}
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {integration && (
                        <div className="flex items-center gap-2">
                          <IntegrationLogo integration={integration} size={22} />
                          <span className="text-sm text-gray-600">{integration.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={issue.status} type="issue" />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {formatDate(issue.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
