import { supabase } from '../../context/AuthContext';

export type TuitionRequest = {
  id: number;
  subject: string;
  pincode: string;
  class: string | null;
  timing: string | null;
  location: string | null;
  details: string | null;
  created_at: string;
};

export async function listTuitionRequests(filter: { pincodes?: string[]; subjects?: string[] } = {}): Promise<TuitionRequest[]> {
  if (!supabase) throw new Error('Database unavailable');

  let query = supabase.from('tuition_requests').select('*');
  // Apply subject filter client-side for now; server-side can be added with RPC
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    const msg = (error.message || '').toLowerCase();
    const code = (error as any).code;
    // Gracefully handle missing table during rollout
    if (code === '42P01' || msg.includes('tuition_requests') || msg.includes('schema cache') || msg.includes('does not exist')) {
      console.warn('[requestsService] tuition_requests table not found yet; returning empty list');
      return [];
    }
    throw new Error(error.message);
  }
  let rows = (data || []) as TuitionRequest[];

  if (filter.pincodes && filter.pincodes.length > 0) {
    const set = new Set(filter.pincodes.map((p) => p.trim()));
    rows = rows.filter((r) => set.has(r.pincode));
  }
  if (filter.subjects && filter.subjects.length > 0) {
    const needles = filter.subjects.map((s) => s.toLowerCase());
    rows = rows.filter((r) => needles.some((n) => r.subject.toLowerCase().includes(n)));
  }
  return rows;
}
