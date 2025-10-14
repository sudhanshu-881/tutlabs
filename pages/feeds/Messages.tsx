import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { subscribeToPush } from '../../lib/services/push';
import { ensureConversation, listConversations, getConversation, sendMessage, Conversation } from '../../lib/services/messages';
import { useSearchParams } from 'react-router-dom';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
};

const Messages: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const VAPID = (import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY;
    if (user?.id && VAPID) {
      subscribeToPush(user.id, VAPID).catch(() => {});
    }
  }, [user]);

  // Initialize from deep link ?peer= & name=
  useEffect(() => {
    const peer = params.get('peer');
    const name = params.get('name') || 'User';
    if (peer && user?.id) {
      ensureConversation(peer, name);
      setSelectedPeer(peer);
    }
  }, [params, user?.id]);

  const conversations = useMemo(() => listConversations(), [refresh]);
  const current = selectedPeer ? getConversation(selectedPeer) : null;

  const handleSend = () => {
    if (!user?.id || !selectedPeer || !input.trim()) return;
    const name = current?.peerName || 'User';
    sendMessage({ fromId: user.id, peerId: selectedPeer, peerName: name, text: input.trim() });
    setInput('');
    setRefresh((x) => x + 1);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur rounded-2xl p-3 border border-white/20 dark:border-white/10">
        {conversations.length === 0 ? (
          <div className="text-sm text-gray-700/80 dark:text-gray-300/90">No conversations yet.</div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.peerId}
              onClick={() => setSelectedPeer(c.peerId)}
              className={`w-full text-left p-3 rounded-xl border border-white/15 dark:border-white/10 transition ${selectedPeer===c.peerId ? 'bg-white/90 dark:bg-slate-900/70' : 'bg-white/70 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-900/60'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{c.peerName}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{c.messages.at(-1)?.ts ? new Date(c.messages.at(-1)!.ts).toLocaleTimeString() : ''}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700/80 dark:text-gray-300/90 truncate">{c.messages.at(-1)?.text || 'New conversation'}</p>
            </button>
          ))
        )}
      </div>
      <div className="md:col-span-2 p-0 rounded-2xl border border-white/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur h-[30rem] flex flex-col shadow-lg">
        {!current ? (
          <div className="h-full flex items-center justify-center text-gray-700/80 dark:text-gray-300/90">
            Select a conversation to start messaging.
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-white/20 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/70 rounded-t-2xl">
              <div className="font-semibold text-gray-900 dark:text-white text-sm">{current.peerName}</div>
              <div className="text-xs text-gray-500">Secure</div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2 scroll-smooth">
              {current.messages.map((m) => (
                <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${m.fromId===user?.id ? 'ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>{m.text}</div>
              ))}
            </div>
            <div className="p-3 border-t border-white/20 dark:border-white/10 flex items-center gap-2 bg-white/80 dark:bg-slate-900/70 rounded-b-2xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key==='Enter') handleSend(); }}
                className="flex-1 px-3 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none shadow-sm"
                placeholder="Type a message"
              />
              <button onClick={handleSend} className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow">Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
