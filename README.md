
🚀 Project Overview
-----------------------
OpenAI Agent Arena is a multi-agent conversational system powered by OpenAI's API. Each agent is assigned a unique persona and skillset, and they work together to brainstorm, debate, and generate solutions in real time.
-------------
This project is designed as both a showcase and a playground for:

🔁 Multi-agent prompt chaining

🧩 Modular agent architecture

📊 Real-time message streaming

🧠 Simulated reasoning and disagreement
---------------------------
✨ Key Features
Customizable Agent Personas: 
Each agent has its own name, background, speaking style, and system prompt.

Live Message Typing Simulation:
See each agent think and respond in real time with a fully animated typing effect.

Selective Agent Participation:
Pick which agents are active for any conversation. The rest sit out.

Iterative Dialogue:
Agents take turns building on each other’s ideas — not just responding to the user.

Gradient Chat Bubbles:
Every agent has its own visual identity, so you always know who’s speaking.
----------------------------
🛠️ Tech Stack
Frontend: Next.js, Tailwind CSS

Backend: OpenAI GPT API

Architecture: Client-side message handling with dynamic agent orchestration

State Management: React hooks
-----------------------------
🧪 Experimental Goals
This project serves as a prototype for more advanced ideas in:

Multi-agent epistemic reasoning

Role-based problem solving

AI self-debate and consensus modeling

Transparent agent deliberation chains
----------------------------------------
🔮 What's Next
 Add a moderator/arbiter agent

 Enable memory for agents across turns

 Log internal thoughts or tool use per agent

 Export conversations for analysis

 Plug into real-world use cases (e.g. legal argument analysis, code review, product ideation)

After the last agent speaks, you can send a follow up message

Refreshing the page will clear the chat histroy, treating it like a new conversation



![image](https://github.com/user-attachments/assets/6c3d8bc8-4d99-4a1f-9dc0-77b29d0ae079)



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
