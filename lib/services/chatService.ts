import { supabase } from '../../context/AuthContext';

export type SupaMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
};

export async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// Resolve peer profile user_id from a link param:
//  - t:123 -> tutors.id = 123 -> user_id
//  - s:456 -> students.id = 456 -> user_id
//  - otherwise assume it's already a profile id
export async function resolvePeerUserId(peer: string): Promise<string | null> {
  if (!supabase || !peer) return null;
  try {
    if (peer.startsWith('t:')) {
      const id = Number(peer.slice(2));
      const { data } = await supabase.from('tutors').select('user_id').eq('id', id).single();
      return (data as any)?.user_id ?? null;
    }
    if (peer.startsWith('s:')) {
      const id = Number(peer.slice(2));
      const { data } = await supabase.from('students').select('user_id').eq('id', id).single();
      return (data as any)?.user_id ?? null;
    }
    // Backward-compat: plain numeric id defaults to tutor id, then student id
    if (/^\d+$/.test(peer)) {
      const num = Number(peer);
      const { data: t } = await supabase.from('tutors').select('user_id').eq('id', num).maybeSingle();
      if ((t as any)?.user_id) return (t as any).user_id as string;
      const { data: s } = await supabase.from('students').select('user_id').eq('id', num).maybeSingle();
      if ((s as any)?.user_id) return (s as any).user_id as string;
      return null;
    }
    // fallback: assume profile id
    return peer;
  } catch {
    return null;
  }
}

export async function ensureDirectConversationWith(peerUserId: string): Promise<string | null> {
  if (!supabase) return null;
  const me = await getCurrentUserId();
  if (!me || !peerUserId) return null;
  // Prefer RPC if available
  const { data, error } = await supabase.rpc('ensure_direct_conversation', { a: me, b: peerUserId });
  if (!error && data) return data as unknown as string;
  // Fallback: try to find an existing conversation id by participants
  try {
    const existing = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', me);
    const myConvIds = new Set((existing.data || []).map((r: any) => r.conversation_id));
    const other = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', peerUserId);
    const conv = (other.data || []).find((r: any) => myConvIds.has(r.conversation_id));
    if (conv) return conv.conversation_id as string;
  } catch {}
  // As last resort: create conversation and add me; note: adding peer row requires RPC & security definer
  const ins = await supabase.from('conversations').insert({}).select('id').single();
  const convId = (ins.data as any)?.id as string | undefined;
  if (!convId) return null;
  await supabase.from('conversation_participants').insert({ conversation_id: convId, user_id: me });
  // Peer participant row likely blocked by RLS; advise backend RPC
  return convId;
}

export async function listMyConversations(): Promise<Array<{ conversation_id: string; peer_id: string; peer_name: string; last: SupaMessage | null }>> {
  if (!supabase) return [];
  const me = await getCurrentUserId();
  if (!me) return [];
  const { data: parts } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', me);
  const convIds = (parts || []).map((p: any) => p.conversation_id);
  if (convIds.length === 0) return [];

  // Fetch peers for each conversation
  const peersResp = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', convIds);
  const byConv = new Map<string, string>();
  for (const row of (peersResp.data || []) as any[]) {
    if (row.user_id !== me) byConv.set(row.conversation_id, row.user_id);
  }

  // Fetch last message per conversation
  const msgsResp = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: false });
  const lastByConv = new Map<string, SupaMessage>();
  for (const m of (msgsResp.data || []) as any[]) {
    if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m as SupaMessage);
  }

  // Fetch peer names
  const peerIds = Array.from(new Set(Array.from(byConv.values())));
  let nameByUser = new Map<string, string>();
  if (peerIds.length) {
    const prof = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', peerIds);
    for (const p of (prof.data || []) as any[]) nameByUser.set(p.id, p.full_name || 'user');
  }

  return convIds.map((cid) => ({
    conversation_id: cid,
    peer_id: byConv.get(cid) || '',
    peer_name: nameByUser.get(byConv.get(cid) || '') || 'user',
    last: lastByConv.get(cid) || null,
  }));
}

export async function fetchConversationMessages(conversationId: string): Promise<SupaMessage[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at');
  return (data || []) as SupaMessage[];
}

export async function insertMessage(conversationId: string, body: string): Promise<SupaMessage | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, body })
    .select('*')
    .single();
  if (error) return null;
  return data as SupaMessage;
}

export async function upsertReceipt(messageId: string, status: 'delivered' | 'read') {
  if (!supabase) return;
  await supabase.rpc('upsert_receipt', { p_message_id: messageId, p_status: status });
}

export function subscribeConversation(
  conversationId: string,
  handlers: {
    onMessage?: (m: SupaMessage) => void;
    onReceipt?: (evt: { message_id: string; status: 'delivered' | 'read' }) => void;
  }
) {
  if (!supabase) return () => {};
  const channel = supabase.channel(`conv-${conversationId}`);
  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
    (payload: any) => {
      const row = payload.new as SupaMessage;
      handlers.onMessage?.(row);
    }
  );
  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'message_receipts' },
    (payload: any) => {
      const row = payload.new as any;
      handlers.onReceipt?.({ message_id: row.message_id, status: row.status });
    }
  );
  channel.subscribe();
  return () => {
    try { supabase.removeChannel(channel); } catch {}
  };
}
