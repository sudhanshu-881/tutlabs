import { supabase } from '../../context/AuthContext';
import type { Student } from '../../types';

export type ListStudentsParams = {
  subject?: string;
  location?: string;
};

export async function listStudents(params: ListStudentsParams = {}): Promise<Student[]> {
  if (!supabase) {
    throw new Error('Database connection is not available. Configure Supabase credentials.');
  }

  try {
    const { subject = '', location = '' } = params;

    let query = supabase
      .from('students')
      .select('*');

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching students:', error);
      throw new Error(`Failed to fetch students: ${error.message}`);
    }

    let result: Student[] = data || [];
    
    if (subject) {
      const needle = subject.toLowerCase();
      result = result.filter((s) => 
        (s.learning_goals || []).some((g) => g.toLowerCase().includes(needle))
      );
    }

    return result;
  } catch (error) {
    console.error('Error in listStudents:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching students');
  }
}
