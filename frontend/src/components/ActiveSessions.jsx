import {
  ArrowRightIcon,
  Code2Icon,
  CrownIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
  LoaderIcon,
} from "lucide-react";
import { Link } from "react-router";
import { getDifficultyBadgeClass } from "../lib/utils";

function ActiveSessions({
  sessions,
  isLoading,
  isUserInSession,
  title = "My Active Interviews",
  emptyTitle = "No active interviews",
  emptyText = "Create a session or join one from an invite link.",
}) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 sm:p-5">
        {/* HEADERS SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          {/* TITLE AND ICON */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ZapIcon className="size-4 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-black leading-tight">{title}</h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="size-2 bg-success rounded-full" />
            <span className="text-sm font-medium text-success">{sessions.length} active</span>
          </div>
        </div>

        {/* SESSIONS LIST */}
        <div className="space-y-2 max-h-[320px] sm:max-h-[260px] overflow-y-auto sm:pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <LoaderIcon className="size-8 animate-spin text-primary" />
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session._id}
                className="card bg-base-200 border border-base-300 hover:border-primary/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3">
                  {/* LEFT SIDE */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative size-11 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <Code2Icon className="size-5 text-white" />
                      <div className="absolute -top-1 -right-1 size-3 bg-success rounded-full border-2 border-base-100" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-base truncate">{session.problem}</h3>
                        <span
                          className={`badge badge-sm ${getDifficultyBadgeClass(
                            session.difficulty
                          )}`}
                        >
                          {session.difficulty.slice(0, 1).toUpperCase() +
                            session.difficulty.slice(1)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs opacity-80">
                        <div className="flex items-center gap-1.5">
                          <CrownIcon className="size-3.5" />
                          <span className="font-medium">{session.host?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UsersIcon className="size-3.5" />
                          <span className="text-xs">{session.participant ? "2/2" : "1/2"}</span>
                        </div>
                        {session.participant && !isUserInSession(session) ? (
                          <span className="badge badge-error badge-sm">FULL</span>
                        ) : (
                          <span className="badge badge-success badge-sm">OPEN</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {session.participant && !isUserInSession(session) ? (
                    <button className="btn btn-disabled btn-sm w-full sm:w-auto">Full</button>
                  ) : (
                    <Link to={`/session/${session._id}`} className="btn btn-primary btn-sm gap-2 w-full sm:w-auto">
                      {isUserInSession(session) ? "Rejoin" : "Join"}
                      <ArrowRightIcon className="size-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <SparklesIcon className="w-7 h-7 text-primary/50" />
              </div>
              <p className="font-semibold opacity-70 mb-1">{emptyTitle}</p>
              <p className="text-sm opacity-50">{emptyText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ActiveSessions;
