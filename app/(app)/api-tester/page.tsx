"use client";

import { useState } from "react";
import { Send, ChevronDown } from "lucide-react";
import { HttpMethodBadge, StatusCodeBadge } from "@/components/ui/status-badge";
import { linkedAccounts, getIntegration } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const methodColors: Record<string, string> = {
  GET: "text-blue-600",
  POST: "text-green-600",
  PATCH: "text-amber-600",
  DELETE: "text-red-600",
};

const sampleEndpoints = [
  { method: "GET", path: "/hris/v1/employees", description: "List employees" },
  { method: "GET", path: "/hris/v1/employees/{id}", description: "Get employee" },
  { method: "GET", path: "/ats/v1/candidates", description: "List candidates" },
  { method: "POST", path: "/ats/v1/candidates", description: "Create candidate" },
  { method: "GET", path: "/crm/v1/contacts", description: "List contacts" },
  { method: "GET", path: "/ticketing/v1/tickets", description: "List tickets" },
  { method: "GET", path: "/accounting/v1/invoices", description: "List invoices" },
];

const mockResponse = {
  "results": [
    {
      "id": "emp_abc123",
      "employee_number": "E001",
      "first_name": "John",
      "last_name": "Doe",
      "work_email": "john.doe@acmecorp.com",
      "employment_status": "ACTIVE",
      "start_date": "2022-03-15",
      "department": "Engineering",
    },
    {
      "id": "emp_def456",
      "employee_number": "E002",
      "first_name": "Jane",
      "last_name": "Smith",
      "work_email": "jane.smith@acmecorp.com",
      "employment_status": "ACTIVE",
      "start_date": "2021-07-01",
      "department": "Marketing",
    }
  ],
  "next": null,
  "previous": null
};

export default function ApiTesterPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(sampleEndpoints[0]);
  const [selectedAccount, setSelectedAccount] = useState(linkedAccounts[1].id);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatusCode(200);
      setResponse(JSON.stringify(mockResponse, null, 2));
    }, 800);
  };

  const account = linkedAccounts.find(a => a.id === selectedAccount);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">API Tester</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Test Merge API endpoints directly from the dashboard
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: endpoint selector */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Endpoints</p>
          </div>
          <div className="divide-y divide-gray-100">
            {sampleEndpoints.map((ep, i) => (
              <button
                key={i}
                onClick={() => setSelectedEndpoint(ep)}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                  selectedEndpoint === ep ? "bg-blue-50" : ""
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-mono font-bold w-10", methodColors[ep.method])}>
                    {ep.method}
                  </span>
                  <span className="text-xs text-gray-600 font-mono truncate">{ep.path}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 ml-12">{ep.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: request + response */}
        <div className="col-span-2 space-y-4">
          {/* Request builder */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Request</p>
            <div className="flex items-center gap-2 mb-4">
              <HttpMethodBadge method={selectedEndpoint.method} />
              <div className="flex-1 flex items-center gap-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-xs text-gray-400">https://api.merge.dev/api</span>
                <span className="text-xs font-mono text-gray-700">{selectedEndpoint.path}</span>
              </div>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
              >
                <Send size={13} />
                {loading ? "Sending..." : "Send"}
              </button>
            </div>

            {/* Headers */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Headers</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">Authorization</div>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">Bearer sk_prod_••••••••</div>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">X-Account-Token</div>
                <select
                  value={selectedAccount}
                  onChange={e => setSelectedAccount(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 text-xs"
                >
                  {linkedAccounts.filter(a => !a.isTest).map(a => {
                    const int = getIntegration(a.integrationId);
                    return (
                      <option key={a.id} value={a.id}>
                        {a.orgName} — {int?.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Response</p>
              {statusCode && <StatusCodeBadge code={statusCode} />}
            </div>
            {response ? (
              <pre className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto max-h-80">
                {response}
              </pre>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                Send a request to see the response
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
