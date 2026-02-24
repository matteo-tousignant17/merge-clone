"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Settings } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/linked-accounts": "Linked Accounts",
  "/logs": "Logs",
  "/issues": "Issues",
  "/integrations": "Integrations",
  "/scopes": "Scopes",
  "/advanced": "Advanced",
  "/api-tester": "API Tester",
  "/api-keys": "API Keys",
  "/get-started": "Get Started",
};

export default function Topbar() {
  const pathname = usePathname();

  const getTitle = () => {
    for (const [key, value] of Object.entries(pageTitles)) {
      if (pathname.startsWith(key)) return value;
    }
    return "Dashboard";
  };

  return (
    <header className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-gray-700">{getTitle()}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment selector */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Production
          <ChevronDown size={12} />
        </button>

        {/* Notifications */}
        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
          <Bell size={16} />
        </button>

        {/* Settings */}
        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
          <Settings size={16} />
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            A
          </div>
          <span className="text-sm text-gray-700 font-medium">Admin</span>
          <ChevronDown size={12} className="text-gray-500" />
        </button>
      </div>
    </header>
  );
}
