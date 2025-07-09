// pages/index.js
import React, { useState, useEffect } from "react";
import AgentBubble from "../components/agentbubble";
import { motion, AnimatePresence } from "framer-motion";

const AGENT_DETAILS = {
  Azazel: { avatar: "🗡️", gradient: "from-red-200 to-red-100" },
  Isaac: { avatar: "🧠", gradient: "from-blue-100 to-blue-50" },
  Lazuras: { avatar: "⚡", gradient: "from-purple-100 to-purple-50" },
};

const ALL_AGENTS = Object.keys(AGENT_DETAILS);

export default function AutoSolve() {
  const [goal, setGoal] = useState("");
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([...ALL_AGENTS]);
  const [queuedMessages, setQueuedMessages] = useState([]);
  const [typingAgent, setTypingAgent] = useState(null);

  const toggleAgent = (agent) => {
    setSelectedAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent]
    );
  };

  useEffect(() => {
    if (queuedMessages.length > 0 && !isThinking) {
      const next = queuedMessages[0];
      setTypingAgent(next.agent);
      const delay = Math.min(2000, Math.max(500, next.text.length * 30));
      const timeout = setTimeout(() => {
        setMessages((prev) => [...prev, next]);
        setQueuedMessages((prev) => prev.slice(1));
        setTypingAgent(null);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [queuedMessages, isThinking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setIsThinking(true);
    setMessages([]);
    setQueuedMessages([]);

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, selectedAgents })
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
      setTimeout(() => setIsThinking(false), 1000);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 text-black">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What do you want to solve today?"
          className="flex-1 px-4 py-2 rounded shadow"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Go</button>
      </form>

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium">Select agents:</p>
        <div className="flex flex-wrap gap-2">
          {ALL_AGENTS.map((agent) => (
            <button
              key={agent}
              onClick={() => toggleAgent(agent)}
              className={`px-3 py-1 rounded-full border text-sm flex items-center gap-1 ${
                selectedAgents.includes(agent)
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              <span>{AGENT_DETAILS[agent].avatar}</span>
              <span>{agent}</span>
            </button>
          ))}
        </div>
      </div>

      {typingAgent && (
        <div className="text-gray-500 flex items-center gap-2 mb-2">
          <span>{AGENT_DETAILS[typingAgent]?.avatar}</span>
          <span className="italic">{typingAgent} is typing...</span>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <AgentBubble
                name={msg.agent}
                text={msg.text}
                timestamp={msg.timestamp}
                gradient={AGENT_DETAILS[msg.agent]?.gradient || "from-gray-100 to-white"}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
