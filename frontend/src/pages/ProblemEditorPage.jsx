import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeftIcon, Loader2Icon, SaveIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCreateProblem, useMyProblems, useUpdateProblem } from "../hooks/useProblems";
import { LANGUAGE_CONFIG } from "../config/languages";

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
  const [form, setForm] = useState(EMPTY_FORM);
  const [language, setLanguage] = useState("javascript");
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
    const options = { onSuccess: () => navigate("/my-problems") };
    if (isEditing) updateProblem.mutate({ id, data: payload }, options);
    else createProblem.mutate(payload, options);
  };

  if (isEditing && isLoading) return <div className="min-h-screen bg-base-200 flex items-center justify-center"><Loader2Icon className="size-10 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button className="btn btn-ghost btn-sm gap-2 mb-5" onClick={() => navigate("/my-problems")}><ArrowLeftIcon className="size-4" /> My Problems</button>
        <div className="mb-7"><p className="text-sm font-bold text-primary">Problem library</p><h1 className="text-3xl sm:text-4xl font-black mt-1">{isEditing ? "Edit problem" : "Create a problem"}</h1></div>

        {isEditing && !isLoading && !problem ? <div className="alert alert-error">Problem not found or you do not own it.</div> : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="bg-base-100 border border-base-300 rounded-lg p-5 sm:p-6 space-y-4">
              <h2 className="text-xl font-black">Basics</h2>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px] gap-4"><label className="form-control"><span className="label font-semibold">Title</span><input required className="input input-bordered" value={form.title} onChange={(e) => setField("title", e.target.value)} /></label><label className="form-control"><span className="label font-semibold">Difficulty</span><select className="select select-bordered" value={form.difficulty} onChange={(e) => setField("difficulty", e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label></div>
              <label className="form-control"><span className="label font-semibold">Category</span><input className="input input-bordered" value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="Arrays, System Design, Strings..." /></label>
              <label className="form-control"><span className="label font-semibold">Description</span><textarea required className="textarea textarea-bordered min-h-36" value={form.description} onChange={(e) => setField("description", e.target.value)} /></label>
              <label className="form-control"><span className="label font-semibold">Additional notes</span><textarea className="textarea textarea-bordered" value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="One note per line" /></label>
            </section>

            <section className="bg-base-100 border border-base-300 rounded-lg p-5 sm:p-6 space-y-4"><h2 className="text-xl font-black">Example and constraints</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="form-control"><span className="label font-semibold">Example input</span><textarea className="textarea textarea-bordered" value={form.exampleInput} onChange={(e) => setField("exampleInput", e.target.value)} /></label><label className="form-control"><span className="label font-semibold">Example output</span><textarea className="textarea textarea-bordered" value={form.exampleOutput} onChange={(e) => setField("exampleOutput", e.target.value)} /></label></div><label className="form-control"><span className="label font-semibold">Explanation</span><textarea className="textarea textarea-bordered" value={form.exampleExplanation} onChange={(e) => setField("exampleExplanation", e.target.value)} /></label><label className="form-control"><span className="label font-semibold">Constraints</span><textarea className="textarea textarea-bordered min-h-24" value={form.constraints} onChange={(e) => setField("constraints", e.target.value)} placeholder="One constraint per line" /></label></section>

            <section className="bg-base-100 border border-base-300 rounded-lg p-5 sm:p-6"><h2 className="text-xl font-black">Starter code</h2><div className="tabs tabs-box mt-4 mb-3">{Object.entries(LANGUAGE_CONFIG).map(([key, config]) => <button type="button" key={key} className={`tab flex-1 ${language === key ? "tab-active" : ""}`} onClick={() => setLanguage(key)}>{config.name}</button>)}</div><textarea className="textarea textarea-bordered w-full min-h-64 font-mono text-sm" value={form.starterCode[language]} onChange={(e) => setForm((current) => ({ ...current, starterCode: { ...current.starterCode, [language]: e.target.value } }))} /></section>

            <section className="bg-base-100 border border-base-300 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="toggle toggle-primary" checked={form.isPublic} onChange={(e) => setField("isPublic", e.target.checked)} /><span><span className="font-semibold block">Public problem</span><span className="text-sm text-base-content/50">Other users can select it for interviews.</span></span></label><button className="btn btn-primary gap-2" disabled={createProblem.isPending || updateProblem.isPending}><SaveIcon className="size-4" /> {isEditing ? "Save Changes" : "Create Problem"}</button></section>
          </form>
        )}
      </main>
    </div>
  );
}

export default ProblemEditorPage;
