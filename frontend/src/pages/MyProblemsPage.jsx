import { Link } from "react-router";
import { Edit3Icon, EyeIcon, EyeOffIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import Navbar from "../components/Navbar";
import { useDeleteProblem, useMyProblems } from "../hooks/useProblems";
import { getDifficultyBadgeClass } from "../lib/utils";

function MyProblemsPage() {
  const { data, isLoading, isError } = useMyProblems();
  const deleteProblem = useDeleteProblem();
  const problems = data?.problems || [];

  const handleDelete = (problem) => {
    if (confirm(`Delete "${problem.title}"? Existing interview snapshots will not be affected.`)) {
      deleteProblem.mutate(problem._id);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div><p className="text-sm font-bold text-primary">Problem library</p><h1 className="text-3xl sm:text-4xl font-black mt-1">My Problems</h1><p className="text-base-content/60 mt-2">Reusable interview questions created by you.</p></div>
          <Link to="/my-problems/new" className="btn btn-primary gap-2"><PlusIcon className="size-4" /> Create Problem</Link>
        </div>

        {isLoading ? <div className="flex justify-center py-20"><Loader2Icon className="size-10 animate-spin text-primary" /></div> : isError ? <div className="alert alert-error">Unable to load your problems.</div> : problems.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {problems.map((problem) => (
              <article key={problem._id} className="card bg-base-100 border border-base-300">
                <div className="card-body p-5">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-black text-lg truncate">{problem.title}</h2><p className="text-sm text-base-content/50 mt-1">{problem.category}</p></div><span className={`badge badge-sm ${getDifficultyBadgeClass(problem.difficulty)}`}>{problem.difficulty}</span></div>
                  <p className="text-sm text-base-content/70 line-clamp-3 mt-3">{problem.description?.text}</p>
                  <div className="flex items-center gap-2 text-xs text-base-content/50 mt-3">{problem.isPublic ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />} {problem.isPublic ? "Public" : "Private"}<span>Updated {new Date(problem.updatedAt).toLocaleDateString()}</span></div>
                  <div className="card-actions mt-4 pt-4 border-t border-base-300">
                    <Link className="btn btn-sm btn-primary flex-1 gap-2" to={`/my-problems/${problem._id}/edit`}><Edit3Icon className="size-4" /> Edit</Link>
                    <button className="btn btn-sm btn-ghost text-error" onClick={() => handleDelete(problem)} disabled={deleteProblem.isPending}><Trash2Icon className="size-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-base-100 border border-base-300 rounded-lg text-center py-16 px-4"><h2 className="text-xl font-black">No custom problems yet</h2><p className="text-base-content/60 mt-2">Create a reusable problem for future interviews.</p><Link to="/my-problems/new" className="btn btn-primary mt-5">Create your first problem</Link></div>
        )}
      </main>
    </div>
  );
}

export default MyProblemsPage;
