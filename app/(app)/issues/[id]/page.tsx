"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, Send, Link2, MessageSquare, Calendar, Copy } from "lucide-react";
import { getIssue, getLinkedAccount, getIntegration, getLogsByIssue } from "@/lib/mock-data";
import { StatusBadge, HttpMethodBadge, StatusCodeBadge } from "@/components/ui/status-badge";
import { IntegrationLogo } from "@/components/ui/integration-logo";
import { formatDate, formatDateTime, maskToken } from "@/lib/utils";

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const issue = getIssue(id);
  const account = issue ? getLinkedAccount(issue.linkedAccountId) : null;
  const integration = account ? getIntegration(account.integrationId) : null;
  const issueLogs = getLogsByIssue(id);

  if (!issue) {
    return <div className="p-6 text-gray-500">Issue not found.</div>;
  }

  return (
    <div className="flex h-full">
      {/* Main */}
      <div className="flex-1 p-6 overflow-y-auto min-w-0">
        {/* Breadcrumb */}
        {account && (
          <Link href={`/linked-accounts/${account.id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ChevronLeft size={14} />
            Back to Linked Account
          </Link>
        )}

        {/* Issue header */}
        <div className="flex items-center gap-3 mb-5">
          <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
          <h1 className="text-xl font-semibold text-gray-900">{issue.type}</h1>
          <StatusBadge status={issue.status} type="issue" />
          {issue.errorCode && (
            <StatusCodeBadge code={issue.errorCode} />
          )}
        </div>

        {/* Remediation banner */}
        <div className="mb-5 px-4 py-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">
                Recommended remediation to share with your customer
              </p>
              <p className="text-sm text-amber-700">{issue.remediationText}</p>
            </div>
          </div>
        </div>

        {/* Logs section */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Related Logs</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Method</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">URL</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Response time</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {issueLogs.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No logs associated with this issue</td></tr>
                ) : issueLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/30">
                    <td className="px-5 py-3"><StatusCodeBadge code={log.statusCode} /></td>
                    <td className="px-5 py-3"><HttpMethodBadge method={log.method} /></td>
                    <td className="px-5 py-3 text-xs text-gray-600 font-mono truncate max-w-sm">{log.url}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{log.responseTime}ms</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-64 flex-shrink-0 border-l border-gray-200 bg-white p-5 space-y-4">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Link2 size={13} />
          Relink with Magic Link
        </button>
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Send size={13} />
          Send test API request
        </button>

        <div className="border-t border-gray-200 pt-4 space-y-3">
          {/* Comments */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MessageSquare size={14} />
            <span>0 comments</span>
          </div>

          {/* Issue created */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            <div>
              <p className="text-xs text-gray-400">Issue created</p>
              <p className="text-xs text-gray-600">{formatDate(issue.createdAt)}</p>
            </div>
          </div>

          {issue.resolvedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} />
              <div>
                <p className="text-xs text-gray-400">Resolved</p>
                <p className="text-xs text-gray-600">{formatDate(issue.resolvedAt)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Account details */}
        {account && (
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account details</p>
            {integration && (
              <div className="flex items-center gap-2">
                <IntegrationLogo integration={integration} size={22} />
                <Link href={`/linked-accounts/${account.id}`} className="text-xs text-blue-600 hover:underline font-medium">
                  {account.orgName}
                </Link>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Linked Account ID</p>
              <p className="text-xs font-mono text-gray-700 break-all">{account.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Account token</p>
              <div className="flex items-center gap-1">
                <p className="text-xs font-mono text-gray-700 flex-1 break-all">
                  {maskToken(account.accountToken)}
                </p>
                <button
                  onClick={() => navigator.clipboard?.writeText(account.accountToken)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
