import { cn } from "@/lib/utils";
import { LinkedAccountStatus, IssueStatus, SyncStatus } from "@/lib/mock-data";

const accountStatusConfig: Record<LinkedAccountStatus, { label: string; className: string }> = {
  LINKED: { label: "Linked", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  IDLE: { label: "Idle", className: "bg-gray-100 text-gray-600 border-gray-200" },
  INCOMPLETE: { label: "Incomplete", className: "bg-amber-50 text-amber-700 border-amber-200" },
  RELINK: { label: "Relink", className: "bg-red-50 text-red-700 border-red-200" },
};

const issueStatusConfig: Record<IssueStatus, { label: string; className: string }> = {
  ONGOING: { label: "Ongoing", className: "bg-amber-50 text-amber-700 border-amber-200" },
  RESOLVED: { label: "Resolved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const syncStatusConfig: Record<SyncStatus, { label: string; className: string }> = {
  DONE: { label: "Done", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  SYNCING: { label: "Syncing", className: "bg-blue-50 text-blue-700 border-blue-200" },
  FAILED: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

interface StatusBadgeProps {
  status: LinkedAccountStatus | IssueStatus | SyncStatus;
  type?: "account" | "issue" | "sync";
  className?: string;
}

export function StatusBadge({ status, type = "account", className }: StatusBadgeProps) {
  let config: { label: string; className: string };

  if (type === "issue") {
    config = issueStatusConfig[status as IssueStatus];
  } else if (type === "sync") {
    config = syncStatusConfig[status as SyncStatus];
  } else {
    config = accountStatusConfig[status as LinkedAccountStatus];
  }

  if (!config) return null;

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}

export function HttpMethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-50 text-blue-700 border-blue-200",
    POST: "bg-green-50 text-green-700 border-green-200",
    PATCH: "bg-amber-50 text-amber-700 border-amber-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
    PUT: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium border",
      colors[method] ?? "bg-gray-100 text-gray-600 border-gray-200"
    )}>
      {method}
    </span>
  );
}

export function StatusCodeBadge({ code }: { code: number }) {
  const className = code >= 500
    ? "bg-red-50 text-red-700 border-red-200"
    : code >= 400
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : code >= 300
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium border",
      className
    )}>
      {code}
    </span>
  );
}
