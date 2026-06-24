import { useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { sessionApi } from "../api/sessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
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

  // find the problem data based on session problem title
  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

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
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - CODE EDITOR & PROBLEM DETAILS */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* PROBLEM DSC PANEL */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-base-200">
                  {/* HEADER SECTION */}
                  <div className="p-6 bg-base-100 border-b border-base-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-3xl font-bold text-base-content">
                          {session?.problem || "Loading..."}
                        </h1>
                        {problemData?.category && (
                          <p className="text-base-content/60 mt-1">{problemData.category}</p>
                        )}
                        <p className="text-base-content/60 mt-2">
                          Host: {session?.host?.name || "Loading..."} -{" "}
                          {session?.participant ? 2 : 1}/2 participants
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`badge badge-lg ${getDifficultyBadgeClass(
                            session?.difficulty
                          )}`}
                        >
                          {session?.difficulty.slice(0, 1).toUpperCase() +
                            session?.difficulty.slice(1) || "Easy"}
                        </span>
                        {isHost && session?.inviteToken && (
                          <button
                            onClick={handleCopyInviteLink}
                            className="btn btn-secondary btn-sm gap-2"
                          >
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
                        {session?.status === "completed" && (
                          <span className="badge badge-ghost badge-lg">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* problem desc */}
                    {problemData?.description && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">Description</h2>
                        <div className="space-y-3 text-base leading-relaxed">
                          <p className="text-base-content/90">{problemData.description.text}</p>
                          {problemData.description.notes?.map((note, idx) => (
                            <p key={idx} className="text-base-content/90">
                              {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* examples section */}
                    {problemData?.examples && problemData.examples.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>

                        <div className="space-y-4">
                          {problemData.examples.map((example, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-sm">{idx + 1}</span>
                                <p className="font-semibold text-base-content">Example {idx + 1}</p>
                              </div>
                              <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                                <div className="flex gap-2">
                                  <span className="text-primary font-bold min-w-[70px]">
                                    Input:
                                  </span>
                                  <span>{example.input}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-secondary font-bold min-w-[70px]">
                                    Output:
                                  </span>
                                  <span>{example.output}</span>
                                </div>
                                {example.explanation && (
                                  <div className="pt-2 border-t border-base-300 mt-2">
                                    <span className="text-base-content/60 font-sans text-xs">
                                      <span className="font-semibold">Explanation:</span>{" "}
                                      {example.explanation}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Constraints */}
                    {problemData?.constraints && problemData.constraints.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
                        <ul className="space-y-2 text-base-content/90">
                          {problemData.constraints.map((constraint, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-primary">-</span>
                              <code className="text-sm">{constraint}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={70} minSize={30}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={handleCodeChange}
                      onRunCode={handleRunCode}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                  <Panel defaultSize={30} minSize={15}>
                    <OutputPanel output={output} />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">Unable to connect to the video call</p>
                    </div>
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
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
