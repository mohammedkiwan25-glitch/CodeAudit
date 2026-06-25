import { useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { sessionApi } from "../api/sessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { getDifficultyBadgeClass } from "../lib/utils";
import { CopyIcon, Loader2Icon, LogOutIcon, PhoneOffIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

const EDITOR_UPDATED_EVENT = "session_editor_updated";
const EDITOR_STATE_REQUESTED_EVENT = "session_editor_state_requested";
const OUTPUT_UPDATED_EVENT = "session_output_updated";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite") || "";
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const applyingRemoteUpdateRef = useRef(false);
  const editorInitializedRef = useRef(false);
  const codeBroadcastTimeoutRef = useRef(null);
  const lastAppliedWorkspaceUpdateRef = useRef(null);
  const lastLocalWorkspaceUpdateRef = useRef(0);

  const {
    data: sessionData,
    isLoading: loadingSession,
    isError: sessionError,
    error: sessionLoadError,
    refetch,
  } = useSessionById(id, inviteToken);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const shouldConnectToCall = isHost || isParticipant;

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  const fallbackProblemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;
  const problemData = session?.problemDetails || fallbackProblemData;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  const canSyncEditor = Boolean(channel && session?.status === "active" && (isHost || isParticipant));

  const sendEditorUpdate = useCallback((nextLanguage, nextCode, nextOutput = null) => {
    if (!canSyncEditor) return;

    channel.sendEvent({
      type: EDITOR_UPDATED_EVENT,
      language: nextLanguage,
      code: nextCode,
      sessionOutput: nextOutput,
    }).catch((error) => console.error("Failed to sync editor update:", error));
  }, [canSyncEditor, channel]);

  const saveWorkspaceUpdate = useCallback((nextLanguage, nextCode, nextOutput = null) => {
    if (!id || !canSyncEditor) return;

    lastLocalWorkspaceUpdateRef.current = Date.now();

    sessionApi
      .updateSessionWorkspace(id, {
        language: nextLanguage,
        code: nextCode,
        output: nextOutput,
      })
      .catch((error) => console.error("Failed to save workspace update:", error));
  }, [id, canSyncEditor]);

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate(`/session/${id}/review`);
  }, [session, loadingSession, navigate, id]);

  // Set the starter code once when the session problem loads.
  useEffect(() => {
    if (editorInitializedRef.current) return;

    if (problemData?.starterCode?.[selectedLanguage]) {
      editorInitializedRef.current = true;
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  useEffect(() => {
    if (!isHost || !canSyncEditor || !editorInitializedRef.current) return;
    if (session?.workspace?.code) return;

    saveWorkspaceUpdate(selectedLanguage, code, output);
  }, [isHost, canSyncEditor, session?.workspace?.code, selectedLanguage, code, output, saveWorkspaceUpdate]);

  useEffect(() => {
    const workspace = session?.workspace;
    if (!workspace?.updatedAt) return;
    if (workspace.updatedAt === lastAppliedWorkspaceUpdateRef.current) return;
    if (Date.now() - lastLocalWorkspaceUpdateRef.current < 1000) return;
    if (!workspace.code && !lastAppliedWorkspaceUpdateRef.current) return;

    applyingRemoteUpdateRef.current = true;
    lastAppliedWorkspaceUpdateRef.current = workspace.updatedAt;

    if (workspace.language) setSelectedLanguage(workspace.language);
    if (typeof workspace.code === "string") setCode(workspace.code);
    if ("output" in workspace) setOutput(workspace.output ?? null);

    setTimeout(() => {
      applyingRemoteUpdateRef.current = false;
    }, 0);
  }, [session?.workspace]);

  useEffect(() => {
    if (!channel || !user?.id) return;

    const handleEditorUpdate = (event) => {
      if (event.user?.id === user.id) return;

      applyingRemoteUpdateRef.current = true;
      if (event.language) setSelectedLanguage(event.language);
      if (typeof event.code === "string") setCode(event.code);
      if ("sessionOutput" in event) setOutput(event.sessionOutput);

      setTimeout(() => {
        applyingRemoteUpdateRef.current = false;
      }, 0);
    };

    const handleEditorStateRequest = (event) => {
      if (event.user?.id === user.id || !isHost) return;
      sendEditorUpdate(selectedLanguage, code, output);
    };

    const handleOutputUpdate = (event) => {
      if (event.user?.id === user.id) return;
      setOutput(event.sessionOutput ?? null);
      setIsRunning(false);
    };

    const handleChannelEvent = (event) => {
      if (event.type === EDITOR_UPDATED_EVENT) handleEditorUpdate(event);
      if (event.type === EDITOR_STATE_REQUESTED_EVENT) handleEditorStateRequest(event);
      if (event.type === OUTPUT_UPDATED_EVENT) handleOutputUpdate(event);
    };

    channel.on(handleChannelEvent);

    return () => {
      channel.off(handleChannelEvent);
    };
  }, [channel, user?.id, isHost, selectedLanguage, code, output, sendEditorUpdate]);

  useEffect(() => {
    if (!canSyncEditor || isHost) return;

    channel
      .sendEvent({ type: EDITOR_STATE_REQUESTED_EVENT })
      .catch((error) => console.error("Failed to request editor state:", error));
  }, [channel, canSyncEditor, isHost]);

  useEffect(() => {
    return () => {
      if (codeBroadcastTimeoutRef.current) clearTimeout(codeBroadcastTimeoutRef.current);
    };
  }, []);

  const handleCodeChange = (value = "") => {
    setCode(value);
    setOutput(null);

    if (!canSyncEditor || applyingRemoteUpdateRef.current) return;

    if (codeBroadcastTimeoutRef.current) clearTimeout(codeBroadcastTimeoutRef.current);
    codeBroadcastTimeoutRef.current = setTimeout(() => {
      channel.sendEvent({
        type: EDITOR_UPDATED_EVENT,
        language: selectedLanguage,
        code: value,
        sessionOutput: null,
      }).catch((error) => console.error("Failed to sync code change:", error));

      saveWorkspaceUpdate(selectedLanguage, value, null);
    }, 300);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
    sendEditorUpdate(newLang, starterCode, null);
    saveWorkspaceUpdate(newLang, starterCode, null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
    saveWorkspaceUpdate(selectedLanguage, code, result);

    if (channel && session?.status === "active") {
      await channel
        .sendEvent({
          type: OUTPUT_UPDATED_EVENT,
          sessionOutput: result,
        })
        .catch((error) => console.error("Failed to sync output:", error));
    }
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard
      endSessionMutation.mutate(id, { onSuccess: () => navigate(`/session/${id}/review`) });
    }
  };

  const handleJoinSession = () => {
    joinSessionMutation.mutate({ id, inviteToken }, { onSuccess: refetch });
  };

  const handleCopyInviteLink = async () => {
    if (!session?.inviteToken) return;

    const appUrl = (import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, "");
    const inviteUrl = `${appUrl}/session/${session._id}?invite=${session.inviteToken}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied");
    } catch (error) {
      console.error("Failed to copy invite link:", error);
      toast.error("Failed to copy invite link");
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">Loading interview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (sessionError) {
    const status = sessionLoadError?.response?.status;
    const message =
      status === 403
        ? "This interview requires a valid invite link."
        : status === 404
          ? "This interview does not exist on this server. Check that the invite link points to the same app where it was created."
          : "Unable to load this interview. Check that the backend is running.";

    return (
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="card bg-base-100 shadow-xl max-w-md w-full">
            <div className="card-body text-center">
              <h1 className="card-title justify-center text-2xl">Interview Unavailable</h1>
              <p className="text-base-content/70">{message}</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (session.status === "completed") {
    navigate(`/session/${id}/review`);
    return null;
  }

  if (!shouldConnectToCall) {
    const isFull = Boolean(session.participant);

    return (
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="card bg-base-100 shadow-xl max-w-lg w-full">
            <div className="card-body">
              <div className="text-center mb-4">
                <p className="text-sm uppercase tracking-wide text-primary font-bold">Interview Invite</p>
                <h1 className="text-3xl font-black mt-2">Join CodeAudit Session</h1>
                <p className="text-base-content/70 mt-2">
                  {session.host?.name || "The host"} invited you to a coding interview.
                </p>
              </div>

              <div className="bg-base-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-base-content/60">Problem</span>
                  <span className="font-semibold text-right">{session.problem}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-base-content/60">Difficulty</span>
                  <span className={`badge ${getDifficultyBadgeClass(session.difficulty)}`}>
                    {session.difficulty}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-base-content/60">Host</span>
                  <span className="font-semibold text-right">{session.host?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-base-content/60">Participants</span>
                  <span className="font-semibold">{session.participant ? "2/2" : "1/2"}</span>
                </div>
              </div>

              {isFull ? (
                <div className="alert alert-error mt-4">
                  <span>This interview is already full.</span>
                </div>
              ) : !inviteToken ? (
                <div className="alert alert-warning mt-4">
                  <span>A valid invite link is required to join.</span>
                </div>
              ) : null}

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleJoinSession}
                  disabled={isFull || !inviteToken || joinSessionMutation.isPending}
                >
                  {joinSessionMutation.isPending ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : null}
                  Join Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 hidden md:grid grid-cols-[300px_minmax(0,1fr)_minmax(440px,0.95fr)] xl:grid-cols-[340px_minmax(0,1fr)_minmax(480px,0.9fr)] gap-4 p-4 bg-base-200 overflow-hidden">
        <aside className="min-w-0 min-h-0 overflow-y-auto rounded-xl border border-base-300 bg-base-100">
          <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
            <p className="text-xs uppercase tracking-wide text-primary font-bold">Interview Problem</p>
            <h2 className="text-2xl font-black leading-tight mt-1 break-words">
              {session?.problem || "Loading..."}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`badge ${getDifficultyBadgeClass(session?.difficulty)}`}>
                {session?.difficulty.slice(0, 1).toUpperCase() + session?.difficulty.slice(1) || "Easy"}
              </span>
              {problemData?.category && <span className="badge badge-ghost">{problemData.category}</span>}
            </div>
          </div>

          <div className="p-4 space-y-5">
            {problemData?.description && (
              <section>
                <h3 className="text-lg font-bold mb-3 text-base-content">Description</h3>
                <div className="space-y-3 text-sm leading-relaxed text-base-content/90">
                  <p>{problemData.description.text}</p>
                  {problemData.description.notes?.map((note, idx) => (
                    <p key={idx}>{note}</p>
                  ))}
                </div>
              </section>
            )}

            {problemData?.examples && problemData.examples.length > 0 && (
              <section>
                <h3 className="text-lg font-bold mb-3 text-base-content">Examples</h3>
                <div className="space-y-3">
                  {problemData.examples.map((example, idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-sm">{idx + 1}</span>
                        <p className="font-semibold text-sm">Example {idx + 1}</p>
                      </div>
                      <div className="bg-base-200 rounded-lg p-3 font-mono text-xs space-y-1.5 overflow-x-auto">
                        <div className="flex gap-2">
                          <span className="text-primary font-bold min-w-[56px]">Input:</span>
                          <span>{example.input}</span>
                        </div>
                        {example.output ? (
                          <div className="flex gap-2">
                            <span className="text-secondary font-bold min-w-[56px]">Output:</span>
                            <span>{example.output}</span>
                          </div>
                        ) : null}
                        {example.explanation && (
                          <div className="pt-2 border-t border-base-300 mt-2 text-base-content/60 font-sans">
                            <span className="font-semibold">Explanation:</span> {example.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {problemData?.constraints && problemData.constraints.length > 0 && (
              <section>
                <h3 className="text-lg font-bold mb-3 text-base-content">Constraints</h3>
                <ul className="space-y-2 text-sm text-base-content/90">
                  {problemData.constraints.map((constraint, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary">-</span>
                      <code className="text-xs break-words">{constraint}</code>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </aside>

        <section className="min-w-0 min-h-0 flex flex-col gap-4">
          <div className="bg-base-100 border border-base-300 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-primary font-bold">Live Workspace</p>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-base-content/60">
                <span>Host: {session?.host?.name || "Loading..."}</span>
                <span>{session?.participant ? 2 : 1}/2 participants</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isHost && session?.inviteToken && (
                <button onClick={handleCopyInviteLink} className="btn btn-secondary btn-sm gap-2">
                  <CopyIcon className="w-4 h-4" />
                  Copy Invite
                </button>
              )}
              {isHost && session?.status === "active" && (
                <button
                  onClick={handleEndSession}
                  disabled={endSessionMutation.isPending}
                  className="btn btn-error btn-sm gap-2"
                >
                  {endSessionMutation.isPending ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOutIcon className="w-4 h-4" />
                  )}
                  End Session
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 grid grid-rows-[minmax(0,1fr)_220px] xl:grid-rows-[minmax(0,1fr)_240px] gap-4">
            <div className="min-h-0 overflow-hidden rounded-xl border border-base-300 bg-base-300">
              <CodeEditorPanel
                selectedLanguage={selectedLanguage}
                code={code}
                isRunning={isRunning}
                onLanguageChange={handleLanguageChange}
                onCodeChange={handleCodeChange}
                onRunCode={handleRunCode}
              />
            </div>

            <div className="min-h-0 overflow-hidden rounded-xl border border-base-300 bg-base-100">
              <OutputPanel output={output} />
            </div>
          </div>
        </section>

        <aside className="min-w-0 min-h-0 overflow-hidden rounded-xl border border-base-300 bg-base-100">
          {isInitializingCall ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                <p className="text-lg">Connecting to video call...</p>
              </div>
            </div>
          ) : !streamClient || !call ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <PhoneOffIcon className="w-10 h-10 text-error" />
                </div>
                <h2 className="text-2xl font-bold">Connection Failed</h2>
                <p className="text-base-content/70">Unable to connect to the video call</p>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <StreamVideo client={streamClient}>
                <StreamCall call={call}>
                  <VideoCallUI chatClient={chatClient} channel={channel} />
                </StreamCall>
              </StreamVideo>
            </div>
          )}
        </aside>
      </div>

      <div className="flex-1 overflow-y-auto md:hidden bg-base-200">
        <section className="bg-base-100 border-b border-base-300 p-4 space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-base-content leading-tight">
              {session?.problem || "Loading..."}
            </h1>
            {problemData?.category && (
              <p className="text-sm text-base-content/60">{problemData.category}</p>
            )}
            <p className="text-sm text-base-content/60">
              Host: {session?.host?.name || "Loading..."} - {session?.participant ? 2 : 1}/2 participants
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${getDifficultyBadgeClass(session?.difficulty)}`}>
              {session?.difficulty.slice(0, 1).toUpperCase() + session?.difficulty.slice(1) || "Easy"}
            </span>
            {isHost && session?.inviteToken && (
              <button onClick={handleCopyInviteLink} className="btn btn-secondary btn-sm gap-2">
                <CopyIcon className="w-4 h-4" />
                Copy Invite
              </button>
            )}
            {isHost && session?.status === "active" && (
              <button
                onClick={handleEndSession}
                disabled={endSessionMutation.isPending}
                className="btn btn-error btn-sm gap-2"
              >
                {endSessionMutation.isPending ? (
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOutIcon className="w-4 h-4" />
                )}
                End Session
              </button>
            )}
          </div>
        </section>

        <section className="p-4 space-y-4">
          {problemData?.description && (
            <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-300">
              <h2 className="text-lg font-bold mb-3 text-base-content">Description</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="text-base-content/90">{problemData.description.text}</p>
                {problemData.description.notes?.map((note, idx) => (
                  <p key={idx} className="text-base-content/90">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          )}

          {problemData?.examples && problemData.examples.length > 0 && (
            <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-300">
              <h2 className="text-lg font-bold mb-3 text-base-content">Examples</h2>
              <div className="space-y-3">
                {problemData.examples.map((example, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-sm">{idx + 1}</span>
                      <p className="font-semibold text-base-content">Example {idx + 1}</p>
                    </div>
                    <div className="bg-base-200 rounded-lg p-3 font-mono text-xs space-y-1.5 overflow-x-auto">
                      <div className="flex gap-2">
                        <span className="text-primary font-bold min-w-[56px]">Input:</span>
                        <span className="break-words">{example.input}</span>
                      </div>
                      {example.output ? (
                        <div className="flex gap-2">
                          <span className="text-secondary font-bold min-w-[56px]">Output:</span>
                          <span className="break-words">{example.output}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {problemData?.constraints && problemData.constraints.length > 0 && (
            <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-300">
              <h2 className="text-lg font-bold mb-3 text-base-content">Constraints</h2>
              <ul className="space-y-2 text-sm text-base-content/90">
                {problemData.constraints.map((constraint, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-primary">-</span>
                    <code className="text-xs break-words">{constraint}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="h-[520px] overflow-hidden rounded-xl border border-base-300 bg-base-300">
            <CodeEditorPanel
              selectedLanguage={selectedLanguage}
              code={code}
              isRunning={isRunning}
              onLanguageChange={handleLanguageChange}
              onCodeChange={handleCodeChange}
              onRunCode={handleRunCode}
            />
          </div>

          <div className="h-[260px] overflow-hidden rounded-xl border border-base-300 bg-base-100">
            <OutputPanel output={output} />
          </div>

          <div className="h-[520px] overflow-hidden rounded-xl border border-base-300 bg-base-100">
            {isInitializingCall ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2Icon className="w-10 h-10 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-base">Connecting to video call...</p>
                </div>
              </div>
            ) : !streamClient || !call ? (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <PhoneOffIcon className="w-8 h-8 text-error" />
                  </div>
                  <h2 className="text-xl font-bold">Connection Failed</h2>
                  <p className="text-sm text-base-content/70">Unable to connect to the video call</p>
                </div>
              </div>
            ) : (
              <StreamVideo client={streamClient}>
                <StreamCall call={call}>
                  <VideoCallUI chatClient={chatClient} channel={channel} />
                </StreamCall>
              </StreamVideo>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SessionPage;
