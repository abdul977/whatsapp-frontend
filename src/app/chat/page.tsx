'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '@/store/useAppStore';
import { getContacts, getMessages, sendMessage, getAccounts, Contact as ApiContact, Message as ApiMessage } from '@/lib/api';
import { useSupabaseRealtime, useSupabaseData, loadMessagesFromSupabase } from '@/hooks/useSupabaseRealtime';
import { fetchContacts } from '@/lib/supabase';

interface UiContact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  avatar?: string;
}

interface UiMessage {
  id: string;
  text: string;
  timestamp: string;
  sender: 'me' | 'contact';
  status: 'sent' | 'delivered' | 'read';
  messageType?: 'text' | 'calendar_event' | 'ai_silent' | 'system';
  calendarEvent?: {
    title: string;
    date: string;
    time: string;
    location?: string;
    description?: string;
  };
}

const normalizePhoneNumber = (value: string) => value.replace(/[^0-9]/g, '');

// Helper function to convert API contact to UI contact
const convertApiContactToUIContact = (apiContact: ApiContact): UiContact => {
  return {
    id: apiContact.phone_number,
    name: apiContact.display_name || apiContact.name || `Contact ${apiContact.phone_number.slice(-4)}`,
    phone: apiContact.phone_number,
    lastMessage: apiContact.last_message || '',
    lastMessageTime: apiContact.last_message_time || '',
    unreadCount: 0, // TODO: Implement unread count tracking
    online: false // TODO: Implement online status tracking
  };
};

// Helper function to convert API message to UI message
const convertApiMessageToUIMessage = (apiMessage: ApiMessage, index?: number): UiMessage => {
  // Generate unique ID by combining message ID with timestamp and index to avoid duplicates
  const uniqueId = apiMessage.id || `msg-${apiMessage.timestamp}-${index || 0}`;

  const baseMessage: UiMessage = {
    id: uniqueId,
    text: apiMessage.text,
    timestamp: new Date(apiMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sender: apiMessage.sender_type === 'outgoing' ? 'me' : 'contact',
    status: 'read' // TODO: Implement proper status tracking
  };

  // Detect calendar event messages
  const calendarEventPatterns = [
    /📅.*(?:created|scheduled)/i,
    /calendar event.*created/i,
    /scheduled.*(?:pickup|delivery)/i,
    /appointment.*(?:set|scheduled)/i
  ];

  const isCalendarEvent = calendarEventPatterns.some(pattern => pattern.test(apiMessage.text));

  if (isCalendarEvent && apiMessage.sender_type === 'outgoing') {
    // Extract calendar event details from message text
    const dateMatch = apiMessage.text.match(/(?:on|for)\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)/i);
    const timeMatch = apiMessage.text.match(/(?:at|@)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/i);
    const locationMatch = apiMessage.text.match(/(?:at|in|location:)\s+([^.]+?)(?:\.|$)/i);

    baseMessage.messageType = 'calendar_event';
    baseMessage.calendarEvent = {
      title: 'Smartwatch Pickup/Delivery',
      date: dateMatch ? dateMatch[1] : 'Date not specified',
      time: timeMatch ? timeMatch[1] : 'Time not specified',
      location: locationMatch ? locationMatch[1].trim() : undefined,
      description: apiMessage.text
    };
  }

  // Detect AI silent responses (empty outgoing messages or specific markers)
  if (apiMessage.sender_type === 'outgoing' &&
      (apiMessage.text.trim() === '' ||
       apiMessage.text.includes('[AI_SILENT]') ||
       apiMessage.text.includes('AI chose not to respond'))) {
    baseMessage.messageType = 'ai_silent';
    baseMessage.text = 'AI chose not to respond (conversation ended)';
  }

  return baseMessage;
};



function ContactItem({ contact, isSelected, onClick }: { 
  contact: UiContact; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-green-50 border-r-2 border-green-500' : ''
      }`}
    >
      <div className="relative">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-medium">
            {contact.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        {contact.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
          <p className="text-xs text-gray-500">{contact.lastMessageTime}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
          {contact.unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 rounded-full">
              {contact.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UiMessage }) {
  const isMe = message.sender === 'me';
  const messageType = message.messageType || 'text';

  // Calendar Event Message
  if (messageType === 'calendar_event' && message.calendarEvent) {
    return (
      <div className="flex justify-center mb-4">
        <div className="max-w-md w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900">📅 Calendar Event Created</h4>
              <p className="text-sm font-medium text-blue-800 mt-1">{message.calendarEvent.title}</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Date:</span> {message.calendarEvent.date}
                </p>
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Time:</span> {message.calendarEvent.time}
                </p>
                {message.calendarEvent.location && (
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Location:</span> {message.calendarEvent.location}
                  </p>
                )}
                {message.calendarEvent.description && (
                  <p className="text-xs text-blue-700 mt-2">{message.calendarEvent.description}</p>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2">{message.timestamp}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI Silent Response (Response Verification)
  if (messageType === 'ai_silent') {
    return (
      <div className="flex justify-center mb-4">
        <div className="max-w-md bg-gray-100 border border-gray-300 rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <p className="text-xs text-gray-600 italic">AI chose not to respond</p>
            <span className="text-xs text-gray-500">{message.timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  // System Message
  if (messageType === 'system') {
    return (
      <div className="flex justify-center mb-4">
        <div className="max-w-md bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          <p className="text-xs text-yellow-800 text-center">{message.text}</p>
          <p className="text-xs text-yellow-600 text-center mt-1">{message.timestamp}</p>
        </div>
      </div>
    );
  }

  // Regular Text Message
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isMe
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          isMe ? 'text-green-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">{message.timestamp}</span>
          {isMe && (
            <div className="flex space-x-1">
              {message.status === 'sent' && <span className="text-xs">✓</span>}
              {message.status === 'delivered' && <span className="text-xs">✓✓</span>}
              {message.status === 'read' && <span className="text-xs text-blue-300">✓✓</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<UiContact | null>(null);
  const [contacts, setContacts] = useState<UiContact[]>([]);
  const [uiMessages, setUiMessages] = useState<UiMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accounts = useAppStore((state) => state.accounts);
  const currentAccount = useAppStore((state) => state.currentAccount);
  const setAccounts = useAppStore((state) => state.setAccounts);
  const switchAccount = useAppStore((state) => state.switchAccount);
  const messageMap = useAppStore((state) => state.messages);
  const contactsFromStore = useAppStore((state) => state.contacts);
  const setMessagesInStore = useAppStore((state) => state.setMessages);
  const addMessageToStore = useAppStore((state) => state.addMessage);
  const wsConnected = useAppStore((state) => state.wsConnected);
  const selectedAccountId = currentAccount?.id;

  // Enable Supabase real-time subscriptions
  useSupabaseRealtime(selectedAccountId || null);

  // Load initial data from Supabase
  useSupabaseData(selectedAccountId || null);

  const loadContacts = useCallback(async (accountId: string) => {
    try {
      setLoading(true);

      // Try to load from Supabase first
      try {
        const supabaseContacts = await fetchContacts(accountId);
        if (supabaseContacts && supabaseContacts.length > 0) {
          console.log(`✅ Loaded ${supabaseContacts.length} contacts from Supabase`);
          const uiContacts = supabaseContacts.map((contact) => ({
            id: contact.phone_number,
            name: contact.display_name || `Contact ${contact.phone_number.slice(-4)}`,
            phone: contact.phone_number,
            lastMessage: contact.last_message || '',
            lastMessageTime: contact.last_message_time || '',
            unreadCount: 0, // Will be updated by chat subscription
            online: false,
          }));
          setContacts(uiContacts);
          if (uiContacts.length > 0 && !selectedContact) {
            setSelectedContact(uiContacts[0]);
          }
          return;
        }
      } catch (supabaseError) {
        console.warn('Supabase contact loading failed, falling back to API:', supabaseError);
      }

      // Fallback to backend API (only if backend is available)
      if (wsConnected) {
        try {
          const response = await getContacts(accountId);
          if (response.status === 'success' && response.contacts) {
            const uiContacts = response.contacts.map(convertApiContactToUIContact);
            setContacts(uiContacts);
            if (uiContacts.length > 0 && !selectedContact) {
              setSelectedContact(uiContacts[0]);
            }
          }
        } catch (apiError) {
          console.warn('Backend API not available:', apiError);
          // Don't show error - contacts will be populated via WebSocket/Supabase real-time
        }
      } else {
        console.log('⏳ Waiting for WebSocket connection to load contacts...');
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedContact, wsConnected]);

  const loadMessages = useCallback(async (phoneNumber: string, accountId: string) => {
    try {
      setLoading(true);
      console.log(`Loading messages for ${phoneNumber} (account: ${accountId})`);

      // Try to load from Supabase first
      try {
        const supabaseMessages = await loadMessagesFromSupabase(accountId, phoneNumber);
        if (supabaseMessages && supabaseMessages.length > 0) {
          console.log(`✅ Loaded ${supabaseMessages.length} messages from Supabase`);
          const normalizedPhone = normalizePhoneNumber(phoneNumber);

          // Convert to API format for store
          const apiMessages = supabaseMessages.map((msg) => ({
            id: msg.id,
            message_id: msg.message_id,
            phone_number: msg.phone_number,
            text: msg.text,
            sender_type: msg.sender_type,
            timestamp: msg.timestamp,
            account_id: msg.account_id,
          }));

          setMessagesInStore(normalizedPhone, apiMessages);
          const uiMessages = apiMessages.map(convertApiMessageToUIMessage);
          setUiMessages(uiMessages);
          return;
        }
      } catch (supabaseError) {
        console.warn('Supabase message loading failed, falling back to API:', supabaseError);
      }

      // Fallback to backend API (only if backend is available)
      if (wsConnected) {
        try {
          const response = await getMessages(phoneNumber, accountId);
          console.log('getMessages response:', response);
          if (response.status === 'success' && response.messages) {
            const normalizedPhone = normalizePhoneNumber(phoneNumber);
            setMessagesInStore(normalizedPhone, response.messages);
            const uiMessages = response.messages.map(convertApiMessageToUIMessage);
            setUiMessages(uiMessages);
          }
        } catch (apiError) {
          console.warn('Backend API not available:', apiError);
          // Messages will be populated via WebSocket/Supabase real-time
        }
      } else {
        console.log('⏳ Waiting for WebSocket connection to load messages...');
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [setMessagesInStore, setUiMessages, wsConnected]);

  // Load accounts on component mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await getAccounts();
        if (response.status === 'success' && response.accounts) {
          setAccounts(response.accounts);
          if (response.accounts.length > 0 && !useAppStore.getState().currentAccount) {
            switchAccount(response.accounts[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    };
    loadAccounts();
  }, [setAccounts, switchAccount]);

  // Sync contacts from store to local state
  useEffect(() => {
    if (contactsFromStore && contactsFromStore.length > 0) {
      const uiContacts = contactsFromStore
        .filter(c => c.account_id === selectedAccountId)
        .map((contact) => ({
          id: contact.phone_number,
          name: contact.display_name || contact.name || `Contact ${contact.phone_number.slice(-4)}`,
          phone: contact.phone_number,
          lastMessage: contact.last_message || '',
          lastMessageTime: contact.last_message_time || '',
          unreadCount: contact.unread_count || 0,
          online: false,
        }));
      setContacts(uiContacts);
    }
  }, [contactsFromStore, selectedAccountId]);

  useEffect(() => {
    if (selectedAccountId) {
      loadContacts(selectedAccountId);
    }
  }, [selectedAccountId, loadContacts]);

  useEffect(() => {
    if (selectedContact && selectedAccountId) {
      loadMessages(selectedContact.phone, selectedAccountId);
    }
  }, [selectedContact, selectedAccountId, loadMessages]);

  // Update UI messages when messageMap changes or contact is selected
  useEffect(() => {
    if (!selectedContact) {
      setUiMessages([]);
      return;
    }

    const normalizedPhone = normalizePhoneNumber(selectedContact.phone);
    const apiMessages = messageMap[normalizedPhone] || [];

    console.log(`📊 Updating UI messages for ${normalizedPhone}:`, {
      messageCount: apiMessages.length,
      lastMessage: apiMessages[apiMessages.length - 1]?.text
    });

    // Deduplicate messages by ID and timestamp before converting
    const uniqueMessages = Array.from(
      new Map(apiMessages.map(msg => [`${msg.id}-${msg.timestamp}`, msg])).values()
    );

    const convertedMessages = uniqueMessages.map((msg, index) => convertApiMessageToUIMessage(msg, index));
    setUiMessages(convertedMessages);

    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => scrollToBottom(), 100);
  }, [messageMap, selectedContact]);

  // Force reload messages when contact is clicked (in case WebSocket missed updates)
  useEffect(() => {
    if (selectedContact && selectedAccountId) {
      console.log(`🔄 Contact selected, reloading messages for ${selectedContact.phone}`);
      loadMessages(selectedContact.phone, selectedAccountId);
    }
  }, [selectedContact?.id, selectedAccountId]);




  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uiMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || sendingMessage || !selectedAccountId) return;

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
    if (!selectedAccount) {
      alert('Selected account not found');
      return;
    }

    const now = new Date();
    const tempId = `temp-${now.getTime()}`;
    const tempDisplayTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const normalizedPhone = normalizePhoneNumber(selectedContact.phone);
    const tempIsoTimestamp = now.toISOString();

    try {
      setSendingMessage(true);

      // Optimistically add message to UI and store
      const tempMessage: UiMessage = {
        id: tempId,
        text: newMessage,
        timestamp: tempDisplayTime,
        sender: 'me',
        status: 'sent'
      };

      const tempApiMessage: ApiMessage = {
        id: tempId,
        phone_number: selectedContact.phone,
        text: newMessage,
        sender_type: 'outgoing',
        timestamp: tempIsoTimestamp,
        account_id: selectedAccountId
      };

      setUiMessages(prev => [...prev, tempMessage]);
      addMessageToStore(normalizedPhone, tempApiMessage);

      // Send message via API
      const response = await sendMessage({
        to: selectedContact.phone,
        message: newMessage,
        type: 'text',
        business_id: selectedAccount.business_account_id,
        phone_id: selectedAccount.phone_number_id
      });

      if (response.status === 'success') {
        const messageId = response.message_id || tempId;

        // Replace temp message with confirmed one in UI
        const realMessage: UiMessage = {
          id: messageId,
          text: newMessage,
          timestamp: tempDisplayTime,
          sender: 'me',
          status: 'delivered'
        };
        setUiMessages(prev => prev.map(msg =>
          msg.id === tempId ? realMessage : msg
        ));

        // Update stored messages so websocket-driven views stay in sync
        const currentMessages = useAppStore.getState().messages[normalizedPhone] || [];
        const updatedMessages = currentMessages.map(msg =>
          msg.id === tempId
            ? { ...msg, id: messageId, message_id: messageId, timestamp: tempIsoTimestamp }
            : msg
        );
        setMessagesInStore(normalizedPhone, updatedMessages);
      } else {
        // Remove temp message on failure
        setUiMessages(prev => prev.filter(msg => msg.id !== tempId));
        const currentMessages = useAppStore.getState().messages[normalizedPhone] || [];
        const updatedMessages = currentMessages.filter(msg => msg.id !== tempId);
        setMessagesInStore(normalizedPhone, updatedMessages);
        alert('Failed to send message: ' + response.message);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setUiMessages(prev => prev.filter(msg => msg.id !== tempId));
      const currentMessages = useAppStore.getState().messages[normalizedPhone] || [];
      const updatedMessages = currentMessages.filter(msg => msg.id !== tempId);
      setMessagesInStore(normalizedPhone, updatedMessages);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Connection Status Bar */}
      {!wsConnected && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-800">Connecting to server...</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-yellow-800 underline hover:text-yellow-900"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Connection Status Indicator */}
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-gray-500">Status:</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={wsConnected ? 'text-green-600' : 'text-red-600'}>
                  {wsConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div>
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => switchAccount(account.id)}
                  className={`w-full p-2 mb-2 border border-gray-300 rounded-lg ${selectedAccountId === account.id ? 'bg-green-500 text-white' : ''}`}>
                  {account.name}
                </button>
              ))}
            </div>
          </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loading && contacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Loading contacts...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No contacts found' : 'No contacts available'}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact?.id === contact.id}
                onClick={() => setSelectedContact(contact)}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  {selectedContact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedContact.online ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <PhoneIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <InformationCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {uiMessages.map((message, index) => (
                <MessageBubble
                  key={`${message.id}-${index}`}
                  message={message}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <PaperClipIcon className="h-5 w-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <FaceSmileIcon className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a contact from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
