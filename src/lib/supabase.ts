import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: false, // We're not using Supabase auth, just the database
  },
});

// Database types for TypeScript
export interface Account {
  id: string;
  name: string;
  token: string;
  phone_number_id: string;
  business_account_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  message_id?: string;
  phone_number: string;
  text: string;
  sender_type: 'incoming' | 'outgoing';
  timestamp: string;
  account_id: string;
  created_at: string;
}

export interface Contact {
  id: string;
  phone_number: string;
  account_id: string;
  display_name?: string;
  last_message?: string;
  last_message_time?: string;
  last_message_type?: 'incoming' | 'outgoing';
  message_count: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  account_id: string;
  contact_phone_number: string;
  last_message_id?: string;
  last_message_time?: string;
  unread_count: number;
  is_archived: boolean;
  is_pinned: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Helper functions for database operations

/**
 * Fetch all accounts
 */
export async function fetchAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch contacts for a specific account
 */
export async function fetchContacts(accountId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('account_id', accountId)
    .order('last_message_time', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch messages for a specific contact
 */
export async function fetchMessages(
  accountId: string,
  phoneNumber: string
): Promise<WhatsAppMessage[]> {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('account_id', accountId)
    .eq('phone_number', phoneNumber)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch chats for a specific account
 */
export async function fetchChats(accountId: string): Promise<Chat[]> {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('account_id', accountId)
    .order('last_message_time', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }

  return data || [];
}

/**
 * Subscribe to new messages for a specific account
 */
export function subscribeToMessages(
  accountId: string,
  callback: (message: WhatsAppMessage) => void
) {
  return supabase
    .channel(`messages:${accountId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'whatsapp_messages',
        filter: `account_id=eq.${accountId}`,
      },
      (payload) => {
        callback(payload.new as WhatsAppMessage);
      }
    )
    .subscribe();
}

/**
 * Subscribe to contact updates for a specific account
 */
export function subscribeToContacts(
  accountId: string,
  callback: (contact: Contact) => void
) {
  return supabase
    .channel(`contacts:${accountId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'contacts',
        filter: `account_id=eq.${accountId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as Contact);
        }
      }
    )
    .subscribe();
}

/**
 * Subscribe to chat updates for a specific account
 */
export function subscribeToChats(
  accountId: string,
  callback: (chat: Chat) => void
) {
  return supabase
    .channel(`chats:${accountId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `account_id=eq.${accountId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as Chat);
        }
      }
    )
    .subscribe();
}

export default supabase;

