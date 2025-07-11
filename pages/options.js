import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Options() {
  const router = useRouter();
  // Persist bot count in localStorage
  const [botCount, setBotCount] = useState(3);
  const [selectedBots, setSelectedBots] = useState(["Azazel", "Isaac", "Lazuras"]);
  const [customAgents, setCustomAgents] = useState([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showCustomAgentForm, setShowCustomAgentForm] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", persona: "", avatar: "" });
  const [customAgentError, setCustomAgentError] = useState("");
  
  // New state for editing
  const [editingAgent, setEditingAgent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAgent, setEditAgent] = useState({ name: "", persona: "", avatar: "" });
  const [editAgentError, setEditAgentError] = useState("");

  // Available bots (built-in + custom)
  const builtInBots = ["Azazel", "Isaac", "Lazuras"];
  const availableBots = [...builtInBots, ...customAgents.map(a => a.name)];

  useEffect(() => {
    const savedCount = localStorage.getItem("botCount");
    const savedBots = localStorage.getItem("selectedBots");
    const savedCustom = localStorage.getItem("customAgents");
    if (savedCount) setBotCount(Number(savedCount));
    if (savedBots) setSelectedBots(JSON.parse(savedBots));
    if (savedCustom) setCustomAgents(JSON.parse(savedCustom));
  }, []);

  const handleBotToggle = (bot) => {
    setSelectedBots(prev => {
      if (prev.includes(bot)) {
        return prev.filter(b => b !== bot);
      } else {
        return [...prev, bot];
      }
    });
  };

  const handleSave = () => {
    localStorage.setItem("botCount", botCount);
    localStorage.setItem("selectedBots", JSON.stringify(selectedBots));
    localStorage.setItem("customAgents", JSON.stringify(customAgents));
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const hasEnoughBots = selectedBots.length >= botCount;
  const hasTooManyBots = selectedBots.length > botCount;
  const hasExactBots = selectedBots.length === botCount;
  const canSave = hasExactBots && selectedBots.length > 0;

  // Custom agent creation
  const handleCustomAgentChange = (e) => {
    const { name, value } = e.target;
    setNewAgent((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddCustomAgent = () => {
    setCustomAgentError("");
    if (!newAgent.name.trim() || !newAgent.persona.trim() || !newAgent.avatar.trim()) {
      setCustomAgentError("All fields are required.");
      return;
    }
    if (availableBots.includes(newAgent.name.trim())) {
      setCustomAgentError("Agent name must be unique.");
      return;
    }
    const agent = {
      name: newAgent.name.trim(),
      persona: newAgent.persona.trim(),
      avatar: newAgent.avatar.trim(),
    };
    const updatedCustom = [...customAgents, agent];
    setCustomAgents(updatedCustom);
    setSelectedBots((prev) => [...prev, agent.name]);
    setNewAgent({ name: "", persona: "", avatar: "" });
    setShowCustomAgentForm(false);
    localStorage.setItem("customAgents", JSON.stringify(updatedCustom));
  };

  // Custom agent editing
  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setEditAgent({ name: agent.name, persona: agent.persona, avatar: agent.avatar });
    setEditAgentError("");
    setShowEditModal(true);
  };

  const handleEditAgentChange = (e) => {
    const { name, value } = e.target;
    setEditAgent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    setEditAgentError("");
    if (!editAgent.name.trim() || !editAgent.persona.trim() || !editAgent.avatar.trim()) {
      setEditAgentError("All fields are required.");
      return;
    }
    
    // Check if name is unique (excluding the current agent being edited)
    const otherAgents = availableBots.filter(name => name !== editingAgent.name);
    if (otherAgents.includes(editAgent.name.trim())) {
      setEditAgentError("Agent name must be unique.");
      return;
    }

    const updatedCustom = customAgents.map(agent => 
      agent.name === editingAgent.name 
        ? { name: editAgent.name.trim(), persona: editAgent.persona.trim(), avatar: editAgent.avatar.trim() }
        : agent
    );
    
    setCustomAgents(updatedCustom);
    
    // Update selectedBots if the name changed
    if (editAgent.name.trim() !== editingAgent.name) {
      setSelectedBots(prev => 
        prev.map(bot => bot === editingAgent.name ? editAgent.name.trim() : bot)
      );
    }
    
    localStorage.setItem("customAgents", JSON.stringify(updatedCustom));
    setShowEditModal(false);
    setEditingAgent(null);
  };

  // Custom agent deletion
  const handleDeleteAgent = (agentName) => {
    if (confirm(`Are you sure you want to delete "${agentName}"? This action cannot be undone.`)) {
      const updatedCustom = customAgents.filter(agent => agent.name !== agentName);
      setCustomAgents(updatedCustom);
      
      // Remove from selectedBots if it was selected
      setSelectedBots(prev => prev.filter(bot => bot !== agentName));
      
      localStorage.setItem("customAgents", JSON.stringify(updatedCustom));
    }
  };

  return (
    <div className="h-screen bg-gray-100 text-black flex flex-col">
      <div className="p-4 border-b bg-white shadow-sm flex items-center justify-between max-w-2xl mx-auto w-full">
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center mr-4"
          onClick={() => router.back()}
          title="Back to chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800 flex-1 text-center">Options</h1>
        <div className="w-10" /> {/* Spacer for symmetry */}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg mt-8">
          <h2 className="text-lg font-semibold mb-4">Number of Bots</h2>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={5}
              value={botCount}
              onChange={e => setBotCount(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <span className="font-mono text-lg w-8 text-center">{botCount}</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">Choose how many bots participate in each conversation.</p>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Select Bots</h2>
            <div className="space-y-3">
              {availableBots.map(bot => {
                const isCustom = customAgents.find(a => a.name === bot);
                return (
                  <div key={bot} className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedBots.includes(bot)}
                        onChange={() => handleBotToggle(bot)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-400"
                      />
                      <span className="text-gray-800">{bot}</span>
                      {isCustom && (
                        <span className="ml-1 text-xs text-blue-400">(custom)</span>
                      )}
                    </label>
                    {isCustom && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleEditAgent(isCustom)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded"
                          title="Edit agent"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(bot)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                          title="Delete agent"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {!hasEnoughBots && (
              <p className="text-red-500 text-sm mt-2">
                You need to select <b>exactly</b> {botCount} bot(s) to use {botCount} bots in conversations.
              </p>
            )}
            {hasTooManyBots && (
              <p className="text-red-500 text-sm mt-2">
                You have selected more bots than the chosen bot count. Please select only {botCount} bot(s).
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              Selected: {selectedBots.length} bot(s)
            </p>
            <div className="mt-6">
              <button
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition"
                onClick={() => setShowCustomAgentForm(v => !v)}
              >
                {showCustomAgentForm ? "Cancel" : "+ Create Custom Agent"}
              </button>
            </div>
            {showCustomAgentForm && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-2">New Agent</h3>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newAgent.name}
                    onChange={handleCustomAgentChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Persona / Prompt</label>
                  <textarea
                    name="persona"
                    value={newAgent.persona}
                    onChange={handleCustomAgentChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Avatar (emoji or text)</label>
                  <input
                    type="text"
                    name="avatar"
                    value={newAgent.avatar}
                    onChange={handleCustomAgentChange}
                    className="w-24 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-2xl text-center"
                    maxLength={2}
                    placeholder="😀"
                  />
                </div>
                {customAgentError && <p className="text-red-500 text-sm mb-2">{customAgentError}</p>}
                <button
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  onClick={handleAddCustomAgent}
                  type="button"
                >
                  Save Agent
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showSaveSuccess ? "Saved!" : "Save Options"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Agent</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={editAgent.name}
                onChange={handleEditAgentChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Persona / Prompt</label>
              <textarea
                name="persona"
                value={editAgent.persona}
                onChange={handleEditAgentChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Avatar (emoji or text)</label>
              <input
                type="text"
                name="avatar"
                value={editAgent.avatar}
                onChange={handleEditAgentChange}
                className="w-24 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-2xl text-center"
                maxLength={2}
                placeholder="😀"
              />
            </div>
            {editAgentError && <p className="text-red-500 text-sm mb-4">{editAgentError}</p>}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 