import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ChatSession } from "../../lib/db/models/message";
import { PanelRight } from "lucide-react";

interface LeftPanelProps {
  onSessionSelect: (sessionId: string) => void;
  currentSessionId?: string;
}

export default function LeftPanel({
  onSessionSelect,
  currentSessionId,
}: LeftPanelProps) {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowSidebar, setIsShowSidebar] = useState<boolean>(false);

  // Fetch chat sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (session?.user?.id) {
        try {
          console.log("Fetching sessions...");
          const response = await fetch("/api/chat/sessions");
          console.log("Sessions response:", response);

          if (response.ok) {
            const data = await response.json();
            console.log("Sessions data:", data);
            setSessions(data.sessions);
          } else {
            console.error("Failed to fetch sessions:", await response.text());
          }
        } catch (error) {
          console.error("Error fetching sessions:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSessions();
    // Set up polling for session updates
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Create new chat session
  const handleNewChat = async () => {
    if (session?.user?.id) {
      try {
        setIsLoading(true);
        const response = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const newSession = await response.json();
          setSessions((prev) => [newSession, ...prev]);
          onSessionSelect(newSession._id.toString());
        } else {
          console.error("Failed to create session:", await response.text());
        }
      } catch (error) {
        console.error("Error creating new session:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
    
      <div
        className={`h-full flex flex-col text-gray-100 ${
          isShowSidebar ? "block" : "hidden w-0"
        }`}
      >
        {/* Clock Section */}

        <div className="p-4 bg-gray-800/30 rounded-lg mb-4">
          <div className="text-2xl font-bold">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-sm text-gray-400">
            {currentTime.toLocaleDateString([], {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          disabled={isLoading}
          className="mb-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg 
                 transition-colors duration-200 flex items-center gap-2
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {isLoading ? "Creating..." : "New Chat"}
        </button>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading && sessions.length === 0 ? (
            <div className="text-center text-gray-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-gray-400">
              No chat sessions yet
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session._id?.toString()}
                onClick={() => onSessionSelect(session._id!.toString())}
                className={`w-full p-3 rounded-lg text-left transition-colors duration-200
                         ${
                           currentSessionId === session._id?.toString()
                             ? "bg-teal-600"
                             : "hover:bg-gray-800/50"
                         }`}
              >
                <div className="font-medium truncate">{session.title}</div>
                {session.lastMessage && (
                  <div className="text-sm text-gray-400 truncate">
                    {session.lastMessage}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
