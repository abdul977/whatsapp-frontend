'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface MessageHistory {
  id: string;
  contactName: string;
  contactPhone: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  account: string;
  messageType: 'text' | 'image' | 'document' | 'template';
}

// Mock data
const mockHistory: MessageHistory[] = [
  {
    id: '1',
    contactName: 'John Doe',
    contactPhone: '+234901234567',
    message: 'Hello! I have a question about your services.',
    direction: 'inbound',
    status: 'read',
    timestamp: '2024-01-20T10:30:00Z',
    account: 'Main Business Account',
    messageType: 'text'
  },
  {
    id: '2',
    contactName: 'John Doe',
    contactPhone: '+234901234567',
    message: 'Thank you for reaching out! I\'d be happy to help you with any questions.',
    direction: 'outbound',
    status: 'read',
    timestamp: '2024-01-20T10:32:00Z',
    account: 'Main Business Account',
    messageType: 'text'
  },
  {
    id: '3',
    contactName: 'Jane Smith',
    contactPhone: '+234907654321',
    message: 'Your order has been confirmed and will be delivered within 2-3 business days.',
    direction: 'outbound',
    status: 'delivered',
    timestamp: '2024-01-20T09:15:00Z',
    account: 'Main Business Account',
    messageType: 'template'
  },
  {
    id: '4',
    contactName: 'Mike Johnson',
    contactPhone: '+234905555555',
    message: 'Can we schedule a meeting for next week?',
    direction: 'inbound',
    status: 'read',
    timestamp: '2024-01-20T08:45:00Z',
    account: 'Secondary Business Account',
    messageType: 'text'
  },
  {
    id: '5',
    contactName: 'Sarah Wilson',
    contactPhone: '+234903333333',
    message: 'Please find the attached document with the details you requested.',
    direction: 'outbound',
    status: 'sent',
    timestamp: '2024-01-20T08:20:00Z',
    account: 'Main Business Account',
    messageType: 'document'
  }
];

function MessageRow({ message }: { message: MessageHistory }) {
  const statusIcons = {
    sent: ClockIcon,
    delivered: CheckIcon,
    read: CheckIcon,
    failed: ExclamationTriangleIcon
  };

  const statusColors = {
    sent: 'text-yellow-500',
    delivered: 'text-green-500',
    read: 'text-blue-500',
    failed: 'text-red-500'
  };

  const directionColors = {
    inbound: 'bg-blue-50 border-l-4 border-blue-500',
    outbound: 'bg-green-50 border-l-4 border-green-500'
  };

  const messageTypeIcons = {
    text: '💬',
    image: '🖼️',
    document: '📄',
    template: '📋'
  };

  const StatusIcon = statusIcons[message.status];

  return (
    <div className={`p-4 rounded-lg border ${directionColors[message.direction]} mb-3`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{messageTypeIcons[message.messageType]}</span>
            <h3 className="font-medium text-gray-900">{message.contactName}</h3>
            <span className="text-sm text-gray-500">{message.contactPhone}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              message.direction === 'inbound' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {message.direction}
            </span>
          </div>
          
          <p className="text-gray-700 mb-2 line-clamp-2">{message.message}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{message.account}</span>
            <span>{new Date(message.timestamp).toLocaleString()}</span>
            <span className="capitalize">{message.messageType}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <StatusIcon className={`h-5 w-5 ${statusColors[message.status]}`} />
          <span className={`text-sm font-medium ${statusColors[message.status]}`}>
            {message.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MessageHistoryPage() {
  const [messages] = useState<MessageHistory[]>(mockHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.contactPhone.includes(searchQuery) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDirection = selectedDirection === 'all' || message.direction === selectedDirection;
    const matchesAccount = selectedAccount === 'all' || message.account === selectedAccount;
    const matchesStatus = selectedStatus === 'all' || message.status === selectedStatus;

    return matchesSearch && matchesDirection && matchesAccount && matchesStatus;
  });

  const handleExport = () => {
    console.log('Export message history');
  };

  const accounts = Array.from(new Set(messages.map(m => m.account)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message History</h1>
          <p className="text-gray-600">View and search through all your WhatsApp message history</p>
        </div>
        
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages, contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Direction Filter */}
          <div>
            <select
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Directions</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Accounts</option>
              {accounts.map((account) => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="mt-4 flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{filteredMessages.length}</div>
          <div className="text-sm text-gray-500">Total Messages</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredMessages.filter(m => m.direction === 'outbound').length}
          </div>
          <div className="text-sm text-gray-500">Sent Messages</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {filteredMessages.filter(m => m.direction === 'inbound').length}
          </div>
          <div className="text-sm text-gray-500">Received Messages</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {Array.from(new Set(filteredMessages.map(m => m.contactPhone))).length}
          </div>
          <div className="text-sm text-gray-500">Unique Contacts</div>
        </div>
      </div>

      {/* Message List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <div className="text-sm text-gray-500">
            Showing {filteredMessages.length} of {messages.length} messages
          </div>
        </div>

        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms or filters' : 'No message history available'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredMessages.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing 1 to {Math.min(20, filteredMessages.length)} of {filteredMessages.length} results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
