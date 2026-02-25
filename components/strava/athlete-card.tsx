import { StravaAthlete } from "@/lib/strava-utils";
import { Users, UserCheck, MapPin, Calendar } from "lucide-react";

export function AthleteCard({ athlete }: { athlete: StravaAthlete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {athlete.profile ? (
          <img
            src={athlete.profile}
            alt={`${athlete.firstname} ${athlete.lastname}`}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
            style={{ backgroundColor: "#FC4C02" }}>
            {athlete.firstname?.[0]}{athlete.lastname?.[0]}
          </div>
        )}
        {athlete.summit && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center" title="Strava Summit">
            <span className="text-white text-xs">⛰</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-gray-900">
          {athlete.firstname} {athlete.lastname}
        </h2>
        {athlete.username && (
          <p className="text-sm text-gray-400 font-mono">@{athlete.username}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 mt-2">
          {(athlete.city || athlete.state || athlete.country) && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={13} />
              {[athlete.city, athlete.state, athlete.country].filter(Boolean).join(", ")}
            </span>
          )}
          {athlete.created_at && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={13} />
              Since {new Date(athlete.created_at).getFullYear()}
            </span>
          )}
        </div>
      </div>

      {/* Social stats */}
      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{athlete.follower_count ?? "—"}</p>
          <div className="flex items-center gap-1 justify-center text-xs text-gray-400 mt-0.5">
            <Users size={11} />
            Followers
          </div>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{athlete.friend_count ?? "—"}</p>
          <div className="flex items-center gap-1 justify-center text-xs text-gray-400 mt-0.5">
            <UserCheck size={11} />
            Following
          </div>
        </div>
      </div>
    </div>
  );
}
