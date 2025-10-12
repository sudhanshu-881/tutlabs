import { supabase } from '../../context/AuthContext';
import type { Tutor } from '../../types';

export type ListTutorsParams = {
  subject?: string;
  location?: string;
  pincode?: string;
};

export async function listTutors(params: ListTutorsParams = {}): Promise<Tutor[]> {
  if (!supabase) throw new Error('Database connection is not available. Configure Supabase credentials.');

  const { subject = '', location = '', pincode = '' } = params;

  let query = supabase
    .from('tutors')
    .select('*');

  if (location) {
    query = query.ilike('location', `%${location}%`);
  }
  if (pincode) {
    // Filter server-side by pincode array containment when provided
    query = query.contains('pincodes', [pincode]);
  }

  const { data, error } = await query.order('rating', { ascending: false });
  if (error) throw new Error(error.message);

  let result: Tutor[] = data || [];
  if (subject) {
    const needle = subject.toLowerCase();
    result = result.filter((t) => (t.subjects || []).some((s) => s.toLowerCase().includes(needle)));
  }

  return result;
}
