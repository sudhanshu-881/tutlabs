import { supabase } from '../../context/AuthContext';
import type { Tutor } from '../../types';

export type ListTutorsParams = {
  subject?: string;
  location?: string;
};

export async function listTutors(params: ListTutorsParams = {}): Promise<Tutor[]> {
  if (!supabase) throw new Error('Database connection is not available. Configure Supabase credentials.');

  const { subject = '', location = '' } = params;

  let query = supabase
    .from('tutors')
    .select('*');

  if (location) {
    query = query.ilike('location', `%${location}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let result: Tutor[] = data || [];
  if (subject) {
    const needle = subject.toLowerCase();
    result = result.filter((t) => (t.subjects || []).some((s) => s.toLowerCase().includes(needle)));
  }

  return result;
}
