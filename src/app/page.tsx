'use client';

import { useEffect, useState } from 'react';
import { getContacts, getSystemStatus } from '@/lib/api';
import { 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  ServerIcon,
  GlobeAltIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: 'green' | 'blue' | 'yellow' | 'red';
  description?: string;
}

function StatCard({ title, value, icon: Icon, color, description }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemStatusCard({ title, status, icon: Icon, description }: {
  title: string;
  status: 'online' | 'offline' | 'warning';
  icon: React.ComponentType<any>;
  description: string;
}) {
  const statusConfig = {
    online: { color: 'text-green-500', bg: 'bg-green-100', text: 'Online' },
    offline: { color: 'text-red-500', bg: 'bg-red-100', text: 'Offline' },
    warning: { color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'Warning' }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
      <div className={`p-2 rounded-lg ${config.bg}`}>
        <Icon className={`h-6 w-6 ${config.color}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

function RecentActivityItem({ activity }: {
  activity: {
    id: string;
    type: 'message' | 'contact' | 'webhook';
    description: string;
    timestamp: string;
    status: 'success' | 'error' | 'warning';
  };
}) {
  const statusColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600'
  };

  const typeIcons = {
    message: '💬',
    contact: '👤',
    webhook: '🔗'
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <span className="text-lg">{typeIcons[activity.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{activity.description}</p>
        <p className="text-xs text-gray-500">{activity.timestamp}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${
        activity.status === 'success' ? 'bg-green-500' : 
        activity.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
      }`} />
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalMessages: 0,
    todayMessages: 0,
    totalContacts: 0,
    activeAccounts: 0
  });

  // Load real statistics on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load contacts to get total count
      const contactsResponse = await getContacts();
      if (contactsResponse.status === 'success' && contactsResponse.data) {
        setStats(prev => ({
          ...prev,
          totalContacts: contactsResponse.data.length
        }));
      }

      // Load system status
      const statusResponse = await getSystemStatus();
      if (statusResponse) {
        // TODO: Extract real statistics from system status
        setStats(prev => ({
          ...prev,
          activeAccounts: 1 // TODO: Get from real API
        }));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [recentActivity] = useState([
    {
      id: '1',
      type: 'message' as const,
      description: 'New message from John Doe',
      timestamp: '2 minutes ago',
      status: 'success' as const
    },
    {
      id: '2',
      type: 'contact' as const,
      description: 'New contact added: Jane Smith',
      timestamp: '15 minutes ago',
      status: 'success' as const
    },
    {
      id: '3',
      type: 'webhook' as const,
      description: 'Webhook delivery successful',
      timestamp: '1 hour ago',
      status: 'success' as const
    },
    {
      id: '4',
      type: 'message' as const,
      description: 'Failed to send message to +234567890',
      timestamp: '2 hours ago',
      status: 'error' as const
    }
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your WhatsApp Business accounts.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Messages"
          value={stats.totalMessages.toLocaleString()}
          icon={ChatBubbleLeftRightIcon}
          color="blue"
          description="All time messages"
        />
        <StatCard
          title="Today's Messages"
          value={stats.todayMessages}
          icon={PaperAirplaneIcon}
          color="green"
          description="Messages sent today"
        />
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon={UserGroupIcon}
          color="yellow"
          description="Active contacts"
        />
        <StatCard
          title="Active Accounts"
          value={stats.activeAccounts}
          icon={CheckCircleIcon}
          color="green"
          description="WhatsApp accounts"
        />
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SystemStatusCard
            title="API Server"
            status="online"
            icon={ServerIcon}
            description="All endpoints responding normally"
          />
          <SystemStatusCard
            title="Redis Cache"
            status="online"
            icon={CircleStackIcon}
            description="Cache performance optimal"
          />
          <SystemStatusCard
            title="Webhook Service"
            status="online"
            icon={GlobeAltIcon}
            description="Real-time delivery active"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <a href="/history" className="text-sm text-green-600 hover:text-green-700">
              View all
            </a>
          </div>
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <RecentActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <a
              href="/chat"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">Send Message</p>
                <p className="text-sm text-gray-500">Start a conversation</p>
              </div>
            </a>
            <a
              href="/contacts"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <UserGroupIcon className="h-6 w-6 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">View Contacts</p>
                <p className="text-sm text-gray-500">Manage contacts</p>
              </div>
            </a>
            <a
              href="/templates"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ClockIcon className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-medium text-gray-900">Templates</p>
                <p className="text-sm text-gray-500">Message templates</p>
              </div>
            </a>
            <a
              href="/analytics"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ExclamationTriangleIcon className="h-6 w-6 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-500">View reports</p>
              </div>
            </a>
            <a
              href="/accounts"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <UserGroupIcon className="h-6 w-6 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Manage Accounts</p>
                <p className="text-sm text-gray-500">Add or remove accounts</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
