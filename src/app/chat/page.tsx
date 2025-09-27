'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { getContacts, getMessages, sendMessage, Contact as ApiContact, Message as ApiMessage, ContactsResponse } from '@/lib/api';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  avatar?: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: 'me' | 'contact';
  status: 'sent' | 'delivered' | 'read';
}

// Helper function to convert API contact to UI contact
const convertApiContactToUIContact = (apiContact: ApiContact): Contact => {
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
const convertApiMessageToUIMessage = (apiMessage: ApiMessage): Message => {
  return {
    id: apiMessage.id,
    text: apiMessage.message_text,
    timestamp: new Date(apiMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sender: apiMessage.sender_type === 'outgoing' ? 'me' : 'contact',
    status: 'read' // TODO: Implement proper status tracking
  };
};



function ContactItem({ contact, isSelected, onClick }: { 
  contact: Contact; 
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

function MessageBubble({ message }: { message: Message }) {
  const isMe = message.sender === 'me';
  
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isMe
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm">{message.text}</p>
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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  // Load messages when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.phone);
    }
  }, [selectedContact]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await getContacts();
      if (response.status === 'success' && response.contacts) {
        const uiContacts = response.contacts.map(convertApiContactToUIContact);
        setContacts(uiContacts);
        if (uiContacts.length > 0 && !selectedContact) {
          setSelectedContact(uiContacts[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (phoneNumber: string) => {
    try {
      setLoading(true);
      const response = await getMessages(phoneNumber);
      if (response.status === 'success' && response.data) {
        const uiMessages = response.data.map(convertApiMessageToUIMessage);
        setMessages(uiMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || sendingMessage) return;

    try {
      setSendingMessage(true);

      // Optimistically add message to UI
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'me',
        status: 'sent'
      };
      setMessages(prev => [...prev, tempMessage]);

      // Send message via API
      const response = await sendMessage({
        to: selectedContact.phone,
        message: newMessage,
        type: 'text'
      });

      if (response.status === 'success') {
        // Replace temp message with real message
        const realMessage: Message = {
          id: response.message_id || tempMessage.id,
          text: newMessage,
          timestamp: tempMessage.timestamp,
          sender: 'me',
          status: 'delivered'
        };
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? realMessage : msg
        ));
      } else {
        // Remove temp message on failure
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        alert('Failed to send message: ' + response.message);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id.startsWith('temp-')));
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
    <div className="h-full flex">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
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
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
  );
}
