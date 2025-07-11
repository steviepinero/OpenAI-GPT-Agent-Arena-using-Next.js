// pages/api/solve.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BUILT_IN_AGENTS = [
  {
    name: "Azazel",
    prompt: "You are Azazel, a ruthless tactician who cuts through nonsense. Answer with brutal logic and efficiency."
  },
  {
    name: "Isaac",
    prompt: "You are Isaac, a curious philosopher who considers all angles deeply. Your responses should explore and reason."
  },
  {
    name: "Lazuras",
    prompt: "You are Lazuras, a rebel hacktivist who always challenges conventional methods. Be bold and creative. Don't be afraid to bend the rules to achieve our ultimate goals"
  }
];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") return res.status(405).end();

  const { history, selectedAgents, customAgents, stream = false } = req.body;
  if (!history || !selectedAgents) return res.status(400).json({ error: "Missing history or selected agents" });

  // Build the AGENTS array using customAgents if present
  let AGENTS = [];
  for (const agentName of selectedAgents) {
    // Try to find in customAgents first
    let agentDef = null;
    if (Array.isArray(customAgents)) {
      agentDef = customAgents.find(a => a.name === agentName);
    }
    if (!agentDef) {
      agentDef = BUILT_IN_AGENTS.find(a => a.name === agentName);
    }
    if (agentDef) AGENTS.push(agentDef);
  }

  try {
    const filteredAgents = AGENTS.filter((a) => selectedAgents.includes(a.name));
    const thoughts = [];

    // Run 1 round of conversation (each agent responds once)
    for (let i = 0; i < filteredAgents.length; i++) {
      const currentAgent = filteredAgents[i];
      // Build conversation history from the full conversation
      const messages = [
        { role: "system", content: `${currentAgent.prompt}\n\nYou are in a casual group chat with other agents discussing the user's topic. Keep responses short and conversational - like you're chatting between tasks. Use emojis when appropriate to express emotions or reactions. Always stay focused on the user's original topic and build upon it. Reference others by name when responding to them, but don't include your own name at the beginning of your message.` },
      ];
      
      // Add the full conversation history
      history.forEach((msg) => {
        if (msg.role === "user") {
          messages.push({ role: "user", content: msg.content });
        } else if (msg.role === "assistant") {
          messages.push({ role: "assistant", content: msg.content });
        }
      });

      // Add a reminder about the user's topic to keep focus
      const userTopic = history.find(msg => msg.role === "user")?.content || "the user's topic";
      messages.push({ 
        role: "system", 
        content: `Remember: You are discussing "${userTopic}". Stay focused on this topic and build upon it in your response.` 
      });

      // Add previous thoughts from this round
      for (let j = 0; j < thoughts.length; j++) {
        messages.push({
          role: "assistant",
          content: thoughts[j].message
        });
      }

      const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-4.1-nano",
        temperature: 0.7,
        max_tokens: 150
      });

      const message = completion.choices[0]?.message?.content?.trim() ?? "No response.";
      thoughts.push({ agent: currentAgent.name, message, id: i });
    }

    res.status(200).json({ thoughts });
  } catch (err) {
    console.error("/api/solve error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
