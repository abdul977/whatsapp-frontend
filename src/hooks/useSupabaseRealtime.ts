import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  supabase,
  WhatsAppMessage,
  Contact,
  Chat,
  subscribeToMessages,
  subscribeToContacts,
  subscribeToChats,
} from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

const normalizePhoneNumber = (value: string) => value.replace(/[^0-9]/g, '');

/**
 * Custom hook to manage Supabase real-time subscriptions
 * This works alongside WebSocket to ensure no messages are missed
 */
export function useSupabaseRealtime(accountId: string | null) {
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const addMessage = useAppStore((state) => state.addMessage);
  const addContact = useAppStore((state) => state.addContact);
  const updateContact = useAppStore((state) => state.updateContact);

  useEffect(() => {
    if (!accountId) {
      // Clean up existing subscriptions
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      return;
    }

    console.log(`🔔 Setting up Supabase real-time subscriptions for account: ${accountId}`);

    // Subscribe to new messages
    const messagesChannel = subscribeToMessages(accountId, (message: WhatsAppMessage) => {
      console.log('📨 Supabase: New message received:', message);
      
      const normalizedPhone = normalizePhoneNumber(message.phone_number);
      
      // Add message to store (converted to API format)
      addMessage(normalizedPhone, {
        id: message.id,
        message_id: message.message_id,
        phone_number: message.phone_number,
        text: message.text,
        sender_type: message.sender_type,
        timestamp: message.timestamp,
        account_id: message.account_id,
      });

      // Show notification for incoming messages
      if (message.sender_type === 'incoming') {
        useAppStore.getState().addNotification({
          type: 'info',
          title: 'New Message',
          message: `From ${message.phone_number}: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`,
        });
      }
    });

    // Subscribe to contact updates
    const contactsChannel = subscribeToContacts(accountId, (contact: Contact) => {
      console.log('👤 Supabase: Contact updated:', contact);
      
      // Check if contact already exists in store
      const existingContacts = useAppStore.getState().contacts;
      const existingContact = existingContacts.find(
        (c) => c.phone_number === contact.phone_number && c.account_id === contact.account_id
      );

      if (existingContact) {
        // Update existing contact
        updateContact(contact.phone_number, {
          display_name: contact.display_name,
          last_message: contact.last_message,
          last_message_time: contact.last_message_time,
          last_message_type: contact.last_message_type,
          message_count: contact.message_count,
        });
      } else {
        // Add new contact
        addContact({
          phone_number: contact.phone_number,
          display_name: contact.display_name,
          last_message: contact.last_message,
          last_message_time: contact.last_message_time,
          last_message_type: contact.last_message_type,
          message_count: contact.message_count,
          account_id: contact.account_id,
        });
      }
    });

    // Subscribe to chat updates (for unread counts, etc.)
    const chatsChannel = subscribeToChats(accountId, (chat: Chat) => {
      console.log('💬 Supabase: Chat updated:', chat);
      
      // Update contact with unread count
      updateContact(chat.contact_phone_number, {
        unread_count: chat.unread_count,
      });
    });

    // Store channel references for cleanup
    channelsRef.current = [messagesChannel, contactsChannel, chatsChannel];

    // Cleanup function
    return () => {
      console.log(`🔕 Cleaning up Supabase subscriptions for account: ${accountId}`);
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [accountId, addMessage, addContact, updateContact]);

  return {
    isSubscribed: channelsRef.current.length > 0,
  };
}

/**
 * Hook to load initial data from Supabase
 */
export function useSupabaseData(accountId: string | null) {
  const setContacts = useAppStore((state) => state.setContacts);
  const setMessages = useAppStore((state) => state.setMessages);

  useEffect(() => {
    if (!accountId) return;

    const loadData = async () => {
      try {
        console.log(`📥 Loading initial data from Supabase for account: ${accountId}`);

        // Load contacts
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('account_id', accountId)
          .order('last_message_time', { ascending: false, nullsFirst: false });

        if (contactsError) {
          console.error('Error loading contacts from Supabase:', contactsError);
        } else if (contacts) {
          console.log(`✅ Loaded ${contacts.length} contacts from Supabase`);
          
          // Convert Supabase contacts to app store format
          const appContacts = contacts.map((contact) => ({
            phone_number: contact.phone_number,
            display_name: contact.display_name,
            name: contact.display_name,
            last_message: contact.last_message,
            last_message_time: contact.last_message_time,
            last_message_type: contact.last_message_type,
            message_count: contact.message_count,
            account_id: contact.account_id,
          }));
          
          setContacts(appContacts);

          // Load messages for each contact (limit to recent messages to avoid overload)
          for (const contact of contacts.slice(0, 10)) {
            // Only load for first 10 contacts
            const { data: messages, error: messagesError } = await supabase
              .from('whatsapp_messages')
              .select('*')
              .eq('account_id', accountId)
              .eq('phone_number', contact.phone_number)
              .order('timestamp', { ascending: true })
              .limit(100); // Limit to last 100 messages per contact

            if (messagesError) {
              console.error(`Error loading messages for ${contact.phone_number}:`, messagesError);
            } else if (messages) {
              const normalizedPhone = normalizePhoneNumber(contact.phone_number);
              
              // Convert to app store format
              const appMessages = messages.map((msg) => ({
                id: msg.id,
                message_id: msg.message_id,
                phone_number: msg.phone_number,
                text: msg.text,
                sender_type: msg.sender_type,
                timestamp: msg.timestamp,
                account_id: msg.account_id,
              }));
              
              setMessages(normalizedPhone, appMessages);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      }
    };

    loadData();
  }, [accountId, setContacts, setMessages]);
}

/**
 * Hook to load messages for a specific contact from Supabase
 */
export async function loadMessagesFromSupabase(
  accountId: string,
  phoneNumber: string
): Promise<WhatsAppMessage[]> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('account_id', accountId)
      .eq('phone_number', phoneNumber)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error loading messages from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading messages from Supabase:', error);
    return [];
  }
}

