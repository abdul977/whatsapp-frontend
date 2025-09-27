'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  PaperAirplaneIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  language: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface TemplatePreviewProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onSend?: (template: Template, variables: Record<string, string>) => void;
}

export default function TemplatePreview({ template, isOpen, onClose, onSend }: TemplatePreviewProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (template) {
      // Initialize variable values
      const initialValues: Record<string, string> = {};
      template.variables.forEach(variable => {
        initialValues[variable] = '';
      });
      setVariableValues(initialValues);
    }
  }, [template]);

  useEffect(() => {
    if (template) {
      let content = template.content;
      
      // Replace variables with their values or placeholders
      template.variables.forEach(variable => {
        const value = variableValues[variable] || `[${variable.toUpperCase()}]`;
        content = content.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value);
      });
      
      setPreviewContent(content);
    }
  }, [template, variableValues]);

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleSend = () => {
    if (template && onSend) {
      // Check if all variables have values
      const missingVariables = template.variables.filter(variable => !variableValues[variable]?.trim());
      
      if (missingVariables.length > 0) {
        alert(`Please fill in all variables: ${missingVariables.join(', ')}`);
        return;
      }
      
      onSend(template, variableValues);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <EyeIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Template Preview</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500">{template.name}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                  {template.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Variables */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Template Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{template.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium uppercase">{template.language}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Variables:</span>
                    <span className="font-medium">{template.variables.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                      {template.status}
                    </span>
                  </div>
                </div>
              </div>

              {template.variables.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Fill Variables ({template.variables.length})
                  </h3>
                  <div className="space-y-3">
                    {template.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {variable}
                        </label>
                        <input
                          type="text"
                          value={variableValues[variable] || ''}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter value for ${variable}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {template.variables.length === 0 && (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    This template has no variables to configure.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Message Preview</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* WhatsApp-like header */}
                  <div className="bg-green-500 text-white px-4 py-2 text-sm font-medium">
                    WhatsApp Business Message
                  </div>
                  
                  {/* Message content */}
                  <div className="p-4 bg-gray-50 min-h-[200px]">
                    <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs">
                      <div className="whitespace-pre-wrap text-sm text-gray-900">
                        {previewContent || 'Message preview will appear here...'}
                      </div>
                      <div className="flex justify-end mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Original Template */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Original Template</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {template.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {template.status === 'approved' ? (
              <span className="text-green-600">✓ This template is approved and ready to send</span>
            ) : template.status === 'pending' ? (
              <span className="text-yellow-600">⏳ This template is pending approval</span>
            ) : (
              <span className="text-red-600">✗ This template has been rejected</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            {onSend && template.status === 'approved' && (
              <button
                onClick={handleSend}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Send Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
