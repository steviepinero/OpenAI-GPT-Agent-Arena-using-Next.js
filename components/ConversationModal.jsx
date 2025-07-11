import React from "react";
import { useConversations } from "../lib/useConversations";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function ConversationModal({ open, onClose }) {
  const {
    threads,
    activeId,
    setActiveThread,
    createThread,
    deleteThread,
  } = useConversations();

  // Animated modal transitions
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto overflow-hidden"
            initial={{ scale: 0.96, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, duration: 0.22 }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <div className="flex items-center gap-2">
                <Link href="/analytics" legacyBehavior>
                  <a title="Analytics" className="text-gray-500 hover:text-gray-800 text-xl px-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </a>
                </Link>
                <Link href="/options" legacyBehavior>
                  <a title="Options" className="text-gray-500 hover:text-gray-800 text-xl px-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 2.25c.414 0 .75.336.75.75v1.086a7.501 7.501 0 013.273 1.357l.77-.77a.75.75 0 111.06 1.06l-.77.77a7.501 7.501 0 011.357 3.273h1.086a.75.75 0 010 1.5h-1.086a7.501 7.501 0 01-1.357 3.273l.77.77a.75.75 0 11-1.06 1.06l-.77-.77a7.501 7.501 0 01-3.273 1.357v1.086a.75.75 0 01-1.5 0v-1.086a7.501 7.501 0 01-3.273-1.357l-.77.77a.75.75 0 11-1.06-1.06l.77-.77a7.501 7.501 0 01-1.357-3.273H2.25a.75.75 0 010-1.5h1.086a7.501 7.501 0 011.357-3.273l-.77-.77a.75.75 0 111.06-1.06l.77.77A7.501 7.501 0 0111.25 4.086V3a.75.75 0 01.75-.75zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
                    </svg>
                  </a>
                </Link>
                <button
                  className="text-gray-500 hover:text-gray-800 text-2xl px-2"
                  onClick={onClose}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y">
              {threads.length === 0 && (
                <div className="p-6 text-center text-gray-400">No conversations yet.</div>
              )}
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`flex items-center px-4 py-3 cursor-pointer hover:bg-blue-50 transition ${
                    thread.id === activeId ? "bg-blue-100" : ""
                  }`}
                  onClick={() => {
                    setActiveThread(thread.id);
                    onClose();
                  }}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 truncate">
                      {(() => {
                        if (!thread.title) return "Conversation";
                        const trimmed = thread.title.trim();
                        const endsWithPunct = /[.!?]$/.test(trimmed);
                        return trimmed.slice(0, 40) + (endsWithPunct ? "" : "...");
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {(() => {
                        if (thread.messages.length === 0) return "No messages yet.";
                        const lastMsg = thread.messages[thread.messages.length - 1].content;
                        if (!lastMsg) return "No messages yet.";
                        const trimmed = lastMsg.trim();
                        const endsWithPunct = /[.!?]$/.test(trimmed);
                        return trimmed.slice(0, 40) + (endsWithPunct ? "" : "...");
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <div className="text-xs text-gray-400">
                      {new Date(thread.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </div>
                    <button
                      className="text-xs text-red-400 hover:text-red-600 mt-1"
                      onClick={e => {
                        e.stopPropagation();
                        deleteThread(thread.id);
                      }}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex justify-between items-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                onClick={() => {
                  createThread();
                  onClose();
                }}
              >
                + New Conversation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 