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
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder}mins`;
  return remainder ? `${hours}h ${remainder}mins` : `${hours}h`;
};

function SessionReportPage() {
  const { id } = useParams();
  const { user } = useUser();
  const { data, isLoading, isError } = useSessionById(id);
  const updateReport = useUpdateSessionReport();
  const [form, setForm] = useState(EMPTY_REPORT);
  const [section, setSection] = useState("rubric");
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
    : session?.report?.rating || 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    updateReport.mutate({ id, report: form });
  };

  if (isLoading) return <div className="min-h-screen bg-base-200 flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2Icon className="size-10 animate-spin text-primary" /></div></div>;
  if (isError || !session) return <div className="min-h-screen bg-base-200"><Navbar /><main className="max-w-xl mx-auto px-4 py-20"><div className="alert alert-error">This interview report is unavailable.</div></main></div>;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div><p className="text-sm font-bold text-primary">Interview report</p><h1 className="text-3xl sm:text-4xl font-black mt-1">{session.problem}</h1><div className="flex flex-wrap gap-2 mt-3"><span className={`badge ${getDifficultyBadgeClass(session.difficulty)}`}>{session.difficulty}</span><span className="badge badge-ghost">{session.workspace?.language || "javascript"}</span><span className="badge badge-success">Completed</span></div></div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start">
          <div className="bg-base-100 border border-base-300 rounded-lg overflow-hidden min-w-0">
            <div className="grid grid-cols-2 bg-base-200 border-b border-base-300">
              <button type="button" onClick={() => setSection("rubric")} className={`py-3.5 text-sm font-bold border-b-2 ${section === "rubric" ? "bg-base-100 border-primary text-primary" : "border-transparent text-base-content/55"}`}>Rubric</button>
              <button type="button" onClick={() => setSection("feedback")} className={`py-3.5 text-sm font-bold border-b-2 ${section === "feedback" ? "bg-base-100 border-primary text-primary" : "border-transparent text-base-content/55"}`}>Feedback & Notes</button>
            </div>

            <fieldset disabled={!isHost || session.status !== "completed"}>
              {section === "rubric" && <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6"><label className="flex flex-col gap-2 flex-1"><span className="font-semibold">Final outcome</span><select className="select select-bordered w-full" value={form.outcome} onChange={(e) => setField("outcome", e.target.value)}>{Object.entries(OUTCOMES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="bg-primary/10 text-primary rounded-lg px-5 py-3 min-w-36"><p className="text-xs font-semibold">Overall score</p><p className="text-2xl font-black mt-0.5">{calculatedRating ? `${calculatedRating}/5` : "-"}</p></div></div>
                <div className="space-y-3">{RUBRIC_ITEMS.map((item) => <div key={item.key} className="border border-base-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"><div className="flex-1"><p className="font-bold">{item.label}</p><p className="text-xs text-base-content/50 mt-1">{item.description}</p></div><select className="select select-bordered select-sm w-full sm:w-44" value={form.rubric[item.key]} onChange={(e) => setField("rubric", { ...form.rubric, [item.key]: e.target.value })}><option value="">Not scored</option>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score} - {SCORE_LABELS[score]}</option>)}</select></div>)}</div>
              </div>}

              {section === "feedback" && <div className="p-5 sm:p-6 space-y-5">
                <label className="flex flex-col gap-2"><span className="font-semibold">Strengths</span><textarea className="textarea textarea-bordered w-full min-h-36" value={form.strengths} onChange={(e) => setField("strengths", e.target.value)} placeholder="What went well? Include specific evidence." /></label>
                <label className="flex flex-col gap-2"><span className="font-semibold">Areas to improve</span><textarea className="textarea textarea-bordered w-full min-h-36" value={form.improvements} onChange={(e) => setField("improvements", e.target.value)} placeholder="What should the candidate improve?" /></label>
                <label className="flex flex-col gap-2"><span className="font-semibold">Private interviewer notes</span><textarea className="textarea textarea-bordered w-full min-h-40" value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Decision context and internal follow-up." /></label>
              </div>}
            </fieldset>
          </div>

          <aside className="bg-base-100 border border-base-300 rounded-lg p-5 lg:sticky lg:top-24">
            <div className="flex items-center gap-3"><UsersIcon className="size-5 text-primary" /><div className="min-w-0"><p className="text-xs text-base-content/50">Candidate</p><p className="font-bold truncate">{session.participant?.name || "Not joined"}</p></div></div>
            <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-base-300"><div><Clock3Icon className="size-4 text-primary" /><p className="text-xs text-base-content/50 mt-2">Duration</p><p className="font-bold text-sm mt-1">{formatDuration(duration)}</p></div><div><CalendarIcon className="size-4 text-primary" /><p className="text-xs text-base-content/50 mt-2">Completed</p><p className="font-bold text-sm mt-1">{endedAt.toLocaleDateString()}</p></div></div>
            <div className="mt-5 p-4 rounded-lg bg-primary/10 text-primary"><div className="flex items-center gap-2"><StarIcon className="size-4" /><p className="text-xs font-bold">Overall score</p></div><p className="text-3xl font-black mt-2">{calculatedRating ? calculatedRating : "-"}<span className="text-base font-semibold"> / 5</span></p></div>
            <Link className="btn btn-outline btn-sm w-full mt-5" to={`/session/${id}/review`}><FileTextIcon className="size-4" /> Code & Output</Link>
            {isHost && <button className="btn btn-primary w-full gap-2 mt-3" disabled={updateReport.isPending}><SaveIcon className="size-4" /> Save Report</button>}
          </aside>
        </form>
      </main>
    </div>
  );
}

export default SessionReportPage;
