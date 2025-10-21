import { supabase } from '../../context/AuthContext';
import type { Tutor } from '../../types';

export type ListTutorsParams = {
  subject?: string;
  location?: string;
  pincode?: string;
};

export async function listTutors(params: ListTutorsParams = {}): Promise<Tutor[]> {
  if (!supabase) {
    throw new Error('Database connection is not available. Configure Supabase credentials.');
  }

  try {
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
    
    if (error) {
      console.error('Error fetching tutors:', error);
      throw new Error(`Failed to fetch tutors: ${error.message}`);
    }

    let result: Tutor[] = data || [];
    
    if (subject) {
      const needle = subject.toLowerCase();
      result = result.filter((t) => 
        (t.subjects || []).some((s) => s.toLowerCase().includes(needle))
      );
    }

    return result;
  } catch (error) {
    console.error('Error in listTutors:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching tutors');
  }
}
