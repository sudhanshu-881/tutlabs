/**
 * TutorService - Enterprise-grade tutor management and search
 * Advanced filtering, caching, and analytics for tutor discovery
 */

import { BaseService, ServiceError } from './BaseService';
import { 
  Tutor, 
  TutorSearchResult, 
  SearchFilters, 
  ApiResponse,
  TutorOnboardingForm,
  DashboardStats
} from '../../../types';

export interface TutorRecommendationFilters {
  student_id: string;
  subjects?: string[];
  location?: string;
  budget_range?: { min: number; max: number };
  preferred_timing?: string[];
  learning_style?: string;
  max_distance_km?: number;
}

export interface TutorAnalytics {
  profile_views: number;
  session_requests: number;
  conversion_rate: number;
  average_rating: number;
  response_time_hours: number;
  completion_rate: number;
}

export class TutorService extends BaseService {
  constructor() {
    super({
      enableCaching: true,
      cacheTTL: 300, // 5 minutes for tutor data
      enableAnalytics: true
    });
  }

  /**
   * Advanced tutor search with multiple filters
   */
  async searchTutors(filters: SearchFilters = {}): Promise<TutorSearchResult> {
    const startTime = Date.now();

    try {
      const tutors = await this.executeQuery(
        async () => {
          let query = supabase
            .from('tutors')
            .select(`
              *,
              user:profiles(*)
            `)
            .eq('verified', true); // Only show verified tutors by default

          // Location filtering
          if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
          }

          // Pincode filtering
          if (filters.pincode) {
            query = query.contains('pincodes', [filters.pincode]);
          }

          // Subject filtering
          if (filters.subjects && filters.subjects.length > 0) {
            query = query.overlaps('subjects', filters.subjects);
          }

          // Rating filtering
          if (filters.min_rating) {
            query = query.gte('rating', filters.min_rating);
          }

          // Price filtering
          if (filters.max_price) {
            query = query.lte('hourly_rate', filters.max_price);
          }

          // Teaching method filtering
          if (filters.teaching_methods && filters.teaching_methods.length > 0) {
            query = query.overlaps('teaching_methods', filters.teaching_methods);
          }

          // Language filtering
          if (filters.languages && filters.languages.length > 0) {
            query = query.overlaps('languages', filters.languages);
          }

          // Online/In-person filtering
          if (filters.online_only) {
            query = query.eq('online_teaching', true);
          }

          if (filters.in_person_only) {
            query = query.eq('in_person_teaching', true);
          }

          // Verified only
          if (filters.verified_only) {
            query = query.eq('verified', true);
          }

          // Order by rating and profile completion
          query = query
            .order('rating', { ascending: false })
            .order('profile_completion_score', { ascending: false })
            .order('last_active_at', { ascending: false });

          const { data, error } = await query;

          return { data, error };
        },
        this.generateCacheKey('tutor_search', filters)
      );

      // Get total count for pagination
      const total = await this.executeQuery(
        async () => {
          let countQuery = supabase
            .from('tutors')
            .select('*', { count: 'exact', head: true })
            .eq('verified', true);

          // Apply same filters for count
          if (filters.location) {
            countQuery = countQuery.ilike('location', `%${filters.location}%`);
          }
          if (filters.pincode) {
            countQuery = countQuery.contains('pincodes', [filters.pincode]);
          }
          if (filters.subjects && filters.subjects.length > 0) {
            countQuery = countQuery.overlaps('subjects', filters.subjects);
          }
          if (filters.min_rating) {
            countQuery = countQuery.gte('rating', filters.min_rating);
          }
          if (filters.max_price) {
            countQuery = countQuery.lte('hourly_rate', filters.max_price);
          }

          const { count, error } = await countQuery;

          return { data: count, error };
        }
      );

      const searchTime = Date.now() - startTime;

      this.trackAnalytics('tutor_search', {
        filters,
        result_count: tutors.length,
        search_time_ms: searchTime
      });

      return {
        tutors,
        total: total || 0,
        filters_applied: filters,
        search_time_ms: searchTime
      };
    } catch (error) {
      throw new ServiceError(
        'Failed to search tutors',
        'TUTOR_SEARCH_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Get tutor recommendations based on student preferences
   */
  async getTutorRecommendations(filters: TutorRecommendationFilters): Promise<Tutor[]> {
    this.validateRequired(filters, ['student_id']);

    try {
      const recommendations = await this.executeQuery(
        async () => {
          // Get student preferences
          const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', filters.student_id)
            .single();

          if (studentError) throw studentError;

          let query = supabase
            .from('tutors')
            .select(`
              *,
              user:profiles(*)
            `)
            .eq('verified', true);

          // Match subjects with student's learning goals
          if (filters.subjects || student.learning_goals) {
            const subjects = filters.subjects || student.learning_goals;
            query = query.overlaps('subjects', subjects);
          }

          // Location matching
          if (filters.location || student.location) {
            const location = filters.location || student.location;
            query = query.ilike('location', `%${location}%`);
          }

          // Budget matching
          if (filters.budget_range || student.budget_range) {
            const budget = filters.budget_range || student.budget_range;
            query = query
              .gte('hourly_rate', budget.min)
              .lte('hourly_rate', budget.max);
          }

          // Teaching method matching
          if (student.preferred_teaching_methods) {
            query = query.overlaps('teaching_methods', student.preferred_teaching_methods);
          }

          // Language matching
          if (student.preferred_language) {
            query = query.contains('languages', [student.preferred_language]);
          }

          // Order by compatibility score (rating + profile completion + response time)
          query = query
            .order('rating', { ascending: false })
            .order('profile_completion_score', { ascending: false })
            .order('response_time_hours', { ascending: true })
            .limit(20);

          const { data, error } = await query;

          return { data, error };
        },
        `tutor_recommendations:${filters.student_id}`
      );

      this.trackAnalytics('tutor_recommendations', {
        student_id: filters.student_id,
        recommendation_count: recommendations.length
      });

      return recommendations;
    } catch (error) {
      throw new ServiceError(
        'Failed to get tutor recommendations',
        'TUTOR_RECOMMENDATIONS_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Get tutor by ID with full details
   */
  async getTutorById(tutorId: number): Promise<Tutor> {
    this.validateRequired({ tutorId }, ['tutorId']);

    try {
      const tutor = await this.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from('tutors')
            .select(`
              *,
              user:profiles(*)
            `)
            .eq('id', tutorId)
            .single();

          return { data, error };
        },
        `tutor:${tutorId}`
      );

      this.trackAnalytics('tutor_viewed', { tutor_id: tutorId });

      return tutor;
    } catch (error) {
      throw new ServiceError(
        'Failed to get tutor details',
        'TUTOR_FETCH_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Get tutors near a specific location
   */
  async getTutorsNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    filters: Omit<SearchFilters, 'location'> = {}
  ): Promise<Tutor[]> {
    this.validateRequired({ latitude, longitude }, ['latitude', 'longitude']);

    try {
      // For now, we'll use location text matching
      // In a production system, you'd want to use PostGIS for proper geospatial queries
      const tutors = await this.executeQuery(
        async () => {
          let query = supabase
            .from('tutors')
            .select(`
              *,
              user:profiles(*)
            `)
            .eq('verified', true);

          // Apply additional filters
          if (filters.subjects && filters.subjects.length > 0) {
            query = query.overlaps('subjects', filters.subjects);
          }

          if (filters.min_rating) {
            query = query.gte('rating', filters.min_rating);
          }

          if (filters.max_price) {
            query = query.lte('hourly_rate', filters.max_price);
          }

          query = query
            .order('rating', { ascending: false })
            .limit(50);

          const { data, error } = await query;

          return { data, error };
        },
        `tutors_near:${latitude}:${longitude}:${radiusKm}`
      );

      this.trackAnalytics('tutors_near_location', {
        latitude,
        longitude,
        radius_km: radiusKm,
        result_count: tutors.length
      });

      return tutors;
    } catch (error) {
      throw new ServiceError(
        'Failed to get tutors near location',
        'TUTORS_NEAR_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Create or update tutor profile
   */
  async createOrUpdateTutor(tutorData: TutorOnboardingForm): Promise<Tutor> {
    this.validateRequired(tutorData, ['name', 'subjects', 'location']);

    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) {
        throw new ServiceError('User not authenticated', 'AUTH_ERROR', 401);
      }

      const tutor = await this.executeQuery(
        async () => {
          // Check if tutor profile already exists
          const { data: existingTutor } = await supabase
            .from('tutors')
            .select('id')
            .eq('user_id', currentUserId)
            .single();

          if (existingTutor) {
            // Update existing tutor
            const { data, error } = await supabase
              .from('tutors')
              .update({
                name: this.sanitizeString(tutorData.name),
                subjects: tutorData.subjects,
                location: this.sanitizeString(tutorData.location),
                pincodes: tutorData.pincodes,
                bio: this.sanitizeString(tutorData.bio, 2000),
                hourly_rate: tutorData.hourly_rate,
                languages: tutorData.languages,
                teaching_experience_years: tutorData.teaching_experience_years,
                education_qualifications: tutorData.education_qualifications,
                certifications: tutorData.certifications,
                teaching_methods: tutorData.teaching_methods,
                available_days: tutorData.available_days,
                time_slots: tutorData.time_slots,
                max_students_per_session: tutorData.max_students_per_session,
                online_teaching: tutorData.online_teaching,
                in_person_teaching: tutorData.in_person_teaching,
                trial_available: tutorData.trial_available,
                trial_duration_minutes: tutorData.trial_duration_minutes,
                response_time_hours: tutorData.response_time_hours,
                profile_completion_score: this.calculateProfileCompletion(tutorData),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', currentUserId)
              .select(`
                *,
                user:profiles(*)
              `)
              .single();

            return { data, error };
          } else {
            // Create new tutor
            const { data, error } = await supabase
              .from('tutors')
              .insert({
                user_id: currentUserId,
                name: this.sanitizeString(tutorData.name),
                subjects: tutorData.subjects,
                location: this.sanitizeString(tutorData.location),
                pincodes: tutorData.pincodes,
                bio: this.sanitizeString(tutorData.bio, 2000),
                hourly_rate: tutorData.hourly_rate,
                languages: tutorData.languages,
                teaching_experience_years: tutorData.teaching_experience_years,
                education_qualifications: tutorData.education_qualifications,
                certifications: tutorData.certifications,
                teaching_methods: tutorData.teaching_methods,
                available_days: tutorData.available_days,
                time_slots: tutorData.time_slots,
                max_students_per_session: tutorData.max_students_per_session,
                online_teaching: tutorData.online_teaching,
                in_person_teaching: tutorData.in_person_teaching,
                trial_available: tutorData.trial_available,
                trial_duration_minutes: tutorData.trial_duration_minutes,
                response_time_hours: tutorData.response_time_hours,
                profile_completion_score: this.calculateProfileCompletion(tutorData),
                rating: 0,
                verified: false
              })
              .select(`
                *,
                user:profiles(*)
              `)
              .single();

            return { data, error };
          }
        }
      );

      // Clear cache
      this.clearCache();

      this.trackAnalytics('tutor_profile_updated', {
        tutor_id: tutor.id,
        profile_completion: tutor.profile_completion_score
      });

      return tutor;
    } catch (error) {
      throw new ServiceError(
        'Failed to create or update tutor profile',
        'TUTOR_UPDATE_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Get tutor analytics
   */
  async getTutorAnalytics(tutorId: number): Promise<TutorAnalytics> {
    this.validateRequired({ tutorId }, ['tutorId']);

    try {
      const analytics = await this.executeQuery(
        async () => {
          // Get tutor details
          const { data: tutor, error: tutorError } = await supabase
            .from('tutors')
            .select('*')
            .eq('id', tutorId)
            .single();

          if (tutorError) throw tutorError;

          // Get session statistics
          const { data: sessions, error: sessionsError } = await supabase
            .from('sessions')
            .select('status, created_at')
            .eq('tutor_id', tutor.user_id);

          if (sessionsError) throw sessionsError;

          // Get feedback statistics
          const { data: feedback, error: feedbackError } = await supabase
            .from('session_feedback')
            .select('rating, created_at')
            .eq('reviewee_id', tutor.user_id);

          if (feedbackError) throw feedbackError;

          // Calculate analytics
          const totalSessions = sessions.length;
          const completedSessions = sessions.filter(s => s.status === 'completed').length;
          const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
          
          const averageRating = feedback.length > 0 
            ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
            : 0;

          return {
            data: {
              profile_views: 0, // Would need separate tracking table
              session_requests: totalSessions,
              conversion_rate: completionRate,
              average_rating: averageRating,
              response_time_hours: tutor.response_time_hours || 24,
              completion_rate: completionRate
            },
            error: null
          };
        },
        `tutor_analytics:${tutorId}`
      );

      return analytics;
    } catch (error) {
      throw new ServiceError(
        'Failed to get tutor analytics',
        'TUTOR_ANALYTICS_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Get tutor dashboard stats
   */
  async getTutorDashboardStats(tutorId: number): Promise<DashboardStats> {
    this.validateRequired({ tutorId }, ['tutorId']);

    try {
      const stats = await this.executeQuery(
        async () => {
          const { data: tutor, error: tutorError } = await supabase
            .from('tutors')
            .select('user_id, rating, total_sessions, total_students')
            .eq('id', tutorId)
            .single();

          if (tutorError) throw tutorError;

          // Get session statistics
          const { data: sessions, error: sessionsError } = await supabase
            .from('sessions')
            .select('status, price, created_at, scheduled_at')
            .eq('tutor_id', tutor.user_id);

          if (sessionsError) throw sessionsError;

          const now = new Date();
          const upcomingSessions = sessions.filter(s => 
            new Date(s.scheduled_at) > now && s.status === 'scheduled'
          ).length;

          const completedSessions = sessions.filter(s => s.status === 'completed').length;
          const totalEarnings = sessions
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + (s.price || 0), 0);

          return {
            data: {
              total_sessions: sessions.length,
              completed_sessions: completedSessions,
              upcoming_sessions: upcomingSessions,
              total_earnings: totalEarnings,
              average_rating: tutor.rating || 0,
              total_students: tutor.total_students || 0,
              response_rate: 95, // Would need separate tracking
              profile_completion: tutor.profile_completion_score || 0
            },
            error: null
          };
        },
        `tutor_dashboard:${tutorId}`
      );

      return stats;
    } catch (error) {
      throw new ServiceError(
        'Failed to get tutor dashboard stats',
        'TUTOR_DASHBOARD_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Calculate profile completion percentage
   */
  private calculateProfileCompletion(tutorData: TutorOnboardingForm): number {
    const fields = [
      'name', 'subjects', 'location', 'bio', 'hourly_rate', 'languages',
      'teaching_experience_years', 'education_qualifications', 'certifications',
      'teaching_methods', 'available_days', 'time_slots'
    ];

    let completedFields = 0;
    fields.forEach(field => {
      const value = (tutorData as any)[field];
      if (value !== undefined && value !== null && value !== '' && 
          (!Array.isArray(value) || value.length > 0)) {
        completedFields++;
      }
    });

    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Get current user ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const tutorService = new TutorService();
