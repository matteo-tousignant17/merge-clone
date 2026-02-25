import {
  StravaActivity,
  formatDistance,
  formatPace,
  formatDuration,
  formatElevation,
  formatDate,
  getActivityEmoji,
  getActivityColor,
} from "@/lib/strava-utils";
import { Heart, Trophy, TrendingUp } from "lucide-react";

interface ActivityListProps {
  activities: StravaActivity[];
  limit?: number;
}

export function ActivityList({ activities, limit = 20 }: ActivityListProps) {
  const items = activities.slice(0, limit);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 w-8"></th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Activity</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Date</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Distance</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Pace / Speed</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Time</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Elevation</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">
              <Heart size={12} className="inline text-red-400" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-10 text-center text-sm text-gray-400">
                No activities found
              </td>
            </tr>
          ) : items.map((activity) => {
            const type = activity.sport_type ?? activity.type;
            const emoji = getActivityEmoji(type);
            const color = getActivityColor(type);

            return (
              <tr key={activity.id} className="hover:bg-gray-50/40 transition-colors">
                {/* Type emoji */}
                <td className="px-5 py-3 text-lg">{emoji}</td>

                {/* Name + achievements */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-snug">{activity.name}</p>
                      <p className="text-xs text-gray-400">{type}</p>
                    </div>
                    {activity.achievement_count > 0 && (
                      <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                        <Trophy size={11} />
                        <span>{activity.achievement_count}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(activity.start_date_local)}
                </td>

                {/* Distance */}
                <td className="px-5 py-3 text-sm font-semibold text-gray-800 text-right">
                  {formatDistance(activity.distance)}
                </td>

                {/* Pace / Speed */}
                <td className="px-5 py-3 text-sm text-gray-600 text-right">
                  {formatPace(activity.average_speed, type)}
                </td>

                {/* Moving time */}
                <td className="px-5 py-3 text-sm text-gray-600 text-right">
                  {formatDuration(activity.moving_time)}
                </td>

                {/* Elevation */}
                <td className="px-5 py-3 text-right">
                  {activity.total_elevation_gain > 0 ? (
                    <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
                      <TrendingUp size={12} className="text-gray-400" />
                      {formatElevation(activity.total_elevation_gain)}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-300">—</span>
                  )}
                </td>

                {/* Heart rate */}
                <td className="px-5 py-3 text-right">
                  {activity.has_heartrate && activity.average_heartrate ? (
                    <span className="text-sm font-medium text-red-500">
                      {Math.round(activity.average_heartrate)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
