'use client';

import { useState } from 'react';
import { 
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface Account {
  id: string;
  name: string;
  phoneNumber: string;
  businessAccountId: string;
  accessToken: string;
  webhookUrl: string;
  verifyToken: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  messagesSent: number;
  messagesReceived: number;
}

interface AccountConfigurationProps {
  account: Account;
  onSave: (account: Account) => void;
  onTest: (account: Account) => void;
}

export default function AccountConfiguration({ account, onSave, onTest }: AccountConfigurationProps) {
  const [formData, setFormData] = useState<Account>(account);
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setTestResult('success');
      onTest(formData);
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = () => {
    switch (formData.status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (formData.status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CogIcon className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Account Configuration</h3>
              <p className="text-sm text-gray-500">Manage WhatsApp Business API settings</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-900">{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter account name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number ID
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter phone number ID"
            />
          </div>
        </div>

        {/* Business Account ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Account ID
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.businessAccountId}
              onChange={(e) => setFormData(prev => ({ ...prev, businessAccountId: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter business account ID"
            />
            <button
              onClick={() => copyToClipboard(formData.businessAccountId)}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Access Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Token
          </label>
          <div className="flex space-x-2">
            <input
              type={showToken ? 'text' : 'password'}
              value={formData.accessToken}
              onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter access token"
            />
            <button
              onClick={() => setShowToken(!showToken)}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showToken ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(formData.accessToken)}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Webhook Configuration</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://your-domain.com/webhook"
              />
              <button
                onClick={() => copyToClipboard(formData.webhookUrl)}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verify Token
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.verifyToken}
                onChange={(e) => setFormData(prev => ({ ...prev, verifyToken: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter verify token"
              />
              <button
                onClick={() => copyToClipboard(formData.verifyToken)}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Account Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formData.messagesSent}</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formData.messagesReceived}</div>
              <div className="text-sm text-gray-600">Messages Received</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-900">Last Sync</div>
              <div className="text-sm text-gray-600">{formData.lastSync}</div>
            </div>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {testResult === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                testResult === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult === 'success' 
                  ? 'Connection test successful!' 
                  : 'Connection test failed. Please check your configuration.'
                }
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleTest}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            ) : null}
            Test Connection
          </button>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
