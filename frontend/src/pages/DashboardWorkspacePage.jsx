import { useUser } from "@clerk/clerk-react";
import { formatDistanceToNow } from "date-fns";
import { ArrowRightIcon, BarChart3Icon, BookOpenIcon, CalendarDaysIcon, CheckCircle2Icon, ClipboardCheckIcon, Code2Icon, HistoryIcon, Loader2Icon, PlusIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";
import { useActiveSessions, useMyRecentSessions } from "../hooks/useSessions";
import { getDifficultyBadgeClass } from "../lib/utils";

const QUICK_ACTIONS = [
  { to: "/interviews/new", title: "New interview", text: "Choose a problem and create an invite", icon: <PlusIcon className="size-5" /> },
  { to: "/problems", title: "Problem library", text: "Practice or manage interview questions", icon: <BookOpenIcon className="size-5" /> },
  { to: "/interviews", title: "Interview history", text: "Search all interviews and reports", icon: <HistoryIcon className="size-5" /> },
  { to: "/analytics", title: "Analytics", text: "Review activity and performance", icon: <BarChart3Icon className="size-5" /> },
];

function LoadingBlock() {
  return <div className="py-14 flex justify-center"><Loader2Icon className="size-7 animate-spin text-primary" /></div>;
}

function DashboardWorkspacePage() {
  const { user } = useUser();
  const { data: activeData, isLoading: loadingActive, isError: activeError } = useActiveSessions();
  const { data: recentData, isLoading: loadingRecent, isError: recentError } = useMyRecentSessions();
  const activeSessions = activeData?.sessions || [];
  const recentSessions = recentData?.sessions || [];
  const hostedCompleted = recentSessions.filter((session) => session.host?.clerkId === user?.id);
  const pendingReports = hostedCompleted.filter((session) => !session.report?.rating).slice(0, 4);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <header className="bg-base-100 border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-9 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div><p className="text-sm font-bold text-primary">Interview workspace</p><h1 className="text-3xl sm:text-4xl font-black mt-1">Welcome back, {user?.firstName || "there"}</h1><p className="text-base-content/55 mt-2">Continue live work, complete evaluations, or prepare the next interview.</p></div>
          <Link to="/interviews/new" className="btn btn-primary gap-2 w-full sm:w-auto"><PlusIcon className="size-4" /> Create Interview</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-9 space-y-7">
        {(activeError || recentError) && <div className="alert alert-error"><span>Some dashboard data could not be loaded. Make sure the backend is running.</span></div>}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => <Link key={action.to} to={action.to} className="bg-base-100 border border-base-300 hover:border-primary/50 rounded-lg p-4 sm:p-5 group"><span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{action.icon}</span><h2 className="font-black mt-4 group-hover:text-primary transition-colors">{action.title}</h2><p className="text-xs sm:text-sm text-base-content/50 mt-1 leading-relaxed hidden sm:block">{action.text}</p></Link>)}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)] gap-5 items-start">
          <div className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-base-300 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase text-primary">Live now</p><h2 className="text-xl font-black mt-1">Active interviews</h2></div><span className="badge badge-success badge-outline">{activeSessions.length} active</span></div>
            {loadingActive ? <LoadingBlock /> : activeSessions.length ? (
              <div className="divide-y divide-base-300">{activeSessions.map((session) => {
                const isHost = session.host?.clerkId === user?.id;
                return <div key={session._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"><span className="size-11 rounded-lg bg-primary text-primary-content flex items-center justify-center shrink-0"><Code2Icon className="size-5" /></span><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black truncate">{session.problem}</h3><span className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}>{session.difficulty}</span><span className="badge badge-sm badge-outline">{isHost ? "Host" : "Participant"}</span></div><p className="text-sm text-base-content/50 mt-2 flex items-center gap-1.5"><UsersIcon className="size-4" /> {session.participant ? "Both participants connected" : "Waiting for participant"}</p></div><Link to={`/session/${session._id}`} className="btn btn-primary btn-sm gap-2 w-full sm:w-auto">Rejoin <ArrowRightIcon className="size-4" /></Link></div>;
              })}</div>
            ) : <div className="p-8 sm:p-12 text-center"><CalendarDaysIcon className="size-9 text-base-content/25 mx-auto" /><h3 className="font-black mt-4">No active interviews</h3><p className="text-sm text-base-content/50 mt-2">Your live interviews will appear here.</p><Link to="/interviews/new" className="btn btn-primary btn-sm mt-5">Create Interview</Link></div>}
          </div>

          <aside className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-base-300"><p className="text-xs font-bold uppercase text-warning">Action needed</p><h2 className="text-xl font-black mt-1">Reports to finish</h2></div>
            {loadingRecent ? <LoadingBlock /> : pendingReports.length ? <div className="divide-y divide-base-300">{pendingReports.map((session) => <Link key={session._id} to={`/session/${session._id}/report`} className="p-4 block hover:bg-base-200"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold truncate">{session.problem}</p><p className="text-xs text-base-content/50 mt-1">{session.participant?.name || "No participant"}</p></div><ClipboardCheckIcon className="size-5 text-warning shrink-0" /></div><p className="text-xs text-base-content/40 mt-3">Completed {formatDistanceToNow(new Date(session.endedAt || session.updatedAt), { addSuffix: true })}</p></Link>)}</div> : <div className="p-8 text-center"><CheckCircle2Icon className="size-9 text-success mx-auto" /><h3 className="font-black mt-4">You are caught up</h3><p className="text-sm text-base-content/50 mt-2">No completed interviews are waiting for evaluation.</p></div>}
          </aside>
        </section>

        <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
          <div className="p-5 border-b border-base-300 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase text-secondary">Recent activity</p><h2 className="text-xl font-black mt-1">Completed interviews</h2></div><Link to="/interviews" className="btn btn-ghost btn-sm gap-2">View all <ArrowRightIcon className="size-4" /></Link></div>
          {loadingRecent ? <LoadingBlock /> : recentSessions.length ? <div className="divide-y divide-base-300">{recentSessions.slice(0, 5).map((session) => {
            const isHost = session.host?.clerkId === user?.id;
            return <Link to={`/session/${session._id}/report`} key={session._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-base-200"><div className="flex-1 min-w-0"><div className="flex flex-wrap gap-2 items-center"><p className="font-bold">{session.problem}</p><span className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}>{session.difficulty}</span><span className="badge badge-sm badge-outline">{isHost ? "Hosted" : "Joined"}</span></div><p className="text-xs text-base-content/50 mt-2">{session.participant?.name || "No participant"} · {formatDistanceToNow(new Date(session.endedAt || session.updatedAt), { addSuffix: true })}</p></div><div className="flex items-center justify-between sm:justify-end gap-4"><span className="text-sm font-bold">{session.report?.rating ? `${session.report.rating}/5` : isHost ? "Report pending" : "Not rated"}</span><ArrowRightIcon className="size-4 text-base-content/35" /></div></Link>;
          })}</div> : <div className="p-10 text-center"><p className="font-bold">No completed interviews yet</p><p className="text-sm text-base-content/50 mt-2">Completed sessions will appear here with their reports.</p></div>}
        </section>
      </main>
    </div>
  );
}

export default DashboardWorkspacePage;
