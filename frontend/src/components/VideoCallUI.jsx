import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (callingState === CallingState.JOINING) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 relative str-video">
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-2.5 sm:p-3 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="font-semibold text-sm sm:text-base">
              {participantCount} {participantCount === 1 ? "participant" : "participants"}
            </span>
          </div>
          {chatClient && channel && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`btn btn-xs sm:btn-sm gap-1.5 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
            >
              <MessageSquareIcon className="size-3.5 sm:size-4" />
              Chat
            </button>
          )}
        </div>

        {/* Video — natural height, no constraints */}
        <div className="bg-base-300 rounded-lg overflow-hidden relative">
          <SpeakerLayout />
        </div>

        {/* Controls */}
        <div className="bg-base-100 p-2.5 sm:p-3 rounded-lg shadow flex justify-center">
          <CallControls onLeave={() => navigate("/dashboard")} />
        </div>
      </div>

      {/* CHAT — overlay on mobile, sidebar on desktop */}
      {chatClient && channel && (
        <>
          <div
            className={`absolute inset-0 z-10 flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30] transition-all duration-300 sm:hidden ${isChatOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
          >
            <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
              <h3 className="font-semibold text-white">Session Chat</h3>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <XIcon className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden stream-chat-dark">
              <Chat client={chatClient} theme="str-chat__theme-dark">
                <Channel channel={channel}>
                  <Window>
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              </Chat>
            </div>
          </div>

          <div
            className={`hidden sm:flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30] transition-all duration-300 ease-in-out ${isChatOpen ? "w-80 opacity-100" : "w-0 opacity-0"
              }`}
          >
            {isChatOpen && (
              <>
                <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
                  <h3 className="font-semibold text-white">Session Chat</h3>
                  <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <XIcon className="size-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden stream-chat-dark">
                  <Chat client={chatClient} theme="str-chat__theme-dark">
                    <Channel channel={channel}>
                      <Window>
                        <MessageList />
                        <MessageInput />
                      </Window>
                      <Thread />
                    </Channel>
                  </Chat>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default VideoCallUI;