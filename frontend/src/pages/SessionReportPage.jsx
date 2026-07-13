import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link, useParams } from "react-router";
import { CalendarIcon, Clock3Icon, FileTextIcon, Loader2Icon, SaveIcon, StarIcon, UsersIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useSessionById, useUpdateSessionReport } from "../hooks/useSessions";
import { getDifficultyBadgeClass } from "../lib/utils";

const RUBRIC_ITEMS = [
  { key: "problemSolving", label: "Problem solving", description: "Understands the task and develops a sound approach." },
  { key: "correctness", label: "Correctness", description: "Produces a working solution and handles important cases." },
  { key: "codeQuality", label: "Code quality", description: "Writes readable, organized, and maintainable code." },
  { key: "communication", label: "Communication", description: "Explains decisions and responds clearly to feedback." },
  { key: "complexity", label: "Complexity analysis", description: "Evaluates time and space complexity accurately." },
];
const EMPTY_RUBRIC = Object.fromEntries(RUBRIC_ITEMS.map(({ key }) => [key, ""]));
const EMPTY_REPORT = { outcome: "pending", rubric: EMPTY_RUBRIC, strengths: "", improvements: "", notes: "" };
const OUTCOMES = { pending: "Pending decision", "strong-hire": "Strong hire", hire: "Hire", "no-hire": "No hire" };
const SCORE_LABELS = { 1: "Needs improvement", 2: "Developing", 3: "Meets expectations", 4: "Strong", 5: "Excellent" };

function SessionReportPage() {
  const { id } = useParams();
  const { user } = useUser();
  const { data, isLoading, isError } = useSessionById(id);
  const updateReport = useUpdateSessionReport();
  const [form, setForm] = useState(EMPTY_REPORT);
  const [initialized, setInitialized] = useState(false);
  const session = data?.session;
  const isHost = session?.host?.clerkId === user?.id;

  useEffect(() => {
    if (!session || initialized) return;
    setForm({
      outcome: session.report?.outcome || "pending",
      rubric: { ...EMPTY_RUBRIC, ...session.report?.rubric },
      strengths: session.report?.strengths || "",
      improvements: session.report?.improvements || "",
      notes: session.report?.notes || "",
    });
    setInitialized(true);
  }, [initialized, session]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const startedAt = session ? new Date(session.createdAt) : null;
  const endedAt = session ? new Date(session.endedAt || session.updatedAt) : null;
  const duration = startedAt && endedAt ? Math.max(1, Math.round((endedAt - startedAt) / 60000)) : 0;
  const rubricScores = Object.values(form.rubric).map(Number).filter((score) => score >= 1 && score <= 5);
  const calculatedRating = rubricScores.length
    ? (rubricScores.reduce((sum, score) => sum + score, 0) / rubricScores.length).toFixed(1)
    : session.report?.rating || 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    updateReport.mutate({ id, report: form });
  };

  if (isLoading) return <div className="min-h-screen bg-base-200 flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2Icon className="size-10 animate-spin text-primary" /></div></div>;
  if (isError || !session) return <div className="min-h-screen bg-base-200"><Navbar /><main className="max-w-xl mx-auto px-4 py-20"><div className="alert alert-error">This interview report is unavailable.</div></main></div>;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
          <div><p className="text-sm font-bold text-primary">Interview report</p><h1 className="text-3xl sm:text-4xl font-black mt-1">{session.problem}</h1><div className="flex flex-wrap gap-2 mt-3"><span className={`badge ${getDifficultyBadgeClass(session.difficulty)}`}>{session.difficulty}</span><span className="badge badge-ghost">{session.workspace?.language || "javascript"}</span><span className="badge badge-success">Completed</span></div></div>
          <Link className="btn btn-outline" to={`/session/${id}/review`}>View Code & Output</Link>
        </div>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-base-100 border border-base-300 rounded-lg p-4"><UsersIcon className="size-5 text-primary" /><p className="text-xs text-base-content/50 mt-3">Candidate</p><p className="font-bold mt-1 truncate">{session.participant?.name || "Not joined"}</p></div>
          <div className="bg-base-100 border border-base-300 rounded-lg p-4"><Clock3Icon className="size-5 text-primary" /><p className="text-xs text-base-content/50 mt-3">Duration</p><p className="font-bold mt-1">{duration} minutes</p></div>
          <div className="bg-base-100 border border-base-300 rounded-lg p-4"><CalendarIcon className="size-5 text-primary" /><p className="text-xs text-base-content/50 mt-3">Completed</p><p className="font-bold mt-1">{endedAt.toLocaleDateString()}</p></div>
          <div className="bg-base-100 border border-base-300 rounded-lg p-4"><StarIcon className="size-5 text-primary" /><p className="text-xs text-base-content/50 mt-3">Overall score</p><p className="font-bold mt-1">{calculatedRating ? `${calculatedRating} / 5` : "Not rated"}</p></div>
        </section>

        <form onSubmit={handleSubmit} className="bg-base-100 border border-base-300 rounded-lg p-5 sm:p-7">
          <div className="flex items-start gap-3 mb-6"><div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><FileTextIcon className="size-5" /></div><div><h2 className="text-xl font-black">Evaluation</h2><p className="text-sm text-base-content/55 mt-1">{isHost ? "Record a structured decision for this interview." : "Evaluation submitted by the interview host."}</p></div></div>
          <fieldset disabled={!isHost || session.status !== "completed"} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-4 items-end">
              <label className="form-control"><span className="label font-semibold">Outcome</span><select className="select select-bordered" value={form.outcome} onChange={(e) => setField("outcome", e.target.value)}>{Object.entries(OUTCOMES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <div className="bg-base-200 rounded-lg px-4 py-3"><p className="text-xs text-base-content/50">Calculated score</p><p className="text-xl font-black mt-1">{calculatedRating ? `${calculatedRating} / 5` : "Not rated"}</p></div>
            </div>
            <div className="border border-base-300 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-base-200 border-b border-base-300"><h3 className="font-black">Evaluation rubric</h3><p className="text-xs text-base-content/50 mt-1">Score each category from 1 (needs improvement) to 5 (excellent).</p></div>
              <div className="divide-y divide-base-300">
                {RUBRIC_ITEMS.map((item) => (
                  <div key={item.key} className="p-4 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_140px] gap-3 sm:items-center">
                    <div><p className="font-bold">{item.label}</p><p className="text-sm text-base-content/55 mt-1">{item.description}</p></div>
                    <select className="select select-bordered select-sm w-full" value={form.rubric[item.key]} onChange={(e) => setField("rubric", { ...form.rubric, [item.key]: e.target.value })}><option value="">Not scored</option>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score} - {SCORE_LABELS[score]}</option>)}</select>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="form-control"><span className="label font-semibold">Strengths</span><textarea className="textarea textarea-bordered min-h-32" value={form.strengths} onChange={(e) => setField("strengths", e.target.value)} placeholder="What went well?" /></label>
              <label className="form-control"><span className="label font-semibold">Areas to improve</span><textarea className="textarea textarea-bordered min-h-32" value={form.improvements} onChange={(e) => setField("improvements", e.target.value)} placeholder="What could be improved?" /></label>
            </div>
            <label className="form-control"><span className="label font-semibold">Private interviewer notes</span><textarea className="textarea textarea-bordered min-h-36" value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Decision context and follow-up notes" /></label>
          </fieldset>
          {isHost && <div className="flex justify-end mt-6 pt-5 border-t border-base-300"><button className="btn btn-primary gap-2" disabled={updateReport.isPending}><SaveIcon className="size-4" /> Save Report</button></div>}
        </form>
      </main>
    </div>
  );
}

export default SessionReportPage;
