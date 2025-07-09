// pages/api/solve.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AGENTS = [
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
    prompt: "You are Lazuras, a rebel innovator who always challenges conventional methods. Be bold and creative."
  }
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { goal, selectedAgents } = req.body;
  if (!goal || !selectedAgents) return res.status(400).json({ error: "Missing goal or selected agents" });

  try {
    const filteredAgents = AGENTS.filter((a) => selectedAgents.includes(a.name));
    const thoughts = [];

    for (let i = 0; i < filteredAgents.length; i++) {
      const currentAgent = filteredAgents[i];
      const prevMessages = thoughts.map(t => ({ role: "assistant", content: `${t.agent}: ${t.message}` }));

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: currentAgent.prompt },
          ...prevMessages,
          { role: "user", content: `The user has this goal: ${goal}` }
        ],
        model: "gpt-4.1-nano",
        temperature: 0.7,
        max_tokens: 300
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
