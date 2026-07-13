import { Link } from "react-router";
import { ActivityIcon, CheckCircle2Icon, ClipboardCheckIcon, Loader2Icon, ShieldCheckIcon, StarIcon, UsersIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useSupervisorOverview } from "../hooks/useSupervisor";
import { getDifficultyBadgeClass } from "../lib/utils";

const OUTCOME_LABELS = {
  pending: "Pending",
  "strong-hire": "Strong hire",
  hire: "Hire",
  "no-hire": "No hire",
};

function SupervisorDashboardPage() {
  const { data: currentUserData, isLoading: loadingUser } = useCurrentUser();
  const isSupervisor = currentUserData?.user?.role === "supervisor";
  const { data, isLoading, isError } = useSupervisorOverview(isSupervisor);
  const overview = data?.overview;

  if (loadingUser || (isSupervisor && isLoading)) {
    return <div className="min-h-screen bg-base-200 flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2Icon className="size-10 animate-spin text-primary" /></div></div>;
  }

  if (!isSupervisor) {
    return <div className="min-h-screen bg-base-200"><Navbar /><main className="max-w-lg mx-auto px-4 py-20"><div className="bg-base-100 border border-base-300 rounded-lg p-8 text-center"><ShieldCheckIcon className="size-10 text-primary mx-auto" /><h1 className="text-2xl font-black mt-4">Supervisor access required</h1><p className="text-base-content/60 mt-2">This dashboard is restricted to authorized supervisors.</p><Link className="btn btn-primary mt-6" to="/dashboard">Back to Dashboard</Link></div></main></div>;
  }

  if (isError || !overview) {
    return <div className="min-h-screen bg-base-200"><Navbar /><main className="max-w-xl mx-auto px-4 py-20"><div className="alert alert-error">Unable to load the supervisor dashboard.</div></main></div>;
  }

  const stats = [
    { label: "Registered users", value: overview.stats.users, icon: <UsersIcon className="size-5" /> },
    { label: "Total interviews", value: overview.stats.interviews, icon: <ActivityIcon className="size-5" /> },
    { label: "Completed reports", value: `${overview.stats.reportsCompleted}/${overview.stats.completed}`, icon: <ClipboardCheckIcon className="size-5" /> },
    { label: "Average score", value: overview.stats.averageRating ? `${overview.stats.averageRating}/5` : "Not rated", icon: <StarIcon className="size-5" /> },
  ];
  const maxOutcome = Math.max(1, ...Object.values(overview.outcomes));

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div><p className="text-sm font-bold text-primary flex items-center gap-2"><ShieldCheckIcon className="size-4" /> Supervisor workspace</p><h1 className="text-3xl sm:text-4xl font-black mt-1">Organization overview</h1><p className="text-base-content/60 mt-2">Monitor interview activity, evaluation coverage, and interviewer performance.</p></div>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon }) => (
            <article key={label} className="bg-base-100 border border-base-300 rounded-lg p-5 flex items-start justify-between gap-4"><div><p className="text-sm text-base-content/55">{label}</p><p className="text-2xl font-black mt-2">{value}</p></div><span className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</span></article>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)] gap-5">
          <div className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-base-300"><h2 className="text-xl font-black">Interviewer activity</h2><p className="text-sm text-base-content/50 mt-1">Interview volume and average rubric scores.</p></div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Interviewer</th><th>Total</th><th>Completed</th><th>Avg. score</th></tr></thead>
                <tbody>{overview.interviewers.map((interviewer) => <tr key={interviewer._id}><td><p className="font-bold">{interviewer.name}</p><p className="text-xs text-base-content/45">{interviewer.email}</p></td><td>{interviewer.total}</td><td>{interviewer.completed}</td><td>{interviewer.averageRating ? `${interviewer.averageRating}/5` : "-"}</td></tr>)}</tbody>
              </table>
              {!overview.interviewers.length && <p className="p-6 text-sm text-base-content/50">No interviewer activity yet.</p>}
            </div>
          </div>

          <div className="bg-base-100 border border-base-300 rounded-lg p-5">
            <h2 className="text-xl font-black">Hiring outcomes</h2><p className="text-sm text-base-content/50 mt-1 mb-5">Decisions from completed interviews.</p>
            <div className="space-y-4">{Object.entries(overview.outcomes).map(([outcome, count]) => <div key={outcome}><div className="flex justify-between text-sm mb-1.5"><span className="font-semibold">{OUTCOME_LABELS[outcome]}</span><span>{count}</span></div><div className="h-2.5 bg-base-200 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(count / maxOutcome) * 100}%` }} /></div></div>)}</div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.65fr)] gap-5">
          <div className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-base-300 flex items-center justify-between"><div><h2 className="text-xl font-black">Recent interviews</h2><p className="text-sm text-base-content/50 mt-1">Latest activity across all users.</p></div><CheckCircle2Icon className="size-5 text-primary" /></div>
            <div className="divide-y divide-base-300">{overview.recentSessions.map((session) => <div key={session._id} className="p-4 flex flex-col md:flex-row md:items-center gap-3"><div className="flex-1 min-w-0"><div className="flex flex-wrap gap-2 items-center"><p className="font-bold">{session.problem}</p><span className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}>{session.difficulty}</span><span className={`badge badge-sm ${session.status === "active" ? "badge-success" : "badge-ghost"}`}>{session.status}</span></div><p className="text-xs text-base-content/50 mt-2">{session.host?.name || "Unknown host"} · {session.participant?.name || "Waiting for participant"} · {new Date(session.createdAt).toLocaleDateString()}</p></div>{session.status === "completed" && <Link className="btn btn-sm btn-outline" to={`/session/${session._id}/report`}>Review</Link>}</div>)}</div>
          </div>

          <div className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-base-300"><h2 className="text-xl font-black">Recent users</h2></div>
            <div className="divide-y divide-base-300">{overview.recentUsers.map((user) => <div key={user._id} className="p-4"><div className="flex items-center justify-between gap-2"><p className="font-bold truncate">{user.name}</p><span className={`badge badge-sm ${user.role === "supervisor" ? "badge-primary" : "badge-ghost"}`}>{user.role}</span></div><p className="text-xs text-base-content/50 truncate mt-1">{user.email}</p><p className="text-xs text-base-content/40 mt-2">Joined {new Date(user.createdAt).toLocaleDateString()}</p></div>)}</div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SupervisorDashboardPage;
