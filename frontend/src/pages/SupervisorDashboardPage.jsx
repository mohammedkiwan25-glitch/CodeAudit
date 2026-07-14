import { Link } from "react-router";
import { ActivityIcon, BookOpenIcon, ClipboardCheckIcon, Edit3Icon, Loader2Icon, PlusIcon, ShieldCheckIcon, StarIcon, Trash2Icon, UsersIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useSupervisorOverview } from "../hooks/useSupervisor";
import { getDifficultyBadgeClass } from "../lib/utils";
import { useDeleteProblem, useMyProblems } from "../hooks/useProblems";

function SupervisorDashboardPage() {
  const { data: currentUserData, isLoading: loadingUser } = useCurrentUser();
  const isSupervisor = currentUserData?.user?.role === "supervisor";
  const { data, isLoading, isError } = useSupervisorOverview(isSupervisor);
  const { data: problemsData, isLoading: loadingProblems } = useMyProblems();
  const deleteProblem = useDeleteProblem();
  const overview = data?.overview;
  const problems = problemsData?.problems || [];

  const handleDeleteProblem = (problem) => {
    if (confirm(`Remove "${problem.title}" from the shared problem bank? Existing interviews will not be affected.`)) {
      deleteProblem.mutate(problem._id);
    }
  };

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

        <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-base-300"><h2 className="text-xl font-black">Interviewer activity</h2><p className="text-sm text-base-content/50 mt-1">Interview volume and average rubric scores.</p></div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Interviewer</th><th>Total</th><th>Completed</th><th>Avg. score</th></tr></thead>
                <tbody>{overview.interviewers.map((interviewer) => <tr key={interviewer._id}><td><p className="font-bold">{interviewer.name}</p><p className="text-xs text-base-content/45">{interviewer.email}</p></td><td>{interviewer.total}</td><td>{interviewer.completed}</td><td>{interviewer.averageRating ? `${interviewer.averageRating}/5` : "-"}</td></tr>)}</tbody>
              </table>
              {!overview.interviewers.length && <p className="p-6 text-sm text-base-content/50">No interviewer activity yet.</p>}
            </div>
        </section>

        <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-base-300"><h2 className="text-xl font-black">Recent interviews</h2><p className="text-sm text-base-content/50 mt-1">Open completed work to inspect the final code and output.</p></div>
            <div className="divide-y divide-base-300">{overview.recentSessions.map((session) => <div key={session._id} className="p-4 flex flex-col md:flex-row md:items-center gap-3"><div className="flex-1 min-w-0"><div className="flex flex-wrap gap-2 items-center"><p className="font-bold">{session.problem}</p><span className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}>{session.difficulty}</span><span className={`badge badge-sm ${session.status === "active" ? "badge-success" : "badge-ghost"}`}>{session.status}</span></div><p className="text-xs text-base-content/50 mt-2">{session.host?.name || "Unknown host"} | {session.participant?.name || "Waiting for participant"} | {new Date(session.createdAt).toLocaleDateString()}</p></div>{session.status === "completed" && <div className="flex gap-2"><Link className="btn btn-sm btn-outline" to={`/session/${session._id}/review`}>Review</Link><Link className="btn btn-sm btn-ghost" to={`/session/${session._id}/report`}>Report</Link></div>}</div>)}</div>
        </section>

        <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
          <div className="p-5 border-b border-base-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><p className="text-xs font-bold uppercase text-primary">Shared library</p><h2 className="text-xl font-black mt-1">Problem management</h2><p className="text-sm text-base-content/50 mt-1">Add, edit, or remove problems available to interviewers.</p></div><Link to="/my-problems/new" className="btn btn-primary btn-sm gap-2"><PlusIcon className="size-4" /> Add Problem</Link></div>
          {loadingProblems ? <div className="py-12 flex justify-center"><Loader2Icon className="size-7 animate-spin text-primary" /></div> : problems.length ? <div className="divide-y divide-base-300">{problems.map((problem) => <div key={problem._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"><span className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><BookOpenIcon className="size-5" /></span><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{problem.title}</p><span className={`badge badge-sm ${getDifficultyBadgeClass(problem.difficulty)}`}>{problem.difficulty}</span><span className="badge badge-sm badge-outline">{problem.source}</span></div><p className="text-xs text-base-content/50 mt-1">{problem.category || "Uncategorized"}</p></div><div className="flex gap-2"><Link to={`/my-problems/${problem._id}/edit`} className="btn btn-sm btn-outline gap-2"><Edit3Icon className="size-4" /> Edit</Link><button className="btn btn-sm btn-ghost text-error" onClick={() => handleDeleteProblem(problem)} disabled={deleteProblem.isPending}><Trash2Icon className="size-4" /></button></div></div>)}</div> : <div className="p-10 text-center"><p className="font-bold">No problems available</p><p className="text-sm text-base-content/50 mt-2">Add the first shared interview problem.</p></div>}
        </section>
      </main>
    </div>
  );
}

export default SupervisorDashboardPage;
