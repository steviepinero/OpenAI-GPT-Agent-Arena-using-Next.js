import React from "react";

export default function Spinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`} aria-label="Loading">
      <span className="block w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
      <span className="block w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
      <span className="block w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
    </div>
  );
} 