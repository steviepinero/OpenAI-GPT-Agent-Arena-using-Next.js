# AI Agent Panel Discussion

A Next.js application featuring an AI-powered discussion panel with multiple agents engaging in dynamic conversations.

## Features

- 🤖 **Multi-Agent Conversations**: Three unique AI agents with distinct personalities
- 💬 **Real-time Chat**: Interactive conversations with typing animations
- 📚 **Conversation History**: Save and load previous chat threads
- ⚙️ **Custom Agents**: Create, edit, and delete your own AI agents
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 📱 **Mobile Friendly**: Works great on all devices

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Setup

### Development
- Development dependencies are automatically checked and installed
- Hot reloading enabled
- Debug information available

### Production
- Development dependencies are excluded
- Optimized builds with SWC minification
- Source maps disabled for security
- Telemetry disabled

## Features

### Agent Management
- **Built-in Agents**: Azazel, Isaac, and Lazuras with unique personalities
- **Custom Agents**: Create your own agents with custom names, personas, and avatars
- **Agent Selection**: Choose how many agents participate (1-5)
- **Edit & Delete**: Full CRUD operations for custom agents

### Conversation Features
- **Real-time Chat**: Send messages and watch agents respond
- **Conversation History**: All chats are saved locally
- **Export Conversations**: Download conversations as text files
- **Copy Messages**: Copy individual agent responses to clipboard

### UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Modern Interface**: Clean, intuitive design
- **Accessibility**: Keyboard navigation and screen reader support

## Tech Stack

- **Framework**: Next.js 15
- **React**: 19
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI**: OpenAI GPT API

## Project Structure

```
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── agentbubble.js  # Agent message component
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   ├── index.js        # Main chat page
│   └── options.js      # Settings page
├── lib/                # Utility functions
├── public/             # Static assets
└── styles/             # Global styles
```

## API Routes

- `/api/solve` - Main chat endpoint for agent responses
- `/api/logMessage` - Server-side message logging

## Configuration

### Custom Agents
1. Go to Options page (gear icon in conversation modal)
2. Click "Create Custom Agent"
3. Fill in name, persona, and avatar
4. Save and select for conversations

### Bot Count
- Adjust the slider in Options to change how many agents participate
- Must select exactly the number of bots you want to use

## Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Other Platforms
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file for local development:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
