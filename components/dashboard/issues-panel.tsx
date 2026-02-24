"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ChevronRight } from "lucide-react";
import { issues, getLinkedAccount, getIntegration } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function IssuesPanel() {
  const [tab, setTab] = useState<"ongoing" | "all">("ongoing");

  const filtered = tab === "ongoing"
    ? issues.filter(i => i.status === "ONGOING")
    : issues;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Issues</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setTab("ongoing")}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              tab === "ongoing" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              tab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No issues found</div>
        ) : (
          filtered.slice(0, 5).map((issue) => {
            const account = getLinkedAccount(issue.linkedAccountId);
            const integration = account ? getIntegration(account.integrationId) : null;
            return (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
              >
                <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">{issue.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      issue.status === "ONGOING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {issue.status === "ONGOING" ? "Ongoing" : "Resolved"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {account?.orgName} {integration ? `· ${integration.name}` : ""} · {formatDate(issue.createdAt)}
                  </p>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
              </Link>
            );
          })
        )}
      </div>

      {filtered.length > 5 && (
        <div className="px-5 py-3 border-t border-gray-100">
          <Link href="/issues" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View all {filtered.length} issues →
          </Link>
        </div>
      )}
    </div>
  );
}
