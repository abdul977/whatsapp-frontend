'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getContacts, getAccounts, Contact as ApiContact, Account as ApiAccount } from '@/lib/api';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import AddContactModal from '@/components/contacts/AddContactModal';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  messageCount: number;
  tags: string[];
  status: 'active' | 'blocked';
  createdAt: string;
}

// Helper function to convert API contact to UI contact
const convertApiContactToUIContact = (apiContact: ApiContact): Contact => {
  return {
    id: apiContact.phone_number,
    name: apiContact.display_name || apiContact.name || `Contact ${apiContact.phone_number.slice(-4)}`,
    phone: apiContact.phone_number,
    email: undefined, // TODO: Add email support to backend
    lastMessage: apiContact.last_message,
    lastMessageTime: apiContact.last_message_time,
    messageCount: apiContact.message_count,
    tags: [], // TODO: Add tags support to backend
    status: 'active' as const,
    createdAt: new Date().toISOString().split('T')[0] // TODO: Add created_at to backend
  };
};

function ContactCard({ contact, onEdit, onDelete, onMessage }: {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onMessage: (contact: Contact) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-lg">
              {contact.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
            <p className="text-sm text-gray-500">{contact.phone}</p>
            {contact.email && (
              <p className="text-sm text-gray-500">{contact.email}</p>
            )}
            
            {contact.lastMessage && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                <p className="text-xs text-gray-400">{contact.lastMessageTime}</p>
              </div>
            )}
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
                      onClick={() => onMessage(contact)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <ChatBubbleLeftRightIcon className="mr-3 h-4 w-4" />
                      Send Message
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(contact)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <PencilIcon className="mr-3 h-4 w-4" />
                      Edit Contact
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(contact)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex items-center w-full px-4 py-2 text-sm text-red-600`}
                    >
                      <TrashIcon className="mr-3 h-4 w-4" />
                      Delete Contact
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{contact.messageCount} messages</span>
          <span>Added {new Date(contact.createdAt).toLocaleDateString()}</span>
        </div>
        
        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contact.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const accounts = useAppStore((state) => state.accounts);
  const currentAccount = useAppStore((state) => state.currentAccount);
  const setAccounts = useAppStore((state) => state.setAccounts);
  const switchAccount = useAppStore((state) => state.switchAccount);
  const selectedAccountId = currentAccount?.id;

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await getAccounts();
        if (response.status === 'success' && response.accounts) {
          setAccounts(response.accounts);
          if (response.accounts.length > 0 && !useAppStore.getState().currentAccount) {
            switchAccount(response.accounts[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    };
    loadAccounts();
  }, [setAccounts, switchAccount]);

  useEffect(() => {
    if (selectedAccountId) {
      loadContacts(selectedAccountId);
    }
  }, [selectedAccountId]);

  const loadContacts = async (accountId: string) => {
    try {
      setLoading(true);
      const response = await getContacts(accountId);
      if (response.status === 'success' && response.contacts) {
        const uiContacts = response.contacts.map(convertApiContactToUIContact);
        setContacts(uiContacts);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'recent' && contact.lastMessage) ||
      (selectedFilter === 'no-messages' && contact.messageCount === 0);

    return matchesSearch && matchesFilter;
  });

  const handleAddContact = () => {
    setIsModalOpen(true);
  };

  const handleContactAdded = () => {
    if (selectedAccountId) {
      loadContacts(selectedAccountId); // Refresh the contact list
    }
  };
  const handleEditContact = (contact: Contact) => {
    console.log('Edit contact:', contact);
  };

  const handleDeleteContact = (contact: Contact) => {
    console.log('Delete contact:', contact);
  };

  const handleMessageContact = (contact: Contact) => {
    console.log('Message contact:', contact);
    // Navigate to chat with this contact
    window.location.href = `/chat?contact=${contact.id}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your WhatsApp contacts and conversations</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedAccountId || ''}
            onChange={(e) => switchAccount(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddContact}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filter
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
                        onClick={() => setSelectedFilter('all')}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } ${selectedFilter === 'all' ? 'text-green-600' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        All Contacts
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setSelectedFilter('recent')}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } ${selectedFilter === 'recent' ? 'text-green-600' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        Recent Messages
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setSelectedFilter('no-messages')}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } ${selectedFilter === 'no-messages' ? 'text-green-600' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        No Messages
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{contacts.length}</div>
          <div className="text-sm text-gray-500">Total Contacts</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {contacts.filter(c => c.lastMessage).length}
          </div>
          <div className="text-sm text-gray-500">Active Conversations</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {contacts.reduce((sum, c) => sum + c.messageCount, 0)}
          </div>
          <div className="text-sm text-gray-500">Total Messages</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {contacts.filter(c => c.messageCount === 0).length}
          </div>
          <div className="text-sm text-gray-500">New Contacts</div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onMessage={handleMessageContact}
          />
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">👥</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first contact'}
          </p>
          <button
            onClick={handleAddContact}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>
      )}

      <AddContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContactAdded={handleContactAdded}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
      />
    </div>
  );
}
