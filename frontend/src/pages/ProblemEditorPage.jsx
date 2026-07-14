import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeftIcon, Loader2Icon, SaveIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCreateProblem, useMyProblems, useUpdateProblem } from "../hooks/useProblems";
import { LANGUAGE_CONFIG } from "../config/languages";
import { useCurrentUser } from "../hooks/useCurrentUser";

const EMPTY_FORM = {
  title: "", difficulty: "medium", category: "", description: "", notes: "", exampleInput: "", exampleOutput: "", exampleExplanation: "", constraints: "", isPublic: false,
  starterCode: { javascript: "function solution() {\n  \n}", python: "def solution():\n    pass", java: "class Solution {\n    public static void main(String[] args) {\n    }\n}" },
};

function ProblemEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { data, isLoading } = useMyProblems();
  const createProblem = useCreateProblem();
  const updateProblem = useUpdateProblem();
  const { data: currentUserData } = useCurrentUser();
  const isSupervisor = currentUserData?.user?.role === "supervisor";
  const backPath = isSupervisor ? "/supervisor" : "/my-problems";
  const [form, setForm] = useState(EMPTY_FORM);
  const [language, setLanguage] = useState("javascript");
  const [section, setSection] = useState("details");
  const [initialized, setInitialized] = useState(false);
  const problem = data?.problems?.find((item) => item._id === id);

  useEffect(() => {
    if (!isEditing || !problem || initialized) return;
    const example = problem.examples?.[0] || {};
    setForm({
      title: problem.title, difficulty: problem.difficulty.toLowerCase(), category: problem.category || "", description: problem.description?.text || "", notes: problem.description?.notes?.join("\n") || "", exampleInput: example.input || "", exampleOutput: example.output || "", exampleExplanation: example.explanation || "", constraints: problem.constraints?.join("\n") || "", isPublic: problem.isPublic, starterCode: { ...EMPTY_FORM.starterCode, ...problem.starterCode },
    });
    setInitialized(true);
  }, [initialized, isEditing, problem]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const payload = {
    title: form.title, difficulty: form.difficulty, category: form.category,
    description: { text: form.description, notes: form.notes.split("\n").map((item) => item.trim()).filter(Boolean) },
    examples: form.exampleInput || form.exampleOutput ? [{ input: form.exampleInput, output: form.exampleOutput, explanation: form.exampleExplanation }] : [],
    constraints: form.constraints.split("\n").map((item) => item.trim()).filter(Boolean), starterCode: form.starterCode, expectedOutput: {}, isPublic: form.isPublic,
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const options = { onSuccess: () => navigate(backPath) };
    if (isEditing) updateProblem.mutate({ id, data: payload }, options);
    else createProblem.mutate(payload, options);
  };

  if (isEditing && isLoading) return <div className="min-h-screen bg-base-200 flex items-center justify-center"><Loader2Icon className="size-10 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button className="btn btn-ghost btn-sm gap-2 mb-5" onClick={() => navigate(backPath)}><ArrowLeftIcon className="size-4" /> {isSupervisor ? "Supervisor" : "My Problems"}</button>
        <div className="mb-6"><p className="text-sm font-bold text-primary">Problem library</p><h1 className="text-3xl sm:text-4xl font-black mt-1">{isEditing ? "Edit problem" : "Create a problem"}</h1><p className="text-base-content/55 mt-2">Define the prompt, example, constraints, and starter code in one place.</p></div>

        {isEditing && !isLoading && !problem ? <div className="alert alert-error">Problem not found or you do not own it.</div> : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5 items-start">
            <div className="bg-base-100 border border-base-300 rounded-lg overflow-hidden min-w-0">
              <div className="grid grid-cols-3 border-b border-base-300 bg-base-200">
                {[['details', 'Details'], ['example', 'Example'], ['code', 'Starter Code']].map(([key, label]) => <button key={key} type="button" onClick={() => setSection(key)} className={`px-3 py-3.5 text-sm font-bold border-b-2 ${section === key ? "border-primary text-primary bg-base-100" : "border-transparent text-base-content/55"}`}>{label}</button>)}
              </div>

              {section === "details" && <div className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_160px] gap-4"><label className="flex flex-col gap-2 min-w-0"><span className="font-semibold">Title</span><input required className="input input-bordered w-full" value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Problem title" /></label><label className="flex flex-col gap-2 min-w-0"><span className="font-semibold">Difficulty</span><select className="select select-bordered w-full" value={form.difficulty} onChange={(e) => setField("difficulty", e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label></div>
                <label className="flex flex-col gap-2"><span className="font-semibold">Category</span><input className="input input-bordered w-full" value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="Arrays, Strings, System Design..." /></label>
                <label className="flex flex-col gap-2"><span className="font-semibold">Problem statement</span><textarea required className="textarea textarea-bordered w-full min-h-52 leading-relaxed" value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Describe the task and expected result." /></label>
                <label className="flex flex-col gap-2"><span className="font-semibold">Additional notes</span><textarea className="textarea textarea-bordered w-full min-h-24" value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="One note per line" /></label>
              </div>}

              {section === "example" && <div className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="flex flex-col gap-2 min-w-0"><span className="font-semibold">Example input</span><textarea className="textarea textarea-bordered w-full min-h-32 font-mono text-sm" value={form.exampleInput} onChange={(e) => setField("exampleInput", e.target.value)} /></label><label className="flex flex-col gap-2 min-w-0"><span className="font-semibold">Expected output</span><textarea className="textarea textarea-bordered w-full min-h-32 font-mono text-sm" value={form.exampleOutput} onChange={(e) => setField("exampleOutput", e.target.value)} /></label></div>
                <label className="flex flex-col gap-2"><span className="font-semibold">Example explanation</span><textarea className="textarea textarea-bordered w-full min-h-28" value={form.exampleExplanation} onChange={(e) => setField("exampleExplanation", e.target.value)} /></label>
                <label className="flex flex-col gap-2"><span className="font-semibold">Constraints</span><textarea className="textarea textarea-bordered w-full min-h-36 font-mono text-sm" value={form.constraints} onChange={(e) => setField("constraints", e.target.value)} placeholder="One constraint per line" /></label>
              </div>}

              {section === "code" && <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4 mb-4"><div><h2 className="font-black text-lg">Starter code</h2><p className="text-sm text-base-content/50 mt-1">The candidate sees this when the session begins.</p></div><select className="select select-bordered select-sm" value={language} onChange={(e) => setLanguage(e.target.value)}>{Object.entries(LANGUAGE_CONFIG).map(([key, config]) => <option key={key} value={key}>{config.name}</option>)}</select></div>
                <textarea className="textarea textarea-bordered w-full min-h-[420px] font-mono text-sm" value={form.starterCode[language]} onChange={(e) => setForm((current) => ({ ...current, starterCode: { ...current.starterCode, [language]: e.target.value } }))} />
              </div>}
            </div>

            <aside className="bg-base-100 border border-base-300 rounded-lg p-5 lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase text-primary">Summary</p><h2 className="font-black text-lg mt-2 break-words">{form.title || "Untitled problem"}</h2><div className="flex flex-wrap gap-2 mt-3"><span className="badge badge-outline capitalize">{form.difficulty}</span>{form.category && <span className="badge badge-ghost">{form.category}</span>}</div>
              <div className="border-t border-base-300 mt-5 pt-5"><label className="flex items-center justify-between gap-3 cursor-pointer"><span><span className="font-semibold block">{isSupervisor ? "Shared library" : "Public"}</span><span className="text-xs text-base-content/50">Visible to interviewers</span></span><input type="checkbox" className="toggle toggle-primary" checked={form.isPublic} onChange={(e) => setField("isPublic", e.target.checked)} /></label></div>
              <button className="btn btn-primary w-full gap-2 mt-6" disabled={createProblem.isPending || updateProblem.isPending}><SaveIcon className="size-4" /> {isEditing ? "Save Changes" : "Create Problem"}</button>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}

export default ProblemEditorPage;
