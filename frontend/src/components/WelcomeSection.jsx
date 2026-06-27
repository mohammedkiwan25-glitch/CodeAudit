import { useUser } from "@clerk/clerk-react";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router";

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();

  return (
    <div className="border-b border-base-300 bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-9">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary mb-1">Interview workspace</p>
            <h1 className="text-3xl sm:text-4xl font-black text-base-content leading-tight">
              Welcome back, {user?.firstName || "there"}
            </h1>
            <p className="text-sm sm:text-base text-base-content/60 mt-2">
              Create interviews, rejoin live sessions, and review completed work.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/problems" className="btn btn-ghost border border-base-300 gap-2">
              <BookOpenIcon className="size-4" />
              Browse Problems
            </Link>
            <button onClick={onCreateSession} className="btn btn-primary gap-2">
              <PlusIcon className="size-4" />
              Create Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
