import { useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router";
import { CalendarIcon, ClockIcon, Loader2Icon, PlusIcon, SearchIcon, UsersIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useSessionHistory } from "../hooks/useSessions";
import { getDifficultyBadgeClass } from "../lib/utils";

function InterviewHistoryPage() {
  const { user } = useUser();
  const { data, isLoading, isError } = useSessionHistory();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const sessions = useMemo(() => data?.sessions || [], [data?.sessions]);

  const filtered = useMemo(() => sessions.filter((session) => {
    const isHost = session.host?.clerkId === user?.id;
    const matchesSearch = session.problem.toLowerCase().includes(search.toLowerCase()) || session.host?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || session.status === status;
    const matchesRole = role === "all" || (role === "host" ? isHost : !isHost);
    return matchesSearch && matchesStatus && matchesRole;
  }), [role, search, sessions, status, user?.id]);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div><p className="text-sm font-bold text-primary">Interviews</p><h1 className="text-3xl sm:text-4xl font-black mt-1">Interview history</h1><p className="text-base-content/60 mt-2">All interviews you hosted or joined.</p></div>
          <Link className="btn btn-primary gap-2" to="/interviews/new"><PlusIcon className="size-4" /> New Interview</Link>
        </div>

        <div className="bg-base-100 border border-base-300 rounded-lg p-4 mb-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px_180px] gap-3">
          <label className="input input-bordered flex items-center gap-2"><SearchIcon className="size-4 text-base-content/40" /><input className="grow" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search interviews" /></label>
          <select className="select select-bordered" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="completed">Completed</option></select>
          <select className="select select-bordered" value={role} onChange={(e) => setRole(e.target.value)}><option value="all">All roles</option><option value="host">Hosted</option><option value="joined">Joined</option></select>
        </div>

        {isLoading ? <div className="flex justify-center py-20"><Loader2Icon className="size-10 animate-spin text-primary" /></div> : isError ? <div className="alert alert-error">Unable to load interview history.</div> : (
          <div className="space-y-3">
            {filtered.map((session) => {
              const isHost = session.host?.clerkId === user?.id;
              return (
                <article key={session._id} className="bg-base-100 border border-base-300 rounded-lg p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{session.problem}</h2><span className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}>{session.difficulty}</span><span className={`badge badge-sm ${session.status === "active" ? "badge-success" : "badge-ghost"}`}>{session.status}</span><span className="badge badge-sm badge-outline">{isHost ? "Host" : "Participant"}</span></div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-base-content/60"><span className="flex items-center gap-1.5"><CalendarIcon className="size-4" />{new Date(session.createdAt).toLocaleDateString()}</span><span className="flex items-center gap-1.5"><UsersIcon className="size-4" />{session.participant ? "2 participants" : "1 participant"}</span><span className="flex items-center gap-1.5"><ClockIcon className="size-4" />{session.status === "active" ? "In progress" : "Completed"}</span></div>
                  </div>
                  <Link className="btn btn-sm btn-primary lg:w-32" to={session.status === "active" ? `/session/${session._id}` : `/session/${session._id}/report`}>{session.status === "active" ? "Rejoin" : "View Report"}</Link>
                </article>
              );
            })}
            {!filtered.length ? <div className="text-center py-16 bg-base-100 border border-base-300 rounded-lg"><p className="font-semibold">No interviews match these filters.</p></div> : null}
          </div>
        )}
      </main>
    </div>
  );
}

export default InterviewHistoryPage;
