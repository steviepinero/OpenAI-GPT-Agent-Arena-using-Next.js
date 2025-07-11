// pages/index.js
import React, { useState, useEffect, useRef } from "react";
import AgentBubble from "../components/agentbubble";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "../components/ui/spinner";
import ConversationModal from "../components/ConversationModal";
import { useConversations } from "../lib/useConversations";

const AGENT_DETAILS = {
  Azazel: { 
    avatar: "🗡️", 
    gradient: "from-red-200 to-red-100",
    bubbleColor: "bg-red-500",
    textColor: "text-white"
  },
  Isaac: { 
    avatar: "🧠", 
    gradient: "from-blue-100 to-blue-50",
    bubbleColor: "bg-purple-500",
    textColor: "text-white"
  },
  Lazuras: { 
    avatar: "⚡", 
    gradient: "from-purple-100 to-purple-50",
    bubbleColor: "bg-green-500",
    textColor: "text-white"
  },
};

const ALL_AGENTS = Object.keys(AGENT_DETAILS);

export default function AutoSolve() {
  const [goal, setGoal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [customAgents, setCustomAgents] = useState([]);
  const lastUsedAgentsRef = useRef([]);
  const [queuedMessages, setQueuedMessages] = useState([]);
  const [typingAgent, setTypingAgent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copyErrorIndex, setCopyErrorIndex] = useState(null);

  // Conversation management
  const {
    threads,
    activeThread,
    activeId,
    createThread,
    setActiveThread,
    addMessage,
    updateThread,
  } = useConversations();

  // Load options from localStorage and sync agents
  useEffect(() => {
    const savedCount = localStorage.getItem("botCount");
    const savedBots = localStorage.getItem("selectedBots");
    const savedCustom = localStorage.getItem("customAgents");
    const botCount = savedCount ? Number(savedCount) : 3;
    const selectedBots = savedBots ? JSON.parse(savedBots) : ["Azazel", "Isaac", "Lazuras"];
    const customAgentsArr = savedCustom ? JSON.parse(savedCustom) : [];
    setCustomAgents(customAgentsArr);
    const newAgents = selectedBots.slice(0, botCount);
    setSelectedAgents(newAgents);
    // If agents changed, start a new conversation
    const lastAgents = lastUsedAgentsRef.current;
    if (
      lastAgents.length !== newAgents.length ||
      lastAgents.some((a, i) => a !== newAgents[i])
    ) {
      createThread();
      setGoal("");
      setQueuedMessages([]);
      setTypingAgent(null);
    }
    lastUsedAgentsRef.current = newAgents;
  }, [createThread]);

  // Auto-create a thread on first load if none exist
  React.useEffect(() => {
    if (threads.length === 0) {
      createThread();
    }
  }, [threads, createThread]);

  // Load conversation history from active thread
  const conversationHistory = activeThread?.messages || [];

  // When switching threads, scroll to bottom and reset UI state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setGoal("");
    setQueuedMessages([]);
    setTypingAgent(null);
  }, [activeId]);

  // Always scroll to bottom when messages, queuedMessages, or typingAgent changes
  useEffect(() => {
    const doScroll = () => {
      if (!messagesContainerRef.current || !messagesEndRef.current) return;
      const container = messagesContainerRef.current;
      // Scroll to bottom
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      // Bounce: scroll further, then back
      setTimeout(() => {
        const maxScroll = container.scrollHeight - container.clientHeight;
        container.scrollTop = maxScroll + 80; // 80px past bottom for a bigger bounce
        setTimeout(() => {
          container.scrollTop = maxScroll;
        }, 70); // faster return
      }, 220);
    };
    const timeout = setTimeout(doScroll, 100);
    return () => clearTimeout(timeout);
  }, [conversationHistory, queuedMessages, typingAgent]);

  // Helper to log a message to the server
  const logMessage = async ({ threadId, role, agent, content, timestamp }) => {
    try {
      await fetch("/api/logMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, role, agent, content, timestamp }),
      });
    } catch (err) {
      // Fail silently for now
      // console.error("Failed to log message", err);
    }
  };

  // Helper to get agent details (built-in or custom)
  const getAgentDetails = (agentName) => {
    const builtIn = AGENT_DETAILS[agentName];
    if (builtIn) return builtIn;
    const custom = customAgents.find(a => a.name === agentName);
    if (custom) {
      return {
        avatar: custom.avatar || "🤖",
        gradient: "from-gray-100 to-gray-50",
        bubbleColor: "bg-gray-700",
        textColor: "text-white"
      };
    }
    return {
      avatar: "🤖",
      gradient: "from-gray-100 to-gray-50",
      bubbleColor: "bg-gray-700",
      textColor: "text-white"
    };
  };

  // Typing/queue logic
  useEffect(() => {
    if (queuedMessages.length > 0 && !isThinking) {
      const next = queuedMessages[0];
      setTypingAgent(next.agent);
      const baseDelay = 2000;
      const charDelay = 50;
      const delay = Math.min(8000, Math.max(baseDelay, next.text.length * charDelay));
      const timeout = setTimeout(() => {
        setQueuedMessages((prev) => prev.slice(1));
        setTypingAgent(null);
        // Add the message to conversation history after it's been displayed
        addMessage(activeId, {
          role: "assistant",
          agent: next.agent,
          content: next.text,
          timestamp: next.timestamp,
        });
        // Log agent message
        logMessage({
          threadId: activeId,
          role: "assistant",
          agent: next.agent,
          content: next.text,
          timestamp: next.timestamp,
        });
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [queuedMessages, isThinking, addMessage, activeId]);

  // Handle user submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim() || !activeId) return;
    setIsThinking(true);
    const userMessage = { role: "user", content: goal, timestamp: new Date().toLocaleTimeString() };
    addMessage(activeId, userMessage);
    // Log user message
    logMessage({
      threadId: activeId,
      role: "user",
      agent: null,
      content: goal,
      timestamp: userMessage.timestamp,
    });
    setGoal("");
    setQueuedMessages([]);
    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: [...conversationHistory, userMessage],
          selectedAgents: selectedAgents.slice(0, selectedAgents.length),
          customAgents
        })
      });
      const data = await response.json();
      const now = new Date().toLocaleTimeString();
      const agentMessages = data.thoughts.map((t) => ({
        agent: t.agent,
        text: t.message,
        timestamp: now
      }));
      setQueuedMessages(agentMessages);
    } catch (error) {
      console.error("Error solving goal:", error);
    } finally {
      setIsThinking(false);
    }
  };

  // When creating a new thread, clear input and queued messages
  const handleNewConversation = () => {
    createThread();
    setGoal("");
    setQueuedMessages([]);
    setTypingAgent(null);
  };

  // Export conversation as text file
  const exportConversation = () => {
    if (!activeThread || !activeThread.messages.length) return;
    const lines = activeThread.messages.map(msg => {
      const time = msg.timestamp ? `[${msg.timestamp}] ` : '';
      const role = msg.role === 'user' ? 'User' : (msg.agent || 'Agent');
      return `${time}${role}: ${msg.content}`;
    });
    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (activeThread.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'conversation') + '.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="h-screen bg-gray-100 text-black flex flex-col">
      {/* Modal for conversation list */}
      <ConversationModal open={modalOpen} onClose={() => setModalOpen(false)} />
      {/* iMessage-style header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Conversations button on the left */}
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center mr-4"
            onClick={() => setModalOpen(true)}
            title="View Conversations"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* Centered title and description */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold text-gray-800">Agent Panel Discussion</h1>
            <p className="text-sm text-gray-500 mt-1">This is an AI-powered discussion panel featuring three unique agents.</p>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                Simply type your question or topic below, and watch as the agents engage in a dynamic conversation, building on each others thoughts and perspectives.
              </p>
            </div>
          </div>
          {/* Save (export) button on the right */}
          <button
            className="ml-4 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
            onClick={exportConversation}
            title="Save conversation as text file"
            disabled={!activeThread || !activeThread.messages.length}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M17 3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3zm-2 0v4H5V3h10zM5 17v-6h10v6H5z" />
              <rect x="7" y="13" width="6" height="2" rx="1" />
            </svg>
          </button>
        </div>
      </div>
      {/* Main content area with messages */}
      <div className="flex-1 overflow-hidden h-full">
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          {/* Messages area - scrollable */}
          <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
            {/* Display full conversation history */}
            {conversationHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, type: 'spring', stiffness: 180, damping: 18 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs lg:max-w-md shadow-lg">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                    <div className="text-xs text-blue-100 mt-1 text-right">
                      {msg.timestamp}
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-start gap-2 max-w-xs lg:max-w-md relative`}>
                    <div className="text-lg mt-1">{getAgentDetails(msg.agent)?.avatar}</div>
                    <div className={`${getAgentDetails(msg.agent)?.bubbleColor || 'bg-gray-500'} ${getAgentDetails(msg.agent)?.textColor || 'text-white'} rounded-2xl rounded-bl-md px-4 py-2 flex-1 relative shadow-lg`}>
                      <div className="flex justify-between items-start">
                        <div className="text-xs opacity-80 mb-1">{msg.agent}</div>
                      </div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {msg.timestamp}
                      </div>
                      {/* Copy button bottom right */}
                      <button
                        className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/40 text-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        style={{ zIndex: 2 }}
                        onClick={async () => {
                          let success = false;
                          try {
                            if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
                              await navigator.clipboard.writeText(msg.content);
                              success = true;
                            } else {
                              // Fallback for older browsers
                              const textarea = document.createElement('textarea');
                              textarea.value = msg.content;
                              document.body.appendChild(textarea);
                              textarea.select();
                              try {
                                document.execCommand('copy');
                                success = true;
                              } catch (err) {
                                success = false;
                              }
                              document.body.removeChild(textarea);
                            }
                          } catch (err) {
                            success = false;
                          }
                          if (success) {
                            setCopiedIndex(i);
                            setTimeout(() => setCopiedIndex(null), 1200);
                          } else {
                            setCopyErrorIndex(i);
                            setTimeout(() => setCopyErrorIndex(null), 1200);
                          }
                        }}
                        title="Copy to clipboard"
                      >
                        {copiedIndex === i ? (
                          <span className="text-xs font-semibold">Copied!</span>
                        ) : copyErrorIndex === i ? (
                          <span className="text-xs font-semibold">Failed!</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16.5V18a2.25 2.25 0 002.25 2.25h6A2.25 2.25 0 0018.5 18v-6A2.25 2.25 0 0016.25 9.75H15.5M8 16.5A2.25 2.25 0 015.75 14.25v-6A2.25 2.25 0 018 6h6A2.25 2.25 0 0116.25 8.25v.75" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Fixed prompt field at bottom - iMessage style */}
          <div className="border-t bg-white sticky bottom-0 left-0 w-full z-10">
            {isThinking && (
              <div className="px-4 py-2 bg-gray-50 border-b">
                <div className="text-gray-500 flex items-center gap-2 text-sm justify-center">
                  <Spinner />
                  <span>Processing your message...</span>
                </div>
              </div>
            )}
            {typingAgent && (
              <div className="px-4 py-2 bg-gray-50 border-b">
                <div className="text-gray-500 flex items-center gap-2 text-sm">
                  <span>{getAgentDetails(typingAgent)?.avatar}</span>
                  <span className="italic">{typingAgent} is typing...</span>
                </div>
              </div>
            )}
            <div className="p-4">
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Message"
                  className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 bg-gray-50"
                />
                <button 
                  type="submit" 
                  className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={!goal.trim()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
