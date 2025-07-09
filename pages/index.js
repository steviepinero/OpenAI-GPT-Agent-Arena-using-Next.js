// pages/index.js
import React, { useState, useEffect, useRef } from "react";
import AgentBubble from "../components/agentbubble";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "../components/ui/spinner";

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
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([...ALL_AGENTS]);
  const [queuedMessages, setQueuedMessages] = useState([]);
  const [typingAgent, setTypingAgent] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const toggleAgent = (agent) => {
    setSelectedAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent]
    );
  };

  useEffect(() => {
    if (queuedMessages.length > 0 && !isThinking) {
      const next = queuedMessages[0];
      setTypingAgent(next.agent);
      
      // Simulate realistic typing time based on message length
      const baseDelay = 2000; // 2 seconds minimum
      const charDelay = 50; // 50ms per character
      const delay = Math.min(8000, Math.max(baseDelay, next.text.length * charDelay));
      
      const timeout = setTimeout(() => {
        setQueuedMessages((prev) => prev.slice(1));
        setTypingAgent(null);
        
        // Add the message to conversation history after it's been displayed
        setConversationHistory(prev => [...prev, {
          role: "assistant",
          agent: next.agent,
          content: next.text,
          timestamp: next.timestamp
        }]);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [queuedMessages, isThinking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setIsThinking(true);
    
    // Add user message to conversation history
    const userMessage = { role: "user", content: goal, timestamp: new Date().toLocaleTimeString() };
    const newHistory = [...conversationHistory, userMessage];
    setConversationHistory(newHistory);
    
    // Clear the input field
    setGoal("");
    
    // Clear previous queued messages for new round
    setQueuedMessages([]);

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory, selectedAgents })
      });

      const data = await response.json();
      const now = new Date().toLocaleTimeString();

      const agentMessages = data.thoughts.map((t) => ({
        agent: t.agent,
        text: t.message,
        timestamp: now
      }));

      // Don't add to conversation history yet - let them appear with typing delays first
      // setConversationHistory(prev => [...prev, ...agentHistoryMessages]);

      // Queue messages for sequential display with typing delays
      setQueuedMessages(agentMessages);
    } catch (error) {
      console.error("Error solving goal:", error);
    } finally {
      // Remove the immediate thinking state and let the typing delays handle the flow
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col">
      {/* iMessage-style header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-xl font-semibold text-gray-800">Agent Panel Discussion</h1>
          <p className="text-sm text-gray-500 mt-1">This is an AI-powered discussion panel featuring three unique agents.          </p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              Simply type your question or topic below, and watch as the agents engage in a dynamic conversation, building on each others thoughts and perspectives.
            </p>
          </div>
        </div>
      </div>

      {/* Main content area with messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          {/* Messages area - scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Display full conversation history */}
            {conversationHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs lg:max-w-md">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                    <div className="text-xs text-blue-100 mt-1 text-right">
                      {msg.timestamp}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 max-w-xs lg:max-w-md">
                    <div className="text-lg mt-1">{AGENT_DETAILS[msg.agent]?.avatar}</div>
                    <div className={`${AGENT_DETAILS[msg.agent]?.bubbleColor || 'bg-gray-500'} ${AGENT_DETAILS[msg.agent]?.textColor || 'text-white'} rounded-2xl rounded-bl-md px-4 py-2 flex-1`}>
                      <div className="text-xs opacity-80 mb-1">{msg.agent}</div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed prompt field at bottom - iMessage style */}
          <div className="border-t bg-white">
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
                  <span>{AGENT_DETAILS[typingAgent]?.avatar}</span>
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
