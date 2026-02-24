"use client";

import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

const webhookEvents = [
  { id: "employee.created", label: "Employee Created", enabled: true },
  { id: "employee.updated", label: "Employee Updated", enabled: true },
  { id: "employee.deleted", label: "Employee Deleted", enabled: false },
  { id: "candidate.created", label: "Candidate Created", enabled: true },
  { id: "candidate.updated", label: "Candidate Updated", enabled: false },
  { id: "ticket.created", label: "Ticket Created", enabled: false },
  { id: "invoice.created", label: "Invoice Created", enabled: false },
];

export default function AdvancedPage() {
  const [webhookUrl, setWebhookUrl] = useState("https://api.yourapp.com/webhooks/merge");
  const [events, setEvents] = useState(webhookEvents);
  const [saved, setSaved] = useState(false);

  const toggleEvent = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Advanced</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure webhooks and advanced settings</p>
      </div>

      {/* Webhooks */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Webhooks</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus size={12} />
            Add endpoint
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <input
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Events to subscribe</p>
          <div className="space-y-2">
            {events.map((event) => (
              <label key={event.id} className="flex items-center gap-3 py-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={event.enabled}
                  onChange={() => toggleEvent(event.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{event.label}</span>
                <span className="text-xs font-mono text-gray-400 ml-auto">{event.id}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Sync settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4">Sync settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sync frequency</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
              <option>Every 24 hours</option>
              <option>Every 12 hours</option>
              <option>Every 6 hours</option>
              <option>Every hour</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Redact unmapped data</p>
              <p className="text-xs text-gray-400 mt-0.5">Remove unmapped fields from API responses</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          saved ? "bg-emerald-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        <Save size={14} />
        {saved ? "Saved!" : "Save changes"}
      </button>
    </div>
  );
}
