import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useActiveSessions, useMyRecentSessions } from "../hooks/useSessions";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const {
    data: activeSessionsData,
    isLoading: loadingActiveSessions,
    isError: activeSessionsError,
  } = useActiveSessions();
  const {
    data: recentSessionsData,
    isLoading: loadingRecentSessions,
    isError: recentSessionsError,
  } = useMyRecentSessions();

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];
  const createdActiveSessions = activeSessions.filter((session) => session.host?.clerkId === user?.id);
  const joinedActiveSessions = activeSessions.filter((session) => session.participant?.clerkId === user?.id);
  const createdRecentSessions = recentSessions.filter((session) => session.host?.clerkId === user?.id);
  const joinedRecentSessions = recentSessions.filter((session) => session.participant?.clerkId === user?.id);

  const isUserInSession = (session) => {
    if (!user.id) return false;

    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <WelcomeSection onCreateSession={() => navigate("/interviews/new")} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-12 sm:pb-16 space-y-8">
          {(activeSessionsError || recentSessionsError) && (
            <div className="alert alert-error">
              <span>Unable to load interviews. Make sure the backend server is running.</span>
            </div>
          )}

          <StatsCards
            recentSessionsCount={recentSessions.length}
            hostedSessionsCount={createdRecentSessions.length}
            joinedSessionsCount={joinedRecentSessions.length}
          />

          <section>
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Live</p>
                <h2 className="text-2xl font-black mt-1">Active Interviews</h2>
              </div>
              <p className="text-sm text-base-content/50 hidden sm:block">
                Rejoin interviews currently in progress
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <ActiveSessions
                title="Hosted By Me"
                sessions={createdActiveSessions}
                isLoading={loadingActiveSessions}
                isUserInSession={isUserInSession}
                emptyTitle="No interviews created"
                emptyText="Create an interview and share its invite link."
              />
              <ActiveSessions
                title="Joined By Me"
                sessions={joinedActiveSessions}
                isLoading={loadingActiveSessions}
                isUserInSession={isUserInSession}
                emptyTitle="No joined interviews"
                emptyText="Interviews you join from invite links will appear here."
              />
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">History</p>
                <h2 className="text-2xl font-black mt-1">Completed Interviews</h2>
              </div>
              <p className="text-sm text-base-content/50 hidden sm:block">
                Open any interview to review its final code and output
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentSessions
                title="Hosted By Me"
                sessions={createdRecentSessions}
                isLoading={loadingRecentSessions}
                emptyText="Completed interviews you hosted will appear here."
                compact
              />
              <RecentSessions
                title="Joined By Me"
                sessions={joinedRecentSessions}
                isLoading={loadingRecentSessions}
                emptyText="Completed interviews you joined will appear here."
                compact
              />
            </div>
          </section>
        </main>
      </div>
  );
}

export default DashboardPage;
