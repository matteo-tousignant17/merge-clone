"use client";

import { useState } from "react";
import { Plus, Eye, EyeOff, Copy, Trash2, Key } from "lucide-react";
import { maskToken } from "@/lib/utils";

const mockKeys = [
  {
    id: "key_prod_1",
    name: "Production API Key",
    key: "sk_prod_xK92mP3qR7aB34cD56eFgH78iJ90kL",
    env: "Production",
    createdAt: "2024-09-01T10:00:00Z",
    lastUsed: "2024-11-21T12:00:00Z",
  },
  {
    id: "key_test_1",
    name: "Test API Key",
    key: "sk_test_yZ01aB23cDeF45gH67iJkL89mN01oP",
    env: "Test",
    createdAt: "2024-09-01T10:05:00Z",
    lastUsed: "2024-11-20T15:30:00Z",
  },
];

export default function ApiKeysPage() {
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (id: string, key: string) => {
    navigator.clipboard?.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">API Keys</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your API keys for authenticating requests to the Merge API
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus size={14} />
          Generate new key
        </button>
      </div>

      {/* Info banner */}
      <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <p className="font-medium mb-1">Keep your API keys secure</p>
        <p>Never share your API keys in public repositories or client-side code. Use environment variables to store them securely.</p>
      </div>

      <div className="space-y-3">
        {mockKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-gray-500" />
                <span className="font-medium text-gray-800">{apiKey.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                  apiKey.env === "Production"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  {apiKey.env}
                </span>
              </div>
              <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <code className="flex-1 text-xs font-mono text-gray-700">
                {revealedKeys.has(apiKey.id) ? apiKey.key : maskToken(apiKey.key)}
              </code>
              <button
                onClick={() => toggleReveal(apiKey.id)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                {revealedKeys.has(apiKey.id) ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => handleCopy(apiKey.id, apiKey.key)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                {copied === apiKey.id ? (
                  <span className="text-xs text-emerald-600 font-medium">Copied!</span>
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
