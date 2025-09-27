'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  usageCount: number;
  createdAt: string;
  lastUsed?: string;
}

// Mock data
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Welcome Message',
    category: 'greeting',
    content: 'Hello {{name}}! Welcome to our service. We\'re excited to have you on board.',
    variables: ['name'],
    language: 'en',
    status: 'approved',
    usageCount: 45,
    createdAt: '2024-01-15',
    lastUsed: '2024-01-20'
  },
  {
    id: '2',
    name: 'Order Confirmation',
    category: 'business',
    content: 'Hi {{customer_name}}, your order #{{order_id}} has been confirmed. Total amount: {{amount}}. Expected delivery: {{delivery_date}}.',
    variables: ['customer_name', 'order_id', 'amount', 'delivery_date'],
    language: 'en',
    status: 'approved',
    usageCount: 128,
    createdAt: '2024-01-10',
    lastUsed: '2024-01-19'
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    category: 'reminder',
    content: 'Dear {{patient_name}}, this is a reminder for your appointment on {{date}} at {{time}}. Please confirm your attendance.',
    variables: ['patient_name', 'date', 'time'],
    language: 'en',
    status: 'pending',
    usageCount: 23,
    createdAt: '2024-01-12'
  },
  {
    id: '4',
    name: 'Payment Reminder',
    category: 'business',
    content: 'Hello {{customer_name}}, your payment of {{amount}} is due on {{due_date}}. Please make the payment to avoid any inconvenience.',
    variables: ['customer_name', 'amount', 'due_date'],
    language: 'en',
    status: 'approved',
    usageCount: 67,
    createdAt: '2024-01-08',
    lastUsed: '2024-01-18'
  }
];

const categories = ['all', 'greeting', 'business', 'reminder', 'marketing', 'support'];

function TemplateCard({ template, onEdit, onDelete, onPreview, onSend }: {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onPreview: (template: Template) => void;
  onSend: (template: Template) => void;
}) {
  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-500 capitalize">{template.category}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[template.status]}`}>
                {template.status}
              </span>
            </div>
          </div>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onPreview(template)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <EyeIcon className="mr-3 h-4 w-4" />
                      Preview
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onSend(template)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <PaperAirplaneIcon className="mr-3 h-4 w-4" />
                      Send Message
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(template)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <PencilIcon className="mr-3 h-4 w-4" />
                      Edit Template
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(template)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex items-center w-full px-4 py-2 text-sm text-red-600`}
                    >
                      <TrashIcon className="mr-3 h-4 w-4" />
                      Delete Template
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
      </div>

      {template.variables.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Variables:</p>
          <div className="flex flex-wrap gap-1">
            {template.variables.map((variable) => (
              <span
                key={variable}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {`{{${variable}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Used {template.usageCount} times</span>
          {template.lastUsed && (
            <span>Last used {new Date(template.lastUsed).toLocaleDateString()}</span>
          )}
        </div>
        <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [templates] = useState<Template[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    console.log('Create new template');
  };

  const handleEditTemplate = (template: Template) => {
    console.log('Edit template:', template);
  };

  const handleDeleteTemplate = (template: Template) => {
    console.log('Delete template:', template);
  };

  const handlePreviewTemplate = (template: Template) => {
    console.log('Preview template:', template);
  };

  const handleSendTemplate = (template: Template) => {
    console.log('Send template:', template);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
          <p className="text-gray-600">Create and manage your WhatsApp message templates</p>
        </div>
        
        <button
          onClick={handleCreateTemplate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Template
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
          <div className="text-sm text-gray-500">Total Templates</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {templates.filter(t => t.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {templates.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {templates.reduce((sum, t) => sum + t.usageCount, 0)}
          </div>
          <div className="text-sm text-gray-500">Total Usage</div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onPreview={handlePreviewTemplate}
            onSend={handleSendTemplate}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first template'}
          </p>
          <button
            onClick={handleCreateTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
      )}
    </div>
  );
}
