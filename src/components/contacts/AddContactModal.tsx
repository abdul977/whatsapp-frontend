'use client';

import { useState } from 'react';
import { sendMessage, SendMessageRequest, Account as ApiAccount } from '@/lib/api';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: () => void;
  accounts: ApiAccount[];
  selectedAccountId: string | null;
}

export default function AddContactModal({ isOpen, onClose, onContactAdded, accounts, selectedAccountId }: AddContactModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Hi! I\'d like to connect.');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    console.log('selectedAccountId in modal:', selectedAccountId);
    if (!phoneNumber || !message) {
      setError('Phone number and message are required.');
      return;
    }

    if (!selectedAccountId) {
      setError('Please select an account first.');
      return;
    }

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
    if (!selectedAccount) {
      setError('Selected account not found.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const request: SendMessageRequest = {
        to: phoneNumber,
        message: message,
        type: 'text',
        business_id: selectedAccount.business_account_id,
        phone_id: selectedAccount.phone_number_id,
      };
      const response = await sendMessage(request);

      if (response.status === 'success') {
        onContactAdded();
        onClose();
        setPhoneNumber('');
      } else {
        setError(response.message || 'Failed to send message.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
        <p className="text-gray-600 mb-6">
          To add a new contact, send them an initial message. This will create a new conversation.
        </p>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter phone number (e.g., 2349025794407)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500"
          />
          <textarea
            placeholder="Initial message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSending}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
          >
            {isSending ? 'Sending...' : 'Send and Add Contact'}
          </button>
        </div>
      </div>
    </div>
  );
}
