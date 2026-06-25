import { Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const problems = Object.values(PROBLEMS);
  const isCustomProblem = roomConfig.problemSource === "custom";

  const updateCustomProblem = (field, value) => {
    setRoomConfig((current) => ({
      ...current,
      customProblem: {
        ...current.customProblem,
        [field]: value,
      },
      problem: field === "title" ? value : current.problem,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

        <div className="space-y-8">
          <div className="tabs tabs-boxed">
            <button
              type="button"
              className={`tab flex-1 ${!isCustomProblem ? "tab-active" : ""}`}
              onClick={() =>
                setRoomConfig({
                  problemSource: "built-in",
                  problem: "",
                  difficulty: "",
                  problemDetails: null,
                  customProblem: roomConfig.customProblem,
                })
              }
            >
              Problem Bank
            </button>
            <button
              type="button"
              className={`tab flex-1 ${isCustomProblem ? "tab-active" : ""}`}
              onClick={() =>
                setRoomConfig({
                  ...roomConfig,
                  problemSource: "custom",
                  problem: roomConfig.customProblem?.title || "",
                  difficulty: roomConfig.customProblem?.difficulty || "Medium",
                  problemDetails: null,
                })
              }
            >
              Custom Problem
            </button>
          </div>

          {/* PROBLEM SELECTION */}
          {!isCustomProblem ? (
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-semibold">Select Problem</span>
                <span className="label-text-alt text-error">*</span>
              </label>

              <select
                className="select w-full"
                value={roomConfig.problem}
                onChange={(e) => {
                  const selectedProblem = problems.find((p) => p.title === e.target.value);
                  setRoomConfig({
                    ...roomConfig,
                    difficulty: selectedProblem.difficulty,
                    problem: e.target.value,
                    problemDetails: selectedProblem,
                  });
                }}
              >
                <option value="" disabled>
                  Choose a coding problem...
                </option>

                {problems.map((problem) => (
                  <option key={problem.id} value={problem.title}>
                    {problem.title} ({problem.difficulty})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Problem Title</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    className="input input-bordered w-full"
                    value={roomConfig.customProblem?.title || ""}
                    onChange={(e) => updateCustomProblem("title", e.target.value)}
                    placeholder="Example: Build a login validator"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Difficulty</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={roomConfig.customProblem?.difficulty || "Medium"}
                    onChange={(e) => {
                      setRoomConfig((current) => ({
                        ...current,
                        difficulty: e.target.value,
                        customProblem: {
                          ...current.customProblem,
                          difficulty: e.target.value,
                        },
                      }));
                    }}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                  <span className="label-text-alt text-error">*</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full min-h-28"
                  value={roomConfig.customProblem?.description || ""}
                  onChange={(e) => updateCustomProblem("description", e.target.value)}
                  placeholder="Describe what the candidate should solve."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Example</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full min-h-20"
                    value={roomConfig.customProblem?.example || ""}
                    onChange={(e) => updateCustomProblem("example", e.target.value)}
                    placeholder="Input: ...&#10;Output: ..."
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Constraints</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full min-h-20"
                    value={roomConfig.customProblem?.constraints || ""}
                    onChange={(e) => updateCustomProblem("constraints", e.target.value)}
                    placeholder="One constraint per line"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ROOM SUMMARY */}
          {roomConfig.problem && (
            <div className="alert alert-success">
              <Code2Icon className="size-5" />
              <div>
                <p className="font-semibold">Room Summary:</p>
                <p>
                  Problem: <span className="font-medium">{roomConfig.problem}</span>
                </p>
                <p>
                  Source:{" "}
                  <span className="font-medium">
                    {isCustomProblem ? "Custom problem" : "Problem bank"}
                  </span>
                </p>
                <p>
                  Max Participants: <span className="font-medium">2 (1-on-1 session)</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={
              isCreating ||
              !roomConfig.problem?.trim() ||
              (isCustomProblem && !roomConfig.customProblem?.description?.trim())
            }
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}

            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
export default CreateSessionModal;
