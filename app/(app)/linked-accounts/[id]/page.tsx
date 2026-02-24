"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ArrowRight, AlertTriangle, X, RefreshCw, Link2, Send, Eye, EyeOff, Copy } from "lucide-react";
import {
  getLinkedAccount, getIntegration, getSyncModels,
  getIssuesByLinkedAccount, getLogsByLinkedAccount, commonModels,
  type ScopeStatus
} from "@/lib/mock-data";
import { StatusBadge, HttpMethodBadge, StatusCodeBadge } from "@/components/ui/status-badge";
import { IntegrationLogo } from "@/components/ui/integration-logo";
import { formatDate, formatDateTime, maskToken } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "overview" | "logs" | "issues" | "field-mapping" | "selective-sync" | "settings";

const scopeToggleOptions: ScopeStatus[] = ["ENABLED", "DISABLED", "OPTIONAL"];

export default function LinkedAccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const account = getLinkedAccount(id);
  const integration = account ? getIntegration(account.integrationId) : null;
  const syncModels = account ? getSyncModels(account.category) : [];
  const accountIssues = getIssuesByLinkedAccount(id);
  const accountLogs = getLogsByLinkedAccount(id);
  const models = account ? commonModels.filter(m => m.category === account.category) : [];

  const [tab, setTab] = useState<Tab>("overview");
  const [showToken, setShowToken] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  if (!account) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Linked account not found.</p>
      </div>
    );
  }

  const ongoingIssues = accountIssues.filter(i => i.status === "ONGOING");

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto min-w-0">
        {/* Breadcrumb */}
        <Link href="/linked-accounts" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft size={14} />
          Back to Linked Accounts
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {integration && <IntegrationLogo integration={integration} size={36} />}
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span>{account.orgName}</span>
              <ArrowRight size={16} className="text-gray-400" />
              <span>{integration?.name}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {account.category.toUpperCase()} · Linked {formatDate(account.linkedAt)}
            </p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={account.status} />
          </div>
        </div>

        {/* Warning banner */}
        {ongoingIssues.length > 0 && !warningDismissed && (
          <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                {ongoingIssues[0].type}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {ongoingIssues.length} ongoing issue{ongoingIssues.length > 1 ? "s" : ""} detected.{" "}
                <Link href={`/issues/${ongoingIssues[0].id}`} className="underline hover:no-underline">
                  View issue →
                </Link>
              </p>
            </div>
            <button onClick={() => setWarningDismissed(true)} className="text-amber-600 hover:text-amber-800">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 mb-5 gap-1">
          {(["overview", "logs", "issues", "field-mapping", "selective-sync", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize",
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t === "field-mapping" ? "Field Mapping" : t === "selective-sync" ? "Selective Sync" : t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "issues" && ongoingIssues.length > 0 && (
                <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                  {ongoingIssues.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Data sync</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <RefreshCw size={13} />
                  Resync all
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <Link2 size={13} />
                  Relink with Magic Link
                </button>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Model</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Scope</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Last sync start</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Next sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {syncModels.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50/30">
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{model.modelName}</td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded border",
                          model.scope === "READ" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          model.scope === "WRITE" ? "bg-green-50 text-green-700 border-green-200" :
                          "bg-gray-100 text-gray-500 border-gray-200"
                        )}>
                          {model.scope}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={model.status} type="sync" />
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {model.lastSyncStart ? formatDateTime(model.lastSyncStart) : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {model.nextSync ? formatDateTime(model.nextSync) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "logs" && (
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
                {accountLogs.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No logs found</td></tr>
                ) : accountLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/30">
                    <td className="px-5 py-3"><StatusCodeBadge code={log.statusCode} /></td>
                    <td className="px-5 py-3"><HttpMethodBadge method={log.method} /></td>
                    <td className="px-5 py-3 text-xs text-gray-600 font-mono truncate max-w-xs">{log.url}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{log.responseTime}ms</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "issues" && (
          <div className="space-y-3">
            {accountIssues.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
                No issues found for this account
              </div>
            ) : accountIssues.map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{issue.type}</span>
                    <StatusBadge status={issue.status} type="issue" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(issue.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === "field-mapping" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Field Mapping</h3>
            <p className="text-sm text-gray-500 mb-4">
              Map custom fields from {integration?.name} to your application&apos;s data model.
            </p>
            <div className="space-y-3">
              {models.slice(0, 1).flatMap(m => m.fields.slice(0, 5)).map((field, i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700 w-40">{field.name}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <div className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-500 bg-gray-50">
                    {field.name}
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{field.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "selective-sync" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Selective Sync</h3>
            <p className="text-sm text-gray-500 mb-4">
              Choose which data models to sync from {integration?.name}.
            </p>
            <div className="space-y-2">
              {syncModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{model.modelName}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={model.scope !== "NONE"} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input defaultValue={account.orgName} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End User Origin ID</label>
                <input defaultValue={account.endUserOriginId} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" readOnly />
              </div>
              <div className="pt-2">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Save changes
                </button>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h4>
                <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors">
                  Delete linked account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-64 flex-shrink-0 border-l border-gray-200 bg-white p-5 space-y-4">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Send size={13} />
          Send test API request
        </button>

        <div className="border border-gray-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account details</p>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Linked Account ID</p>
            <p className="text-xs font-mono text-gray-700 break-all">{account.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Account token</p>
            <div className="flex items-center gap-1">
              <p className="text-xs font-mono text-gray-700 flex-1 break-all">
                {showToken ? account.accountToken : maskToken(account.accountToken)}
              </p>
              <button
                onClick={() => setShowToken(!showToken)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                {showToken ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(account.accountToken)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>

        {integration && (
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Integration</p>
            <div className="flex items-center gap-2">
              <IntegrationLogo integration={integration} size={28} />
              <div>
                <p className="text-sm font-medium text-gray-800">{integration.name}</p>
                <p className="text-xs text-gray-400 capitalize">{integration.category}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
