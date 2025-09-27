'use client';

import { useState } from 'react';
import { 
  FolderIcon,
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  templateCount: number;
}

interface TemplateTag {
  id: string;
  name: string;
  color: string;
  templateCount: number;
}

interface TemplateCategoriesProps {
  onCategoryFilter?: (categoryId: string | null) => void;
  onTagFilter?: (tagId: string | null) => void;
  selectedCategory?: string | null;
  selectedTags?: string[];
}

const mockCategories: Category[] = [
  { id: '1', name: 'Welcome Messages', description: 'Greeting and welcome templates', color: 'blue', templateCount: 8 },
  { id: '2', name: 'Order Updates', description: 'Order status and shipping updates', color: 'green', templateCount: 12 },
  { id: '3', name: 'Promotions', description: 'Marketing and promotional messages', color: 'purple', templateCount: 15 },
  { id: '4', name: 'Support', description: 'Customer support templates', color: 'yellow', templateCount: 6 },
  { id: '5', name: 'Reminders', description: 'Appointment and payment reminders', color: 'red', templateCount: 9 }
];

const mockTags: TemplateTag[] = [
  { id: '1', name: 'urgent', color: 'red', templateCount: 5 },
  { id: '2', name: 'automated', color: 'blue', templateCount: 18 },
  { id: '3', name: 'personalized', color: 'green', templateCount: 12 },
  { id: '4', name: 'seasonal', color: 'orange', templateCount: 7 },
  { id: '5', name: 'multilingual', color: 'purple', templateCount: 4 }
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function TemplateCategories({ 
  onCategoryFilter, 
  onTagFilter, 
  selectedCategory, 
  selectedTags = [] 
}: TemplateCategoriesProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredCategories = mockCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = mockTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (categoryId: string) => {
    const newSelection = selectedCategory === categoryId ? null : categoryId;
    onCategoryFilter?.(newSelection);
  };

  const handleTagClick = (tagId: string) => {
    const isSelected = selectedTags.includes(tagId);
    if (isSelected) {
      // Remove tag from selection
      const newTags = selectedTags.filter(id => id !== tagId);
      onTagFilter?.(newTags.length > 0 ? newTags.join(',') : null);
    } else {
      // Add tag to selection
      const newTags = [...selectedTags, tagId];
      onTagFilter?.(newTags.join(','));
    }
  };

  const clearFilters = () => {
    onCategoryFilter?.(null);
    onTagFilter?.(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Template Organization</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Create
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories and tags..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'categories'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FolderIcon className="h-4 w-4 inline mr-1" />
            Categories
          </button>
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
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Clear Filters */}
        {(selectedCategory || selectedTags.length > 0) && (
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

        {activeTab === 'categories' && (
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedCategory === category.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg border ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                    <FolderIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <span className="text-xs text-gray-500">
                      {category.templateCount} templates
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit
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

        {activeTab === 'tags' && (
          <div className="space-y-2">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleTagClick(tag.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses[tag.color as keyof typeof colorClasses]}`}>
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tag.templateCount} templates
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit
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

        {/* No Results */}
        {((activeTab === 'categories' && filteredCategories.length === 0) ||
          (activeTab === 'tags' && filteredTags.length === 0)) && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              {activeTab === 'categories' ? <FolderIcon className="h-12 w-12 mx-auto" /> : <TagIcon className="h-12 w-12 mx-auto" />}
            </div>
            <p className="text-gray-500">
              No {activeTab} found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New {activeTab === 'categories' ? 'Category' : 'Tag'}
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
