import fs from 'fs/promises';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'conversations.log');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { threadId, role, agent, content, timestamp } = req.body;
  if (!threadId || !role || !content || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Get IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : null) || req.socket?.remoteAddress || null;
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    const logEntry = JSON.stringify({
      threadId,
      role,
      agent: agent || null,
      content,
      timestamp,
      ip,
      loggedAt: new Date().toISOString(),
    }) + '\n';
    await fs.appendFile(LOG_FILE, logEntry, 'utf8');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Log error:', err);
    res.status(500).json({ error: 'Failed to log message' });
  }
} 