'use client';

import { useState } from 'react';
import { 
  TagIcon,
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Tag {
  id: string;
  name: string;
  color: string;
  contactCount: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  tags: string[];
}

interface ContactGroupsProps {
  onTagFilter?: (tagId: string | null) => void;
  onGroupFilter?: (groupId: string | null) => void;
  selectedTag?: string | null;
  selectedGroup?: string | null;
}

const mockTags: Tag[] = [
  { id: '1', name: 'Customer', color: 'blue', contactCount: 45 },
  { id: '2', name: 'Lead', color: 'yellow', contactCount: 23 },
  { id: '3', name: 'VIP', color: 'purple', contactCount: 8 },
  { id: '4', name: 'Support', color: 'red', contactCount: 12 },
  { id: '5', name: 'Partner', color: 'green', contactCount: 6 }
];

const mockGroups: Group[] = [
  { 
    id: '1', 
    name: 'High Value Customers', 
    description: 'Customers with high purchase value',
    contactCount: 15,
    tags: ['1', '3'] // Customer, VIP
  },
  { 
    id: '2', 
    name: 'New Leads', 
    description: 'Recently acquired leads',
    contactCount: 18,
    tags: ['2'] // Lead
  },
  { 
    id: '3', 
    name: 'Support Queue', 
    description: 'Contacts requiring support',
    contactCount: 12,
    tags: ['4'] // Support
  }
];

const tagColors = {
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800',
  red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  gray: 'bg-gray-100 text-gray-800'
};

export default function ContactGroups({ 
  onTagFilter, 
  onGroupFilter, 
  selectedTag, 
  selectedGroup 
}: ContactGroupsProps) {
  const [activeTab, setActiveTab] = useState<'tags' | 'groups'>('tags');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Tag | Group | null>(null);

  const handleTagClick = (tagId: string) => {
    const newSelection = selectedTag === tagId ? null : tagId;
    onTagFilter?.(newSelection);
  };

  const handleGroupClick = (groupId: string) => {
    const newSelection = selectedGroup === groupId ? null : groupId;
    onGroupFilter?.(newSelection);
  };

  const clearFilters = () => {
    onTagFilter?.(null);
    onGroupFilter?.(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Organization</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Create
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'tags'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TagIcon className="h-4 w-4 inline mr-1" />
            Tags
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'groups'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserGroupIcon className="h-4 w-4 inline mr-1" />
            Groups
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Clear Filters */}
        {(selectedTag || selectedGroup) && (
          <div className="mb-4">
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
            >
              <XMarkIcon className="h-3 w-3 mr-1" />
              Clear Filters
            </button>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-2">
            {mockTags.map((tag) => (
              <div
                key={tag.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTag === tag.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleTagClick(tag.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tagColors[tag.color as keyof typeof tagColors]}`}>
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tag.contactCount} contacts
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(tag);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle delete
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-3">
            {mockGroups.map((group) => (
              <div
                key={group.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedGroup === group.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleGroupClick(group.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <UserGroupIcon className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium text-gray-900">{group.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {group.contactCount} contacts
                      </span>
                      <div className="flex space-x-1">
                        {group.tags.map((tagId) => {
                          const tag = mockTags.find(t => t.id === tagId);
                          return tag ? (
                            <span
                              key={tagId}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tagColors[tag.color as keyof typeof tagColors]}`}
                            >
                              {tag.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(group);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New {activeTab === 'tags' ? 'Tag' : 'Group'}
            </h3>
            <p className="text-gray-600 mb-4">
              This feature will be implemented to create new {activeTab}.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
