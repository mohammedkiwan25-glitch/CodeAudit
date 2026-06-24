import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });

  const createSessionMutation = useCreateSession();

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

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;

    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          navigate(`/session/${data.session._id}`);
        },
      }
    );
  };

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
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />

        {/* Grid layout */}
        <div className="container mx-auto px-6 pb-16">
          {(activeSessionsError || recentSessionsError) && (
            <div className="alert alert-error mb-6">
              <span>Unable to load interviews. Make sure the backend server is running.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
            />
            <div className="lg:col-span-2 space-y-6">
              <ActiveSessions
                title="Created By Me"
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <RecentSessions
              title="Past Interviews Created By Me"
              sessions={createdRecentSessions}
              isLoading={loadingRecentSessions}
              emptyText="Completed interviews you hosted will appear here."
              compact
            />
            <RecentSessions
              title="Past Interviews Joined By Me"
              sessions={joinedRecentSessions}
              isLoading={loadingRecentSessions}
              emptyText="Completed interviews you joined will appear here."
              compact
            />
          </div>
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />
    </>
  );
}

export default DashboardPage;
