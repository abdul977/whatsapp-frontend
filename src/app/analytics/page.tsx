'use client';

import { useState } from 'react';
import { 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
}

function MetricCard({ title, value, change, changeType, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {changeType === 'increase' ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Mock chart component (in real app, you'd use recharts or similar)
function SimpleChart({ data, title, color = '#10B981' }: {
  data: number[];
  title: string;
  color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64 flex items-end space-x-2">
        {data.map((value, index) => {
          const height = ((value - min) / range) * 200 + 20;
          return (
            <div
              key={index}
              className="flex-1 rounded-t"
              style={{
                height: `${height}px`,
                backgroundColor: color,
                opacity: 0.8
              }}
              title={`Day ${index + 1}: ${value}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>7 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function TopContactsTable() {
  const topContacts = [
    { name: 'John Doe', phone: '+234901234567', messages: 45, lastActive: '2 hours ago' },
    { name: 'Jane Smith', phone: '+234907654321', messages: 38, lastActive: '5 hours ago' },
    { name: 'Mike Johnson', phone: '+234905555555', messages: 32, lastActive: '1 day ago' },
    { name: 'Sarah Wilson', phone: '+234903333333', messages: 28, lastActive: '2 days ago' },
    { name: 'David Brown', phone: '+234902222222', messages: 24, lastActive: '3 days ago' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Active Contacts</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Messages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topContacts.map((contact, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-gray-600">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contact.messages}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contact.lastActive}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data
  const messageData = [12, 19, 15, 27, 32, 25, 18];
  const responseData = [8, 12, 10, 18, 22, 16, 14];
  const contactData = [2, 3, 1, 4, 2, 3, 2];

  const metrics = [
    {
      title: 'Total Messages',
      value: '1,234',
      change: 12.5,
      changeType: 'increase' as const,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Contacts',
      value: '89',
      change: 8.2,
      changeType: 'increase' as const,
      icon: UserGroupIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Avg Response Time',
      value: '2.3h',
      change: 15.3,
      changeType: 'decrease' as const,
      icon: ClockIcon,
      color: 'bg-yellow-500'
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: 2.1,
      changeType: 'increase' as const,
      icon: ChartBarIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your WhatsApp Business performance and insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          data={messageData}
          title="Messages Sent"
          color="#3B82F6"
        />
        <SimpleChart
          data={responseData}
          title="Messages Received"
          color="#10B981"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          data={contactData}
          title="New Contacts"
          color="#F59E0B"
        />
        
        {/* Response Time Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">&lt; 1 hour</span>
              <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900">65%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">1-4 hours</span>
              <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">4-24 hours</span>
              <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '8%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900">8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">&gt; 24 hours</span>
              <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '2%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900">2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Contacts Table */}
      <TopContactsTable />

      {/* Account Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Main Business Account</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Messages Sent</span>
                <span className="font-medium">856</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Messages Received</span>
                <span className="font-medium">642</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Contacts</span>
                <span className="font-medium">67</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">96.2%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Secondary Business Account</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Messages Sent</span>
                <span className="font-medium">378</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Messages Received</span>
                <span className="font-medium">289</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Contacts</span>
                <span className="font-medium">22</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">92.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
