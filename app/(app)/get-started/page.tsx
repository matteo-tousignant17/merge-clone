import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, Code2, Link2, Zap, Book } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Get your API key",
    description: "Generate an API key from the API Keys page to authenticate your requests.",
    completed: true,
    href: "/api-keys",
    icon: Code2,
  },
  {
    id: 2,
    title: "Create a link token",
    description: "Generate a link token from your backend to initialize the Merge Link component.",
    completed: true,
    href: "#",
    icon: Link2,
  },
  {
    id: 3,
    title: "Embed Merge Link",
    description: "Add the Merge Link component to your frontend so users can connect their tools.",
    completed: false,
    href: "/link",
    icon: Zap,
  },
  {
    id: 4,
    title: "Make your first API call",
    description: "Exchange the public token for an account token and start fetching normalized data.",
    completed: false,
    href: "/api-tester",
    icon: Book,
  },
];

const codeSnippet = `// 1. Create a link token (backend)
const response = await fetch('https://api.merge.dev/api/integrations/create-link-token', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    end_user_origin_id: 'your-user-id',
    end_user_organization_name: 'Acme Corp',
    end_user_email_address: 'user@acmecorp.com',
    categories: ['hris'],
  }),
});
const { link_token } = await response.json();

// 2. Initialize Merge Link (frontend)
import { useMergeLink } from '@mergeapi/react-merge-link';

const { open } = useMergeLink({
  linkToken: link_token,
  onSuccess: (public_token) => {
    // Exchange for account_token on your backend
    exchangeToken(public_token);
  },
});

// 3. Fetch data using account token
const employees = await fetch('https://api.merge.dev/api/hris/v1/employees', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'X-Account-Token': account_token,
  },
});`;

export default function GetStartedPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Get started</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Follow these steps to add your first integration in minutes
        </p>
      </div>

      {/* Progress steps */}
      <div className="space-y-3 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                step.completed
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-white border-gray-200 hover:border-blue-200"
              }`}
            >
              {step.completed ? (
                <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle size={20} className="text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Step {step.id}</span>
                </div>
                <p className={`text-sm font-semibold mt-0.5 ${step.completed ? "text-emerald-700" : "text-gray-800"}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>
              {!step.completed && (
                <Link href={step.href} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0">
                  Start <ArrowRight size={12} />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Code snippet */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick start example</p>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Copy</button>
        </div>
        <pre className="p-4 text-xs font-mono text-gray-700 overflow-auto bg-gray-950 text-gray-300">
          {codeSnippet}
        </pre>
      </div>

      {/* Docs link */}
      <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-800">Full documentation</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Explore guides, references, and SDK docs
          </p>
        </div>
        <Link
          href="https://docs.merge.dev"
          target="_blank"
          className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          View docs <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
