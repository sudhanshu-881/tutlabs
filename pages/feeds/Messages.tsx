import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { subscribeToPush } from '../../lib/services/push';
import { resolvePeerUserId, ensureDirectConversationWith, listMyConversations, fetchConversationMessages, insertMessage, subscribeConversation, upsertReceipt } from '../../lib/services/chatService';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
};

const Messages: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [initializing, setInitializing] = useState(false);
  const deepLinkName = params.get('name') || undefined;
  useEffect(() => {
    const VAPID = (import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY;
    if (user?.id && VAPID) {
      subscribeToPush(user.id, VAPID).catch(() => {});
    }
  }, [user]);

  // Initialize from deep link ?peer=
  useEffect(() => {
    const peer = params.get('peer');
    if (peer && user?.id) {
      setInitializing(true);
      resolvePeerUserId(peer).then(async (peerUserId) => {
        if (!peerUserId) return;
        const conv = await ensureDirectConversationWith(peerUserId);
        if (conv) setSelectedConv(conv);
        setRefresh((x)=>x+1);
        setInitializing(false);
      });
    }
  }, [params, user?.id]);

  const [conversations, setConversations] = useState<Array<{ conversation_id: string; peer_id: string; peer_name: string; last: any }>>([]);
  useEffect(() => { listMyConversations().then(setConversations); }, [refresh, selectedConv]);
  const [messages, setMessages] = useState<any[]>([]);
  const currentPeerName = useMemo(() => {
    const conv = conversations.find((c) => c.conversation_id === selectedConv);
    return conv?.peer_name || params.get('name') || 'User';
  }, [conversations, selectedConv, params]);
  useEffect(() => {
    if (!selectedConv) return;
    const unsub = subscribeConversation(selectedConv, {
      onMessage: (m) => {
        setMessages((prev) => [...prev, m]);
        // mark delivered immediately for receiver
        upsertReceipt(m.id, 'delivered').catch(()=>{});
      },
      onReceipt: (evt) => {
        if (evt.status === 'read' || evt.status === 'delivered') {
          setMessages((prev) => prev.map((x) => x.id === evt.message_id ? { ...x, status: evt.status } : x));
        }
      },
    });
    return () => unsub();
  }, [selectedConv]);
  useEffect(() => {
    if (!selectedConv) { setMessages([]); return; }
    fetchConversationMessages(selectedConv).then(setMessages);
  }, [selectedConv, refresh]);

  const handleSend = async () => {
    if (!user?.id || !selectedConv || !input.trim()) return;
    const m = await insertMessage(selectedConv, input.trim());
    if (m) setMessages((prev) => [...prev, m]);
    setInput('');
    setRefresh((x) => x + 1);
  };

  // TODO: call upsert_receipt via RPC and subscribe to realtime for live updates
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur rounded-2xl p-3 border border-white/20 dark:border-white/10">
        {conversations.length === 0 ? (
          <div className="text-sm text-gray-700/80 dark:text-gray-300/90">No conversations yet.</div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.conversation_id}
              onClick={() => setSelectedConv(c.conversation_id)}
              className={`w-full text-left p-3 rounded-xl border border-white/15 dark:border-white/10 transition ${selectedConv===c.conversation_id ? 'bg-white/90 dark:bg-slate-900/70' : 'bg-white/70 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-900/60'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  {c.peer_name}
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" title="Online"></span>
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{c.last?.created_at ? new Date(c.last.created_at).toLocaleTimeString() : ''}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700/80 dark:text-gray-300/90 truncate">{c.last?.body || 'New conversation'}</p>
            </button>
          ))
        )}
      </div>
      <div className="md:col-span-2 p-0 rounded-2xl border border-white/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur h-[30rem] flex flex-col shadow-lg">
        {(!selectedConv && !initializing && !params.get('peer')) ? (
          <div className="h-full flex items-center justify-center text-gray-700/80 dark:text-gray-300/90">Select a conversation to start messaging.</div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-white/20 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/70 rounded-t-2xl">
              <div className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <span>{currentPeerName || deepLinkName || 'User'}</span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span> Online
                </span>
              </div>
              <div className="text-xs text-gray-500">Secure</div>
            </div>
            {initializing && !selectedConv ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner inline={true} messages={[
                  'Starting a secure chat…',
                  'Setting up your conversation…',
                  'Bringing you together…',
                ]} />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-4 space-y-2 scroll-smooth">
                  {messages.map((m) => (
                    <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${m.sender_id===user?.id ? 'ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
                      <div>{m.body}</div>
                      <div className={`mt-1 text-[10px] ${m.sender_id===user?.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {m.status === 'read' ? 'Read' : m.status === 'delivered' ? 'Delivered' : 'Sent'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/20 dark:border-white/10 flex items-center gap-2 bg-white/80 dark:bg-slate-900/70 rounded-b-2xl">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key==='Enter') handleSend(); }}
                    className="flex-1 px-3 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none shadow-sm"
                    placeholder="Type a message"
                    disabled={!selectedConv}
                  />
                  <button onClick={handleSend} disabled={!selectedConv} className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow disabled:opacity-50 disabled:cursor-not-allowed">Send</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
