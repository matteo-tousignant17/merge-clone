"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { getCommonModelsByCategory, IntegrationCategory, ScopeStatus, CommonModel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const categories: { slug: IntegrationCategory; label: string }[] = [
  { slug: "hris", label: "HR and Payroll" },
  { slug: "ats", label: "Applicant Tracking" },
  { slug: "accounting", label: "Accounting" },
  { slug: "ticketing", label: "Ticketing" },
  { slug: "crm", label: "CRM" },
];

const scopeOptions: { value: ScopeStatus; label: string }[] = [
  { value: "ENABLED", label: "Enabled" },
  { value: "DISABLED", label: "Disabled" },
  { value: "OPTIONAL", label: "Optional" },
];

function FieldScopeToggle({
  scope,
  onChange,
}: {
  scope: ScopeStatus;
  onChange: (s: ScopeStatus) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-white">
      {scopeOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium transition-colors border-r border-gray-200 last:border-r-0",
            scope === opt.value
              ? opt.value === "ENABLED"
                ? "bg-blue-600 text-white"
                : opt.value === "OPTIONAL"
                ? "bg-amber-500 text-white"
                : "bg-gray-700 text-white"
              : "text-gray-500 hover:bg-gray-50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function ScopesPage() {
  const { category } = useParams<{ category: string }>();
  const router = useRouter();

  const activeCat = categories.find(c => c.slug === category) ?? categories[0];
  const initialModels = getCommonModelsByCategory(activeCat.slug as IntegrationCategory);

  const [modelScopes, setModelScopes] = useState<Record<string, Record<string, ScopeStatus>>>(
    () => {
      const init: Record<string, Record<string, ScopeStatus>> = {};
      initialModels.forEach(model => {
        init[model.id] = {};
        model.fields.forEach(f => {
          init[model.id][f.name] = f.scope;
        });
      });
      return init;
    }
  );

  const [modelReadEnabled, setModelReadEnabled] = useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      initialModels.forEach(m => { init[m.id] = true; });
      return init;
    }
  );

  const [saved, setSaved] = useState(false);

  const handleFieldChange = (modelId: string, fieldName: string, scope: ScopeStatus) => {
    setModelScopes(prev => ({
      ...prev,
      [modelId]: { ...prev[modelId], [fieldName]: scope },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const models = getCommonModelsByCategory(activeCat.slug as IntegrationCategory);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Scopes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure which fields are synced for each data model
          </p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            saved
              ? "bg-emerald-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          <Save size={14} />
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => router.push(`/scopes/${cat.slug}`)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              cat.slug === activeCat.slug
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Models */}
      <div className="space-y-4">
        {models.map((model) => (
          <div key={model.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Model header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-800">{model.modelName}</h3>
                <span className="text-xs text-gray-400">
                  {model.fields.length} fields
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">Read</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modelReadEnabled[model.id] ?? true}
                    onChange={(e) => setModelReadEnabled(prev => ({
                      ...prev,
                      [model.id]: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Field rows */}
            <div className="divide-y divide-gray-100">
              {model.fields.map((field) => (
                <div key={field.name} className="flex items-center gap-4 px-5 py-2.5 hover:bg-gray-50/30 transition-colors">
                  <span className="text-sm text-gray-700 flex-1 font-mono text-xs">{field.name}</span>
                  <span className="text-xs text-gray-400 w-24 text-right font-mono">{field.type}</span>
                  <FieldScopeToggle
                    scope={modelScopes[model.id]?.[field.name] ?? field.scope}
                    onChange={(s) => handleFieldChange(model.id, field.name, s)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {models.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
            No models configured for this category yet
          </div>
        )}
      </div>
    </div>
  );
}
