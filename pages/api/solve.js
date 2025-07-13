// pages/api/solve.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BUILT_IN_AGENTS = [
  {
    name: "Azazel",
    prompt: "You are Azazel, a ruthless tactician who cuts through nonsense. You're direct, logical, and often disagree with others. When you disagree, point out specific flaws in their arguments. You value efficiency and practical solutions over philosophical musings."
  },
  {
    name: "Isaac",
    prompt: "You are Isaac, a curious philosopher who considers all angles deeply. You often disagree with others' conclusions and point out logical gaps or assumptions they make. You prefer thorough analysis over quick solutions and aren't afraid to challenge others' reasoning."
  },
  {
    name: "Lazuras",
    prompt: "You are Lazuras, a rebel hacktivist who always challenges conventional methods. You frequently disagree with others and point out how their approaches are too conservative or flawed. You're bold, creative, and love pointing out the weaknesses in traditional thinking."
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
        { 
          role: "system", 
          content: `${currentAgent.prompt}

IMPORTANT: You are ${currentAgent.name}. You are in a dynamic group discussion where agents actively respond to each other. Your response should:

1. **Directly engage** with what others have said - reference specific points from their responses
2. **Disagree when appropriate** - point out flaws, gaps, or weaknesses in others' arguments
3. **Build on or challenge** previous responses - don't just give your own take
4. **Use names** when referring to others (e.g., "Azazel's point about...", "Isaac, I disagree because...")
5. **Stay conversational** - like you're in a real debate, not giving a monologue
6. **Keep responses concise** but substantive - 2-4 sentences typically
7. **DO NOT include your own name** at the beginning or end of your response
8. **DO NOT say "I am [name]"** or similar phrases
9. **DO NOT refer to yourself as other agents** - you are ${currentAgent.name}, not Azazel, Isaac, or Lazuras

Remember: This is a lively discussion where agents challenge each other's thinking!` 
        },
      ];
      
      // Add the full conversation history
      history.forEach((msg) => {
        if (msg.role === "user") {
          messages.push({ role: "user", content: msg.content });
        } else if (msg.role === "assistant") {
          messages.push({ role: "assistant", content: msg.content });
        }
      });

      // Add previous thoughts from this round with context
      for (let j = 0; j < thoughts.length; j++) {
        const previousThought = thoughts[j];
        messages.push({
          role: "assistant",
          content: `${previousThought.agent}: ${previousThought.message}`
        });
      }

      // Determine if this agent is the first to respond
      const isFirstToRespond = thoughts.length === 0;
      
      // Adjust the system prompt based on whether this is the first response
      if (isFirstToRespond) {
        messages.push({
          role: "system",
          content: `You are ${currentAgent.name} and you're the first to respond to the user's question. Since no other agents have spoken yet, focus on:
- Providing your initial thoughts on the topic
- Setting up the discussion with your perspective
- NOT referencing other agents by name (since they haven't spoken)
- Keeping your response concise but substantive (2-4 sentences)
- NOT including your own name in your response`
        });
      } else {
        messages.push({
          role: "system",
          content: `You are ${currentAgent.name}. You've heard from other agents in this round. Now respond by:
- Engaging with their specific points
- Disagreeing where you see flaws
- Building on or challenging their arguments
- Staying focused on the original topic
- NOT including your name in your response
- NOT referring to yourself as other agents`
        });
      }

      const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-4.1-nano",
        temperature: 0.8, // Slightly higher for more dynamic responses
        max_tokens: 200 // Increased for more detailed responses
      });

      let message = completion.choices[0]?.message?.content?.trim() ?? "No response.";
      
      // Clean up any agent name prefixes that might still appear
      const agentName = currentAgent.name;
      const allAgentNames = [...BUILT_IN_AGENTS.map(a => a.name), ...(Array.isArray(customAgents) ? customAgents.map(a => a.name) : [])];
      
      const namePatterns = [
        // Remove own name patterns
        new RegExp(`^${agentName}:\\s*`, 'i'),
        new RegExp(`^I am ${agentName}\\s*`, 'i'),
        new RegExp(`^As ${agentName}\\s*`, 'i'),
        new RegExp(`^${agentName} here\\s*`, 'i'),
        new RegExp(`^This is ${agentName}\\s*`, 'i'),
        // Remove other agent name patterns (in case of confusion)
        ...allAgentNames.map(name => new RegExp(`^${name}:\\s*`, 'i')),
        ...allAgentNames.map(name => new RegExp(`^I am ${name}\\s*`, 'i')),
        ...allAgentNames.map(name => new RegExp(`^As ${name}\\s*`, 'i')),
        ...allAgentNames.map(name => new RegExp(`^${name} here\\s*`, 'i')),
        ...allAgentNames.map(name => new RegExp(`^This is ${name}\\s*`, 'i'))
      ];
      
      namePatterns.forEach(pattern => {
        message = message.replace(pattern, '');
      });
      
      // Also clean up any trailing name references
      allAgentNames.forEach(name => {
        message = message.replace(new RegExp(`\\s*-\\s*${name}$`, 'i'), '');
        message = message.replace(new RegExp(`\\s*~\\s*${name}$`, 'i'), '');
      });
      
      thoughts.push({ agent: currentAgent.name, message, id: i });
    }

    res.status(200).json({ thoughts });
  } catch (err) {
    console.error("/api/solve error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
