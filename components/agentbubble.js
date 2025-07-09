import React from "react";
import ReactMarkdown from "react-markdown";

const AGENT_GRADIENTS = {
  Azazel: "from-red-100 to-red-300",
  Isaac: "from-blue-100 to-blue-300",
  Lazuras: "from-purple-100 to-purple-300"
};

const AgentBubble = ({ name, text, timestamp }) => {
  const safeText = typeof text === "string" ? text : "";
  const gradientClass = AGENT_GRADIENTS[name] || "from-gray-100 to-white";

  return (
    <div className={`bg-gradient-to-br ${gradientClass} text-black shadow-md rounded-xl p-4 max-w-3xl`}>
      <div className="flex justify-between items-center mb-1">
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-gray-600">{timestamp}</div>
      </div>
      <div className="text-sm whitespace-pre-wrap leading-relaxed">
        <ReactMarkdown>{safeText}</ReactMarkdown>
      </div>
    </div>
  );
};

export default AgentBubble;


