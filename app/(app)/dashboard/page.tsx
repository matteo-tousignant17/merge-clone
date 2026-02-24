import ApiRequestsChart from "@/components/dashboard/api-requests-chart";
import IssuesPanel from "@/components/dashboard/issues-panel";
import LinkedIntegrations from "@/components/dashboard/linked-integrations";
import { linkedAccounts, issues } from "@/lib/mock-data";
import { TrendingUp, Link2 } from "lucide-react";

export default function DashboardPage() {
  const prodAccounts = linkedAccounts.filter(a => !a.isTest);
  const ongoingIssues = issues.filter(i => i.status === "ONGOING");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Top row: chart + stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* API Requests chart — spans 2 cols */}
        <div className="col-span-2">
          <ApiRequestsChart />
        </div>

        {/* Right column stats */}
        <div className="flex flex-col gap-4">
          {/* Linked Accounts card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Linked Accounts</p>
                <p className="text-3xl font-bold text-gray-900">{prodAccounts.length}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Link2 size={18} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp size={11} />
                +104%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          </div>

          {/* Ongoing Issues card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Ongoing Issues</p>
                <p className="text-3xl font-bold text-gray-900">{ongoingIssues.length}</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">Require attention</p>
          </div>
        </div>
      </div>

      {/* Bottom row: issues panel + linked integrations */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <IssuesPanel />
        </div>
        <div>
          <LinkedIntegrations />
        </div>
      </div>
    </div>
  );
}
