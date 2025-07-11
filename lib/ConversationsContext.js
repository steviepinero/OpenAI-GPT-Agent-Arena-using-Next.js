import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "agent_conversations";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function sortThreads(threads) {
  return [...threads].sort((a, b) => b.timestamp - a.timestamp);
}

const ConversationsContext = createContext();

export function ConversationsProvider({ children }) {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Load threads from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setThreads(parsed.threads || []);
      setActiveId(parsed.activeId || (parsed.threads?.[0]?.id ?? null));
    }
  }, []);

  // Save threads to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ threads, activeId })
    );
  }, [threads, activeId]);

  const createThread = useCallback((title = "New Conversation") => {
    const id = generateId();
    const newThread = {
      id,
      title,
      timestamp: Date.now(),
      messages: [],
    };
    setThreads((prev) => sortThreads([newThread, ...prev]));
    setActiveId(id);
    return id;
  }, []);

  const updateThread = useCallback((id, updates) => {
    setThreads((prev) => sortThreads(
      prev.map((t) => (t.id === id ? { ...t, ...updates, timestamp: Date.now() } : t))
    ));
  }, []);

  const deleteThread = useCallback((id) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  }, [activeId]);

  const setActiveThread = useCallback((id) => {
    setActiveId(id);
    // Optionally, bump the selected thread to the top (by updating timestamp)
    setThreads((prev) => sortThreads(
      prev.map((t) => t.id === id ? { ...t, timestamp: Date.now() } : t)
    ));
  }, []);

  const addMessage = useCallback((id, message) => {
    setThreads((prev) => sortThreads(
      prev.map((t) => {
        if (t.id !== id) return t;
        const isFirstUserMsg = t.messages.length === 0 && message.role === "user";
        return {
          ...t,
          messages: [...t.messages, message],
          timestamp: Date.now(),
          title: isFirstUserMsg ? message.content.slice(0, 40) : t.title,
        };
      })
    ));
  }, []);

  const activeThread = threads.find((t) => t.id === activeId) || null;

  return (
    <ConversationsContext.Provider
      value={{
        threads,
        activeThread,
        activeId,
        createThread,
        updateThread,
        deleteThread,
        setActiveThread,
        addMessage,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  return useContext(ConversationsContext);
} 