import { useState } from "react";
import { useSession } from "next-auth/react";
import { Message } from "../lib/db/models/message";
import { MemoizedReactMarkdown } from "./MemoizedMarkdown";
import { useChat } from "../hooks/useChat";

interface ChatInterfaceProps {
  sessionId?: string;
  onNewSession?: () => void;
}

export default function ChatInterface({
  sessionId,
  onNewSession,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, messagesEndRef } = useChat(sessionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !session?.user?.id || !sessionId) return;

    const message = input;
    setInput("");
    await sendMessage(message);
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Please sign in to chat</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[90vh] bg-gray-50 rounded-lg shadow-xl">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-teal-600 text-white rounded-br-none"
                  : "bg-white shadow-sm rounded-bl-none"
              }`}
            >
              <MemoizedReactMarkdown>{msg.content}</MemoizedReactMarkdown>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t bg-white rounded-b-lg"
      >
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={sessionId ? "Type your message..." : "Create a new chat to start messaging"}
            className="flex-1 p-2 border-none rounded-lg focus:outline-none focus:ring-0"
            disabled={isLoading || !sessionId}
          />
          <button
            type="submit"
            disabled={isLoading || !sessionId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
