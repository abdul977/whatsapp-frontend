'use client';

import { useState, useEffect } from 'react';

interface Account {
  id: string;
  name: string;
  phone_number_id: string;
  business_account_id: string;
  status: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccount, setNewAccount] = useState({
    id: '',
    name: '',
    token: '',
    phone_number_id: '',
    business_account_id: '',
  });

  useEffect(() => {
    if (!apiBaseUrl) {
      console.error('API base URL is not configured');
      return;
    }
    fetch(`${apiBaseUrl}/api/accounts`)
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data.accounts);
      })
      .catch((error) => {
        console.error('Failed to fetch accounts:', error);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAccount = () => {
    if (!apiBaseUrl) {
      console.error('API base URL is not configured');
      return;
    }
    fetch(`${apiBaseUrl}/api/accounts/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAccount),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setAccounts((prev) => [...prev, data.account]);
          setNewAccount({
            id: '',
            name: '',
            token: '',
            phone_number_id: '',
            business_account_id: '',
          });
        } else {
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error('Failed to add account:', error);
        alert('Failed to add account. See console for details.');
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Account Management</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Add New Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="id"
            placeholder="Account ID"
            value={newAccount.id}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="name"
            placeholder="Account Name"
            value={newAccount.name}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="token"
            placeholder="Token"
            value={newAccount.token}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="phone_number_id"
            placeholder="Phone Number ID"
            value={newAccount.phone_number_id}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="business_account_id"
            placeholder="Business Account ID"
            value={newAccount.business_account_id}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
        </div>
        <button
          onClick={handleAddAccount}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Account
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Existing Accounts</h2>
        <ul className="space-y-2">
          {accounts.map((account) => (
            <li key={account.id} className="p-4 border rounded-lg shadow-sm">
              <p className="font-bold text-gray-800">{account.name}</p>
              <p className="text-gray-600">ID: {account.id}</p>
              <p className="text-gray-600">Phone Number ID: {account.phone_number_id}</p>
              <p className="text-gray-600">Business Account ID: {account.business_account_id}</p>
              <p className="text-gray-600">Status: {account.status}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}