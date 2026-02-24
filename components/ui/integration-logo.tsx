import { Integration } from "@/lib/mock-data";

interface IntegrationLogoProps {
  integration: Integration;
  size?: number;
  className?: string;
}

export function IntegrationLogo({ integration, size = 32, className = "" }: IntegrationLogoProps) {
  return (
    <div
      className={`rounded-md flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: integration.color,
        fontSize: size * 0.32,
      }}
    >
      {integration.initials}
    </div>
  );
}
