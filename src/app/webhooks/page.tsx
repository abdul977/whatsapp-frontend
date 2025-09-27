'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface WebhookLog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  responseTime: number;
  payload: any;
  response: any;
  error?: string;
  account: string;
  eventType: string;
}

// Mock data
const mockLogs: WebhookLog[] = [
  {
    id: '1',
    timestamp: '2024-01-20T10:30:15Z',
    method: 'POST',
    endpoint: '/webhook',
    status: 200,
    responseTime: 145,
    payload: {
      object: 'whatsapp_business_account',
      entry: [{
        id: '2139592896448288',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '15550559999', phone_number_id: '837445062775054' },
            messages: [{
              from: '234901234567',
              id: 'wamid.HBgNMjM0OTAxMjM0NTY3FQIAEhggRkY4QzA5RjI4QzA5RjI4QzA5RjI4QzA5RjI4QzA5RjI=',
              timestamp: '1705747815',
              text: { body: 'Hello! I have a question about your services.' },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    },
    response: { status: 'success', message_id: 'msg_001' },
    account: 'Main Business Account',
    eventType: 'message_received'
  },
  {
    id: '2',
    timestamp: '2024-01-20T10:25:32Z',
    method: 'POST',
    endpoint: '/webhook',
    status: 200,
    responseTime: 89,
    payload: {
      object: 'whatsapp_business_account',
      entry: [{
        id: '2139592896448288',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '15550559999', phone_number_id: '837445062775054' },
            statuses: [{
              id: 'wamid.HBgNMjM0OTAxMjM0NTY3FQIAEhggRkY4QzA5RjI4QzA5RjI4QzA5RjI4QzA5RjI4QzA5RjI=',
              status: 'delivered',
              timestamp: '1705747532',
              recipient_id: '234901234567'
            }]
          },
          field: 'messages'
        }]
      }]
    },
    response: { status: 'success' },
    account: 'Main Business Account',
    eventType: 'message_status'
  },
  {
    id: '3',
    timestamp: '2024-01-20T10:20:45Z',
    method: 'POST',
    endpoint: '/webhook',
    status: 500,
    responseTime: 5000,
    payload: {
      object: 'whatsapp_business_account',
      entry: [{
        id: '2139592896448288',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '15550559999', phone_number_id: '837445062775054' },
            messages: [{
              from: '234907654321',
              id: 'wamid.invalid_message_id',
              timestamp: '1705747245',
              text: { body: 'Test message' },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    },
    response: null,
    error: 'Internal server error: Database connection timeout',
    account: 'Main Business Account',
    eventType: 'message_received'
  }
];

function LogRow({ log, onViewDetails }: { log: WebhookLog; onViewDetails: (log: WebhookLog) => void }) {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100';
    if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-100';
    if (status >= 500) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return CheckCircleIcon;
    if (status >= 400 && status < 500) return ExclamationTriangleIcon;
    if (status >= 500) return XCircleIcon;
    return ClockIcon;
  };

  const StatusIcon = getStatusIcon(log.status);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <StatusIcon className={`h-5 w-5 ${getStatusColor(log.status).split(' ')[0]}`} />
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-medium text-gray-900">{log.method}</span>
              <span className="text-sm text-gray-500">{log.endpoint}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                {log.status}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span>{new Date(log.timestamp).toLocaleString()}</span>
              <span>{log.responseTime}ms</span>
              <span>{log.account}</span>
              <span className="capitalize">{log.eventType.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(log)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      </div>

      {log.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{log.error}</p>
        </div>
      )}
    </div>
  );
}

function LogDetailsModal({ log, isOpen, onClose }: {
  log: WebhookLog | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Webhook Log Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Request Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Method:</span> {log.method}</div>
                <div><span className="font-medium">Endpoint:</span> {log.endpoint}</div>
                <div><span className="font-medium">Timestamp:</span> {new Date(log.timestamp).toLocaleString()}</div>
                <div><span className="font-medium">Account:</span> {log.account}</div>
                <div><span className="font-medium">Event Type:</span> {log.eventType}</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Response Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Status:</span> {log.status}</div>
                <div><span className="font-medium">Response Time:</span> {log.responseTime}ms</div>
                {log.error && (
                  <div className="text-red-600">
                    <span className="font-medium">Error:</span> {log.error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Request Payload</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </div>

          {log.response && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Response</h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(log.response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<WebhookLog[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.account.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'success' && log.status >= 200 && log.status < 300) ||
      (selectedStatus === 'error' && log.status >= 400);

    const matchesAccount = selectedAccount === 'all' || log.account === selectedAccount;

    return matchesSearch && matchesStatus && matchesAccount;
  });

  const handleViewDetails = (log: WebhookLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    console.log('Refreshing webhook logs...');
    // In real app, this would fetch fresh data
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing logs...');
        // In real app, this would fetch fresh data
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const accounts = Array.from(new Set(logs.map(l => l.account)));
  const successCount = logs.filter(l => l.status >= 200 && l.status < 300).length;
  const errorCount = logs.filter(l => l.status >= 400).length;
  const avgResponseTime = Math.round(logs.reduce((sum, l) => sum + l.responseTime, 0) / logs.length);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Logs</h1>
          <p className="text-gray-600">Monitor webhook requests and responses in real-time</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh</span>
          </label>
          
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
          <div className="text-sm text-gray-500">Total Requests</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{successCount}</div>
          <div className="text-sm text-gray-500">Successful</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-sm text-gray-500">Errors</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{avgResponseTime}ms</div>
          <div className="text-sm text-gray-500">Avg Response Time</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="success">Success (2xx)</option>
            <option value="error">Error (4xx, 5xx)</option>
          </select>

          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Accounts</option>
            {accounts.map((account) => (
              <option key={account} value={account}>{account}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <LogRow
            key={log.id}
            log={log}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClockIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No webhook logs found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search terms or filters' : 'Webhook logs will appear here when requests are received'}
          </p>
        </div>
      )}

      {/* Log Details Modal */}
      <LogDetailsModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
