'use client';

import { useState } from 'react';
import { 
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  messageCount: number;
  tags: string[];
  status: 'active' | 'blocked';
  createdAt: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read';
}

interface ContactDetailsProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (contact: Contact) => void;
  onMessage?: (contact: Contact) => void;
}

// Mock message history
const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hello! How can I help you today?',
    timestamp: '2024-01-20T10:30:00Z',
    direction: 'outbound',
    status: 'read'
  },
  {
    id: '2',
    text: 'Hi there! I have a question about your services.',
    timestamp: '2024-01-20T10:32:00Z',
    direction: 'inbound',
    status: 'read'
  },
  {
    id: '3',
    text: 'Sure! I\'d be happy to help. What would you like to know?',
    timestamp: '2024-01-20T10:33:00Z',
    direction: 'outbound',
    status: 'read'
  }
];

function MessageBubble({ message }: { message: Message }) {
  const isOutbound = message.direction === 'outbound';
  
  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-xs px-3 py-2 rounded-lg ${
          isOutbound
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          isOutbound ? 'text-green-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {isOutbound && (
            <span className="text-xs">
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && '✓✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactDetails({ contact, isOpen, onClose, onEdit, onMessage }: ContactDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'analytics'>('overview');

  if (!isOpen || !contact) return null;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: PhoneIcon },
    { id: 'messages', name: 'Messages', icon: ChatBubbleLeftRightIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-lg">
                {contact.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{contact.name}</h2>
              <p className="text-sm text-gray-500">{contact.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(contact)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            {onMessage && (
              <button
                onClick={() => onMessage(contact)}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Message
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{contact.phone}</p>
                    </div>
                  </div>
                  
                  {contact.email && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Added</p>
                      <p className="text-sm text-gray-600">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Messages</p>
                      <p className="text-sm text-gray-600">{contact.messageCount} total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                {contact.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No tags assigned</p>
                )}
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                {contact.lastMessage ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900 mb-2">{contact.lastMessage}</p>
                    <p className="text-xs text-gray-500">{contact.lastMessageTime}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No recent messages</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Message History</h3>
                <span className="text-sm text-gray-500">{mockMessages.length} messages</span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {mockMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Contact Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{contact.messageCount}</div>
                  <div className="text-sm text-blue-700">Total Messages</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor(contact.messageCount * 0.7)}
                  </div>
                  <div className="text-sm text-green-700">Messages Sent</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor(contact.messageCount * 0.3)}
                  </div>
                  <div className="text-sm text-purple-700">Messages Received</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Engagement Timeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>First Contact</span>
                    <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Activity</span>
                    <span>{contact.lastMessageTime || 'No recent activity'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Response Rate</span>
                    <span>85%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Response Time</span>
                    <span>2.5 hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
