-- TutLabs Enterprise Database Schema
-- Sprint 1: Advanced Database Architecture

-- =============================================
-- ENHANCED PROFILES TABLE
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  preferred_language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  notification_preferences jsonb DEFAULT '{"email": true, "push": true, "sms": false}',
  privacy_settings jsonb DEFAULT '{"profile_visibility": "public", "location_sharing": true}',
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  last_active_at timestamp with time zone DEFAULT now(),
  onboarding_completed boolean DEFAULT false,
  verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- =============================================
-- CONVERSATIONS & MESSAGING SYSTEM
-- =============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'support')),
  title text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamp with time zone DEFAULT now(),
  last_read_at timestamp with time zone,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  metadata jsonb DEFAULT '{}',
  reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.message_receipts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('sent', 'delivered', 'read')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- =============================================
-- ENHANCED TUTORS TABLE
-- =============================================
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS
  hourly_rate numeric(10,2),
  currency text DEFAULT 'INR',
  languages text[] DEFAULT '{"English"}',
  teaching_experience_years integer DEFAULT 0,
  education_qualifications jsonb DEFAULT '[]',
  certifications jsonb DEFAULT '[]',
  teaching_methods text[] DEFAULT '{}',
  available_days text[] DEFAULT '{}',
  time_slots jsonb DEFAULT '{}',
  max_students_per_session integer DEFAULT 1,
  online_teaching boolean DEFAULT true,
  in_person_teaching boolean DEFAULT true,
  trial_available boolean DEFAULT false,
  trial_duration_minutes integer DEFAULT 30,
  response_time_hours integer DEFAULT 24,
  completion_rate numeric(5,2) DEFAULT 0.00,
  total_sessions integer DEFAULT 0,
  total_students integer DEFAULT 0,
  last_active_at timestamp with time zone DEFAULT now(),
  profile_completion_score integer DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100);

-- =============================================
-- ENHANCED STUDENTS TABLE
-- =============================================
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS
  preferred_language text DEFAULT 'English',
  learning_style text CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  budget_range jsonb DEFAULT '{"min": 0, "max": 1000, "currency": "INR"}',
  preferred_timing text[] DEFAULT '{}',
  learning_goals_detailed jsonb DEFAULT '[]',
  current_level text,
  target_level text,
  study_commitment_hours_per_week integer DEFAULT 5,
  preferred_teaching_methods text[] DEFAULT '{}',
  special_requirements text,
  parent_contact_email text,
  parent_contact_phone text,
  emergency_contact jsonb DEFAULT '{}';

-- =============================================
-- BOOKING & SESSION MANAGEMENT
-- =============================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  session_type text DEFAULT 'online' CHECK (session_type IN ('online', 'in_person', 'hybrid')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 60,
  meeting_link text,
  location text,
  notes text,
  price numeric(10,2),
  currency text DEFAULT 'INR',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  categories jsonb DEFAULT '{}', -- {"punctuality": 5, "communication": 4, "knowledge": 5}
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- PAYMENT & SUBSCRIPTION SYSTEM
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  payment_method text NOT NULL,
  payment_provider text NOT NULL, -- 'stripe', 'razorpay', 'paypal'
  provider_transaction_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'premium', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  auto_renew boolean DEFAULT true,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- NOTIFICATION SYSTEM
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('message', 'booking', 'payment', 'system', 'marketing')),
  title text NOT NULL,
  content text NOT NULL,
  data jsonb DEFAULT '{}',
  read_at timestamp with time zone,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- ANALYTICS & TRACKING
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_active_role ON public.profiles(active_role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_tier);

-- Tutors indexes
CREATE INDEX IF NOT EXISTS idx_tutors_location ON public.tutors USING GIN(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_tutors_subjects ON public.tutors USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_tutors_pincodes ON public.tutors USING GIN(pincodes);
CREATE INDEX IF NOT EXISTS idx_tutors_rating ON public.tutors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tutors_verified ON public.tutors(verified);
CREATE INDEX IF NOT EXISTS idx_tutors_online ON public.tutors(online_teaching);
CREATE INDEX IF NOT EXISTS idx_tutors_rate ON public.tutors(hourly_rate);

-- Students indexes
CREATE INDEX IF NOT EXISTS idx_students_learning_goals ON public.students USING GIN(learning_goals);
CREATE INDEX IF NOT EXISTS idx_students_level ON public.students(level);
CREATE INDEX IF NOT EXISTS idx_students_location ON public.students USING GIN(to_tsvector('english', location));

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON public.sessions(tutor_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.sessions(student_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON public.sessions(scheduled_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_event ON public.user_analytics(user_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.user_analytics(event_type, created_at);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Conversation policies
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations" ON public.conversation_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (tutor_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Users can create sessions" ON public.sessions
  FOR INSERT WITH CHECK (tutor_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Users can update their own sessions" ON public.sessions
  FOR UPDATE USING (tutor_id = auth.uid() OR student_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure direct conversation
CREATE OR REPLACE FUNCTION ensure_direct_conversation(a uuid, b uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conv_id uuid;
BEGIN
  -- Check if conversation already exists
  SELECT c.id INTO conv_id
  FROM public.conversations c
  JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE c.type = 'direct'
    AND cp1.user_id = a AND cp2.user_id = b
    AND cp1.user_id != cp2.user_id;
  
  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO public.conversations (type, created_by)
  VALUES ('direct', a)
  RETURNING id INTO conv_id;
  
  -- Add participants
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (conv_id, a), (conv_id, b);
  
  RETURN conv_id;
END;
$$;

-- Function to insert message with receipts
CREATE OR REPLACE FUNCTION insert_message_with_receipts(
  p_conversation_id uuid,
  p_sender_id uuid,
  p_content text,
  p_message_type text DEFAULT 'text'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id uuid;
  participant_record RECORD;
BEGIN
  -- Insert message
  INSERT INTO public.messages (conversation_id, sender_id, content, message_type)
  VALUES (p_conversation_id, p_sender_id, p_content, p_message_type)
  RETURNING id INTO message_id;
  
  -- Create receipts for all participants except sender
  FOR participant_record IN
    SELECT user_id FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id != p_sender_id
  LOOP
    INSERT INTO public.message_receipts (message_id, user_id, status)
    VALUES (message_id, participant_record.user_id, 'sent');
  END LOOP;
  
  RETURN message_id;
END;
$$;

-- Function to upsert receipt
CREATE OR REPLACE FUNCTION upsert_receipt(p_message_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.message_receipts (message_id, user_id, status)
  VALUES (p_message_id, auth.uid(), p_status)
  ON CONFLICT (message_id, user_id)
  DO UPDATE SET status = p_status, created_at = now();
END;
$$;

-- Function to calculate tutor rating
CREATE OR REPLACE FUNCTION calculate_tutor_rating(p_tutor_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating numeric;
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM public.session_feedback
  WHERE reviewee_id = p_tutor_id;
  
  RETURN COALESCE(avg_rating, 0);
END;
$$;

-- Trigger to update tutor rating
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tutors
  SET rating = calculate_tutor_rating(NEW.reviewee_id)
  WHERE user_id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tutor_rating_trigger
  AFTER INSERT OR UPDATE ON public.session_feedback
  FOR EACH ROW EXECUTE FUNCTION update_tutor_rating();

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample notifications
INSERT INTO public.notifications (user_id, type, title, content) 
SELECT 
  id,
  'system',
  'Welcome to TutLabs!',
  'Complete your profile to get started with finding the perfect tutor or student.'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.notifications WHERE type = 'system' AND title = 'Welcome to TutLabs!')
LIMIT 10;

COMMENT ON TABLE public.profiles IS 'Enhanced user profiles with subscription and preference management';
COMMENT ON TABLE public.conversations IS 'Real-time messaging conversations';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations';
COMMENT ON TABLE public.sessions IS 'Tutoring session bookings and management';
COMMENT ON TABLE public.payments IS 'Payment transactions and history';
COMMENT ON TABLE public.subscriptions IS 'User subscription plans and billing';
COMMENT ON TABLE public.notifications IS 'In-app notification system';
COMMENT ON TABLE public.user_analytics IS 'User behavior tracking and analytics';
