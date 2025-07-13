import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Analytics() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalMessages: 0,
    agentUsage: {},
    agentWordCounts: {},
    popularTopics: [],
    averageResponseTime: 0,
    userEngagement: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load analytics from localStorage
    const loadAnalytics = () => {
      try {
        const conversations = JSON.parse(localStorage.getItem("agent_conversations") || "{}");
        const threads = conversations.threads || [];
        
        // Calculate basic metrics
        const totalConversations = threads.length;
        const totalMessages = threads.reduce((sum, thread) => sum + thread.messages.length, 0);
        
        // Agent usage analysis
        const agentUsage = {};
        const agentWordCounts = {};
        
        threads.forEach(thread => {
          thread.messages.forEach(msg => {
            if (msg.agent) {
              // Count messages
              agentUsage[msg.agent] = (agentUsage[msg.agent] || 0) + 1;
              
              // Count words
              const wordCount = msg.content ? msg.content.trim().split(/\s+/).length : 0;
              agentWordCounts[msg.agent] = (agentWordCounts[msg.agent] || 0) + wordCount;
            }
          });
        });

        // Popular topics (first user message in each thread)
        const topics = threads
          .map(thread => thread.messages[0]?.content?.slice(0, 50))
          .filter(Boolean)
          .slice(0, 5);

        setAnalytics({
          totalConversations,
          totalMessages,
          agentUsage,
          agentWordCounts,
          popularTopics: topics,
          averageResponseTime: totalMessages > 0 ? Math.round(totalMessages / totalConversations * 10) / 10 : 0,
          userEngagement: totalConversations > 0 ? Math.round((totalMessages / totalConversations) * 10) / 10 : 0
        });
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const topAgent = Object.entries(analytics.agentUsage)
    .sort(([,a], [,b]) => b - a)[0];

  const mostVerboseAgent = Object.entries(analytics.agentWordCounts)
    .sort(([,a], [,b]) => b - a)[0];

  if (loading) {
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
          <h1 className="text-xl font-semibold text-gray-800 flex-1 text-center">Analytics Dashboard</h1>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 text-black flex flex-col">
      <div className="p-4 border-b bg-white shadow-sm flex items-center justify-between max-w-4xl mx-auto w-full">
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center mr-4"
          onClick={() => router.back()}
          title="Back to chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800 flex-1 text-center">Analytics Dashboard</h1>
        <div className="w-10" />
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalConversations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalMessages}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Messages/Conversation</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.averageResponseTime}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">User Engagement</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.userEngagement}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Performance */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Agent Performance</h2>
            <div className="space-y-4">
              {Object.entries(analytics.agentUsage)
                .sort(([,a], [,b]) => b - a)
                .map(([agent, count]) => {
                  const wordCount = analytics.agentWordCounts[agent] || 0;
                  const avgWordsPerMessage = count > 0 ? Math.round(wordCount / count) : 0;
                  const isTopPerformer = topAgent && topAgent[0] === agent;
                  const isMostVerbose = mostVerboseAgent && mostVerboseAgent[0] === agent;
                  
                  return (
                    <div key={agent} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">
                          {agent === "Azazel" ? "🗡️" : agent === "Isaac" ? "🧠" : agent === "Lazuras" ? "⚡" : "🤖"}
                        </span>
                        <div>
                          <span className="font-medium">{agent}</span>
                          <div className="flex gap-2 mt-1">
                            {isTopPerformer && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Top Performer</span>
                            )}
                            {isMostVerbose && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Most Verbose</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Messages</div>
                          <div className="font-semibold">{count}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Total Words</div>
                          <div className="font-semibold">{wordCount.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Avg Words/Message</div>
                          <div className="font-semibold">{avgWordsPerMessage}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / Math.max(...Object.values(analytics.agentUsage))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Word Count Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Communication Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(analytics.agentWordCounts).reduce((sum, count) => sum + count, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Words Generated</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.totalMessages > 0 ? Math.round(Object.values(analytics.agentWordCounts).reduce((sum, count) => sum + count, 0) / analytics.totalMessages) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Words per Message</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {mostVerboseAgent ? mostVerboseAgent[0] : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Most Verbose Agent</div>
              </div>
            </div>
          </div>

          {/* Recent Topics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Conversation Topics</h2>
            <div className="space-y-2">
              {analytics.popularTopics.length > 0 ? (
                analytics.popularTopics.map((topic, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">{topic}...</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No conversations yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 