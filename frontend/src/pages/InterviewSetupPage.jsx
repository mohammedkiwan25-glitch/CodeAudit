import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeftIcon, BookOpenIcon, Code2Icon, ListChecksIcon, Loader2Icon, PlusIcon, UsersIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useProblems } from "../hooks/useProblems";
import { useCreateSession } from "../hooks/useSessions";
import { getDifficultyBadgeClass } from "../lib/utils";

const CUSTOM_STARTER_CODE = {
  javascript: "function solution() {\n  // Write your solution here\n}",
  python: "def solution():\n    # Write your solution here\n    pass",
  java: "class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}",
};

function InterviewSetupPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useProblems();
  const createSession = useCreateSession();
  const problems = useMemo(() => data?.problems || [], [data?.problems]);
  const [source, setSource] = useState("bank");
  const [problemId, setProblemId] = useState("");
  const [custom, setCustom] = useState({
    title: "",
    difficulty: "Medium",
    category: "",
    description: "",
    exampleInput: "",
    exampleOutput: "",
    exampleExplanation: "",
    constraints: "",
  });

  const selectedProblem = useMemo(
    () => problems.find((problem) => problem._id === problemId),
    [problemId, problems]
  );

  const canCreate = source === "bank"
    ? Boolean(selectedProblem)
    : Boolean(custom.title.trim() && custom.description.trim());

  const handleCreate = () => {
    if (!canCreate) return;

    const isCustom = source === "custom";
    const problemDetails = isCustom
      ? {
          id: `custom-${Date.now()}`,
          source: "custom",
          title: custom.title.trim(),
          difficulty: custom.difficulty,
          category: custom.category.trim() || "Custom Interview Problem",
          description: { text: custom.description.trim(), notes: [] },
          examples: custom.exampleInput.trim() || custom.exampleOutput.trim()
            ? [{ input: custom.exampleInput.trim(), output: custom.exampleOutput.trim(), explanation: custom.exampleExplanation.trim() }]
            : [],
          constraints: custom.constraints.split("\n").map((item) => item.trim()).filter(Boolean),
          starterCode: CUSTOM_STARTER_CODE,
        }
      : null;

    createSession.mutate(
      {
        problem: isCustom ? custom.title.trim() : selectedProblem.title,
        problemId: isCustom ? null : selectedProblem._id,
        difficulty: (isCustom ? custom.difficulty : selectedProblem.difficulty).toLowerCase(),
        problemDetails,
      },
      { onSuccess: (result) => navigate(`/session/${result.session._id}`) }
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
        <button className="btn btn-ghost btn-sm gap-2 mb-5" onClick={() => navigate("/dashboard")}>
          <ArrowLeftIcon className="size-4" /> Dashboard
        </button>

        <div className="mb-7">
          <p className="text-sm font-bold text-primary">New interview</p>
          <h1 className="text-3xl sm:text-4xl font-black mt-1">Set up an interview</h1>
          <p className="text-base-content/60 mt-2">Choose a reusable problem or write a one-time prompt.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <section className="bg-base-100 border border-base-300 rounded-lg p-5 sm:p-6">
            <div className="tabs tabs-box mb-6">
              <button className={`tab flex-1 gap-2 ${source === "bank" ? "tab-active" : ""}`} onClick={() => setSource("bank")}>
                <BookOpenIcon className="size-4" /> Problem Bank
              </button>
              <button className={`tab flex-1 gap-2 ${source === "custom" ? "tab-active" : ""}`} onClick={() => setSource("custom")}>
                <PlusIcon className="size-4" /> One-time Problem
              </button>
            </div>

            {source === "bank" ? (
              <div>
                <label className="label font-semibold">Interview problem</label>
                {isLoading ? (
                  <div className="flex justify-center py-16"><Loader2Icon className="size-8 animate-spin text-primary" /></div>
                ) : isError ? (
                  <div className="alert alert-error">Unable to load the problem bank.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {problems.map((problem) => (
                      <button
                        key={problem._id}
                        type="button"
                        onClick={() => setProblemId(problem._id)}
                        className={`text-left border rounded-lg p-4 transition-colors ${problemId === problem._id ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/50"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold">{problem.title}</h3>
                          <span className={`badge badge-sm ${getDifficultyBadgeClass(problem.difficulty)}`}>{problem.difficulty}</span>
                        </div>
                        <p className="text-xs text-base-content/50 mt-2">{problem.category}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-black">One-time interview problem</h2>
                  <p className="text-sm text-base-content/55 mt-1">This prompt belongs only to this interview and will not be added to your problem library.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_150px] gap-4">
                  <label className="form-control"><span className="label font-semibold">Title <span className="text-error">*</span></span><input className="input input-bordered w-full" value={custom.title} onChange={(e) => setCustom({ ...custom, title: e.target.value })} placeholder="Design a rate limiter" /></label>
                  <label className="form-control"><span className="label font-semibold">Category</span><input className="input input-bordered w-full" value={custom.category} onChange={(e) => setCustom({ ...custom, category: e.target.value })} placeholder="System Design" /></label>
                  <label className="form-control"><span className="label font-semibold">Difficulty</span><select className="select select-bordered w-full" value={custom.difficulty} onChange={(e) => setCustom({ ...custom, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
                </div>

                <label className="form-control mt-5"><span className="label font-semibold">Problem statement <span className="text-error">*</span></span><textarea className="textarea textarea-bordered min-h-40 w-full text-base leading-relaxed" value={custom.description} onChange={(e) => setCustom({ ...custom, description: e.target.value })} placeholder="Describe the task, expected behavior, and what the solution should return." /><span className="text-xs text-base-content/45 mt-2">Mathematical text can be written as O(n^2) or 1 &lt;= n &lt;= 100000.</span></label>

                <div className="border-t border-base-300 mt-6 pt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-black">Example</h3>
                    <p className="text-xs text-base-content/50 mt-1 mb-4">Optional, but useful for clarifying the expected result.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="form-control"><span className="label text-sm font-semibold">Input</span><textarea className="textarea textarea-bordered min-h-24 font-mono text-sm" value={custom.exampleInput} onChange={(e) => setCustom({ ...custom, exampleInput: e.target.value })} placeholder="nums = [2, 7], target = 9" /></label>
                      <label className="form-control"><span className="label text-sm font-semibold">Output</span><textarea className="textarea textarea-bordered min-h-24 font-mono text-sm" value={custom.exampleOutput} onChange={(e) => setCustom({ ...custom, exampleOutput: e.target.value })} placeholder="[0, 1]" /></label>
                    </div>
                    <label className="form-control mt-3"><span className="label text-sm font-semibold">Explanation</span><textarea className="textarea textarea-bordered min-h-20" value={custom.exampleExplanation} onChange={(e) => setCustom({ ...custom, exampleExplanation: e.target.value })} placeholder="Why does this output satisfy the problem?" /></label>
                  </div>

                  <div className="xl:border-l xl:border-base-300 xl:pl-6">
                    <h3 className="font-black">Constraints</h3>
                    <p className="text-xs text-base-content/50 mt-1 mb-4">Add one technical limit per line.</p>
                    <textarea className="textarea textarea-bordered w-full min-h-44 font-mono text-sm" value={custom.constraints} onChange={(e) => setCustom({ ...custom, constraints: e.target.value })} placeholder={"2 <= nums.length <= 10000\n-1000000000 <= nums[i] <= 1000000000"} />
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="bg-base-100 border border-base-300 rounded-lg p-5 lg:sticky lg:top-24">
            <h2 className="font-black text-xl">Interview summary</h2>
            <div className="space-y-4 mt-5 text-sm">
              <div className="flex gap-3"><Code2Icon className="size-5 text-primary shrink-0" /><div><p className="text-base-content/50">Problem</p><p className="font-semibold mt-0.5">{source === "bank" ? selectedProblem?.title || "Not selected" : custom.title || "Untitled"}</p></div></div>
              <div className="flex gap-3"><ListChecksIcon className="size-5 text-primary shrink-0" /><div><p className="text-base-content/50">Difficulty</p><p className="font-semibold mt-0.5">{source === "bank" ? selectedProblem?.difficulty || "Not selected" : custom.difficulty}</p></div></div>
              <div className="flex gap-3"><UsersIcon className="size-5 text-primary shrink-0" /><div><p className="text-base-content/50">Format</p><p className="font-semibold mt-0.5">1-on-1 live interview</p></div></div>
            </div>
            <button className="btn btn-primary w-full mt-6" disabled={!canCreate || createSession.isPending} onClick={handleCreate}>
              {createSession.isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Create Interview
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default InterviewSetupPage;
