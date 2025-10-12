import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { subscribeToPush } from '../../lib/services/push';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
};

const mockConversations: Conversation[] = [
  { id: '1', name: 'Alice Johnson', lastMessage: 'Can we reschedule to 7pm?', time: '2h' },
  { id: '2', name: 'Frank Garcia', lastMessage: 'I need help with calculus.', time: '1d' },
  { id: '3', name: 'Grace Rodriguez', lastMessage: 'Thanks! See you tomorrow.', time: '3d' }
];

const Messages: React.FC = () => {
  const { user } = useContext(AuthContext);
  useEffect(() => {
    const VAPID = (import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY;
    if (user?.id && VAPID) {
      subscribeToPush(user.id, VAPID).catch(() => {});
    }
  }, [user]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-3">
        {mockConversations.map((c) => (
          <button key={c.id} className="w-full text-left p-4 rounded-2xl border border-white/15 dark:border-white/10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl hover:bg-white/40 dark:hover:bg-slate-900/40 transition">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{c.time}</span>
            </div>
            <p className="mt-1 text-sm text-gray-700/80 dark:text-gray-300/90 truncate">{c.lastMessage}</p>
          </button>
        ))}
      </div>
      <div className="md:col-span-2 p-6 rounded-2xl border border-white/15 dark:border-white/10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl h-96">
        <div className="h-full flex items-center justify-center text-gray-700/80 dark:text-gray-300/90">
          Select a conversation to start messaging.
        </div>
      </div>
    </div>
  );
};

export default Messages;
