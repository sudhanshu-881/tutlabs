/**
 * MessagingService - Enterprise-grade real-time messaging system
 * Replaces localStorage-based messaging with Supabase real-time infrastructure
 */

import { BaseService, ServiceError } from './BaseService';
import { 
  Conversation, 
  Message, 
  MessageReceipt, 
  ConversationParticipant,
  MessageType,
  MessageStatus,
  ConversationType,
  ApiResponse,
  PaginationInfo
} from '../../../types';

export interface MessageFilters {
  conversation_id?: string;
  sender_id?: string;
  message_type?: MessageType;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface ConversationFilters {
  type?: ConversationType;
  participant_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class MessagingService extends BaseService {
  constructor() {
    super({
      enableCaching: true,
      cacheTTL: 60, // 1 minute for messages
      enableAnalytics: true
    });
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    type: ConversationType = 'direct',
    title?: string,
    participantIds: string[] = []
  ): Promise<Conversation> {
    this.validateRequired({ type }, ['type']);

    try {
      const conversation = await this.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from('conversations')
            .insert({
              type,
              title: title || null,
              created_by: (await this.getCurrentUserId()) || null
            })
            .select()
            .single();

          return { data, error };
        },
        `conversation:${type}:${participantIds.sort().join(',')}`
      );

      // Add participants
      if (participantIds.length > 0) {
        await this.addParticipantsToConversation(conversation.id, participantIds);
      }

      this.trackAnalytics('conversation_created', {
        conversation_id: conversation.id,
        type,
        participant_count: participantIds.length
      });

      return conversation;
    } catch (error) {
      throw new ServiceError(
        'Failed to create conversation',
        'CONVERSATION_CREATE_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Get or create a direct conversation between two users
   */
  async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<Conversation> {
    this.validateRequired({ userId1, userId2 }, ['userId1', 'userId2']);

    try {
      // Try to find existing conversation
      const existing = await this.executeQuery(
        async () => {
          const { data, error } = await supabase
            .rpc('ensure_direct_conversation', { a: userId1, b: userId2 })
            .single();

          if (error) throw error;

          // Get full conversation details
          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select(`
              *,
              participants:conversation_participants(
                *,
                user:profiles(*)
              )
            `)
            .eq('id', data)
            .single();

          return { data: conversation, error: convError };
        }
      );

      this.trackAnalytics('direct_conversation_accessed', {
        conversation_id: existing.id,
        user1: userId1,
        user2: userId2
      });

      return existing;
    } catch (error) {
      throw new ServiceError(
        'Failed to get or create direct conversation',
        'DIRECT_CONVERSATION_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Get conversations for current user
   */
  async getConversations(filters: ConversationFilters = {}): Promise<ApiResponse<Conversation[]>> {
    const { limit = 20, offset = 0 } = filters;

    try {
      const conversations = await this.executeQuery(
        async () => {
          let query = supabase
            .from('conversations')
            .select(`
              *,
              participants:conversation_participants(
                *,
                user:profiles(*)
              ),
              last_message:messages(
                *,
                sender:profiles(*)
              )
            `)
            .in('id', 
              supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', await this.getCurrentUserId())
            )
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (filters.type) {
            query = query.eq('type', filters.type);
          }

          if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%`);
          }

          const { data, error } = await query;

          return { data, error };
        },
        `conversations:${JSON.stringify(filters)}`
      );

      // Get total count
      const total = await this.executeQuery(
        async () => {
          const { count, error } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .in('id', 
              supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', await this.getCurrentUserId())
            );

          return { data: count, error };
        }
      );

      return this.createPaginatedResponse(conversations, Math.floor(offset / limit) + 1, limit, total);
    } catch (error) {
      throw new ServiceError(
        'Failed to get conversations',
        'CONVERSATIONS_FETCH_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string, 
    filters: MessageFilters = {}
  ): Promise<ApiResponse<Message[]>> {
    this.validateRequired({ conversationId }, ['conversationId']);

    const { limit = 50, offset = 0 } = filters;

    try {
      const messages = await this.executeQuery(
        async () => {
          let query = supabase
            .from('messages')
            .select(`
              *,
              sender:profiles(*),
              receipts:message_receipts(*),
              reply_to:messages(
                *,
                sender:profiles(*)
              )
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (filters.sender_id) {
            query = query.eq('sender_id', filters.sender_id);
          }

          if (filters.message_type) {
            query = query.eq('message_type', filters.message_type);
          }

          if (filters.date_from) {
            query = query.gte('created_at', filters.date_from);
          }

          if (filters.date_to) {
            query = query.lte('created_at', filters.date_to);
          }

          const { data, error } = await query;

          return { data, error };
        },
        `messages:${conversationId}:${JSON.stringify(filters)}`
      );

      // Get total count
      const total = await this.executeQuery(
        async () => {
          const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId);

          return { data: count, error };
        }
      );

      return this.createPaginatedResponse(messages, Math.floor(offset / limit) + 1, limit, total);
    } catch (error) {
      throw new ServiceError(
        'Failed to get messages',
        'MESSAGES_FETCH_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    messageType: MessageType = 'text',
    replyToId?: string
  ): Promise<Message> {
    this.validateRequired({ conversationId, content }, ['conversationId', 'content']);

    const sanitizedContent = this.sanitizeString(content, 4000);

    try {
      const message = await this.executeQuery(
        async () => {
          const { data, error } = await supabase
            .rpc('insert_message_with_receipts', {
              p_conversation_id: conversationId,
              p_sender_id: await this.getCurrentUserId(),
              p_content: sanitizedContent,
              p_message_type: messageType
            })
            .single();

          if (error) throw error;

          // Get full message details
          const { data: fullMessage, error: msgError } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles(*),
              receipts:message_receipts(*),
              reply_to:messages(
                *,
                sender:profiles(*)
              )
            `)
            .eq('id', data)
            .single();

          return { data: fullMessage, error: msgError };
        }
      );

      // Clear conversation cache
      this.clearCache(`conversations:*`);

      this.trackAnalytics('message_sent', {
        conversation_id: conversationId,
        message_type: messageType,
        has_reply: !!replyToId,
        content_length: sanitizedContent.length
      });

      return message;
    } catch (error) {
      throw new ServiceError(
        'Failed to send message',
        'MESSAGE_SEND_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    this.validateRequired({ messageId }, ['messageId']);

    try {
      await this.executeQuery(
        async () => {
          const { error } = await supabase
            .rpc('upsert_receipt', {
              p_message_id: messageId,
              p_status: 'read'
            });

          return { data: null, error };
        }
      );

      this.trackAnalytics('message_read', { message_id: messageId });
    } catch (error) {
      throw new ServiceError(
        'Failed to mark message as read',
        'MESSAGE_READ_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    this.validateRequired({ conversationId }, ['conversationId']);

    try {
      await this.executeQuery(
        async () => {
          const { error } = await supabase
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', await this.getCurrentUserId());

          return { data: null, error };
        }
      );

      this.trackAnalytics('conversation_read', { conversation_id: conversationId });
    } catch (error) {
      throw new ServiceError(
        'Failed to mark conversation as read',
        'CONVERSATION_READ_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Add participants to conversation
   */
  async addParticipantsToConversation(
    conversationId: string, 
    userIds: string[]
  ): Promise<ConversationParticipant[]> {
    this.validateRequired({ conversationId, userIds }, ['conversationId', 'userIds']);

    try {
      const participants = await this.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from('conversation_participants')
            .insert(
              userIds.map(userId => ({
                conversation_id: conversationId,
                user_id: userId
              }))
            )
            .select(`
              *,
              user:profiles(*)
            `);

          return { data, error };
        }
      );

      this.trackAnalytics('participants_added', {
        conversation_id: conversationId,
        participant_count: userIds.length
      });

      return participants;
    } catch (error) {
      throw new ServiceError(
        'Failed to add participants',
        'PARTICIPANTS_ADD_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Remove participant from conversation
   */
  async removeParticipantFromConversation(
    conversationId: string, 
    userId: string
  ): Promise<void> {
    this.validateRequired({ conversationId, userId }, ['conversationId', 'userId']);

    try {
      await this.executeQuery(
        async () => {
          const { error } = await supabase
            .from('conversation_participants')
            .delete()
            .eq('conversation_id', conversationId)
            .eq('user_id', userId);

          return { data: null, error };
        }
      );

      this.trackAnalytics('participant_removed', {
        conversation_id: conversationId,
        user_id: userId
      });
    } catch (error) {
      throw new ServiceError(
        'Failed to remove participant',
        'PARTICIPANT_REMOVE_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Subscribe to conversation updates
   */
  subscribeToConversation(
    conversationId: string,
    callbacks: {
      onMessage?: (message: Message) => void;
      onMessageUpdate?: (message: Message) => void;
      onParticipantJoin?: (participant: ConversationParticipant) => void;
      onParticipantLeave?: (participant: ConversationParticipant) => void;
    }
  ): () => void {
    if (!supabase) return () => {};

    const channel = supabase.channel(`conversation-${conversationId}`);

    // Listen for new messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        try {
          const message = await this.executeQuery(
            async () => {
              const { data, error } = await supabase
                .from('messages')
                .select(`
                  *,
                  sender:profiles(*),
                  receipts:message_receipts(*)
                `)
                .eq('id', payload.new.id)
                .single();

              return { data, error };
            }
          );

          callbacks.onMessage?.(message);
        } catch (error) {
          console.error('Error handling new message:', error);
        }
      }
    );

    // Listen for message updates
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        try {
          const message = await this.executeQuery(
            async () => {
              const { data, error } = await supabase
                .from('messages')
                .select(`
                  *,
                  sender:profiles(*),
                  receipts:message_receipts(*)
                `)
                .eq('id', payload.new.id)
                .single();

              return { data, error };
            }
          );

          callbacks.onMessageUpdate?.(message);
        } catch (error) {
          console.error('Error handling message update:', error);
        }
      }
    );

    // Listen for participant changes
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_participants',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        try {
          const participant = await this.executeQuery(
            async () => {
              const { data, error } = await supabase
                .from('conversation_participants')
                .select(`
                  *,
                  user:profiles(*)
                `)
                .eq('id', payload.new.id)
                .single();

              return { data, error };
            }
          );

          callbacks.onParticipantJoin?.(participant);
        } catch (error) {
          console.error('Error handling participant join:', error);
        }
      }
    );

    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'conversation_participants',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        callbacks.onParticipantLeave?.(payload.old as ConversationParticipant);
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Get unread message count for current user
   */
  async getUnreadCount(): Promise<number> {
    try {
      const count = await this.executeQuery(
        async () => {
          const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', 
              supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', await this.getCurrentUserId())
            )
            .not('sender_id', 'eq', await this.getCurrentUserId())
            .not('id', 'in', 
              supabase
                .from('message_receipts')
                .select('message_id')
                .eq('user_id', await this.getCurrentUserId())
                .eq('status', 'read')
            );

          return { data: count, error };
        }
      );

      return count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Search messages across conversations
   */
  async searchMessages(
    query: string,
    conversationId?: string,
    limit: number = 20
  ): Promise<Message[]> {
    this.validateRequired({ query }, ['query']);

    try {
      const messages = await this.executeQuery(
        async () => {
          let searchQuery = supabase
            .from('messages')
            .select(`
              *,
              sender:profiles(*),
              conversation:conversations(*)
            `)
            .textSearch('content', query)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (conversationId) {
            searchQuery = searchQuery.eq('conversation_id', conversationId);
          } else {
            // Only search in user's conversations
            searchQuery = searchQuery.in('conversation_id',
              supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', await this.getCurrentUserId())
            );
          }

          const { data, error } = await searchQuery;

          return { data, error };
        }
      );

      this.trackAnalytics('message_search', {
        query,
        conversation_id: conversationId,
        result_count: messages.length
      });

      return messages;
    } catch (error) {
      throw new ServiceError(
        'Failed to search messages',
        'MESSAGE_SEARCH_ERROR',
        500,
        error
      );
    }
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
export const messagingService = new MessagingService();
