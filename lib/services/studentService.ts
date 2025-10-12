import { supabase } from '../../context/AuthContext';
import type { Student } from '../../types';

export type ListStudentsParams = {
  subject?: string;
  location?: string;
};

export async function listStudents(params: ListStudentsParams = {}): Promise<Student[]> {
  if (!supabase) throw new Error('Database connection is not available. Configure Supabase credentials.');

  const { subject = '', location = '' } = params;

  let query = supabase
    .from('students')
    .select('*');

  if (location) {
    query = query.ilike('location', `%${location}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let result: Student[] = data || [];
  if (subject) {
    const needle = subject.toLowerCase();
    result = result.filter((s) => (s.learning_goals || []).some((g) => g.toLowerCase().includes(needle)));
  }

  return result;
}
