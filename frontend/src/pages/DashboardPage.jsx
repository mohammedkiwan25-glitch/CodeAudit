import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";
import { useProblems } from "../hooks/useProblems";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";

const DEFAULT_CUSTOM_STARTER_CODE = {
  javascript: `function solution() {
  // Write your solution here
  
}`,
  python: `def solution():
    # Write your solution here
    pass`,
  java: `class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}`,
};

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({
    problemSource: "built-in",
    problem: "",
    problemId: null,
    difficulty: "",
    problemDetails: null,
    customProblem: {
      title: "",
      difficulty: "Medium",
      description: "",
      example: "",
      constraints: "",
    },
  });

  const createSessionMutation = useCreateSession();
  const { data: problemsData, isLoading: loadingProblems } = useProblems();

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
    const isCustomProblem = roomConfig.problemSource === "custom";
    const customProblem = roomConfig.customProblem || {};
    const problemTitle = isCustomProblem ? customProblem.title?.trim() : roomConfig.problem?.trim();

    if (!problemTitle || !roomConfig.difficulty) return;
    if (isCustomProblem && !customProblem.description?.trim()) return;

    const problemDetails = isCustomProblem
      ? {
          id: `custom-${Date.now()}`,
          source: "custom",
          title: problemTitle,
          difficulty: customProblem.difficulty,
          category: "Custom Interview Problem",
          description: {
            text: customProblem.description.trim(),
            notes: [],
          },
          examples: customProblem.example.trim()
            ? [{ input: customProblem.example.trim(), output: "" }]
            : [],
          constraints: customProblem.constraints
            .split("\n")
            .map((constraint) => constraint.trim())
            .filter(Boolean),
          starterCode: DEFAULT_CUSTOM_STARTER_CODE,
        }
      : null;

    createSessionMutation.mutate(
      {
        problem: problemTitle,
        problemId: isCustomProblem ? null : roomConfig.problemId,
        difficulty: roomConfig.difficulty.toLowerCase(),
        problemDetails,
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
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />

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

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
        problems={problemsData?.problems || []}
        isLoadingProblems={loadingProblems}
      />
    </>
  );
}

export default DashboardPage;
