export type Message = {
  id: string;
  fromId: string;
  text: string;
  ts: number;
};

export type Conversation = {
  peerId: string;
  peerName: string;
  messages: Message[];
};

type Store = {
  conversations: Record<string, Conversation>;
};

const STORAGE_KEY = 'tutlabs:messages:v1';

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: {} };
    return JSON.parse(raw) as Store;
  } catch {
    return { conversations: {} };
  }
}

function save(store: Store) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
}

export function listConversations(): Conversation[] {
  const s = load();
  return Object.values(s.conversations);
}

export function getConversation(peerId: string): Conversation | null {
  const s = load();
  return s.conversations[peerId] || null;
}

export function ensureConversation(peerId: string, peerName: string): Conversation {
  const s = load();
  if (!s.conversations[peerId]) {
    s.conversations[peerId] = { peerId, peerName, messages: [] };
    save(s);
  } else if (peerName && s.conversations[peerId].peerName !== peerName) {
    s.conversations[peerId].peerName = peerName;
    save(s);
  }
  return s.conversations[peerId];
}

export function sendMessage(opts: { fromId: string; peerId: string; peerName: string; text: string }): Message {
  const { fromId, peerId, peerName, text } = opts;
  const s = load();
  const conv = s.conversations[peerId] || { peerId, peerName, messages: [] } as Conversation;
  const msg: Message = { id: String(Date.now()) + Math.random().toString(36).slice(2), fromId, text, ts: Date.now() };
  conv.messages.push(msg);
  s.conversations[peerId] = conv;
  save(s);
  return msg;
}
