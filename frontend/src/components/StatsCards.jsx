import { TrophyIcon, UsersIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
      {/* Active Count */}
      <div className="card bg-base-100 border-2 border-primary/20 hover:border-primary/40">
        <div className="card-body p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl">
              <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="badge badge-primary badge-sm sm:badge-md">Live</div>
          </div>
          <div className="text-2xl sm:text-3xl font-black leading-none mb-1">{activeSessionsCount}</div>
          <div className="text-sm opacity-60">Active Sessions</div>
        </div>
      </div>

      {/* Recent Count */}
      <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/40">
        <div className="card-body p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 sm:p-2.5 bg-secondary/10 rounded-xl">
              <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black leading-none mb-1">{recentSessionsCount}</div>
          <div className="text-sm opacity-60">Total Sessions</div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
