'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Template {
  id?: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  language: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface TemplateEditorProps {
  template?: Template;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Template) => void;
}

const categories = [
  'greeting',
  'business',
  'reminder',
  'marketing',
  'support',
  'notification'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' }
];

export default function TemplateEditor({ template, isOpen, onClose, onSave }: TemplateEditorProps) {
  const [formData, setFormData] = useState<Template>({
    name: '',
    category: 'business',
    content: '',
    variables: [],
    language: 'en',
    status: 'pending'
  });
  const [newVariable, setNewVariable] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        name: '',
        category: 'business',
        content: '',
        variables: [],
        language: 'en',
        status: 'pending'
      });
    }
  }, [template]);

  // Extract variables from content
  useEffect(() => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = formData.content.match(variableRegex);
    if (matches) {
      const extractedVars = matches.map(match => match.replace(/[{}]/g, ''));
      const uniqueVars = Array.from(new Set(extractedVars));
      setFormData(prev => ({ ...prev, variables: uniqueVars }));
    } else {
      setFormData(prev => ({ ...prev, variables: [] }));
    }
  }, [formData.content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Template content is required';
    }
    
    if (formData.content.length > 1024) {
      newErrors.content = 'Template content must be less than 1024 characters';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
      onClose();
    }
  };

  const addVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      const updatedContent = formData.content + ` {{${newVariable.trim()}}}`;
      setFormData(prev => ({
        ...prev,
        content: updatedContent
      }));
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    const updatedContent = formData.content.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), '');
    setFormData(prev => ({
      ...prev,
      content: updatedContent
    }));
  };

  const renderPreview = () => {
    let preview = formData.content;
    formData.variables.forEach(variable => {
      preview = preview.replace(
        new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
        `[${variable.toUpperCase()}]`
      );
    });
    return preview;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {template ? 'Edit Template' : 'Create New Template'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                previewMode 
                  ? 'border-green-300 text-green-700 bg-green-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter template name"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your template content. Use {{variable}} for dynamic content."
                />
                {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  {formData.content.length}/1024 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Variable
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Variable name"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                  />
                  <button
                    type="button"
                    onClick={addVariable}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Preview/Variables */}
            <div className="space-y-4">
              {previewMode ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md min-h-[200px]">
                    <div className="whitespace-pre-wrap text-sm text-gray-900">
                      {renderPreview() || 'Template preview will appear here...'}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Variables ({formData.variables.length})
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {formData.variables.length > 0 ? (
                      formData.variables.map((variable, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <span className="text-sm font-mono text-gray-900">
                            {`{{${variable}}}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVariable(variable)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No variables detected. Use {`{{variable}}`} syntax in your content.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
