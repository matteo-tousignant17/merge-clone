"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { logs, getLinkedAccount, getIntegration } from "@/lib/mock-data";
import { HttpMethodBadge, StatusCodeBadge } from "@/components/ui/status-badge";
import { IntegrationLogo } from "@/components/ui/integration-logo";
import { formatDateTime } from "@/lib/utils";

export default function LogsPage() {
  const [search, setSearch] = useState("");

  const filtered = logs.filter(l => {
    if (search) {
      return l.url.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Logs</h1>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search URL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-64"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Method</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">URL</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Account</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Response time</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-gray-400">No logs found</td>
              </tr>
            ) : (
              filtered.map((log) => {
                const account = getLinkedAccount(log.linkedAccountId);
                const integration = account ? getIntegration(account.integrationId) : null;
                return (
                  <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3"><StatusCodeBadge code={log.statusCode} /></td>
                    <td className="px-5 py-3"><HttpMethodBadge method={log.method} /></td>
                    <td className="px-5 py-3 text-xs text-gray-600 font-mono max-w-xs truncate">{log.url}</td>
                    <td className="px-5 py-3">
                      {account && integration && (
                        <Link href={`/linked-accounts/${account.id}`} className="flex items-center gap-2 hover:underline">
                          <IntegrationLogo integration={integration} size={20} />
                          <span className="text-sm text-blue-600">{account.orgName}</span>
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{log.responseTime}ms</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDateTime(log.createdAt)}</td>
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
