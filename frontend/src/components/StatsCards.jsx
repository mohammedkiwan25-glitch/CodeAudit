import { BriefcaseBusinessIcon, HistoryIcon, UserRoundCheckIcon } from "lucide-react";

function StatsCards({ recentSessionsCount, hostedSessionsCount, joinedSessionsCount }) {
  const stats = [
    {
      label: "Completed Interviews",
      value: recentSessionsCount,
      icon: HistoryIcon,
      color: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      label: "Hosted By Me",
      value: hostedSessionsCount,
      icon: BriefcaseBusinessIcon,
      color: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      label: "Joined By Me",
      value: joinedSessionsCount,
      icon: UserRoundCheckIcon,
      color: "text-accent",
      iconBg: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div key={stat.label} className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 sm:p-5 flex-row items-center gap-4">
              <div className={`size-11 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-black leading-none">{stat.value}</div>
                <div className="text-sm text-base-content/60 mt-1">{stat.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;
