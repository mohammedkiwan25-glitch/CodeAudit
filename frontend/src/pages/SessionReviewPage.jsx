import { Link, useNavigate, useParams } from "react-router";
import { ClockIcon, Code2Icon, Loader2Icon, UsersIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import OutputPanel from "../components/OutputPanel";
import { useSessionById } from "../hooks/useSessions";
import { getDifficultyBadgeClass } from "../lib/utils";

function SessionReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useSessionById(id);

  const session = data?.session;
  const workspace = session?.workspace;
  const startedAt = session?.createdAt ? new Date(session.createdAt) : null;
  const endedAt = session?.endedAt || session?.updatedAt ? new Date(session.endedAt || session.updatedAt) : null;
  const durationMinutes =
    startedAt && endedAt ? Math.max(1, Math.round((endedAt - startedAt) / 60000)) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2Icon className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !session) {
    const status = error?.response?.status;
    const message =
      status === 403
        ? "You can only review sessions you participated in."
        : "Unable to load this session review.";

    return (
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="card bg-base-100 shadow-xl max-w-md w-full">
            <div className="card-body text-center">
              <h1 className="card-title justify-center text-2xl">Review Unavailable</h1>
              <p className="text-base-content/70">{message}</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-wide text-primary font-bold">Session Review</p>
            <h1 className="text-3xl sm:text-4xl font-black mt-2 leading-tight break-words">
              {session.problem}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`badge badge-lg ${getDifficultyBadgeClass(session.difficulty)}`}>
                {session.difficulty}
              </span>
              <span className="badge badge-ghost badge-lg">{workspace?.language || "javascript"}</span>
              <span className="badge badge-success badge-lg">Completed</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link className="btn btn-outline" to={`/session/${id}/report`}>Interview Report</Link>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-100">
            <div className="card-body p-4 sm:p-6">
              <UsersIcon className="w-6 h-6 text-primary" />
              <p className="text-sm text-base-content/60">Participants</p>
              <p className="font-bold">
                {session.host?.name || "Host"}
                {session.participant?.name ? ` and ${session.participant.name}` : ""}
              </p>
            </div>
          </div>
          <div className="card bg-base-100">
            <div className="card-body p-4 sm:p-6">
              <ClockIcon className="w-6 h-6 text-primary" />
              <p className="text-sm text-base-content/60">Duration</p>
              <p className="font-bold">{durationMinutes ? `${durationMinutes} min` : "Not available"}</p>
            </div>
          </div>
          <div className="card bg-base-100">
            <div className="card-body p-4 sm:p-6">
              <Code2Icon className="w-6 h-6 text-primary" />
              <p className="text-sm text-base-content/60">Completed On</p>
              <p className="font-bold">{endedAt ? endedAt.toLocaleString() : "Not available"}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-100">
            <div className="card-body p-4 sm:p-6">
              <h2 className="card-title">Final Code</h2>
              <pre className="bg-base-300 rounded-lg p-3 sm:p-4 overflow-auto text-xs sm:text-sm min-h-[260px] sm:min-h-[360px] whitespace-pre-wrap">
                {workspace?.code || "No code was saved for this session."}
              </pre>
            </div>
          </div>

          <div className="card bg-base-100">
            <div className="card-body p-4 sm:p-6">
              <h2 className="card-title">Final Output</h2>
              <div className="h-[300px] sm:h-[420px] border border-base-300 rounded-lg overflow-hidden">
                <OutputPanel output={workspace?.output || null} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SessionReviewPage;
